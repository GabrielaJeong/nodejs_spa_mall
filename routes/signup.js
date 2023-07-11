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
        .required()
        .custom((value, helpers) => {
            if (value.includes(helpers.state.ancestors[0].nickname)) {
                return helpers.message('패스워드에 닉네임이 포함되어 있습니다.');
            }
            return value;
        }),
    passwordConfirm: Joi.any()
        .equal(Joi.ref('password'))
        .required()
        .messages({ 'any.only': '비밀번호가 일치하지 않습니다' })
});

const loginSchema = Joi.object({
    nickname: Joi.string().required(),
    password: Joi.string().required()
});


// 회원 가입
router.post('/signup', async (req, res) => {
    try {
        const { error } = signupSchema.validate(req.body);
        if (error) {
            if (error.details[0].context.key === 'nickname') {
                return res.status(412).send({ errorMessage: '닉네임의 형식이 일치하지 않습니다.' });
            }
        } 

        const { nickname, password } = req.body;

        // 중복 닉네임 확인
        const exists = await User.findOne({ where: { nickname: nickname } }); // =Users.exists()
        if (exists) {
            return res.status(412).json({ errorMessage: '중복된 닉네임입니다.' });
        }

        const hashedPassword = bcrypt.hashSync(password, 10);
        const user = await User.create({ // = new Users()
            nickname: nickname, 
            password: hashedPassword
        });

        res.status(201).json({});
    } catch (error) {
        res.status(400).json({ errorMessage: '요청한 데이터 형식이 올바르지 않습니다.' });
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
        const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
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
