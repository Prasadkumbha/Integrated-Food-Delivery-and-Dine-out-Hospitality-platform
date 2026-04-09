const express = require('express');
const router = express.Router();
const { registerUser, loginUser } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

router.post('/register', registerUser);
router.post('/login', loginUser);

// Protected test route
router.get('/me', protect, async (req, res) => {
  res.json({
    message: 'You are authenticated!',
    user: req.user,
  });
});

module.exports = router;