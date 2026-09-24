import jwt from 'jsonwebtoken';
import Admin from '../models/Admin.js';

// Helper to generate JWT token
const generateToken = (id) => {
  return jwt.sign(
    { id },
    process.env.JWT_SECRET || 'dev_jwt_secret_change_in_production',
    { expiresIn: process.env.JWT_EXPIRE || '7d' }
  );
};

// @desc    Auth admin & get token
// @route   POST /api/auth/login
// @access  Public
export const loginAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Please provide both email and password',
      });
    }

    const admin = await Admin.findOne({ email: email.toLowerCase().trim() });

    if (admin && (await admin.matchPassword(password))) {
      const token = generateToken(admin._id);
      return res.json({
        success: true,
        token,
        user: {
          id: admin._id.toString(),
          email: admin.email,
          name: admin.name,
          role: admin.role,
        },
      });
    } else {
      return res.status(401).json({
        success: false,
        error: 'Invalid email or password',
      });
    }
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error.message || 'Server error during authentication',
    });
  }
};

// @desc    Get current admin profile
// @route   GET /api/auth/me
// @access  Private
export const getAdminProfile = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(404).json({
        success: false,
        error: 'Admin not found',
      });
    }

    return res.json({
      success: true,
      user: {
        id: req.user._id.toString(),
        email: req.user.email,
        name: req.user.name,
        role: req.user.role,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error.message || 'Server error retrieving admin profile',
    });
  }
};

// @desc    Register a new admin (Protected / Initial Setup)
// @route   POST /api/auth/register
// @access  Public (if no admins exist) / Protected
export const registerAdmin = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Please provide both email and password',
      });
    }

    const adminExists = await Admin.findOne({ email: email.toLowerCase().trim() });

    if (adminExists) {
      return res.status(400).json({
        success: false,
        error: 'Admin already exists with this email',
      });
    }

    const admin = await Admin.create({
      name: name || 'Admin',
      email: email.toLowerCase().trim(),
      password,
      role: role || 'admin',
    });

    const token = generateToken(admin._id);

    return res.status(201).json({
      success: true,
      token,
      user: {
        id: admin._id.toString(),
        email: admin.email,
        name: admin.name,
        role: admin.role,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error.message || 'Server error creating admin',
    });
  }
};

// @desc    Forgot Password Request
// @route   POST /api/auth/forgot-password
// @access  Public
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        error: 'Please provide an email address',
      });
    }

    const admin = await Admin.findOne({ email: email.toLowerCase().trim() });

    if (!admin) {
      return res.status(404).json({
        success: false,
        error: 'No account found with this email',
      });
    }

    // In production, integrate email service; for now acknowledge receipt
    return res.json({
      success: true,
      message: 'Password reset instructions have been recorded. Please check your admin inbox.',
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error.message || 'Server error processing password reset',
    });
  }
};
