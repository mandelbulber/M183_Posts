import { Sequelize } from 'sequelize';

export const sequelize = new Sequelize({ dialect: 'sqlite', storage: './src/database/database.sqlite' });
