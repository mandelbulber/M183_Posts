import express from 'express';
import { authRouter } from './routes/auth.js';
import { postRouter } from './routes/post.js';
import { postSecuredRouter } from './routes/postSecured.js';
import { sequelize } from './database/database.js';
import cookieParser from 'cookie-parser';
import { createRelations, seedDatabase } from './database/alterDatabase.js';
import { logger } from './logger/logger.js';

import dotenv from 'dotenv';
dotenv.config();

const app = express();
const port = 8000;

app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(cookieParser());

// define routes
app.use('/api/auth', authRouter);
app.use('/api/post', postRouter);
app.use('/api/posts', postSecuredRouter)

// database connection
createRelations();
await sequelize.sync().then(() => {
    logger.info('Database synced');
});
seedDatabase();

app.listen(port, () => {
    logger.info(`Server listening at http://localhost:${port}`);
});
