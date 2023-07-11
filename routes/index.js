const express = require('express');

const postRoutes = require('./post');
const commentRoutes = require('./comment');
const userRoutes = require('./users.js');
const authRoutes = require('./auth.js');

const router = express.Router();

router.use('/posts', postRoutes);
router.use('/comments', commentRoutes);
router.use('/users', userRoutes);
router.use('/auth', authRoutes);

module.exports = router;
