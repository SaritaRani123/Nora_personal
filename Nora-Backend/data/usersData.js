/**
 * User accounts for security features (password, 2FA, delete).
 * Stored in backend only - no mock data in frontend.
 * Default password: "password123" (hashed with bcrypt)
 */
import bcrypt from 'bcryptjs';

const DEFAULT_PASSWORD_HASH = bcrypt.hashSync('password123', 10);

export const initialUsers = [
  {
    id: 'user-1',
    email: 'john@business.com',
    passwordHash: DEFAULT_PASSWORD_HASH,
    twoFactorEnabled: false,
    twoFactorSecret: null,
  },
];
