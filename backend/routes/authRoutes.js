const express = require('express');
const { body } = require('express-validator');
const { authenticateToken } = require('../middleware/auth');
const { validateRequest } = require('../middleware/validateRequest');
const { registerUser, loginUser, getProfile, updateProfile, forgotPassword, logoutUser } = require('../services/authService');

const router = express.Router();

/**
 * @openapi
 * /api/auth/register:
 *   post:
 *     tags: [Auth]
 *     summary: Register a new customer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [fullName, email, password]
 *             properties:
 *               fullName:
 *                 type: string
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *               phone:
 *                 type: string
 *     responses:
 *       201:
 *         description: User created successfully
 */
router.post(
  '/register',
  [
    body('fullName').trim().isLength({ min: 2 }).withMessage('Full name is required.'),
    body('email').isEmail().withMessage('Please provide a valid email address.'),
    body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters.'),
  ],
  validateRequest,
  async (req, res, next) => {
    try {
      const user = await registerUser(req.body);
      res.status(201).json(user);
    } catch (error) {
      next(error);
    }
  },
);

/**
 * @openapi
 * /api/auth/login:
 *   post:
 *     tags: [Auth]
 *     summary: Sign in with email and password
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Auth token returned
 */
router.post(
  '/login',
  [
    body('email').isEmail().withMessage('Please provide a valid email address.'),
    body('password').notEmpty().withMessage('Password is required.'),
  ],
  validateRequest,
  async (req, res, next) => {
    try {
      const session = await loginUser(req.body);
      res.json(session);
    } catch (error) {
      next(error);
    }
  },
);

/**
 * @openapi
 * /api/auth/forgot-password:
 *   post:
 *     tags: [Auth]
 *     summary: Request a password reset email
 */
router.post(
  '/forgot-password',
  [body('email').isEmail().withMessage('Please provide a valid email address.')],
  validateRequest,
  async (req, res, next) => {
    try {
      const response = await forgotPassword(req.body.email);
      res.json(response);
    } catch (error) {
      next(error);
    }
  },
);

router.get('/profile', authenticateToken, async (req, res, next) => {
  try {
    const profile = await getProfile(req.user.id);
    res.json(profile);
  } catch (error) {
    next(error);
  }
});

router.put('/profile', authenticateToken, async (req, res, next) => {
  try {
    const profile = await updateProfile(req.user.id, req.body);
    res.json(profile);
  } catch (error) {
    next(error);
  }
});

router.post('/logout', authenticateToken, async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization || '';
    const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;
    const response = await logoutUser(token);
    res.json(response);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
