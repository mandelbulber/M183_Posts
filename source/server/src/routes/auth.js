import express from 'express';
import { checkEmailUsed, checkPasswordCorrect, checkSmsTokenCorrect, checkUsernameUsed, cookieJwtAuth, createUser, getUserDetails, saveSmsToken, sendSmsToken, checkUserBlocked, incrementFailedLoginAttempts, resetFailedLoginAttempts, checkSmsTokenAvailable, checkUserAdmin, checkRecoveryCodeCorrect } from '../controllers/authController.js';
import validator from 'validator';
import jwt from 'jsonwebtoken';
import { logger } from '../logger/logger.js';
import { User } from '../models/user.js';
import { Role } from '../models/role.js';
import { generateSecret, verifyToken } from 'node-2fa';

export const authRouter = express.Router();

authRouter.post('/register', async (req, res) => {
    const { username, email, password, phoneNumber } = req.body;

    // check if user is already logged in
    if (await cookieJwtAuth(req, res)) {
        logger.debug(`Login: User '${req.userData.username}' is already logged in`);
        res.statusMessage = 'User is already logged in';
        return res.status(403).end(); // 403 forbidden
    }

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

    // create recovery codes
    const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    const recoveryCodes = [];
    for (let i = 0; i < 10; i++) {
        let recoveryCode = ""
        // create 10 digit recovery code
        for (let i = 0; i < 12; i++) {
            recoveryCode += characters.charAt(Math.floor(Math.random() * characters.length))
        }
        recoveryCodes.push(recoveryCode);
    }

    createUser(username, email, password, phoneNumber, JSON.stringify(recoveryCodes)).then(() => {
        logger.info(`Register: User with username '${username}' created`);

        // generate jwt-token
        const token = jwt.sign({ username: username }, process.env.JWT_SECRET, { expiresIn: '1h' });
        res.cookie('jwt', token, { httpOnly: true, secure: true });
        logger.debug(`Register: JWT generated for user '${username}'`);

        res.status(201).json(JSON.stringify(recoveryCodes)).end(); // 201 created
    }).catch((err) => {
        logger.error(`Register: user creation failed for user ${username}` + err);
        res.status(500).end(); // 500 internal server error
    });
});

authRouter.post('/login', async (req, res) => {
    const { username, password } = req.body;

    // check if user is already logged in
    if (await cookieJwtAuth(req, res)) {
        logger.debug(`Login: User '${req.userData.username}' is already logged in`);
        res.statusMessage = 'User is already logged in';
        return res.status(403).end(); // 403 forbidden
    }

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

    // check if user is already logged in
    if (await cookieJwtAuth(req, res)) {
        logger.debug(`Login: User '${req.userData.username}' is already logged in`);
        res.statusMessage = 'User is already logged in';
        return res.status(403).end(); // 403 forbidden
    }
    
    //check if all parameters are provided
    if (!username || !smsToken) {
        logger.debug(`Verify: Missing parameters { username: ${username}, smsToken: ${smsToken} }}`);
        res.statusMessage = 'Missing parameters';
        return res.status(400).end(); // 400 bad request
    }

    // check if user went through first part of login process
    const smsTokenAvailable = await checkSmsTokenAvailable(username).then((result) => {
        return result;
    }).catch((err) => {
        logger.error(`Verify: SMS-Code availability check failed for user '${username}'` + err);
    });

    if (!smsTokenAvailable) {
        logger.debug(`Verify: User '${username}' did not go through first part of login process`);
        res.statusMessage = 'User did not go through first part of login process';
        return res.status(403).end(); // 403 forbidden
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

    // check if username and sms-token or recovery code match [req. 2.9]
    if (!await checkSmsTokenCorrect(username, smsToken)) {
        if (!await checkRecoveryCodeCorrect(username, smsToken)) {
            logger.debug(`Verify: Code '${smsToken}' doesn't match SMS token or recovery code for user '${username}'`);
            res.statusMessage = 'Code doesn\'t match user';
    
            // increment failed login attempts
            logger.debug(`Verify: Incrementing failed login attempts for user '${username}'`);
            await incrementFailedLoginAttempts(username).then(() => {
                logger.debug(`Verify: Failed login attempts incremented for user '${username}'`);
            }).catch((err) => {
                logger.error(`Verify: Failed login attempts incrementing failed for user '${username}'` + err);
            });
            return res.status(401).end(); // 401 unauthorized
        }
    }

    // reset failed login attempts
    await resetFailedLoginAttempts(username).then(() => {
        logger.debug(`Verify: Failed login attempts resetted for user '${username}'`);
    }).catch((err) => {
        logger.error(`Verify: Failed login attempts resetting failed for user '${username}'` + err);
    });

    // Get current user
    const currentUser = await User.findOne({
        include: [{
            model: Role,
            attributes: ['name'],
        }],
        where: {username: username}, 
        attributes: ['totpSecret']
    }).then((user) => {
        return user;
    }).catch((err) => {
        logger.error(`Verify: User with username ${username} not found` + err);
    });

    // generate jwt
    const token = jwt.sign({ username: username }, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.cookie('jwt', token, { httpOnly: true, secure: true });
    logger.debug(`Verify: JWT generated for user '${username}'`);

    logger.info(`Verify: User '${username}' logged in`);
    res.status(200).json({role: currentUser.role.name, totpSecret: currentUser.totpSecret}).end(); // 200 ok
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

authRouter.get('/isAdmin', async (req, res) => {
    const loggedIn = await cookieJwtAuth(req, res);
    if (!loggedIn)
        res.send(false);
    else
        res.send(await checkUserAdmin(req.userData.username));
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

authRouter.get('/totp', async (req, res) => {
    // check if authenticated
    if (!await cookieJwtAuth(req, res)) {
        logger.debug('Auth: Not authenticated');
        res.status(401).end(); // 401 unauthorized
    }

    // Get current user
    const currentUser = await User.findOne({
        include: [{
            model: Role,
            attributes: ['name'],
        }],
        where: {username: req.userData.username}, 
        attributes: ['totpSecret']
    }).then((user) => {
        return user;
    }).catch((err) => {
        logger.error(`Auth: User with username ${req.userData.username} not found` + err);
    });
});

authRouter.get('/totp/setup', async (req, res) => {
    // check if authenticated
    if (!await cookieJwtAuth(req, res)) {
        logger.debug('Auth: Not authenticated');
        res.status(401).end(); // 401 unauthorized
    }

    // Get current user
    const currentUser = await User.findOne({
        include: [{
            model: Role,
            attributes: ['name'],
        }],
        where: {username: req.userData.username}, 
        attributes: ['totpSecret']
    }).then((user) => {
        return user;
    }).catch((err) => {
        logger.error(`Auth: User with username ${req.userData.username} not found` + err);
    });

    if (currentUser.role.name != 'admin') {
        logger.debug(`Auth: User '${req.userData.username}' is not admin`);
        res.status(403).end(); // 403 forbidden
    }

    // generate totp secret
    const secret = generateSecret({ name: 'PostsAppOrSomething', account: req.userData.username });

    res.status(200).send(secret);
});

authRouter.post('/totp/verify', async (req, res) => {
    // check if authenticated
    if (!await cookieJwtAuth(req, res)) {
        logger.debug('Auth: Not authenticated');
        res.status(401).end(); // 401 unauthorized
    }

    // Get current user
    const currentUser = await User.findOne({
        include: [{
            model: Role,
            attributes: ['name'],
        }],
        where: {username: req.userData.username}, 
        attributes: ['totpSecret']
    }).then((user) => {
        return user;
    }).catch((err) => {
        logger.error(`Auth: User with username ${req.userData.username} not found` + err);
    });

    if (currentUser.role.name != 'admin') {
        logger.debug(`Auth: User '${req.userData.username}' is not admin`);
        res.status(403).end(); // 403 forbidden
    }

    if ( currentUser.totpSecret == null) {
        const { totpToken, totpSecret } = req.body;

        if (!totpToken || !totpSecret) {
            logger.debug(`Auth: Missing parameters { totpToken: ${totpToken}, totpSecret: ${totpSecret} }}`);
            res.statusMessage = 'Missing parameters';
            return res.status(400).end(); // 400 bad request
        }

        const result = verifyToken(totpSecret, totpToken);

        if(result && result.delta == 0){
            await User.update({ totpSecret: totpSecret }, {
                where: { username: req.userData.username }
            }).then(() => {
                logger.debug(`Auth: User '${req.userData.username}' enabled 2FA`);
                res.status(200).end(); // 200 ok
            }).catch((err) => {
                logger.error(`Auth: User '${req.userData.username}' could not enable 2FA` + err);
                res.statusMessage = "Internal server error please refresh and try again"
                res.status(500).end(); // 500 internal server error
            });
        }else{
            logger.debug(`Auth: TOTP Token '${totpToken}' doesn't match user '${req.userData.username}'`);
            res.statusMessage = 'TOTP Token doesn\'t match user';
            return res.status(401).end(); // 401 unauthorized
        }
    } else {
        const { totpToken } = req.body;

        const result = verifyToken(currentUser.totpSecret, totpToken);
        
        if(result && result.delta == 0){
            logger.debug(`Auth: User '${req.userData.username}' verified 2FA`);
            res.status(200).end(); // 200 ok
        }else{
            logger.debug(`Auth: TOTP Token '${totpToken}' doesn't match user '${req.userData.username}'`);
            res.statusMessage = 'TOTP Token doesn\'t match user';
            return res.status(401).end(); // 401 unauthorized
        }
    }
});
