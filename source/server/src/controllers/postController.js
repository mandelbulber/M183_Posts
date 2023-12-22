import { Post } from '../models/post.js';
import { Status } from '../models/status.js';
import { User } from '../models/user.js';
import { Comment } from '../models/comment.js';
import { logger } from '../logger/logger.js';
import { Op } from 'sequelize';

export const createPost = async (title, content, username) => {
    await Post.create({
            title: title,
            content: content,
    }).then(async (post) => {
        await Status.findOne({
            where: {name: 'hidden'}, 
        }).then(async (status) => {
            await post.setStatus(status);
        }).catch((err) => {
            throw err;
        });
        await User.findOne({
            where: {username: username}, 
        }).then(async (user) => {
            await post.setUser(user);
        }).catch((err) => {
            throw err;
        });
    }).catch((err) => {
        throw err;
    });
}

export const getAllPublishedPosts = async () => {
    const posts = await Post.findAll({
        include: [{
            model: Status,
            where: {name: 'published'},
            attributes: ['name']
        },{
            model: User,
            attributes: ['username']
        }],
        attributes: ['id', 'title', 'content']
    }).then((posts) => {
        return posts;
    }).catch((err) => {
        throw err;
    });
    return posts;
}

export const getUserPosts = async (username) => {
    const user = await User.findOne({
        where: {username: username},
    });

    const posts = await Post.findAll({
        include: [{
            model: Status,
            where: {name: { [Op.ne]: 'deleted' }},
            attributes: ['name']
        },{
            model: User,
            where: {id: user.id},
            attributes: ['username']
        }],
        attributes: ['id', 'title', 'content']
    }).then((posts) => {
        return posts;
    }).catch((err) => {
        throw err;
    });
    return posts;
}

export const getPublishedPostById = async (postId) => {
    const post = await Post.findOne({
        include: [
            {
                model: Status,
                where: {name: 'published'},
                attributes: ['name']
            },
            {
                model: Comment,
                include: [{
                    model: User,
                    attributes: ['username']
                }],
                attributes: ['id', 'content']
            },
            {
                model: User,
                attributes: ['username']
            }
        ],
        attributes: ['id', 'title', 'content'],
        where: {
            id: postId
        }
    }).then((post) => {
        return post;
    }).catch((err) => {
        throw err;
    });
    return post;
}

export const changePostStatus = async (id, status) => {
    await Status.findOne({
        where: {name: status}, 
    }).then(async (status) => {
        await Post.update({
            statusId: status.id
        }, {
            where: {
                id: id
            }
        }).then(() => {
            logger.debug('PostController: Post status changed');
        }).catch((err) => {
            throw err;
        });
    }).catch((err) => {
        logger.error(`PostController: Error while changing post status: ${err}`);
        throw err;
    });
}

export const addComment = async (postId, content, username) => {
    await Comment.create({
        content: content
    }).then(async (comment) => {
        await User.findOne({
            where: {username: username}, 
        }).then(async (user) => {
            await comment.setUser(user);
        }).catch((err) => {
            throw err;
        });
        await Post.findOne({
            where: {id: postId}, 
        }).then(async (post) => {
            await comment.setPost(post);
        }).catch((err) => {
            throw err;
        });
    }).catch((err) => {
        throw err;
    });
}

