import express from 'express';
import { getAllPublishedPosts } from '../controllers/postController.js';
export const postSecuredRouter = express.Router();

// TODO: Add authentication where needed

postSecuredRouter.get('/', async (req, res) => {
    const apiKey = req.header('x-api-key');

    if (!apiKey) {
        res.statusMessage = 'Missing API key';
        return res.status(401).end(); // 401 unauthorized
    }

    if (apiKey !== process.env.API_KEY) {
        res.statusMessage = 'Invalid API key';
        return res.status(403).end(); // 403 forbidden
    }

    const posts = await getAllPublishedPosts();
    res.send(posts);
});

    
