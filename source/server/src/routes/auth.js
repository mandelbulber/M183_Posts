import express from 'express';
import { checkEmailUsed, checkPasswordCorrect, checkSmsTokenCorrect, checkUsernameUsed, cookieJwtAuth, createUser, getUserDetails, saveSmsToken, sendSmsToken } from '../controllers/authController.js';
import validator from 'validator';
import jwt from 'jsonwebtoken';

export const authRouter = express.Router();

authRouter.post('/register', async (req, res) => {
    const { username, email, password, phoneNumber } = req.body;

    // check if all parameters are provided
    if (!username || !email || !password || !phoneNumber){
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

    // check if phone number is valid
    if (!validator.isMobilePhone(phoneNumber, 'de-CH', { strictMode: true })){
        res.statusMessage = 'Invalid phone number';
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

    createUser(username, email, password, phoneNumber).then(() => {
        res.status(201).end(); // 201 created
    }).catch((err) => {
        console.log(err);
        res.status(500).end(); // 500 internal server error
    });
});

authRouter.post('/login', (req, res) => {
    const { username, password } = req.body;

    // check if all parameters are provided
    if (!username || !password){
        res.statusMessage = 'Missing parameters';
        return res.status(400).end(); // 400 bad request
    }

    // check if username exists [req. 2.4]
    const usernameUsed = checkUsernameUsed(username);
    if (!usernameUsed){
        res.statusMessage = 'Username not found';
        return res.status(404).end(); // 404 not found
    }

    // ToDo: check password at what point?

    // generate sms-token
    const smsToken = Math.floor(100000 + Math.random() * 900000)
    saveSmsToken(username, smsToken).then(() => {
        res.status(200).end(); // 200 ok
    }).catch((err) => {
        console.log(err);
        res.status(500).end(); // 500 internal server error
    });

    // send sms-token
    sendSmsToken(username, smsToken).then(() => {
        res.status(200).end(); // 200 ok
    }).catch((err) => {
        console.log(err);
        res.status(500).end(); // 500 internal server error
    });
});

authRouter.post('/verify', (req, res) => {
    //const { username, password, smsToken } = req.body;

    // check if all parameters are provided
    // if (!username || !smsToken){
    //     res.statusMessage = 'Missing parameters';
    //     return res.status(400).end(); // 400 bad request
    // }

    // // check if username, password and sms-token match [req. 2.9]
    // const passwordCorrect = checkPasswordCorrect(username, password);
    // const smsTokenCorrect = checkSmsTokenCorrect(username, smsToken);

    // if (!passwordCorrect || !smsTokenCorrect){
    //     res.statusMessage = 'Wrong password or sms-token';
    //     return res.status(401).end(); // 401 unauthorized
    // }

    // generate jwt
    const token = jwt.sign({ username: "username" }, process.env.JWT_SECRET, { expiresIn: '1h' });

    res.cookie('jwt', token, { httpOnly: true, secure: true});
    res.status(200).end(); // 200 ok
});

authRouter.get('/profile', cookieJwtAuth, async (req, res) => {
    res.status(200).json(await getUserDetails(req.userData.username)); // 200 ok
});

authRouter.post('/logout', (req, res) => {
    res.clearCookie('jwt');
    res.status(200).end(); // 200 ok
});
