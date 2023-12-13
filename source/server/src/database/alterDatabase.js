import { Role } from '../models/role.js';
import { User } from '../models/user.js';
import { Post } from '../models/post.js';
import { Comment } from '../models/comment.js';
import { Status } from '../models/status.js';

export const createRelations = async () => {
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
};

export const seedDatabase = async () => {

    // Create roles
    await Role.findOrCreate({
        where: {name: 'admin'}, 
    }).then(() => {
        console.log('Admin role created');
    }).catch((err) => {
        console.log(err);
        throw err;
    });

    await Role.findOrCreate({
        where: {name: 'user'}, 
    }).then(() =>{
        console.log('User role created');
    }).catch((err) => {
        console.log(err);
        throw err;
    });

    // Create statuses
    await Status.findOrCreate({
        where: {name: 'hidden'},
    }).then(() => {
        console.log('Status hidden created');
    }).catch((err) => {
        console.log(err);
        throw err;
    });

    await Status.findOrCreate({
        where: {name: 'published'},
    }).then(() => {
        console.log('Status published created');
    }).catch((err) => {
        console.log(err);
        throw err;
    });

    await Status.findOrCreate({
        where: {name: 'deleted'},
    }).then(() => {
        console.log('Status deleted created');
    }).catch((err) => {
        console.log(err);
        throw err;
    });

    // Create example users
    await User.findOrCreate({
        where: {
            username: 'username',
            email: 'username@email.com',
            // Password: #S3$UZe2K2*xjG
            password: "$2a$10$/cE7hkbotQ50UYrK22ijuubmnWHxzVf9VN1Po8WPQp.Uk3riOyHh.",
            phoneNumber: process.env.PHONE_NUMBER,
        },
    }).then(async (user) => {
        await Role.findOne({
            where: {name: 'user'}, 
        }).then(async (role) => {
            await user[0].setRole(role);
        }).catch((err) => {
            console.log(err);
            throw err;
        });
    }).then(() => {
        console.log('User username created');
    }).catch((err) => {
        console.log(err);
        throw err;
    });

    await User.findOrCreate({
        where: {
            username: 'admin',
            email: 'admin@email.com',
            // Password: #S3$UZe2K2*xjG
            password: "$2a$10$/cE7hkbotQ50UYrK22ijuubmnWHxzVf9VN1Po8WPQp.Uk3riOyHh.",
            phoneNumber: process.env.PHONE_NUMBER,
        },
    }).then(async (user) => {
        await Role.findOne({
            where: {name: 'admin'}, 
        }).then(async (role) => {
            await user[0].setRole(role);
        }).catch((err) => {
            console.log(err);
            throw err;
        });
    }).then(() => {
        console.log('User admin created');
    }).catch((err) => {
        console.log(err);
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
            where: {name: 'published'}, 
        }).then(async (status) => {
            await post[0].setStatus(status);
        }).catch((err) => {
            console.log(err);
            throw err;
        });
        await User.findOne({
            where: {username: 'username'}, 
        }).then(async (user) => {
            await post[0].setUser(user);
        }).catch((err) => {
            console.log(err);
            throw err;
        });
    }).then(() => {
        console.log('Post Seeded post1 created');
    }).catch((err) => {
        console.log(err);
        throw err;
    });

    await Post.findOrCreate({
        where: {
            title: 'Seeded post2',
            content: 'Seeded post2 content',
        }
    }).then(async (post) => {
        await Status.findOne({
            where: {name: 'deleted'}, 
        }).then(async (status) => {
            await post[0].setStatus(status);
        }).catch((err) => {
            console.log(err);
            throw err;
        });
        await User.findOne({
            where: {username: 'username'}, 
        }).then(async (user) => {
            await post[0].setUser(user);
        }).catch((err) => {
            console.log(err);
            throw err;
        });
    }).then(() => {
        console.log('Post Seeded post2 created');
    }).catch((err) => {
        console.log(err);
        throw err;
    });

    await Post.findOrCreate({
        where: {
            title: 'Seeded post3',
            content: 'Seeded post3 content',
        }
    }).then(async (post) => {
        await Status.findOne({
            where: {name: 'hidden'}, 
        }).then(async (status) => {
            await post[0].setStatus(status);
        }).catch((err) => {
            console.log(err);
            throw err;
        });
        await User.findOne({
            where: {username: 'admin'}, 
        }).then(async (user) => {
            await post[0].setUser(user);
        }).catch((err) => {
            console.log(err);
            throw err;
        });
    }).then(() => {
        console.log('Post Seeded post3 created');
    }).catch((err) => {
        console.log(err);
        throw err;
    });

    await Post.findOrCreate({
        where: {
            title: 'Seeded post4',
            content: 'Seeded post4 content',
        }
    }).then(async (post) => {
        await Status.findOne({
            where: {name: 'published'}, 
        }).then(async (status) => {
            await post[0].setStatus(status);
        }).catch((err) => {
            console.log(err);
            throw err;
        });
        await User.findOne({
            where: {username: 'admin'}, 
        }).then(async (user) => {
            await post[0].setUser(user);
        }).catch((err) => {
            console.log(err);
            throw err;
        });
    }).then(() => {
        console.log('Post Seeded post4 created');
    }).catch((err) => {
        console.log(err);
        throw err;
    });

    // Create example comments (only on seeded post1)
    await Comment.findOrCreate({
        where: {
            content: 'Seeded comment1',
        }
    }).then(async (comment) => {
        await Post.findOne({
            where: {title: 'Seeded post1'}, 
        }).then(async (post) => {
            await comment[0].setPost(post);
        }).catch((err) => {
            console.log(err);
            throw err;
        });
        await User.findOne({
            where: {username: 'username'}, 
        }).then(async (user) => {
            await comment[0].setUser(user);
        }).catch((err) => {
            console.log(err);
            throw err;
        });
    }).then(() => {
        console.log('Comment Seeded comment1 created');
    }).catch((err) => {  
        console.log(err);
        throw err;
    });

    await Comment.findOrCreate({
        where: {
            content: 'Seeded comment2',
        }
    }).then(async (comment) => {
        await Post.findOne({
            where: {title: 'Seeded post1'}, 
        }).then(async (post) => {
            await comment[0].setPost(post);
        }).catch((err) => {
            console.log(err);
            throw err;
        });
        await User.findOne({
            where: {username: 'admin'}, 
        }).then(async (user) => {
            await comment[0].setUser(user);
        }).catch((err) => {
            console.log(err);
            throw err;
        });
    }).then(() => {
        console.log('Comment Seeded comment2 created');
    }).catch((err) => {  
        console.log(err);
        throw err;
    });
        
};