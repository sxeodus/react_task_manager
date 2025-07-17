const User = require('../models/User');
const jwt = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library');
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

exports.register = async (req, res) => {
  const { firstName, lastName, username, email, password, matchPassword } = req.body;

  if (password !== matchPassword) {
    return res.status(400).json({ success: false, message: 'Passwords do not match' });
  }

  try {
    // Check if user already exists
    let user = await User.findOne({ $or: [{ email }, { username }] });
    if (user) {
      return res.status(400).json({ success: false, message: 'User already exists' });
    }

    // Create new user
    user = await User.create({
      firstName,
      lastName,
      username,
      email,
      password,
    });

    // Create token
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: '1d',
    });

    res.status(201).json({
      success: true,
      token,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.login = async (req, res) => {
  const { email, password } = req.body;

  // Validate email & password were provided
  if (!email || !password) {
    return res.status(400).json({ success: false, message: 'Please provide an email and password' });
  }

  try {
    // Check for user and explicitly select password
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    // Check if password matches
    const isMatch = await user.matchPassword(password);

    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    // Create token
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: '1d',
    });

    res.status(200).json({
      success: true,
      token,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res, next) => {
  // req.user is available from the protect middleware
  const user = await User.findById(req.user.id);
  res.status(200).json({ success: true, data: user });
};

exports.googleLogin = async (req, res) => {
  const { idToken } = req.body;

  try {
    const ticket = await client.verifyIdToken({
        idToken,
        audience: process.env.GOOGLE_CLIENT_ID,
    });
    const { name, email, sub: googleId, given_name, family_name } = ticket.getPayload();

    let user = await User.findOne({ googleId });

    if (!user) {
      // If user with this googleId doesn't exist, check if an account with this email exists
      user = await User.findOne({ email });
      if (user) {
        // If email exists, link the googleId to that account
        user.googleId = googleId;
        await user.save();
      } else {
        // If no user found, create a new user
        // A username is required, let's create one from the email
        const username = email.split('@')[0] + Math.floor(1000 + Math.random() * 9000);
        user = await User.create({
          googleId,
          email,
          firstName: given_name,
          lastName: family_name,
          username: username,
        });
      }
    }

    // Create token
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
        expiresIn: '1d',
    });

    res.status(200).json({
        success: true,
        token,
    });

  } catch (error) {
    console.error('Google login error:', error);
    res.status(401).json({ success: false, message: 'Invalid Google Token' });
  }
};