import { Model, DataTypes } from 'sequelize';
import { sequelize } from '../database/database.js';

export class Comment extends Model { }

Comment.init({
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
    }
    
}, {
    sequelize,
    modelName: 'comment'
});
