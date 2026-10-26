const dotenv = require('dotenv');

dotenv.config();

const required = ['DATABASE_URL', 'JWT_SECRET'];
for (const key of required) {
  if (!process.env[key]) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
}

if (process.env.JWT_SECRET.length < 32) {
  throw new Error('JWT_SECRET must be at least 32 characters long.');
}

const smtpFields = ['SMTP_HOST', 'SMTP_USER', 'SMTP_PASSWORD'];
const configuredSmtpFields = smtpFields.filter((key) => Boolean(process.env[key]));
if (configuredSmtpFields.length > 0 && configuredSmtpFields.length !== smtpFields.length) {
  throw new Error('SMTP_HOST, SMTP_USER, and SMTP_PASSWORD must be configured together.');
}

module.exports = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: Number(process.env.PORT || 3000),
  databaseUrl: process.env.DATABASE_URL,
  jwtSecret: process.env.JWT_SECRET,
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '1h',
  corsOrigins: (process.env.CORS_ORIGINS || '')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean),
  passwordResetUrl: process.env.PASSWORD_RESET_URL || '',
  passwordResetTokenTtlMinutes: Number(process.env.PASSWORD_RESET_TOKEN_TTL_MINUTES || 30),
  smtp: configuredSmtpFields.length === smtpFields.length
    ? {
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT || 587),
        secure: process.env.SMTP_SECURE === 'true',
        user: process.env.SMTP_USER,
        password: process.env.SMTP_PASSWORD,
        from: process.env.SMTP_FROM || process.env.SMTP_USER,
      }
    : null,
};
