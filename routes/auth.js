require('dotenv').config();
const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs'); // 비밀번호 이중보안 
const jwt = require('jsonwebtoken');
const Users = require('../models/users.js');
const jwtValidation = require('../middleware/auth-middleware.js'); // 해당 라우터에만 적용될 수 있도록 미들웨어 끌어오기
const Joi = require('joi'); // 쪼이이이


const signupSchema = Joi.object({
    nickname: Joi.string()
        .alphanum() // 알파벳(대소문자 구별없이) + 숫자
        .min(3) // 미니멈 (최소 3글자)
        .required(), // 반드시 있어야함
    password: Joi.string()
        .min(4) // 미니멈 (최소 4글자)
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
        const { nickname, password } = req.body;

        const { error } = signupSchema.validate(req.body);
        if (error) {
            if (error.details[0].context.key === 'nickname') {
                return res.status(412).send({ errorMessage: '닉네임의 형식이 일치하지 않습니다.' });
            }
        } 

        // 중복 닉네임 확인
        const exists = await User.findOne({ where: { nickname: nickname } }); // =Users.exists()
        if (exists) {
            return res.status(412).json({ errorMessage: '중복된 닉네임입니다.' });
        }

        const hashedPassword = bcrypt.hashSync(password, Number(process.env.BCRYPT_ROUNDS)); // .env에 넣어놓기 ***
        const user = await user.create({ // = new Users()
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
        res.cookie('userToken', `Bearer ${token}`, { httpOnly: true }); // httpOnly안해놓으면 Javascript 변조 가능
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
