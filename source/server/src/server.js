import express from 'express';
import { authRouter } from './routes/auth.js';
import { postsRouter } from './routes/posts.js';

import { sequelize } from './database/database.js';

const app = express();
const port = 8000;

app.use(express.urlencoded({ extended: false }));
app.use(express.json());

// define routes
app.use('/api/auth', authRouter);
app.use('/api/posts', postsRouter);

// database connection
sequelize.sync().then(() => {
    console.log('Database synced');
});

app.listen(port, () => {
    console.log(`Server listening at http://localhost:${port}`);
});
