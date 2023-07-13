const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs'); // 비밀번호 이중보안 
const jwt = require('jsonwebtoken');
const User = require('../models/users.js'); // Sequelize User 모델
const jwtValidation = require('../middleware/auth-middleware');

// 로그인 구현
router.post('/login', async (req, res) => {
    try {
        const { nickname, password } = req.body; // 클라이언트로부터 닉네임과 패스워드 받기

        // 유저 찾기
        const user = await User.findOne({ where: { nickname } }); // 닉네임을 기반으로 사용자를 검색
        if (!user) { // 사용자가 없는 경우
            return res.status(412).json({ errorMessage: "닉네임 또는 패스워드를 확인해주세요." });
        }

        // 비밀번호 검사
        const isMatch = await bcrypt.compare(password, user.password); // 입력한 비밀번호와 데이터베이스에 저장된 해시된 비밀번호 비교
        if (!isMatch) { // 비밀번호가 일치하지 않는 경우
            return res.status(412).json({ errorMessage: "닉네임 또는 패스워드를 확인해주세요." });
        }

        // JWT 토큰 생성
        const token = jwt.sign(
            { userId: user.id }, // 페이로드는 사용자 ID
            process.env.JWT_SECRET, // JWT 시크릿 키
            { expiresIn: '1h' } // 토큰 유효 시간은 1시간 // 엥 왜 1시간으로 해놨지?
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
    // 쿠키에서 JWT 토큰 삭제
    res.clearCookie('token');
    return res.status(200).json({ message: "로그아웃에 성공하였습니다." });
});


module.exports = router;
