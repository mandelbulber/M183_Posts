import { Model, DataTypes } from 'sequelize';
import { sequelize } from '../database/database.js';

export class Role extends Model { }

Role.init({
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
        allowNull: false
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },
}, {
    sequelize,
    modelName: 'role'
});
