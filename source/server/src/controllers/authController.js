import { User } from '../models/user.js';
import { Role } from '../models/role.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { logger } from '../logger/logger.js';

export const checkEmailUsed = async (email) => {
    logger.debug(`AuthController: Check if email '${email}' is already used`);
    const emailUsed = await User.findOne({
        where: {
            email: email,
        }
    });

    if (emailUsed) {
        logger.debug(`Email '${email}' is already used`);
        return true;
    } else {
        logger.debug(`Email '${email}' is not used`);
        return false;
    }
}

export const checkUsernameUsed = async (username) => {
    logger.debug(`AuthController: Check if username '${username}' is already used`);
    const usernameUsed = await User.findOne({
        where: {
            username: username,
        }
    });

    if (usernameUsed) {
        logger.debug(`Username '${username}' is already used`);
        return true;
    } else {
        logger.debug(`Username '${username}' is not used`);
        return false;
    }
}

export const checkPasswordCorrect = async (username, password) => {
    logger.debug(`AuthController: Check if password is correct for user '${username}'`);

    // get hashed password from database
    const hashedPassword = await User.findOne({
        where: {
            username: username,
        },
        attributes: ['password']
    }).then((password) => {
        if (password)
            return password.dataValues.password;
        else
            return null;
    }).catch((err) => {
        logger.error(`AuthController: Error while getting password for user '${username}'`);
        throw err;
    });

    // compare passwords
    if (hashedPassword) {
        if (await bcrypt.compare(password, hashedPassword)) {
            logger.debug(`AuthController: Password is correct for user '${username}'`);
            return true;
        } else {
            logger.debug(`AuthController: Password is not correct for user '${username}'`);
            return false;
        }
    }
}

export const checkSmsTokenCorrect = async (username, smsToken) => {
    logger.debug(`AuthController: Check if SMS code is correct for user '${username}'`);

    if (await User.findOne({
        where: {
            username: username,
            smsToken: smsToken
        }
    }) && (new Date() - (await User.findOne({
        where: {
            username: username,
        }
    })).smsTokenCreatedAt) < 300000) {
        logger.debug(`AuthController: SMS code is correct for user '${username}'`);

        // delete sms token
        await User.update({
            smsToken: null,
            smsTokenCreatedAt: null
        }, {
            where: {
                username: username
            }
        }).then(() => {
            logger.debug(`AuthController: SMS code deleted for user '${username}'`);
        }).catch((err) => {
            logger.error(`AuthController: Error while deleting SMS code for user '${username}'`);
            throw err;
        });
        return true;
    }
    else {
        logger.debug(`AuthController: SMS code is not correct for user '${username}'`);
        // ToDo: +1 failed login attempt
        return false;
    }
}

export const createUser = async (username, email, password, phoneNumber) => {
    logger.debug(`AuthController: Create user with properties {username: '${username}', email: '${email}', phoneNumber: '${phoneNumber}'}`);

    // create user
    const hashedPassword = await bcrypt.hash(password, 10);
    await User.findOrCreate({
        where: {
            username: username,
            email: email,
            password: hashedPassword,
            phoneNumber: phoneNumber,
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
        logger.debug(`AuthController: User with properties {username: '${username}', email: '${email}', phoneNumber: '${phoneNumber}'} created`);
    }).catch((err) => {
        logger.error(`AuthController: Error while creating user with properties {username: '${username}', email: '${email}', phoneNumber: '${phoneNumber}'}: ${err}}`);
        throw err;
    });
}

export const getUserDetails = async (username) => {
    logger.debug(`AuthController: Get user details for user '${username}'`);

    const user = await User.findOne({
        where: {
            username: username
        },
        attributes: ['username', 'email', 'phoneNumber']
    }).then((user) => {
        logger.debug(`AuthController: User details for user '${username}' found and provided`);
        return user.dataValues;
    }).catch((err) => {
        logger.error(`AuthController: Error while getting user details for user '${username}': ${err}`);
        throw err;
    });
    return user;
}

export const saveSmsToken = async (username, smsToken) => {
    logger.debug(`AuthController: Save SMS code ${smsToken} for user '${username}'`);

    await User.update({
        smsToken: smsToken,
        smsTokenCreatedAt: new Date()
    }, {
        where: {
            username: username
        }
    }).then(() => {
        logger.debug(`AuthController: SMS code ${smsToken} saved for user '${username}'`);
    }).catch((err) => {
        logger.error(`AuthController: Error while saving SMS code ${smsToken} for user '${username}': ${err}`);
        throw err;
    });
}

export const sendSmsToken = async (username, smsToken) => {
    logger.debug(`AuthController: Send SMS code ${smsToken} to user '${username}'`);

    // get phone number for username
    const user = await User.findOne({
        where: {
            username: username
        },
    });

    const payload = {
        "mobileNumber": user.phoneNumber.substring(1),
        "message": "Your sms token is: " + smsToken + "."
    };

    fetch('https://m183.gibz-informatik.ch/api/sms/message', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-Api-Key': process.env.GIBZ_API_KEY,
        },
        body: JSON.stringify(payload),
    }).then(() => {
        logger.debug(`AuthController: SMS code ${smsToken} sent to user '${username}'`);
    }).catch((err) => {
        logger.error(`AuthController: Error while sending SMS code ${smsToken} to user '${username}': ${err}`);
        throw err;
    });
}

export const cookieJwtAuth = async (req, res) => {
    logger.debug(`AuthController: Check if user is authenticated`);

    try {
        const jwtCookie = req.cookies.jwt;
        if (jwtCookie) {
            const decoded = jwt.verify(jwtCookie, process.env.JWT_SECRET);
            logger.debug(`AuthController: User '${decoded.username}' is authenticated`);
            req.userData = decoded;
            return true;
        }
        else {
            logger.debug(`AuthController: User is not authenticated`);
            res.clearCookie('jwt');
            return false;
        }
    }
    catch (err) {
        logger.debug(`AuthController: Users jwt token is invalid / expired`);
        res.clearCookie('jwt');
        return false;
    }
}
