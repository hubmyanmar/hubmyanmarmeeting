import test from 'node:test';
import assert from 'node:assert/strict';

import { normalizeMeetingStatus, isMeetingStopped, applyMeetingStopState } from './meetingSessionState.js';

test('normalizeMeetingStatus resolves stopped status consistently', () => {
  assert.equal(normalizeMeetingStatus('stopped'), 'stopped');
  assert.equal(normalizeMeetingStatus('done'), 'stopped');
  assert.equal(normalizeMeetingStatus('finished'), 'stopped');
  assert.equal(normalizeMeetingStatus('running'), 'running');
});

test('isMeetingStopped returns true only for terminal states', () => {
  assert.equal(isMeetingStopped({ status: 'stopped' }), true);
  assert.equal(isMeetingStopped({ status: 'done' }), true);
  assert.equal(isMeetingStopped({ stopped_at: '2026-09-28T10:05:00.000Z' }), true);
  assert.equal(isMeetingStopped({ status: 'running' }), false);
  assert.equal(isMeetingStopped({ status: 'active' }), false);
});

test('applyMeetingStopState marks a session as stopped for all clients', () => {
  const stopped = applyMeetingStopState({
    meeting_id: 'm-123',
    status: 'running',
    actual_started_at: '2026-09-28T10:00:00.000Z'
  }, '2026-09-28T10:05:00.000Z');

  assert.equal(stopped.status, 'stopped');
  assert.equal(stopped.stopped_at, '2026-09-28T10:05:00.000Z');
  assert.equal(stopped.actual_started_at, '2026-09-28T10:00:00.000Z');
});
