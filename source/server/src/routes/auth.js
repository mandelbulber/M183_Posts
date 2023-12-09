import express from 'express';
import { checkEmailUsed, checkUsernameUsed, createUser } from '../controllers/userController.js';
import validator from 'validator';

export const authRouter = express.Router();

authRouter.post('/register', async (req, res) => {
    const { username, email, password } = req.body;

    // check if all parameters are provided
    if (!username || !email || !password){
        res.statusMessage = 'Missing parameters';
        return res.status(400).end(); // 400 bad request
    }

    // check if email and password are valid [req. 2.2]
    if (!validator.isEmail(email)){
        res.statusMessage = 'Invalid email';
        return res.status(400).end(); // 400 bad request
    }
    if (!validator.isStrongPassword(password, { minLength: 12, minLowercase: 1, minUppercase: 1, minNumbers: 1, minSymbols: 1 } )) {
        res.statusMessage = 'Password not strong enough';
        return res.status(400).end(); // 400 bad request
    }

    // check if email or username already used
    const emailUsed = await checkEmailUsed(email);
    const usernameUsed = await checkUsernameUsed(username);

    if (emailUsed && usernameUsed){
        res.statusMessage = 'Email and username already used';
        return res.status(409).end(); // 409 conflict
    }
    else if (emailUsed){
        res.statusMessage = 'Email already used';
        return res.status(409).end(); // 409 conflict
    }
    else if (usernameUsed){
        res.statusMessage = 'Username already used';
        return res.status(409).end(); // 409 conflict
    }

    createUser(username, email, password).then(() => {
        res.status(201).end(); // 201 created
    }).catch((err) => {
        console.log(err);
        res.status(500).end(); // 500 internal server error
    });
});

authRouter.post('/login', (req, res) => {
    // TODO
    res.send('Logging in a user');
});
