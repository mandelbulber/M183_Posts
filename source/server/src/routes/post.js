import express from 'express';
import { createPost, getAllPublishedPosts, getPostById, changePostStatus, addComment } from '../controllers/postController.js';
export const postsRouter = express.Router();

// TODO: Add authentication where needed

postsRouter.get('/', async (req, res) => {
    const posts = await getAllPublishedPosts();
    res.send(posts);
});

postsRouter.get('/:id', async (req, res) => {
    const post = await getPostById(req.params.id);
    res.send(post);
});

postsRouter.post('/create', async (req, res) => {
    const { title, content, username } = req.body;

    // check if all parameters are provided
    if (!title || !content || !username) {
        res.statusMessage = 'Missing parameters';
        return res.status(400).end(); // 400 bad request
    }

    await createPost(title, content, username).then(() => {
        res.status(201).end();
    });
});

postsRouter.post('/update', async (req, res) => {
    const { postId, status } = req.body;

    // check if all parameters are provided
    if (!postId || !status) {
        res.statusMessage = 'Missing parameters';
        return res.status(400).end(); // 400 bad request
    }

    await changePostStatus(postId, status).then(() => {
        res.status(200).end();
    });
});

postsRouter.post('/comment', async (req, res) => {
    const { postId, content, username } = req.body;

    // check if all parameters are provided
    if (!postId || !content || !username) {
        res.statusMessage = 'Missing parameters';
        return res.status(400).end(); // 400 bad request
    }

    await addComment(postId, content, username).then(() => {
        res.status(200).end();
    });
});

    
