const {
  hashPassword,
  verifyPassword,
  generateVerificationToken,
  validatePassword
} = require('../../utils/security');
const argon2 = require('argon2');

describe('Security Utils', () => {

  describe('hashPassword', () => {
    it('should return a non-empty string', async () => {
      const password = 'mySecretPassword';
      const hash = await hashPassword(password);
      expect(typeof hash).toBe('string');
      expect(hash.length).toBeGreaterThan(0);
    });

    it('should return a valid Argon2 hash', async () => {
      const password = 'mySecretPassword';
      const hash = await hashPassword(password);
      expect(hash).toMatch(/^\$argon2/);
    });

    it('should generate different hashes for the same password (salting)', async () => {
      const password = 'samePassword';
      const hash1 = await hashPassword(password);
      const hash2 = await hashPassword(password);
      expect(hash1).not.toBe(hash2);
    });
  });

  describe('verifyPassword', () => {
    it('should return true for a correct password/hash pair', async () => {
      const password = 'correctPassword';
      const hash = await hashPassword(password);
      const isValid = await verifyPassword(hash, password);
      expect(isValid).toBe(true);
    });

    it('should return false for an incorrect password', async () => {
      const password = 'correctPassword';
      const hash = await hashPassword(password);
      const isValid = await verifyPassword(hash, 'wrongPassword');
      expect(isValid).toBe(false);
    });

    it('should return false for a malformed hash', async () => {
      const isValid = await verifyPassword('notAValidHash', 'password');
      expect(isValid).toBe(false);
    });

    it('should return false for null/undefined hash', async () => {
        expect(await verifyPassword(null, 'password')).toBe(false);
        expect(await verifyPassword(undefined, 'password')).toBe(false);
    });
  });

  describe('generateVerificationToken', () => {
    it('should return a string of length 64 (32 bytes hex)', () => {
      const token = generateVerificationToken();
      expect(typeof token).toBe('string');
      expect(token.length).toBe(64);
      expect(token).toMatch(/^[0-9a-f]+$/);
    });

    it('should generate unique tokens', () => {
      const token1 = generateVerificationToken();
      const token2 = generateVerificationToken();
      expect(token1).not.toBe(token2);
    });
  });

  describe('validatePassword', () => {
    it('should reject passwords shorter than 12 characters', () => {
      const shortPassword = 'short';
      const result = validatePassword(shortPassword);
      expect(result.valid).toBe(false);
      expect(result.message).toBe('Password must be at least 12 characters long');
    });

    it('should reject common passwords', () => {
      const commonPassword = 'password1234';
      const result = validatePassword(commonPassword);
      expect(result.valid).toBe(false);
      expect(result.message).toBe('Password is too common. Please choose a stronger password.');
    });

    it('should reject common passwords regardless of case', () => {
      const commonPassword = 'PASSWORD1234';
      const result = validatePassword(commonPassword);
      expect(result.valid).toBe(false);
      expect(result.message).toBe('Password is too common. Please choose a stronger password.');
    });

    it('should accept a strong password', () => {
      const strongPassword = 'ThisIsAStrongPassword123!';
      const result = validatePassword(strongPassword);
      expect(result.valid).toBe(true);
      expect(result.message).toBeUndefined();
    });
  });

});
