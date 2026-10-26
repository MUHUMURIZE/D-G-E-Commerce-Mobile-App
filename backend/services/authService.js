const crypto = require('node:crypto');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const env = require('../config/env');
const { User, RevokedToken, PasswordResetToken } = require('../models');

async function registerUser({ fullName, email, password, phone }) {
  const normalizedEmail = String(email || '').trim().toLowerCase();
  const normalizedName = String(fullName || '').trim();
  if (!normalizedName || !normalizedEmail || !password) {
    throw createAppError(400, 'Full name, email, and password are required.');
  }

  const existingUser = await User.findOne({ where: { email: normalizedEmail } });
  if (existingUser) {
    throw createAppError(409, 'A user with this email already exists.');
  }

  const passwordHash = await bcrypt.hash(password, 12);
  const user = await User.create({
    fullName: normalizedName,
    email: normalizedEmail,
    passwordHash,
    phone: phone ? String(phone).trim() : null,
    role: 'customer',
  });

  return buildAuthResponse(user);
}

async function loginUser({ email, password }) {
  const normalizedEmail = String(email || '').trim().toLowerCase();
  if (!normalizedEmail || !password) {
    throw createAppError(400, 'Email and password are required.');
  }

  const user = await User.findOne({ where: { email: normalizedEmail } });
  if (!user) {
    throw createAppError(401, 'Invalid email or password.');
  }

  const validPassword = await bcrypt.compare(password, user.passwordHash);
  if (!validPassword) {
    throw createAppError(401, 'Invalid email or password.');
  }

  return buildAuthResponse(user);
}

async function getProfile(userId) {
  const user = await User.findByPk(userId, {
    attributes: ['id', 'fullName', 'email', 'phone', 'role', 'created_at'],
  });
  if (!user) {
    throw createAppError(404, 'User not found.');
  }
  return user;
}

async function updateProfile(userId, payload) {
  const user = await User.findByPk(userId);
  if (!user) {
    throw createAppError(404, 'User not found.');
  }

  const nextFullName = payload.fullName ? String(payload.fullName).trim() : user.fullName;
  const nextPhone = payload.phone ? String(payload.phone).trim() : user.phone;

  if (!nextFullName) {
    throw createAppError(400, 'Full name cannot be empty.');
  }

  await user.update({
    fullName: nextFullName,
    phone: nextPhone || null,
  });

  return user;
}

async function forgotPassword(email) {
  const normalizedEmail = String(email || '').trim().toLowerCase();
  if (!normalizedEmail) {
    throw createAppError(400, 'Email is required.');
  }

  const user = await User.findOne({ where: { email: normalizedEmail } });
  if (!user) {
    return { message: 'If an account exists for that email, a reset link has been sent.' };
  }

  const token = crypto.randomBytes(32).toString('hex');
  const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
  const expiresAt = new Date(Date.now() + env.passwordResetTokenTtlMinutes * 60 * 1000);

  await PasswordResetToken.destroy({ where: { userId: user.id } });
  await PasswordResetToken.create({ userId: user.id, tokenHash, expiresAt });

  if (env.smtp) {
    const { sendPasswordResetEmail } = require('./emailService');
    await sendPasswordResetEmail({ email: user.email, fullName: user.fullName, token });
  }

  return { message: 'If an account exists for that email, a reset link has been sent.' };
}

async function logoutUser(token) {
  if (!token) {
    return { message: 'User logged out successfully.' };
  }

  const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
  const decoded = jwt.decode(token, { complete: false });
  const expiresAt = decoded && decoded.exp ? new Date(decoded.exp * 1000) : new Date(Date.now() + 60 * 60 * 1000);

  await RevokedToken.findOrCreate({
    where: { tokenHash },
    defaults: { tokenHash, expiresAt },
  });

  return { message: 'Logout successful.' };
}

function buildAuthResponse(user) {
  const token = jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    env.jwtSecret,
    { expiresIn: env.jwtExpiresIn },
  );

  return {
    token,
    user: {
      id: user.id,
      name: user.fullName,
      email: user.email,
      role: user.role,
      phone: user.phone,
    },
  };
}

function createAppError(statusCode, message) {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
}

module.exports = {
  registerUser,
  loginUser,
  getProfile,
  updateProfile,
  forgotPassword,
  logoutUser,
};
