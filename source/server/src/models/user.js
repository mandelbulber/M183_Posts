import { Model, DataTypes } from 'sequelize';
import { sequelize } from '../database/database.js';

export class User extends Model { }

User.init({
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
        allowNull: false
    },
    username: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false
    },
    phoneNumber: {
        type: DataTypes.STRING,
        allowNull: false
    },
    smsToken: {
        type: DataTypes.STRING,
        allowNull: true
    },
    smsTokenCreatedAt: {
        type: DataTypes.DATE,
        allowNull: true
    },
}, {
    sequelize,
    modelName: 'user'
});
