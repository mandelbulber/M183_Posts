// Create controller for all post related tasks
// including creating comments

// createPost (default visibility = hidden), getAllPublishedPosts, 
// getPostById, changePostStatus (Also used to delete post), addComment

import { Post } from '../models/post.js';
import { Status } from '../models/status.js';
import { User } from '../models/user.js';
import { Comment } from '../models/comment.js';

export const createPost = async (title, content,  username) => {
    console.log(title, content, username)
    await Post.create({
            title: title,
            content: content,
    }).then(async (post) => {
        await Status.findOne({
            where: {name: 'hidden'}, 
        }).then(async (status) => {
            await post.setStatus(status);
        }).catch((err) => {
            console.log(err);
            throw err;
        });
        await User.findOne({
            where: {username: username}, 
        }).then(async (user) => {
            await post.setUser(user);
        }).catch((err) => {
            console.log(err);
            throw err;
        });
    }).catch((err) => {
        console.log(err);
        throw err;
    });
}

export const getAllPublishedPosts = async () => {
    const posts = await Post.findAll({
        include: [{
            model: Status,
            where: {name: 'published'}
        }],
    }).then((posts) => {
        return posts;
    }).catch((err) => {
        console.log(err);
        throw err;
    });
    return posts;
}

export const getPostById = async (postId) => {
    const post = await Post.findOne({
        include: [
            Status,
            Comment
        ],
        where: {
            id: postId
        }
    }).then((post) => {
        return post;
    }).catch((err) => {
        console.log(err);
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
            console.log('Post status changed');
        }).catch((err) => {
            console.log(err);
            throw err;
        });
    }).catch((err) => {
        console.log(err);
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
            console.log(err);
            throw err;
        });
        await Post.findOne({
            where: {id: postId}, 
        }).then(async (post) => {
            await comment.setPost(post);
        }).catch((err) => {
            console.log(err);
            throw err;
        });
    });
}

