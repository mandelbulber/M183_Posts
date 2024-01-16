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
    content: {
        type: DataTypes.STRING,
        allowNull: false
    },
    
}, {
    sequelize,
    modelName: 'comment'
});

Comment.beforeCreate((comment) => {
    if (comment.content.length > 200) {
        comment.content = comment.content.substring(0, 200);
    }
});
