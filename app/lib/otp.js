import crypto from 'crypto';

/**
 * Generates a secure, digits-only OTP of a specified length.
 * @param {number} length The desired length of the OTP.
 * @returns {string} The generated OTP.
 */
export function generateOTP(length = 6) {
  const digits = '0123456789';
  let otp = '';
  const randomBytes = crypto.randomBytes(length);
  for (let i = 0; i < length; i++) {
    otp += digits[randomBytes[i] % 10];
  }
  return otp;
}

/**
 * Hashes an OTP for secure storage.
 * @param {string} otp The plaintext OTP.
 * @returns {string} The hashed OTP.
 */
export function hashOTP(otp) {
  return crypto.createHash('sha256').update(otp).digest('hex');
}
