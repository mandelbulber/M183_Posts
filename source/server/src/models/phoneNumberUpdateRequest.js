import { Model, DataTypes } from 'sequelize';
import { sequelize } from '../database/database.js';

export class PhoneNumberUpdateRequest extends Model { }

PhoneNumberUpdateRequest.init({
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
        allowNull: false
    },
    phoneNumber: {
        type: DataTypes.STRING,
        allowNull: false
    },
    smsToken: {
        type: DataTypes.STRING,
        allowNull: false
    },
}, {
    sequelize,
    modelName: 'phoneNumberUpdateRequest'
});
