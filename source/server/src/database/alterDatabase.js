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
};

export const seedDatabase = async () => {
    await Role.findOrCreate({
        where: {name: 'admin'}, 
    }).then(() => {
        console.log('Admin role created');
    }).catch((err) => {
        console.log(err);
        throw err;
    });

    await Role.findCreateFind({
        where: {name: 'user'}, 
    }).then(() =>{
        console.log('User role created');
    }).catch((err) => {
        console.log(err);
        throw err;
    });

    await User.findOrCreate({
        where: {
            username: 'username',
            email: 'username@email.com',
            // Password: #S3$UZe2K2*xjG
            password: "$2a$10$/cE7hkbotQ50UYrK22ijuubmnWHxzVf9VN1Po8WPQp.Uk3riOyHh.",
            phoneNumber: process.env.PHONE_NUMBER,
        },
    }).then((user) => {
        Role.findOne({
            where: {name: 'user'}, 
        }).then((role) => {
            user[0].setRole(role);
        }).catch((err) => {
            console.log(err);
            throw err;
        });
    }).catch((err) => {
        console.log(err);
        throw err;
    });
};