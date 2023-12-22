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
    recoveryCodes: {
        type: DataTypes.STRING,
        allowNull: true
    },
    smsToken: {
        type: DataTypes.STRING,
        allowNull: true
    },
    smsTokenCreatedAt: {
        type: DataTypes.DATE,
        allowNull: true
    },
    failedLoginAttempts: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0
    },
    blockedUntil: {
        type: DataTypes.DATE,
        allowNull: true
    },
    totpSecret: {
        type: DataTypes.STRING,
        allowNull: true
    },
}, {
    sequelize,
    modelName: 'user'
});
