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
        if (await bcrypt.compare(password + process.env.PEPPER, hashedPassword)) {
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
        return false;
    }
}

export const checkSmsTokenAvailable = async (username) => {
    logger.debug(`AuthController: Check if SMS code is available for user '${username}'`);

    const smsToken = await User.findOne({
        where: {
            username: username
        },
        attributes: ['smsToken']
    }).then((user) => {
        return user.dataValues.smsToken;
    }).catch((err) => {
        logger.error(`AuthController: Error while getting SMS code for user '${username}'`);
        throw err;
    });

    if (smsToken) {
        logger.debug(`AuthController: SMS code is available for user '${username}'`);
        return true;
    } else {
        logger.debug(`AuthController: No SMS code is available for user '${username}'`);
        return false;
    }
}

export const checkRecoveryCodeCorrect = async (username, recoveryCode) => {
    logger.debug(`AuthController: Check if recovery code is correct for user '${username}'`);

    // get users recovery codes
    const recoveryCodes = await User.findOne({
        where: {
            username: username
        },
        attributes: ['recoveryCodes']
    }).then((user) => {
        return user.dataValues.recoveryCodes;
    }).catch((err) => {
        logger.error(`AuthController: Error while getting recovery codes for user '${username}'`);
        throw err;
    });

    // check if one of the recovery codes matches
    const recoveryCodesArray = JSON.parse(recoveryCodes);
    if (recoveryCodesArray.length) {
        for (let i = 0; i < recoveryCodesArray.length; i++) {
            if (recoveryCode === recoveryCodesArray[i]) {
                logger.debug(`AuthController: Recovery code is correct for user '${username}'`);

                // delete recovery code
                recoveryCodesArray.splice(i, 1);
                console.log("spliced: " + recoveryCodesArray);
                await User.update({
                    recoveryCodes: JSON.stringify(recoveryCodesArray)
                }, {
                    where: {
                        username: username
                    }
                }).then(() => {
                    logger.debug(`AuthController: Recovery code deleted for user '${username}'`);
                }).catch((err) => {
                    logger.error(`AuthController: Error while deleting recovery code for user '${username}'`);
                    throw err;
                });
                return true;
            }
        }
        logger.debug(`AuthController: Recovery code is not correct for user '${username}'`);
        return false;
    } else {
        logger.debug(`AuthController: No recovery codes available for user '${username}'`);
        return false;
    }
}

export const createUser = async (username, email, password, phoneNumber, recoveryCodes) => {
    logger.debug(`AuthController: Create user with properties {username: '${username}', email: '${email}', phoneNumber: '${phoneNumber}'}`);

    // create user
    const hashedPassword = await bcrypt.hash(password + process.env.PEPPER, 10);
    await User.findOrCreate({
        where: {
            username: username,
            email: email,
            password: hashedPassword,
            phoneNumber: phoneNumber,
            recoveryCodes: recoveryCodes
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

export const incrementFailedLoginAttempts = async (username) => {
    logger.debug(`AuthController: Increment failed login attempts for user '${username}'`);

    const failedLoginAttempts = await User.findOne({
        where: {
            username: username
        },
        attributes: ['failedLoginAttempts']
    }).then((user) => {
        if (user)
            return user.dataValues.failedLoginAttempts;
        else
            return null;
    }).catch((err) => {
        logger.error(`AuthController: Error while getting failed login attempts for user '${username}': ${err}`);
        throw err;
    });

    if (failedLoginAttempts >= 2) {
        await User.update({
            failedLoginAttempts: 0,
            blockedUntil: new Date(new Date().getTime() + 300000)
        }, {
            where: {
                username: username
            }
        }).then(() => {
            logger.debug(`AuthController: User '${username}' blocked`);
        }
        ).catch((err) => {
            logger.error(`AuthController: Error while blocking user '${username}': ${err}`);
            throw err;
        });
    } else {
        await User.update({
            failedLoginAttempts: failedLoginAttempts + 1
        }, {
            where: {
                username: username
            }
        }).then(() => {
            logger.debug(`AuthController: Failed login attempts for user '${username}' incremented`);
        }
        ).catch((err) => {
            logger.error(`AuthController: Error while incrementing failed login attempts for user '${username}': ${err}`);
            throw err;
        });
    }
}

export const resetFailedLoginAttempts = async (username) => {
    logger.debug(`AuthController: Reset failed login attempts for user '${username}'`);

    await User.update({
        failedLoginAttempts: 0
    }, {
        where: {
            username: username
        }
    }).then(() => {
        logger.debug(`AuthController: Failed login attempts for user '${username}' resetted`);
    }
    ).catch((err) => {
        logger.error(`AuthController: Error while resetting failed login attempts for user '${username}': ${err}`);
        throw err;
    });
}

export const checkUserBlocked = async (username) => {
    logger.debug(`AuthController: Check if user '${username}' is blocked`);

    const blockedUntil = await User.findOne({
        where: {
            username: username
        },
        attributes: ['blockedUntil']
    }).then((user) => {
        if (user)
            return user.dataValues.blockedUntil;
        else
            return null;
    }).catch((err) => {
        logger.error(`AuthController: Error while getting blockedUntil for user '${username}': ${err}`);
        throw err;
    });

    if (blockedUntil) {
        if (blockedUntil > new Date()) {
            logger.debug(`AuthController: User '${username}' is blocked`);
            return true;
        } else {
            logger.debug(`AuthController: User '${username}' is not blocked`);
            return false;
        }
    }

    logger.debug(`AuthController: User '${username}' is not blocked`);
    return false;
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

export const checkUserAdmin = async (username) => {
    logger.debug(`AuthController: Check if user '${username}' is admin`);

    const user = await User.findOne({
        where: {
            username: username
        },
        include: [{
            model: Role,
            attributes: ['name']
        }]
    });
    if (user.role.name === 'admin') {
        logger.debug(`AuthController: User '${username}' is admin`);
        return true;
    }
    logger.debug(`AuthController: User '${username}' is not admin`);
    return false;
}
