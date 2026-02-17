import bcrypt from 'bcryptjs';
import { initialUsers } from '../data/usersData.js';

// In-memory store (matches backend pattern for contacts, expenses, etc.)
let usersStore = [...initialUsers];

/**
 * Find user by email. For single-user app, uses first matching user.
 * In production: use session/token to identify user.
 */
function findUserByEmail(email) {
  return usersStore.find((u) => u.email.toLowerCase() === (email || '').toLowerCase());
}

/**
 * POST /security/change-password
 * Body: { email, currentPassword, newPassword }
 */
export const changePassword = async (req, res) => {
  try {
    const { email, currentPassword, newPassword } = req.body;
    if (!email || !currentPassword || !newPassword) {
      return res.status(400).json({ error: 'Email, current password, and new password are required' });
    }
    if (newPassword.length < 6) {
      return res.status(400).json({ error: 'New password must be at least 6 characters' });
    }

    const user = findUserByEmail(email);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const valid = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!valid) {
      return res.status(401).json({ error: 'Current password is incorrect' });
    }

    user.passwordHash = bcrypt.hashSync(newPassword, 10);
    res.json({ success: true, message: 'Password updated successfully' });
  } catch (error) {
    console.error('changePassword error:', error);
    res.status(500).json({ error: error.message });
  }
};

/**
 * POST /security/enable-2fa
 * Body: { email }
 * For MVP: toggles 2FA flag. Full TOTP setup would require speakeasy/otplib.
 */
export const enable2FA = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    const user = findUserByEmail(email);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    user.twoFactorEnabled = !user.twoFactorEnabled;
    res.json({
      success: true,
      twoFactorEnabled: user.twoFactorEnabled,
      message: user.twoFactorEnabled ? 'Two-factor authentication enabled' : 'Two-factor authentication disabled',
    });
  } catch (error) {
    console.error('enable2FA error:', error);
    res.status(500).json({ error: error.message });
  }
};

/**
 * GET /security/2fa-status?email=
 * Returns current 2FA status for user.
 */
export const get2FAStatus = async (req, res) => {
  try {
    const { email } = req.query;
    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    const user = findUserByEmail(email);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ twoFactorEnabled: user.twoFactorEnabled });
  } catch (error) {
    console.error('get2FAStatus error:', error);
    res.status(500).json({ error: error.message });
  }
};

/**
 * DELETE /security/account
 * Body: { email, password }
 * Permanently deletes user account after password confirmation.
 */
export const deleteAccount = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required to delete account' });
    }

    const user = findUserByEmail(email);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) {
      return res.status(401).json({ error: 'Password is incorrect' });
    }

    usersStore = usersStore.filter((u) => u.id !== user.id);
    res.json({ success: true, message: 'Account deleted successfully' });
  } catch (error) {
    console.error('deleteAccount error:', error);
    res.status(500).json({ error: error.message });
  }
};
