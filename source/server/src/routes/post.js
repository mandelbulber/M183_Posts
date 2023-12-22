import express from 'express';
import { createPost, getAllPublishedPosts, getUserPosts, getAdminPosts, getPublishedPostById, changePostStatus, addComment } from '../controllers/postController.js';
import { cookieJwtAuth, checkUserAdmin } from '../controllers/authController.js';
import { logger } from '../logger/logger.js';
import { User } from '../models/user.js';
import { Post } from '../models/post.js';
import { Role } from '../models/role.js';
import { Status } from '../models/status.js';

export const postRouter = express.Router();

// TODO: Add authentication where needed

postRouter.get('/', async (req, res) => {
    const posts = await getAllPublishedPosts().catch((err) => {
        logger.error('Post: Error while getting all published posts' + err);
        res.statusMessage = 'Internal server error';
        return res.status(500).end(); // 500 internal server error
    });
    res.send(posts);
});

postRouter.get('/userPosts', async (req, res) => {
    // check if authenticated
    if (!await cookieJwtAuth(req, res)) {
        logger.debug('Post: Not authenticated');
        return res.status(401).end(); // 401 unauthorized
    }
    
    const posts = await getUserPosts(req.userData.username).catch((err) => {
        logger.error('Post: Error while getting all user posts' + err);
        res.statusMessage = 'Internal server error';
        return res.status(500).end(); // 500 internal server error
    });
    res.send(posts);
});

postRouter.get('/adminPosts', async (req, res) => {
    // check if authenticated
    if (!await cookieJwtAuth(req, res)) {
        logger.debug('Post: Not authenticated');
        return res.status(401).end(); // 401 unauthorized
    }

    if (!await checkUserAdmin(req.userData.username)) {
        logger.debug('Post: Not admin');
        return res.status(401).end(); // 401 unauthorized
    }
    
    const posts = await getAdminPosts().catch((err) => {
        logger.error('Post: Error while getting all user posts' + err);
        res.statusMessage = 'Internal server error';
        return res.status(500).end(); // 500 internal server error
    });
    res.send(posts);
});

postRouter.get('/:id', async (req, res) => {
    const post = await getPublishedPostById(req.params.id).catch((err) => {
        logger.error(`Post: Public post with id ${req.params.id} not found` + err);
        res.statusMessage = 'Post not found';
        return res.status(404).end(); // 404 not found
    });
    if (!post) {
        logger.error(`Post: Public post with id ${req.params.id} not found`);
        res.statusMessage = 'Post not found';
        return res.status(404).end(); // 404 not found
    }
    res.send(post);
});

postRouter.post('/create', async (req, res) => {
    // check if authenticated
    if (!await cookieJwtAuth(req, res)) {
        logger.debug('Post: Not authenticated');
        return res.status(401).end(); // 401 unauthorized
    }
    
    const { title, content } = req.body;

    // check if all parameters are provided
    if (!title || !content) {
        res.statusMessage = 'Missing parameters';
        return res.status(400).end(); // 400 bad request
    }

    await createPost(title, content, req.userData.username).then(() => {
        res.status(201).end();
    }).catch((err) => {
        logger.error('Post: Error while creating post' + err);
        res.statusMessage = 'Internal server error';
        return res.status(500).end(); // 500 internal server error
    });
});

postRouter.post('/update', async (req, res) => {
    // check if authenticated
    if (!await cookieJwtAuth(req, res)) {
        logger.debug('Post: Not authenticated');
        return res.status(401).end(); // 401 unauthorized
    }
    
    const { postId, status } = req.body;

    // check if all parameters are provided
    if (!postId || !status) {
        res.statusMessage = 'Missing parameters';
        return res.status(400).end(); // 400 bad request
    }

    // Get current user and post
    const currentUser = await User.findOne({
        include: [{
            model: Role,
            attributes: ['name'],
        }],
        where: {username: req.userData.username}, 
        attributes: ['id', 'username']
    }).then((user) => {
        return user;
    }).catch((err) => {
        logger.error(`Post: User with username ${req.userData.username} not found` + err);
    });

    const currentPost = await Post.findOne({
        include: [{
            model: User,
            attributes: ['username'],
        },{
            model: Status,
            attributes: ['name'],
        }],
        where: {id: postId}
    }).then((post) => {
        return post;
    }).catch((err) => {
        logger.error(`Post: Post with id ${postId} not found` + err);
    });

    // If user not admin and post is owned by user + req.status == deleted the update
    // If user == admin check all 3 status cases for update
    // hidden can be changed to published and deleted
    // published can be changed to hidden and deleted
    // deleted can be changed to hidden
    if(currentUser.role.name == 'user' && status != 'deleted'){
        res.statusMessage = 'Unauthorized';
        return res.status(401).end(); // 401 unauthorized
    }else if(currentUser.role.name == 'admin'){
        if(currentPost.status.name == 'hidden' && !(status == 'published' || status == 'deleted')){
            res.statusMessage = `Not allowed to change post status from ${currentPost.status.name} to ${status}`;
            return res.status(422).end(); // 422 unprocessable entity
        }else if(currentPost.status.name == 'published' && !(status == 'hidden' || status == 'deleted')){
            res.statusMessage = `Not allowed to change post status from ${currentPost.status.name} to ${status}`;
            return res.status(422).end(); // 422 unprocessable entity
        }else if(currentPost.status.name == 'deleted' && status != 'hidden'){
            res.statusMessage = `Not allowed to change post status from ${currentPost.status.name} to ${status}`;
            return res.status(422).end(); // 422 unprocessable entity
        }
    }

    await changePostStatus(postId, status).then(() => {
        res.status(200).end();
    }).catch((err) => {
        logger.error('Post: Error while changing post status' + err);
        res.statusMessage = 'Internal server error';
        return res.status(500).end(); // 500 internal server error
    })
});

postRouter.post('/comment', async (req, res) => {
    // check if authenticated
    if (!await cookieJwtAuth(req, res)) {
        logger.debug('Post: Not authenticated');
        return res.status(401).end(); // 401 unauthorized
    }
    
    const { postId, content } = req.body;

    // check if all parameters are provided
    if (!postId || !content) {
        res.statusMessage = 'Missing parameters';
        return res.status(400).end(); // 400 bad request
    }

    await addComment(postId, content, req.userData.username).then(() => {
        res.status(200).end();
    }).catch((err) => {
        logger.error('Post: Error while adding comment' + err);
        res.statusMessage = 'Internal server error';
        return res.status(500).end(); // 500 internal server error
    })
});