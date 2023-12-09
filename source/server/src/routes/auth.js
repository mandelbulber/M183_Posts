import express from 'express';
import { checkEmailUsed, checkUsernameUsed, createUser } from '../controllers/userController.js';
import validator from 'validator';

export const authRouter = express.Router();

authRouter.post('/register', async (req, res) => {
    const { username, email, password } = req.body;

    // check if all parameters are provided
    if (!username || !email || !password)
        return res.status(400).send('Missing parameters'); // 400 bad request

    // check if email and password are valid [req. 2.2]
    if (!validator.isEmail(email))
        return res.status(400).send('Invalid email'); // 400 bad request
    if (!validator.isStrongPassword(password, { minLength: 12, minLowercase: 1, minUppercase: 1, minNumbers: 1, minSymbols: 1 } ))
        return res.status(400).send('Password not strong enough'); // 400 bad request

    // check if email or username already used
    const emailUsed = await checkEmailUsed(email);
    const usernameUsed = await checkUsernameUsed(username);

    if (emailUsed && usernameUsed)
        return res.status(409).send('Email and username already used'); // 409 conflict
    else if (emailUsed)
        return res.status(409).send('Email already used'); // 409 conflict
    else if (usernameUsed)
        return res.status(409).send('Username already used'); // 409 conflict

    createUser(username, email, password).then(() => {
        res.status(201).send('User registered'); // 201 created
    }).catch((err) => {
        console.log(err);
        res.status(500).send('Internal server error'); // 500 internal server error
    });
});

authRouter.post('/login', (req, res) => {
    // TODO
    res.send('Logging in a user');
});
