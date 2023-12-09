import { User } from '../models/user.js';
import bcrypt from 'bcrypt';

export const checkEmailUsed = async (email) => {
    console.log('Check if email is already used');
    const emailUsed = await User.findOne({
        where: {
            email: email,
        }
    });

    if (emailUsed)
        return true;
    else
        return false;
}

export const checkUsernameUsed = async (username) => {
    console.log('Check if username is already used');
    const usernameUsed = await User.findOne({
        where: {
            username: username,
        }
    });

    if (usernameUsed)
        return true;
    else
        return false;
}

export const createUser = async (username, email, password) => {
    console.log('Registering a user');

    // create user
    console.log('hashing password');
    const hashedPassword = await bcrypt.hash(password, 10);
    await User.create({
        username,
        email,
        password: hashedPassword,
        role: 'user' // always user, if account created via api
    }).then(() => {
        console.log('User created');
    }).catch((err) => {
        console.log(err);
        throw err;
    });
}
