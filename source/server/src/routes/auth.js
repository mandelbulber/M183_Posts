import express from 'express';
import { checkEmailUsed, checkPasswordCorrect, checkSmsTokenCorrect, checkUsernameUsed, cookieJwtAuth, createUser, getUserDetails, saveSmsToken, sendSmsToken, checkUserBlocked, incrementFailedLoginAttempts, resetFailedLoginAttempts } from '../controllers/authController.js';
import validator from 'validator';
import jwt from 'jsonwebtoken';
import { logger } from '../logger/logger.js';

export const authRouter = express.Router();

authRouter.post('/register', async (req, res) => {
    const { username, email, password, phoneNumber } = req.body;

    // check if all parameters are provided
    if (!username || !email || !password || !phoneNumber) {
        logger.debug(`Register: Missing parameters {username: ${username}, email: ${email}, password: ${password != "" && ("provided")}, phoneNumber: ${phoneNumber}}`)
        res.statusMessage = 'Missing parameters';
        return res.status(400).end(); // 400 bad request
    }

    // check if email and password are valid [req. 2.2]
    if (!validator.isEmail(email)) {
        logger.debug('Register: Invalid email');
        res.statusMessage = 'Invalid email';
        return res.status(400).end(); // 400 bad request
    }
    if (!validator.isStrongPassword(password, { minLength: 12, minLowercase: 1, minUppercase: 1, minNumbers: 1, minSymbols: 1 })) {
        logger.debug('Register: Password not strong enough');
        res.statusMessage = 'Password not strong enough';
        return res.status(400).end(); // 400 bad request
    }

    // check if phone number is valid
    if (!validator.isMobilePhone(phoneNumber, 'de-CH', { strictMode: true })) {
        logger.debug('Register: Invalid phone number');
        res.statusMessage = 'Invalid phone number';
        return res.status(400).end(); // 400 bad request
    }

    // check if email or username already used
    const emailUsed = await checkEmailUsed(email);
    const usernameUsed = await checkUsernameUsed(username);

    if (emailUsed && usernameUsed) {
        logger.debug('Register: Email and username already used');
        res.statusMessage = 'Email and username already used';
        return res.status(409).end(); // 409 conflict
    }
    else if (emailUsed) {
        logger.debug('Register: Email already used');
        res.statusMessage = 'Email already used';
        return res.status(409).end(); // 409 conflict
    }
    else if (usernameUsed) {
        logger.debug('Register: Username already used');
        res.statusMessage = 'Username already used';
        return res.status(409).end(); // 409 conflict
    }

    createUser(username, email, password, phoneNumber).then(() => {
        logger.info(`Register: User with username '${username}' created`);

        // generate jwt-token
        const token = jwt.sign({ username: username }, process.env.JWT_SECRET, { expiresIn: '1h' });
        res.cookie('jwt', token, { httpOnly: true, secure: true });
        logger.debug(`Register: JWT generated for user '${username}'`);

        res.status(201).end(); // 201 created
    }).catch((err) => {
        logger.error(`Register: user creation failed for user ${username}` + err);
        res.status(500).end(); // 500 internal server error
    });
});

authRouter.post('/login', async (req, res) => {
    const { username, password } = req.body;

    // check if all parameters are provided
    if (!username || !password) {
        logger.debug(`Login: Missing parameters { username: ${username}, password: ${password != "" && ("provided")}}`);
        res.statusMessage = 'Missing parameters';
        return res.status(400).end(); // 400 bad request
    }

    const userExists = await checkUsernameUsed(username);
    const passwordCorrect = await checkPasswordCorrect(username, password);

    // check if user is blocked
    if (userExists) {
        const userBlocked = await checkUserBlocked(username);
        if (userBlocked) {
            logger.debug(`Login: User '${username}' is blocked`);
            res.statusMessage = 'User is blocked for 5 minutes, try again later';
            return res.status(401).end(); // 401 unauthorized
        }
    }

    // check if username exists and matches with password [req. 2.4]
    if (!userExists || !passwordCorrect) {
        logger.debug(`Login: Username or password entered incorrect for user '${username}'`);

        // increment failed login attempts
        if (userExists) {
            logger.debug(`Login: Incrementing failed login attempts for user '${username}'`);
            await incrementFailedLoginAttempts(username).then(() => {
                logger.debug(`Login: Failed login attempts incremented for user '${username}'`);
            }).catch((err) => {
                logger.error(`Login: Failed login attempts incrementing failed for user '${username}'` + err);
            });
        }

        res.statusMessage = 'Username or password incorrect';
        return res.status(401).end(); // 401 unauthorized
    }

    // generate sms-token
    const smsToken = Math.floor(100000 + Math.random() * 900000)
    saveSmsToken(username, smsToken).then(() => {
        logger.debug(`Login: SMS - Token generated for user '${username}'`);
        res.status(200).end(); // 200 ok
    }).catch((err) => {
        logger.error(`Login: SMS - Token generation failed for user '${username}'` + err);
        res.status(500).end(); // 500 internal server error
    });

    // send sms-token
    sendSmsToken(username, smsToken).then(() => {
        logger.info(`Login: SMS - Code sent to user '${username}'`);
        res.status(200).end(); // 200 ok
    }).catch((err) => {
        logger.error(`Login: SMS - Code sending failed for user '${username}'` + err);
        res.status(500).end(); // 500 internal server error
    });
});

authRouter.post('/verify', async (req, res) => {
    const { username, smsToken } = req.body;

    //check if all parameters are provided
    if (!username || !smsToken) {
        logger.debug(`Verify: Missing parameters { username: ${username}, smsToken: ${smsToken} }}`);
        res.statusMessage = 'Missing parameters';
        return res.status(400).end(); // 400 bad request
    }

    // check if user is blocked
    const userExists = await checkUsernameUsed(username);
    if (userExists) {
        const userBlocked = await checkUserBlocked(username);
        if (userBlocked) {
            logger.debug(`Verify: User '${username}' is blocked`);
            res.statusMessage = 'User is blocked for 5 minutes, try again later';
            return res.status(401).end(); // 401 unauthorized
        }
    } else {
        logger.debug(`Verify: Username '${username}' does not exist`);
        res.statusMessage = 'Login failed unexpectedly';
        return res.status(401).end(); // 401 unauthorized
    }

    // check if username and sms-token match [req. 2.9]
    if (!await checkSmsTokenCorrect(username, smsToken)) {
        logger.debug(`Verify: SMS-Code '${smsToken}' doesn't match user '${username}'`);
        res.statusMessage = 'SMS-Code doesn\'t match user';

        // increment failed login attempts
        logger.debug(`Verify: Incrementing failed login attempts for user '${username}'`);
        await incrementFailedLoginAttempts(username).then(() => {
            logger.debug(`Verify: Failed login attempts incremented for user '${username}'`);
        }).catch((err) => {
            logger.error(`Verify: Failed login attempts incrementing failed for user '${username}'` + err);
        });
        
        return res.status(401).end(); // 401 unauthorized
    }

    // reset failed login attempts
    await resetFailedLoginAttempts(username).then(() => {
        logger.debug(`Verify: Failed login attempts resetted for user '${username}'`);
    }).catch((err) => {
        logger.error(`Verify: Failed login attempts resetting failed for user '${username}'` + err);
    });

    // generate jwt
    const token = jwt.sign({ username: username }, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.cookie('jwt', token, { httpOnly: true, secure: true });
    logger.debug(`Verify: JWT generated for user '${username}'`);

    logger.info(`Verify: User '${username}' logged in`);
    res.status(200).end(); // 200 ok
});

authRouter.post('/logout', async (req, res) => {
    res.clearCookie('jwt');
    const loggedIn = await cookieJwtAuth(req, res);
    if (!loggedIn)
        logger.debug('Logout: Cannot logout user because user is not logged in');
    else
        logger.info(`Logout: User '${req.userData.username}' logged out`);
    res.status(200).end(); // 200 ok
});

authRouter.get('/isAuthenticated', async (req, res) => {
    const loggedIn = await cookieJwtAuth(req, res);
    if (loggedIn)
        res.send(true);
    else
        res.send(false);
});

authRouter.get('/profile', async (req, res) => {
    const loggedIn = await cookieJwtAuth(req, res);
    if (loggedIn) {
        logger.info(`Profile: User '${req.userData.username}' requested profile`);
        res.status(200).json(await getUserDetails(req.userData.username)); // 200 ok
    }
    else {
        logger.debug(`Profile: User requested profile but is not logged in`);
        res.status(401).end(); // 401 unauthorized
    }
});
