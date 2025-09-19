import express from 'express';
import bcrypt from 'bcryptjs';
import jwt, { SignOptions } from 'jsonwebtoken';
import Joi from 'joi';
import { DatabaseService } from '@/services/databaseService';
import { User, UserRole, ApiResponse } from '@/types';
import { authMiddleware } from '@/middleware/auth';

const router = express.Router();

// Validation schemas
const registerSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(8).required(),
  name: Joi.string().min(2).required(),
  role: Joi.string().valid(...Object.values(UserRole)).optional().default(UserRole.OPERATOR)
});

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required()
});

// Register new user
router.post('/register', async (req, res) => {
  try {
    const { error, value } = registerSchema.validate(req.body);
    if (error) {
      const response: ApiResponse = {
        success: false,
        error: error.details[0].message
      };
      return res.status(400).json(response);
    }

    const databaseService: DatabaseService = req.app.locals.databaseService;
    const { email, password, name, role } = value;

    // Check if user already exists
    const existingUser = await databaseService.getUserByEmail(email);
    if (existingUser) {
      const response: ApiResponse = {
        success: false,
        error: 'User with this email already exists'
      };
      return res.status(400).json(response);
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create user
    const newUser = await databaseService.createUser({
      email,
      password: hashedPassword,
      name,
      role,
      active: true
    });

    // Generate JWT token
    const token = jwt.sign(
      { userId: newUser.id, email: newUser.email, role: newUser.role },
      process.env.JWT_SECRET!,
      { expiresIn: process.env.JWT_EXPIRE || '7d' } as SignOptions
    );

    const response: ApiResponse = {
      success: true,
      data: {
        user: {
          id: newUser.id,
          email: newUser.email,
          name: newUser.name,
          role: newUser.role,
          active: newUser.active
        },
        token
      },
      message: 'User registered successfully'
    };

    return res.status(201).json(response);
  } catch (error) {
    console.error('Registration error:', error);
    const response: ApiResponse = {
      success: false,
      error: 'Failed to register user'
    };
    return res.status(500).json(response);
  }
});

// Login user
router.post('/login', async (req, res) => {
  try {
    const { error, value } = loginSchema.validate(req.body);
    if (error) {
      const response: ApiResponse = {
        success: false,
        error: error.details[0].message
      };
      return res.status(400).json(response);
    }

    const databaseService: DatabaseService = req.app.locals.databaseService;
    const { email, password } = value;

    // Find user
    const user = await databaseService.getUserByEmail(email);
    if (!user || !user.active) {
      const response: ApiResponse = {
        success: false,
        error: 'Invalid email or password'
      };
      return res.status(401).json(response);
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      const response: ApiResponse = {
        success: false,
        error: 'Invalid email or password'
      };
      return res.status(401).json(response);
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET!,
      { expiresIn: process.env.JWT_EXPIRE || '7d' } as SignOptions
    );

    const response: ApiResponse = {
      success: true,
      data: {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          active: user.active
        },
        token
      },
      message: 'Login successful'
    };

    return res.json(response);
  } catch (error) {
    console.error('Login error:', error);
    const response: ApiResponse = {
      success: false,
      error: 'Failed to login'
    };
    return res.status(500).json(response);
  }
});

// Get current user profile
router.get('/profile', authMiddleware, async (req, res) => {
  try {
    const databaseService: DatabaseService = req.app.locals.databaseService;
    const userId = req.user!.userId;

    const user = await databaseService.getUserById(userId);
    if (!user) {
      const response: ApiResponse = {
        success: false,
        error: 'User not found'
      };
      return res.status(404).json(response);
    }

    const response: ApiResponse = {
      success: true,
      data: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        active: user.active,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      }
    };

    return res.json(response);
  } catch (error) {
    console.error('Profile error:', error);
    const response: ApiResponse = {
      success: false,
      error: 'Failed to get user profile'
    };
    return res.status(500).json(response);
  }
});

// Update user profile
router.put('/profile', authMiddleware, async (req, res) => {
  try {
    const updateSchema = Joi.object({
      name: Joi.string().min(2).optional(),
      email: Joi.string().email().optional()
    });

    const { error, value } = updateSchema.validate(req.body);
    if (error) {
      const response: ApiResponse = {
        success: false,
        error: error.details[0].message
      };
      return res.status(400).json(response);
    }

    const databaseService: DatabaseService = req.app.locals.databaseService;
    const userId = req.user!.userId;

    // Check if email is already taken (if being updated)
    if (value.email) {
      const existingUser = await databaseService.getUserByEmail(value.email);
      if (existingUser && existingUser.id !== userId) {
        const response: ApiResponse = {
          success: false,
          error: 'Email is already taken'
        };
        return res.status(400).json(response);
      }
    }

    await databaseService.updateUser(userId, value);

    const response: ApiResponse = {
      success: true,
      message: 'Profile updated successfully'
    };

    return res.json(response);
  } catch (error) {
    console.error('Profile update error:', error);
    const response: ApiResponse = {
      success: false,
      error: 'Failed to update profile'
    };
    return res.status(500).json(response);
  }
});

// Change password
router.put('/change-password', authMiddleware, async (req, res) => {
  try {
    const changePasswordSchema = Joi.object({
      currentPassword: Joi.string().required(),
      newPassword: Joi.string().min(8).required()
    });

    const { error, value } = changePasswordSchema.validate(req.body);
    if (error) {
      const response: ApiResponse = {
        success: false,
        error: error.details[0].message
      };
      return res.status(400).json(response);
    }

    const databaseService: DatabaseService = req.app.locals.databaseService;
    const userId = req.user!.userId;
    const { currentPassword, newPassword } = value;

    // Get user
    const user = await databaseService.getUserById(userId);
    if (!user) {
      const response: ApiResponse = {
        success: false,
        error: 'User not found'
      };
      return res.status(404).json(response);
    }

    // Verify current password
    const isValidPassword = await bcrypt.compare(currentPassword, user.password);
    if (!isValidPassword) {
      const response: ApiResponse = {
        success: false,
        error: 'Current password is incorrect'
      };
      return res.status(401).json(response);
    }

    // Hash new password
    const hashedNewPassword = await bcrypt.hash(newPassword, 12);

    // Update password
    await databaseService.updateUser(userId, { password: hashedNewPassword });

    const response: ApiResponse = {
      success: true,
      message: 'Password changed successfully'
    };

    return res.json(response);
  } catch (error) {
    console.error('Change password error:', error);
    const response: ApiResponse = {
      success: false,
      error: 'Failed to change password'
    };
    return res.status(500).json(response);
  }
});

export { router as authRouter };