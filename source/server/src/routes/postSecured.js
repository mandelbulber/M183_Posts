import express from 'express';
import { getAllPublishedPosts } from '../controllers/postController.js';
import { logger } from '../logger/logger.js';

export const postSecuredRouter = express.Router();

postSecuredRouter.get('/', async (req, res) => {
    const apiKey = req.header('x-api-key');

    if (!apiKey) {
        logger.debug('Post Secured: Missing API key');
        res.statusMessage = 'Missing API key';
        return res.status(401).end(); // 401 unauthorized
    }

    if (apiKey !== process.env.API_KEY) {
        logger.debug('Post Secured: Invalid API key');
        res.statusMessage = 'Invalid API key';
        return res.status(403).end(); // 403 forbidden
    }

    const posts = await getAllPublishedPosts().catch((err) => {
        logger.error('Post Secured: Error while getting all published posts' + err);
        res.statusMessage = 'Internal server error';
        return res.status(500).end(); // 500 internal server error
    });
    logger.info(`Post Secured: ${posts.length} published posts returned`);
    res.send(posts);
});