import express from 'express';
import { logger } from '../logger/logger.js';
import { checkUsernameUsed } from '../controllers/authController.js';
import { User } from '../models/user.js';
import { Role } from '../models/role.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const clientId = "37af0dc7e25266b0cbd0";
const clientSecret = "b8dfc9cc8c2e8028103bae0ddb3e6884186adc20";

export const githubOAuthRouter = express.Router();

githubOAuthRouter.get('/github/callback', async (req, res) => {
    const requestToken = req.query.code

    await fetch(`https://github.com/login/oauth/access_token?client_id=${clientId}&client_secret=${clientSecret}&code=${requestToken}`, {
        method: 'POST',
        headers: {
            'Accept': 'application/json'
        }
    }).then(res => res.json()).then(async (data) => {
        await fetch('https://api.github.com/user', {
            headers: {
                Authorization: `token ${data.access_token}`
            }
        }).then(res => res.json()).then(async (githubUser) => {
            logger.debug(`OAuth: GitHub sent user '${githubUser.login}'. with the id '${githubUser.id}'`);
            await User.findOne({ 
                where: { 
                    githubId: githubUser.id 
                },
            }).then(async (user) => {
                const hashedPassword = await bcrypt.hash(githubUser.login+githubUser.id+githubUser.created_at, 12);
                if (!user) {
                    //Create user
                    logger.debug(`OAuth: User '${githubUser.login}' not found in database. Creating new user.`);
                    if(await checkUsernameUsed(githubUser.login)) {
                        githubUser.login = githubUser.login + githubUser.id;
                    }

                    user = await User.create({
                        username: githubUser.login,
                        email: githubUser.email,
                        password: hashedPassword,
                        githubId: githubUser.id,
                        phoneNumber: "OAuth"
                    }).then(async (user) => {
                        await Role.findOne({
                            where: { name: 'user' }
                        }).then(async (role) => {
                            await user.setRole(role);
                        }).catch((err) => {
                            throw err;
                        });
                        logger.debug(`OAuth: User '${user.username}' created in database.`);
                        return user;
                    }).catch((err) => {
                        throw err;
                    });
                }
                // generate jwt-token
                const token = jwt.sign({ username: user.username }, process.env.JWT_SECRET, { expiresIn: '1h' });
                res.cookie('jwt', token, { httpOnly: true, secure: true });
                logger.debug(`OAuth: JWT generated for user '${user.username}'`);

                logger.info(`OAuth: User '${user.username}' logged in`);
                res.redirect('http://localhost:5173/dashboard');
            }).catch((err) => {
                logger.error(`OAuth: Error while Authenticating user via GitHub: ${err}`);
            });
        })
    })
});