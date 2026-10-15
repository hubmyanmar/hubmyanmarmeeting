import axios from 'axios';
import api from '../api';

const PART_SIZE = 8 * 1024 * 1024;
const s3Client = axios.create(); // Never attach the app's bearer token to a presigned S3 URL.

/** Backend contract: POST /uploads/multipart/initiate, /presign, and /complete.
 * The backend must return {key, uploadId}, {url}, then persist/return {fileUrl}.
 */
export async function createMultipartUpload({ meetingId, fileName, contentType, size }) {
  const numericMeetingId = Number(meetingId);
  if (!Number.isFinite(size) || size <= 0) {
    throw new Error(`Cannot start multipart upload with an empty or invalid file size (received: ${size}).`);
  }
  if (!Number.isFinite(numericMeetingId)) {
    throw new Error(`A numeric meeting ID is required to upload audio (received: ${meetingId}).`);
  }
  try {
    const response = await api.post('/uploads/multipart/initiate', {
      meeting_id: numericMeetingId,
      filename: fileName,
      content_type: contentType,
    }, {
      headers: { 'Content-Type': 'application/json' },
    });
    console.log('Multipart initiate succeeded; extracting upload session:', response.status);
    console.log('Multipart initiate response:', response.status, response.data);
    const pendingObjects = [response.data];
    const seenObjects = new Set();
    let key;
    let uploadId;
    while (pendingObjects.length && (!key || !uploadId)) {
      const candidate = pendingObjects.shift();
      if (!candidate || typeof candidate !== 'object' || seenObjects.has(candidate)) continue;
      seenObjects.add(candidate);
      for (const [name, value] of Object.entries(candidate)) {
        const normalizedName = name.replace(/[^a-z0-9]/gi, '').toLowerCase();
        if (!key && [
          'key', 'filekey', 's3key', 'objectkey', 'storagekey', 'audiokey', 'filepath',
        ].includes(normalizedName) && typeof value === 'string' && value.trim()) {
          key = value.trim();
        }
        if (!uploadId && [
          'uploadid', 'multipartuploadid', 's3uploadid', 'multipartid',
        ].includes(normalizedName) && typeof value === 'string' && value.trim()) {
          uploadId = value.trim();
        }
        if (value && typeof value === 'object') pendingObjects.push(value);
      }
    }
    if (!uploadId || !key) {
      console.error("FAILED TO EXTRACT KEYS. Raw response:", response.data);
      throw new Error('Upload service returned an invalid multipart session.');
    }
    console.log('Multipart upload session extracted:', { key, uploadId });
    return new MultipartUpload({ key, uploadId, meetingId, fileName, contentType, size });
  } catch (error) {
    console.error('Unable to initiate multipart upload:', error);
    console.error(error);
    throw error;
  }
}

class MultipartUpload {
  constructor(meta) {
    Object.assign(this, meta);
    this.parts = [];
    this.buffer = [];
    this.bufferSize = 0;
    this.partNumber = 1;
    this.pending = Promise.resolve();
    this.uploadedBytes = 0;
    this.scheduledParts = 0;
  }

  append(blob, onProgress = () => {}) {
    if (!blob?.size) throw new Error('Cannot upload an empty audio chunk.');
    console.log('Appending audio to multipart upload:', { chunkBytes: blob.size, currentBytes: this.size });
    this.buffer.push(blob);
    this.bufferSize += blob.size;
    this.size += blob.size;
    while (this.bufferSize >= PART_SIZE) {
      const part = this.takeBytes(PART_SIZE);
      this.scheduledParts += 1;
      this.pending = this.pending.then(() => this.uploadPart(part, onProgress)).finally(() => { this.scheduledParts -= 1; });
    }
  }

  takeBytes(byteCount) {
    const selected = [];
    let remaining = byteCount;
    while (remaining > 0 && this.buffer.length) {
      const blob = this.buffer[0];
      if (blob.size <= remaining) {
        selected.push(blob); this.buffer.shift(); remaining -= blob.size; this.bufferSize -= blob.size;
      } else {
        selected.push(blob.slice(0, remaining));
        this.buffer[0] = blob.slice(remaining); this.bufferSize -= remaining; remaining = 0;
      }
    }
    return new Blob(selected, { type: this.contentType });
  }

  async uploadPart(blob, onProgress) {
    const partNumber = Number.parseInt(this.partNumber++, 10);
    let data;
    try {
      if (!this.uploadId || !this.key || this.meetingId == null || !Number.isFinite(Number(this.meetingId))) {
        throw new Error("Multipart upload is missing a valid meeting ID, object key, or upload ID.");
      }
      const presignPayload = {
        meeting_id: Number(this.meetingId),
        object_key: String(this.key),
        upload_id: String(this.uploadId),
        partNumber: Number(partNumber),
      };
      console.log("🔥 SENDING PRESIGN PAYLOAD:", presignPayload);
      ({ data } = await api.post('/uploads/multipart/presign', presignPayload));
    } catch (error) {
      console.error("422 Error:", error.response?.data?.detail);
      throw error;
    }
    if (!data?.url) throw new Error(`Could not get upload URL for part ${partNumber}.`);
    const { headers } = await s3Client.put(data.url, blob, {
      headers: { 'Content-Type': this.contentType },
      onUploadProgress: (event) => onProgress(Math.min(99, Math.round(((this.uploadedBytes + (event.loaded || 0)) / this.size) * 100))),
    });
    const etag = headers.etag || headers.ETag;
    if (!etag) throw new Error('S3 did not return an ETag. Expose the ETag header in the bucket CORS policy.');
    this.parts.push({ ETag: etag, PartNumber: partNumber });
    this.uploadedBytes += blob.size;
    onProgress(Math.min(99, Math.round((this.uploadedBytes / this.size) * 100)));
  }

  async complete(onProgress = () => {}) {
    await this.pending;
    if (this.bufferSize) await this.uploadPart(this.takeBytes(this.bufferSize), onProgress);

    const meetingId = Number(this.meetingId);
    if (!Number.isInteger(meetingId)) {
      throw new Error(`Multipart completion requires an integer meeting ID (received: ${this.meetingId}).`);
    }
    if (!this.key || !this.uploadId) {
      throw new Error('Multipart completion requires both the S3 file key and upload ID.');
    }
    if (!this.parts.length || this.parts.some((part) => (
      !Number.isInteger(part.PartNumber) || typeof part.ETag !== 'string' || !part.ETag.trim()
    ))) {
      throw new Error('Multipart completion requires parts with an ETag and integer part number.');
    }

    const quoteETag = (etag) => {
      const value = etag.trim();
      return value.startsWith('"') && value.endsWith('"') ? value : `"${value}"`;
    };

    const payload = {
      meeting_id: meetingId,
      upload_id: String(this.uploadId),
      object_key: String(this.key),
      parts: this.parts
        .sort((a, b) => a.PartNumber - b.PartNumber)
        .map(({ ETag, PartNumber }) => ({
          ETag: quoteETag(ETag),
          PartNumber: Number(PartNumber),
        })),
    };
    console.log('Multipart complete payload:', payload);
    let data;
    try {
      const response = await api.post('/uploads/multipart/complete', payload);
      data = response.data;
      console.log('Multipart complete server response:', response.data);
    } catch (error) {
      console.error('Multipart complete failed; FastAPI detail:', error.response?.data?.detail);
      throw error;
    }

    const urlFields = new Set(['fileurl', 'url', 'audiourl', 'audioobjectkey']);
    const pendingObjects = [data];
    const seenObjects = new Set();
    let fileUrl;
    while (pendingObjects.length && !fileUrl) {
      const candidate = pendingObjects.shift();
      if (!candidate || typeof candidate !== 'object' || seenObjects.has(candidate)) continue;
      seenObjects.add(candidate);
      for (const [field, value] of Object.entries(candidate)) {
        const normalizedField = field.replace(/[^a-z0-9]/gi, '').toLowerCase();
        if (urlFields.has(normalizedField) && typeof value === 'string' && value.trim()) {
          fileUrl = value.trim();
          break;
        }
        if (value && typeof value === 'object') pendingObjects.push(value);
      }
    }
    // Some backends only return the S3 object key; preserve it as the audio reference.
    fileUrl ||= this.key;
    console.log('Resolved multipart audio reference:', fileUrl);
    onProgress(100);
    return { ...(data && typeof data === 'object' ? data : {}), fileUrl, key: this.key };
  }

  async abort() {
    await api.post('/uploads/multipart/abort', { key: this.key, uploadId: this.uploadId }).catch(() => {});
  }
}

export async function uploadFileToS3(file, { meetingId, onProgress = () => {} }) {
  console.log('Starting multipart upload:', { name: file?.name, size: file?.size, type: file?.type, meetingId });
  const upload = await createMultipartUpload({ meetingId, fileName: file.name, contentType: file.type || 'application/octet-stream', size: file.size });
  try {
    for (let offset = 0; offset < file.size; offset += PART_SIZE) {
      const chunk = file.slice(offset, Math.min(file.size, offset + PART_SIZE));
      console.log('Appending upload chunk:', { offset, chunkBytes: chunk.size });
      upload.append(chunk, onProgress);
      await upload.pending;
    }
    console.log('All upload chunks sent; completing multipart upload.');
    return await upload.complete(onProgress);
  } catch (error) {
    console.error('Multipart file upload failed:', error);
    await upload.abort();
    throw error;
  }
}

export { PART_SIZE };
