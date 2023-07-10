const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Users = require('../models/users');
const jwtValidation = require('../middleware/auth-middleware');

// 로그인 구현
router.post('/login', async (req, res) => {
    try {
        const { nickname, password } = req.body;
        
        // 유저 찾기
        const user = await Users.findOne({ nickname });
        if (!user) {
            return res.status(412).json({ errorMessage: "닉네임 또는 패스워드를 확인해주세요." });
        }
        
        // 비밀번호 검사
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(412).json({ errorMessage: "닉네임 또는 패스워드를 확인해주세요." });
        }
        
        // JWT 토큰 생성
        const token = jwt.sign(
            { userId: user._id },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );
        
        // 쿠키에 토큰 저장
        res.cookie('token', token, { httpOnly: true });
        return res.status(200).json({ message: "로그인에 성공하였습니다." });
    } catch (error) {
        return res.status(400).json({ errorMessage: "로그인에 실패하였습니다." });
    }
});

// 로그아웃 구현
router.get('/logout', jwtValidation, (req, res) => {
    res.clearCookie('token');
    return res.status(200).json({ message: "로그아웃에 성공하였습니다." });
});

module.exports = router;
