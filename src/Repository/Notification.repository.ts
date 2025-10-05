import { NotificationAttributes, NotificationCreatinAttributes, NotificationModel } from '../Models';
import { Transaction } from 'sequelize';

export class NotificationRepository {
    // Query to create Notification
    static async create(payload: NotificationCreatinAttributes, transaction?: Transaction): Promise<NotificationAttributes> {
        return await NotificationModel.create(payload, { transaction });
    }
}
