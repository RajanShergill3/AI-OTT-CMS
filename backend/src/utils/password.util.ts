import bcrypt from 'bcrypt';

/**
 * bcrypt cost factor (2^12 iterations).
 * OWASP recommends a minimum of 10; 12 is suitable for production workloads.
 */
const BCRYPT_ROUNDS = 12;

/**
 * Maximum password length accepted before hashing or comparison.
 * Prevents bcrypt CPU-exhaustion attacks from extremely long inputs.
 * bcrypt only considers the first 72 bytes, but hashing long strings is still costly.
 */
const MAX_PASSWORD_LENGTH = 128;

const BCRYPT_HASH_REGEX = /^\$2[aby]?\$\d{2}\$.{53}$/;

const assertHashablePassword = (password: string): void => {
  if (typeof password !== 'string' || password.length === 0) {
    throw new Error('Password must be a non-empty string');
  }

  if (password.length > MAX_PASSWORD_LENGTH) {
    throw new Error(`Password must not exceed ${MAX_PASSWORD_LENGTH} characters`);
  }
};

const isValidBcryptHash = (hash: string): boolean => {
  return typeof hash === 'string' && BCRYPT_HASH_REGEX.test(hash);
};

/**
 * Hash a plaintext password using bcrypt.
 *
 * @param password - Plaintext password to hash
 * @returns bcrypt hash string (includes salt)
 * @throws {Error} When password is empty or exceeds the maximum length
 */
export const hashPassword = async (password: string): Promise<string> => {
  assertHashablePassword(password);
  return bcrypt.hash(password, BCRYPT_ROUNDS);
};

/**
 * Compare a plaintext password against a stored bcrypt hash.
 *
 * Returns `false` for invalid input or malformed hashes without throwing,
 * so callers can treat authentication failures uniformly.
 *
 * @param password - Plaintext password to verify
 * @param passwordHash - Stored bcrypt hash from the database
 */
export const comparePassword = async (password: string, passwordHash: string): Promise<boolean> => {
  if (typeof password !== 'string' || password.length === 0) {
    return false;
  }

  if (password.length > MAX_PASSWORD_LENGTH) {
    return false;
  }

  if (!isValidBcryptHash(passwordHash)) {
    return false;
  }

  try {
    return await bcrypt.compare(password, passwordHash);
  } catch {
    return false;
  }
};
