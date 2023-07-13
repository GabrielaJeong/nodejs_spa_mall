const express = require('express');
const Joi = require('joi');
const jwt = require('jsonwebtoken');

const cookieParser = require('cookie-parser');
const Post = require('../models/post');

router.use(cookieParser())
const router = express.Router();

// Joi 스키마 정의 - 게시글 작성시 필요한 데이터 형식
const postSchema = Joi.object({
    title: Joi.string().required(),
    content: Joi.string().required(),
});


// JWT 미들웨어 - 쿠키에서 토큰 추출하고 검증
const verifyToken = (req, res, next) => {
    try {
        // 쿠키에서 토큰 가져오기
        const tokenValue = req.cookies.user;
        if (!tokenValue) {
            res.status(403).json({ errorMessage: '로그인이 필요한 기능입니다.' });
            return;
        }
        const { userId } = jwt.verify(tokenValue, process.env.JWT_SECRET_KEY); // JWT 토큰 검증
        res.locals.userId = userId; // 검증된 사용자 ID를 응답 객체에 추가
        next();
    } catch (error) {
        res.status(403).json({ errorMessage: '전달된 쿠키에서 오류가 발생하였습니다.' });
    }
};

// 게시글 작성
router.post('/', verifyToken, async (req, res) => {
    try {
        const { error } = postSchema.validate(req.body); // 입력 값 유효성 검사
        if (error) {
            // 에러 메시지 반환
            if (error.details[0].context.key === 'title') {
                return res.status(412).send({ errorMessage: '게시글 제목의 형식이 일치하지 않습니다.' });
            } else if (error.details[0].context.key === 'content') {
                return res.status(412).send({ errorMessage: '게시글 내용의 형식이 일치하지 않습니다.' });
            }
        }

        const { title, content } = req.body; // 클라이언트로부터 제목과 내용 받기
        const userId = res.locals.userId; // 로컬 변수에서 사용자 ID 받기

        const savedPost = await Post.create({ title, content, userId }); // 게시글 저장
        res.status(201).json({ message: "게시글을 생성하였습니다." });
    } catch (error) {
        console.log(error);
        res.status(400).json({ errorMessage: '게시글 작성에 실패하였습니다.' });
    }
});

// 게시글 조회 (전체)
router.get('/', async (req, res) => {
    try {
        const posts = await Post.findAll({ order: [['createdAt', 'DESC']] }); // 생성일자 내림차순으로 게시글 모두 찾기
        res.json(posts);
    } catch (error) {
        console.log(error);
        res.status(400).json({ errorMessage: '게시글 조회에 실패하였습니다.' });
    }
});


// 게시글 상세조회 (특정 게시글)
router.get('/:postId', async (req, res) => {
    try {
        const post = await Post.findOne({ where: { id: req.params.postId } }); // 게시글 ID로 특정 게시글 찾기
        if (!post) {
            return res.status(404).json({ errorMessage: '포스트를 찾을 수 없습니다.' });
        }
        res.json(post);
    } catch (error) {
        console.log(error);
        res.status(400).json({ errorMessage: '게시글 조회에 실패하였습니다.' });
    }
});



// 게시글 수정
router.put('/:_postId', verifyToken, async (req, res) => {
    const { title, content } = req.body;

    // Joi를 사용하여 데이터 형식 검증
    const { error } = postUpdateSchema.validate({ title, content });
    if (error) {
        const errorMessage = getErrorMessage(error);
        return res.status(412).json({ errorMessage });
    }

    const userId = res.locals.userId;

    try {
        const post = await Post.findOne({ where: { id: req.params._postId } });
        if (!post) { // 포스트아이디에 해당하는 게시글이 없음
            return res.status(404).json({ errorMessage: '게시글 조회에 실패하였습니다.' });
        }

        if (post.userId !== userId) { // 현재 사용자가 게시물의 소유자가 아닌 경우
            return res.status(403).json({ errorMessage: '게시글 수정의 권한이 존재하지 않습니다.' });
        }

        await Post.update({ title, content }, { where: { id: req.params._postId } });
        res.status(201).json({ message: "게시글을 수정하였습니다." });
    } catch (error) {
        console.log(error);
        res.status(400).json({ errorMessage: '게시글 수정에 실패하였습니다.' });
    }
});


// 게시글 삭제
router.delete('/:_postId', verifyToken, async (req, res) => {
    const { password } = req.body;
    const userId = res.locals.userId;
    try {
        const post = await Post.findOne({ where: { id: req.params._postId } });
        if (!post) { // 포스트아이디에 해당하는 게시글이 없음
            return res.status(404).json({ errorMessage: '게시글이 존재하지 않습니다.' });
        }
        if (post.userId !== userId) { // 입력한 패스워드와 저장된 패스워드가 다를 경우
            return res.status(403).json({ errorMessage: '게시글의 삭제 권한이 존재하지 않습니다.' });
        }

        // 게시글 삭제
        const deleteResult = await Post.destroy({ where: { id: req.params._postId } });
        if (!deleteResult) { // 삭제된 문서의 수가 0인 경우
            return res.status(401).json({ errorMessage: '게시글이 정상적으로 삭제되지 않았습니다.' });
        }

        res.status(201).json({ message: '게시글을 삭제하였습니다.' });
    } catch (error) {
        console.log(error);
        res.status(400).json({ errorMessage: '게시글 삭제에 실패하였습니다.' });
    }
});



module.exports = router;
