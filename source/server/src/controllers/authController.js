import { User } from '../models/user.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

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

export const checkPasswordCorrect = async (username, password) => {
    console.log('Checking if password is correct');

    if (await bcrypt.compare(password, (await User.findOne({
        where: {
            username: username,
        }
    })).password))
        return true;
    else
        return false;
}

export const checkSmsTokenCorrect = async (username, smsToken) => {
    console.log('Checking if sms token is correct');

    if (await User.findOne({
        where: {
            username: username,
            smsToken: smsToken
        }
    }) && (new Date() - (await User.findOne({
        where: {
            username: username,
        }
    })).smsTokenCreatedAt) < 300000){
        // delete sms token
        await User.update({
            smsToken: null,
            smsTokenCreatedAt: null
        }, {
            where: {
                username: username
            }
        }).then(() => {
            console.log('Sms token deleted');
        }).catch((err) => {
            console.log(err);
            throw err;
        });
        return true;
    }
    else {
        // ToDo: +1 failed login attempt
        return false;
    }
}

export const createUser = async (username, email, password, phoneNumber) => {
    console.log('Registering a user');

    // create user
    console.log('hashing password');
    const hashedPassword = await bcrypt.hash(password, 10);
    await User.create({
        username,
        email,
        password: hashedPassword,
        phoneNumber,
        role: 'user' // always user, if account created via api
    }).then(() => {
        console.log('User created');
    }).catch((err) => {
        console.log(err);
        throw err;
    });
}

export const getUserDetails = async (username) => {
    console.log('Getting user details for user: ' + username);

    const user = await User.findOne({
        where: {
            username: username
        },
        attributes: ['username', 'email', 'phoneNumber']
    }).then((user) => {
        return user.dataValues;
    }).catch((err) => {
        console.log(err);
        throw err;
    });
    return user;
}

export const saveSmsToken = async (username, smsToken) => {
    console.log('Saving sms token');
    await User.update({
        smsToken: smsToken,
        smsTokenCreatedAt: new Date()
    }, {
        where: {
            username: username
        }
    }).then(() => {
        console.log('Sms token saved');
    }).catch((err) => {
        console.log(err);
        throw err;
    });
}

export const sendSmsToken = async (username, smsToken) => {
    console.log('Sending sms token');
    
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
            'X-Api-Key': 'MgAyADgAOQA1ADIAOQA1ADMAMwAwADYAMgAyADgANQA5ADkA',
        },
        body: JSON.stringify(payload),
    });
}

export const cookieJwtAuth = async (req, res) => {
    console.log('Checking if user is authenticated');
    
    if (req.cookies.jwt) {
        req.userData = jwt.verify(req.cookies.jwt, process.env.JWT_SECRET);
        return true;
    }
    else{
        res.clearCookie('jwt');
        return false;
    }
}
