const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const test = require('node:test');

process.env.DATABASE_URL ||= 'postgres://test:test@127.0.0.1:5432/test';
process.env.JWT_SECRET ||= 'test-secret-for-password-reset-tests-at-least-32';

const bcrypt = require('bcryptjs');
const { sequelize, User, PasswordResetToken } = require('../models');
const { resetPassword } = require('../services/authService');

function mockResetDependencies({ resetToken, user }) {
  const original = {
    transaction: sequelize.transaction,
    findOne: PasswordResetToken.findOne,
    findByPk: User.findByPk,
    hash: bcrypt.hash,
  };
  const transaction = { LOCK: { UPDATE: 'UPDATE' } };
  const calls = {};

  sequelize.transaction = async (callback) => callback(transaction);
  PasswordResetToken.findOne = async (options) => {
    calls.lookupOptions = options;
    return resetToken;
  };
  User.findByPk = async () => user;

  return {
    calls,
    restore: () => {
      sequelize.transaction = original.transaction;
      PasswordResetToken.findOne = original.findOne;
      User.findByPk = original.findByPk;
      bcrypt.hash = original.hash;
    },
  };
}

test('resetPassword hashes the new password and consumes the token', async (t) => {
  const resetToken = {
    userId: 'user-id',
    expiresAt: new Date(Date.now() + 60_000),
    usedAt: null,
    async update(values) {
      this.usedAt = values.usedAt;
    },
  };
  const user = {
    passwordHash: 'old-hash',
    async update(values) {
      this.passwordHash = values.passwordHash;
    },
  };
  const mocks = mockResetDependencies({ resetToken, user });
  t.after(mocks.restore);

  const result = await resetPassword('plain-reset-token', 'StrongPass123');

  assert.equal(result.message, 'Password reset successfully.');
  assert.equal(await bcrypt.compare('StrongPass123', user.passwordHash), true);
  assert.ok(resetToken.usedAt instanceof Date);
  assert.equal(
    mocks.calls.lookupOptions.where.tokenHash,
    crypto.createHash('sha256').update('plain-reset-token').digest('hex'),
  );
  assert.equal(mocks.calls.lookupOptions.lock, 'UPDATE');
});

test('resetPassword rejects missing, expired, and already-used tokens', async (t) => {
  const invalidTokens = [
    null,
    { expiresAt: new Date(Date.now() - 1_000), usedAt: null },
    { expiresAt: new Date(Date.now() + 60_000), usedAt: new Date() },
  ];

  for (const resetToken of invalidTokens) {
    let userLookupCount = 0;
    const mocks = mockResetDependencies({
      resetToken,
      user: {
        async update() {
          userLookupCount += 1;
        },
      },
    });
    t.after(mocks.restore);

    await assert.rejects(
      resetPassword('plain-reset-token', 'StrongPass123'),
      (error) => error.statusCode === 400,
    );
    assert.equal(userLookupCount, 0);
  }
});

test('resetPassword hashes tokens before lookup and rejects weak passwords', async (t) => {
  const resetToken = {
    expiresAt: new Date(Date.now() + 60_000),
    usedAt: null,
    userId: 'user-id',
  };
  const mocks = mockResetDependencies({ resetToken, user: null });
  t.after(mocks.restore);

  await assert.rejects(
    resetPassword('plain-reset-token', 'short'),
    (error) => error.statusCode === 400,
  );
  assert.equal(mocks.calls.lookupOptions, undefined);
});
