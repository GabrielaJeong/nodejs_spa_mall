const express = require('express');
const router = express.Router();
const jwtValidation = require('../middleware/auth-middleware');
const Post = require('../models/post');
const Comment = require('../models/comment');
const { Op } = require("sequelize");

// Authorization middleware
const authMiddleware = async (req, res, next) => {
    try {
        const { userId } = req.decoded;
        const comment = await Comment.findByPk(req.params._commentId);
        if (!comment || comment.userId !== userId) {
            return res.status(403).json({ errorMessage: '권한이 없습니다.' });
        }
        next();
    } catch (error) {
        console.error(error);
        return res.status(400).json({ errorMessage: '권한 확인에 실패했습니다.' });
    }
};


// 댓글 작성
router.post('/:_postId/comment', jwtValidation, async (req, res) => {
    const { content } = req.body;
    const { userId } = req.decoded;
    const postId = req.params._postId;

    try {
        // 게시글이 존재하는지 확인
        const postExists = await Post.findOne({ where: { id: postId } });
        if (!postExists) {
            return res.status(404).json({ errorMessage: "게시글이 존재하지 않습니다." });
        }
        // 댓글 작성
        const savedComment = await Comment.create({ postId, userId, content });
        if (!savedComment) {
            return res.status(412).json({ errorMessage: "데이터 형식이 올바르지 않습니다." });
        }
        res.status(201).json({ message: "댓글을 생성하였습니다." });
    } catch (error) {
        if (error.name === "SequelizeValidationError") {
            return res.status(412).json({ errorMessage: "데이터 형식이 올바르지 않습니다." });
        } else {
            console.error(error);
            return res.status(400).json({ errorMessage: "댓글 작성에 실패하였습니다." });
        }
    }
});

// 댓글 조회 (특정 게시글에 달린 댓글 전체)
router.get('/:_postId/comment', async (req, res) => {
    const postId = req.params._postId;

    try {
        // 게시글이 존재하는지 확인
        const postExists = await Post.findOne({ where: { id: postId } });
        if (!postExists) {
            return res.status(404).json({ errorMessage: "게시글이 존재하지 않습니다." });
        }

        // 게시글에 달린 댓글 조회
        const comments = await Comment.findAll({ where: { postId: postId }, order: [['createdAt', 'DESC']] });
        res.json(comments);
    } catch (error) {
        console.error(error);
        res.status(400).json({ errorMessage: "댓글 조회에 실패하였습니다." });
    }
});


// 댓글 수정
router.put('/:_postId/comment/:_commentId', jwtValidation, async (req, res) => {
    const { password, content, ...rest } = req.body;
    const postId = req.params._postId;
    const commentId = req.params._commentId;

    // 쿠키 확인 (로그인 상태)
    if (!req.cookies || !req.cookies.user) {
        return res.status(403).json({ errorMessage: "로그인이 필요한 기능입니다." });
    }

    // 쿠키 유효성 검사
    let user;
    try {
        user = jwt.verify(req.cookies.user, process.env.JWT_SECRET);
    } catch (e) {
        return res.status(403).json({ errorMessage: "전달된 쿠키에서 오류가 발생하였습니다." });
    }

    try {
        // 게시글이 존재하는지 확인
        const postExists = await Post.findByPk(postId);
        if (!postExists) {
            return res.status(404).json({ errorMessage: "게시글이 존재하지 않습니다." });
        }

        // 댓글이 존재하는지 확인
        const comment = await Comment.findByPk(commentId);
        if (!comment) {
            return res.status(404).json({ errorMessage: "댓글이 존재하지 않습니다." });
        }

        // 권한 확인
        if (comment.user !== user.username) {
            return res.status(403).json({ errorMessage: "댓글의 수정 권한이 존재하지 않습니다." });
        }

        // 댓글 수정
        await comment.update({ content, ...rest });

        res.status(201).json({ message: "댓글을 수정하였습니다." });
    } catch (error) {
        console.error(error);
        res.status(500).json({ errorMessage: "댓글 수정에 실패하였습니다." });
    }
});



// 댓글 삭제
router.delete('/:_postId/comment/:_commentId', jwtValidation, async (req, res) => {
    try {
        const post = await Post.findOne({ where: { id: req.params._postId } });
        if (!post) {
            return res.status(404).json({ errorMessage: '게시글이 존재하지 않습니다.' });
        }

        const comment = await Comment.findOne({ where: { id: req.params._commentId } });
        if (!comment) {
            return res.status(404).json({ errorMessage: '댓글이 존재하지 않습니다.' });
        }

        if (String(comment.userId) !== String(res.locals.user._id)) {
            return res.status(403).json({ errorMessage: '댓글의 삭제 권한이 존재하지 않습니다.' });
        }

        await comment.destroy();
        res.status(200).json({ message: '댓글을 삭제하였습니다.' });

    } catch (error) {
        console.error(error);
        res.status(400).json({ errorMessage: '댓글 삭제에 실패하였습니다.' });
    }
});



module.exports = router;
