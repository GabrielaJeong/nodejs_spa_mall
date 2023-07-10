const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Users = require('../models/users');
const jwtValidation = require('../middleware/auth-middleware');
const Joi = require('joi');

const signupSchema = Joi.object({
    nickname: Joi.string()
        .alphanum()
        .min(3)
        .required(),
    password: Joi.string()
        .min(4)
        .required(),
    passwordConfirm: Joi.ref('password')
});
const loginSchema = Joi.object({
    nickname: Joi.string().required(),
    password: Joi.string().required()
});

// 회원 가입
router.post('/signup', async (req, res) => {
    try {
        const result = signupSchema.validate(req.body);
        if (result.error) {
            return res.status(400).json({ errorMessage: result.error.details[0].message });
        }

        const { nickname, password } = req.body;

        // 중복 닉네임 확인
        const exists = await Users.exists({ nickname: nickname });
        if (exists) {
            return res.status(409).json({ errorMessage: '중복된 닉네임입니다.' });
        }

        const hashedPassword = bcrypt.hashSync(password, 10);
        const user = new Users({ nickname, password: hashedPassword });
        await user.save();

        res.status(201).json({});
    } catch (error) {
        res.status(400).json({ errorMessage: '회원 가입에 실패하였습니다.' });
    }
});

// 로그인
router.post('/login', async (req, res) => {
    try {
        const result = loginSchema.validate(req.body);
        if (result.error) {
            return res.status(400).json({ errorMessage: result.error.details[0].message });
        }

        const { nickname, password } = req.body;

        // 닉네임과 패스워드 확인
        const user = await Users.findOne({ nickname: nickname });
        if (!user || !bcrypt.compareSync(password, user.password)) {
            return res.status(412).json({ errorMessage: '닉네임 또는 패스워드를 확인해주세요.' });
        }

        // JWT 발행
        const token = jwt.sign({ userId: user._id }, 'SecretKey', { expiresIn: '1h' });
        res.cookie('userToken', `Bearer ${token}`, { httpOnly: true });
        res.status(200).json({});

    } catch (error) {
        res.status(400).json({ errorMessage: '로그인에 실패하였습니다.' });
    }
});

// 로그아웃
router.get('/logout', jwtValidation, (req, res) => {
    res.clearCookie('userToken');
    res.status(200).json({});
});

module.exports = router;
