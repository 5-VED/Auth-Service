import { Table, Column, DataType, ForeignKey, BelongsTo, HasMany, AllowNull, PrimaryKey, HasOne, Unique, Default } from 'sequelize-typescript';
import { BaseModel } from './BaseModel';
import { Optional } from 'sequelize';
import { UserModel } from './User.model';

export interface NotificationAttributes {
    id: string;
    eventType: string;
    queueName: string;
    payload: any;
    channel: string;
    priority: number;
    status: string;
    sentAt: Date;
    userId: string;
    isDeleted?: boolean;
    createdAt?: Date;
    updatedAt?: Date;
    isActive?: boolean;
}

export interface NotificationCreatinAttributes extends Optional<NotificationAttributes, 'id'> { }

@Table({
    tableName: 'notifications',
    timestamps: true,
})
export class NotificationModel extends BaseModel<NotificationCreatinAttributes> {
    @PrimaryKey
    @Default(DataType.UUIDV4)
    @Column({
        type: DataType.UUID,
        primaryKey: true,
    })
    id!: string;

    @AllowNull(false)
    @Column({
        type: DataType.STRING,
        allowNull: false,
    })
    eventType!: string;

    @AllowNull(false)
    @Column({
        type: DataType.STRING,
        allowNull: false,
    })
    queueName!: string;

    @AllowNull(true)
    @Column({
        type: DataType.JSONB,
        allowNull: false,
        defaultValue: {},
    })
    payload!: JSON;

    @AllowNull(false)
    @Column({
        type: DataType.STRING,
        allowNull: false,
    })
    channel!: string;

    @AllowNull(false)
    @Column({
        type: DataType.INTEGER,
        allowNull: false,
        defaultValue: 1,
    })
    priority!: number;

    @AllowNull(false)
    @Column({
        type: DataType.STRING,
        allowNull: false,
        defaultValue: 'pending',
    })
    status!: string

    @AllowNull(false)
    @Column({
        type: DataType.DATE,
        allowNull: false,
    })
    sentAt!: Date;

    @AllowNull(false)
    @Column({
        type: DataType.UUID,
        allowNull: false,
    })
    userId!: string;

    @BelongsTo(() => UserModel, { foreignKey: 'userId', targetKey: 'id' })
    userData!: UserModel;
}
