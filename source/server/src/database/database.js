import { Sequelize } from 'sequelize';
import { logger } from '../logger/logger.js';

export const sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: './src/database/database.sqlite',
    logging: (msg) => logger.silly(`Sequelize: ${msg}`),
});
