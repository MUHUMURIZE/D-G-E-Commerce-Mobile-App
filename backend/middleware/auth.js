const jwt = require('jsonwebtoken');
const { User, RevokedToken } = require('../models');
const env = require('../config/env');

async function authenticateToken(req, res, next) {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;

  if (!token) {
    return res.status(401).json({ message: 'Authentication token is required.' });
  }

  try {
    const decoded = jwt.verify(token, env.jwtSecret);
    const revoked = await RevokedToken.findOne({ where: { tokenHash: getTokenHash(token) } });
    if (revoked) {
      return res.status(401).json({ message: 'This session has been revoked.' });
    }

    const user = await User.findByPk(decoded.id);
    if (!user) {
      return res.status(401).json({ message: 'User no longer exists.' });
    }

    req.user = { id: user.id, fullName: user.fullName, email: user.email, role: user.role };
    return next();
  } catch (error) {
    return res.status(401).json({ message: 'Invalid or expired token.' });
  }
}

function getTokenHash(token) {
  const crypto = require('node:crypto');
  return crypto.createHash('sha256').update(token).digest('hex');
}

function requireAdmin(req, res, next) {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Admin access required.' });
  }
  return next();
}

module.exports = { authenticateToken, requireAdmin };
