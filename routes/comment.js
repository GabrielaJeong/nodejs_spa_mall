

const express = require('express');
const router = express.Router();

const Comment = require('../models/comment');

// 댓글 작성
router.post('/:_postId/comment', async (req, res) => {
    const { user, content, password } = req.body;
    const postId = req.params._postId;

    try {
        const savedComment = await Comment.create({ postId, user, content, password });
        if (!savedComment) {
            return res.status(404).json({ message: "댓글 내용을 입력해주세요."});
        }
        res.status(201).json({ message: "댓글을 생성하였습니다." });
    } catch (error) {
        console.log(error);
        res.status(400).json({ message: "데이터 형식이 올바르지 않습니다." });
    }
});

// 댓글 조회 (특정 게시글에 달린 댓글 전체)
router.get('/:_postId/comment', async (req, res) => {
    try {
        const comments = await Comment.findOne({ postId: req.params._postId }).sort('-createdAt'); //findone
        res.json(comments);
    } catch (error) {
        res.status(400).json({ message: "데이터 형식이 올바르지 않습니다." });
    }
});

// 댓글 수정
router.put('/:_postId/comment/:_commentId', async (req, res) => {
    const { password, content, ...rest } = req.body;
    console.log(req.body);

    try {
        const comment = await Comment.findById(req.params._commentId);
        comment.content = content;
        // comment.user = user;

        if (!comment) { // 코멘트 아이디에 해당하는 게시글이 없음
            return res.status(404).json({ error: '댓글 조회에 실패하였습니다.' });
        }
        if (comment.password !== password) { // 입력한 패스워드와 저장된 패스워드가 다를 경우
            return res.status(400).json({ error: '데이터 형식이 올바르지 않습니다.' });
        }

        Object.entries(rest).forEach(([key, value]) => {
            comment[key] = value;
        });

        await comment.save();
        res.status(201).json({ message: "댓글을 수정하였습니다." });
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: error.toString() });
    }
});


// 댓글 삭제
router.delete('/:_postId/comment/:_commentId', async (req, res) => {
    const { password } = req.body;
    
    try {
        const comment = await Comment.findById(req.params._commentId);

        if (!comment) { // 포스트아이디에 해당하는 게시글이 없음
            return res.status(404).json({ message: '댓글 조회에 실패하였습니다.' });
        }
        if (comment.password !== password) {
            return res.status(400).json({ massage: '데이터 형식이 올바르지 않습니다.' });
        }
        res.status(201).json({ message: '댓글을 삭제하였습니다.' });
    } catch (error) {
        res.status(500).json({ error: error.toString() });
    }
});

module.exports = router;
