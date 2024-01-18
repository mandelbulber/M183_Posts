import { Role } from '../models/role.js';
import { User } from '../models/user.js';
import { Post } from '../models/post.js';
import { Comment } from '../models/comment.js';
import { Status } from '../models/status.js';
import { logger } from '../logger/logger.js';
import bcrypt from 'bcrypt';

export const createRelations = async () => {
    logger.info('Seeding: Create relations');

    // Role to User relationship
    Role.hasMany(User, { foreignKey: 'roleId' });
    User.belongsTo(Role, { foreignKey: 'roleId' });

    // Status to Post relationship
    Status.hasMany(Post, { foreignKey: 'statusId' });
    Post.belongsTo(Status, { foreignKey: 'statusId' });

    // Post to Comment relationship
    Post.hasMany(Comment, { foreignKey: 'postId' });
    Comment.belongsTo(Post, { foreignKey: 'postId' });

    // User to Post relationship
    User.hasMany(Post, { foreignKey: 'userId' });
    Post.belongsTo(User, { foreignKey: 'userId' });

    // User to Comment relationship
    User.hasMany(Comment, { foreignKey: 'userId' });
    Comment.belongsTo(User, { foreignKey: 'userId' });

    logger.info('Seeding: Relations created');
};

export const seedDatabase = async () => {
    logger.info('Seeding: Seeding database');

    // Create roles
    await Role.findOrCreate({
        where: { name: 'admin' },
    }).then(() => {
        logger.info('Seeding: Admin role created');
    }).catch((err) => {
        logger.error(`Error while creating admin role: ${err}`);
        throw err;
    });

    await Role.findOrCreate({
        where: { name: 'user' },
    }).then(() => {
        logger.info('Seeding: User role created');
    }).catch((err) => {
        logger.error(`Error while creating user role: ${err}`);
        throw err;
    });

    // Create statuses
    await Status.findOrCreate({
        where: { name: 'hidden' },
    }).then(() => {
        logger.info('Seeding: Status hidden created');
    }).catch((err) => {
        logger.error(`Error while creating hidden status: ${err}`);
        throw err;
    });

    await Status.findOrCreate({
        where: { name: 'published' },
    }).then(() => {
        logger.info('Seeding: Status published created');
    }).catch((err) => {
        logger.error(`Error while creating published status: ${err}`);
        throw err;
    });

    await Status.findOrCreate({
        where: { name: 'deleted' },
    }).then(() => {
        logger.info('Seeding: Status deleted created');
    }).catch((err) => {
        logger.error(`Error while creating deleted status: ${err}`);
        throw err;
    });

    // Create example users
    const hashedPassword = await bcrypt.hash("#S3$UZe2K2*xjG" + process.env.PEPPER, 10)
    await User.findOrCreate({
        where: {
            username: 'username',
            email: 'username@email.com',
            password: hashedPassword,
            phoneNumber: process.env.PHONE_NUMBER,
        },
    }).then(async (user) => {
        await Role.findOne({
            where: { name: 'user' },
        }).then(async (role) => {
            await user[0].setRole(role);
        }).catch((err) => {
            throw err;
        });
    }).then(() => {
        logger.info(`User 'username' created`);
    }).catch((err) => {
        logger.error(`Error while creating user 'username': ${err}`);
        throw err;
    });

    await User.findOrCreate({
        where: {
            username: 'admin',
            email: 'admin@email.com',
            password: hashedPassword,
            phoneNumber: process.env.PHONE_NUMBER,
        },
    }).then(async (user) => {
        await Role.findOne({
            where: { name: 'admin' },
        }).then(async (role) => {
            await user[0].setRole(role);
        }).catch((err) => {
            throw err;
        });
    }).then(() => {
        logger.info(`User 'admin' created`);
    }).catch((err) => {
        logger.error(`Error while creating user 'admin': ${err}`);
        throw err;
    });

    // Create example posts
    await Post.findOrCreate({
        where: {
            title: 'Seeded post1',
            content: 'Seeded post1 content',
        }
    }).then(async (post) => {
        await Status.findOne({
            where: { name: 'published' },
        }).then(async (status) => {
            await post[0].setStatus(status);
        }).catch((err) => {
            throw err;
        });
        await User.findOne({
            where: { username: 'username' },
        }).then(async (user) => {
            await post[0].setUser(user);
        }).catch((err) => {
            throw err;
        });
    }).then(() => {
        logger.info('Seeding: post1 created');
    }).catch((err) => {
        logger.error(`Error while creating post1: ${err}`);
        throw err;
    });

    await Post.findOrCreate({
        where: {
            title: 'Seeded post2',
            content: 'Seeded post2 content',
        }
    }).then(async (post) => {
        await Status.findOne({
            where: { name: 'deleted' },
        }).then(async (status) => {
            await post[0].setStatus(status);
        }).catch((err) => {
            throw err;
        });
        await User.findOne({
            where: { username: 'username' },
        }).then(async (user) => {
            await post[0].setUser(user);
        }).catch((err) => {
            throw err;
        });
    }).then(() => {
        logger.info('Seeding: post2 created');
    }).catch((err) => {
        logger.error(`Error while creating post2: ${err}`);
        throw err;
    });

    await Post.findOrCreate({
        where: {
            title: 'Seeded post3',
            content: 'Seeded post3 content',
        }
    }).then(async (post) => {
        await Status.findOne({
            where: { name: 'hidden' },
        }).then(async (status) => {
            await post[0].setStatus(status);
        }).catch((err) => {
            throw err;
        });
        await User.findOne({
            where: { username: 'admin' },
        }).then(async (user) => {
            await post[0].setUser(user);
        }).catch((err) => {
            throw err;
        });
    }).then(() => {
        logger.info('Seeding: post3 created');
    }).catch((err) => {
        logger.error(`Error while creating post3: ${err}`);
        throw err;
    });

    await Post.findOrCreate({
        where: {
            title: 'Seeded post4',
            content: 'Seeded post4 content',
        }
    }).then(async (post) => {
        await Status.findOne({
            where: { name: 'published' },
        }).then(async (status) => {
            await post[0].setStatus(status);
        }).catch((err) => {
            throw err;
        });
        await User.findOne({
            where: { username: 'admin' },
        }).then(async (user) => {
            await post[0].setUser(user);
        }).catch((err) => {
            throw err;
        });
    }).then(() => {
        logger.info('Seeding: post4 created');
    }).catch((err) => {
        logger.error(`Error while creating post4: ${err}`);
        throw err;
    });

    // Create example comments (only on seeded post1)
    await Comment.findOrCreate({
        where: {
            content: 'Seeded comment1',
        }
    }).then(async (comment) => {
        await Post.findOne({
            where: { title: 'Seeded post1' },
        }).then(async (post) => {
            await comment[0].setPost(post);
        }).catch((err) => {
            throw err;
        });
        await User.findOne({
            where: { username: 'username' },
        }).then(async (user) => {
            await comment[0].setUser(user);
        }).catch((err) => {
            throw err;
        });
    }).then(() => {
        logger.info('Seeding: comment1 created');
    }).catch((err) => {
        logger.error(`Error while creating comment1: ${err}`);
        throw err;
    });

    await Comment.findOrCreate({
        where: {
            content: 'Seeded comment2',
        }
    }).then(async (comment) => {
        await Post.findOne({
            where: { title: 'Seeded post1' },
        }).then(async (post) => {
            await comment[0].setPost(post);
        }).catch((err) => {
            throw err;
        });
        await User.findOne({
            where: { username: 'admin' },
        }).then(async (user) => {
            await comment[0].setUser(user);
        }).catch((err) => {
            throw err;
        });
    }).then(() => {
        logger.info('Seeding: comment2 created');
    }).catch((err) => {
        logger.error(`Error while creating comment2: ${err}`);
        throw err;
    });
};
