import express from 'express';
export const postsRouter = express.Router();

postsRouter.get('/', (req, res) => {
    // TODO
    res.send('Receiving all public posts');
});

postsRouter.get('/:id', (req, res) => {
    // TODO
    res.send('Receiving a specific post');
});

postsRouter.post('/create', async (req, res) => {
    // TODO
    res.send('Creating a new post');
});
