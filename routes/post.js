

const express = require('express');
const router = express.Router();

const Post = require('../schemas/post');

// 게시글 작성
router.post('/', async (req, res) => {
    const { title, password, user, content } = req.body;
    try {
        const savedPost = await Post.create({ title, password, user, content });
        res.status(201).json({ message: "게시글을 생성하였습니다." });
    } catch (error) {
        console.log(error)
        res.status(400).json({ message: '데이터 형식이 올바르지 않습니다.' });

    }
});

// 게시글 조회 (전체)
router.get('/', async (req, res) => {
    try {
        const posts = await Post.find().sort('-createdAt');
        res.json(posts);
    } catch (error) {
        res.status(400).json({ error: error.toString() });
    }
});



// 게시글 상세조회 (특정 게시글)
router.get('/:_postId', async (req, res) => {
    try {
        const post = await Post.findById(req.params._postId);
        if (!post) {
            return res.status(404).json({ error: "포스트를 찾을 수 없습니다."});
        }
        res.json(post);
    } catch (error) {
        console.log(error);
        res.status(400).json({ message: '데이터 형식이 올바르지 않습니다.' });
    }
});


// 게시글 수정
router.put('/:_postId', async (req, res) => {
    const { password, ...rest } = req.body;
    try {
        const post = await Post.findById(req.params._postId);
        if (!post) { // 포스트아이디에 해당하는 게시글이 없음
            return res.status(404).json({ error: '게시글 조회에 실패하였습니다.' });
        }
        if (post.password !== password) { // 입력한 패스워드와 저장된 패스워드가 다를 경우
            return res.status(400).json({ error: '데이터 형식이 올바르지 않습니다.' });
        }

        Object.entries(rest).forEach(([key, value]) => {
            post[key] = value;
        });

        await post.save();
        res.status(201).json({ message: "게시글을 수정하였습니다." });
    } catch (error) {
        res.status(400).json({ error: error.toString() });
    }
});


// 게시글 삭제
router.delete('/:_postId', async (req, res) => {
    const { password } = req.body;

    try {
        const post = await Post.findById(req.params._postId);
        if (!post) { // 포스트아이디에 해당하는 게시글이 없음
            return res.status(404).json({ error: '게시글 조회에 실패하였습니다.' });
        }
        if (post.password !== password) {
            return res.status(400).json({ massage: '데이터 형식이 올바르지 않습니다.' });
        }
        res.status(201).json({ message: '게시글을 삭제하였습니다.' });
    } catch (error) {
        res.status(400).json({ error: error.toString() });
    }
});

module.exports = router;
