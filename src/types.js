/**
 * @typedef {Object} AuthUser
 * @property {string|number} [id]
 * @property {string} [name]
 * @property {string} [email]
 * @property {string} [position]
 * @property {string} [role]
 */

/**
 * @typedef {Object} AuthSession
 * @property {string} access_token
 * @property {string} [token_type]
 * @property {AuthUser} [user]
 */

/**
 * @typedef {Object} MeetingRecord
 * @property {string|number} id
 * @property {string} title
 * @property {string|Object} organizer
 * @property {string} [date]
 * @property {string} [start_time]
 * @property {string} [end_time]
 * @property {string} [room]
 * @property {string} [audio_url]
 * @property {string} [transcript]
 * @property {string} [summary_en]
 * @property {string} [summary_my]
 * @property {string[]} [key_decisions]
 * @property {Array<Object>} [action_items]
 * @property {Array<Object|string>|number} [participants]
 */

export {};
