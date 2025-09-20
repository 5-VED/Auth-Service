import { Table, Column, DataType, PrimaryKey, Unique, Model, CreatedAt, UpdatedAt, HasMany } from 'sequelize-typescript';
import { Optional } from 'sequelize';
import { UserModel } from './User.model';
import { BaseModel } from './BaseModel';

export interface RoleAttributes {
    id: string;
    role: string;
    createdAt?: Date;
    updatedAt?: Date;
}

export interface RoleCreatinAttributes extends Optional<RoleAttributes, 'id'> { }

const indexes = [
    {
        fields: ['role'],
    },
    {
        fields: ['userId'],
    },
]

@Table({
    tableName: 'roles',
    timestamps: true,
    indexes: indexes
})
export class RoleModel extends Model<RoleCreatinAttributes> {
    @PrimaryKey
    @Column({
        type: DataType.UUID,
        defaultValue: DataType.UUIDV4,
        primaryKey: true,
    })
    id!: string;

    @Unique(true)
    @Column({
        type: DataType.STRING,
        allowNull: false,
    })
    role!: string;

    // Add the HasMany association back to UserModel
    @HasMany(() => UserModel, { foreignKey: 'role', sourceKey: 'id' })
    users!: UserModel[];
}















