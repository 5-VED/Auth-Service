import { Table, Column, DataType, ForeignKey, BelongsTo, HasMany, AllowNull, PrimaryKey, HasOne, Unique, Default } from 'sequelize-typescript';
import { BaseModel } from './BaseModel';
import { Optional } from 'sequelize';
import { RoleModel } from './Role.model';
import { AddressModel } from './Address.model';
import { AuthModel } from './Auth.model';

export interface UserAttributes {
	id: string;
	firstName: string;
	lastName: string;
	middleName?: string;
	email: string;
	phoneNo?: string;
	role: string;
	address: string;
	images: string[];
	isKYCVerified: boolean;
	isActive: boolean;
	isDeleted: boolean;
	createdAt?: Date;
	updatedAt?: Date;
}

const	 indexes = [
	{
		unique: true,
		fields: ['email']
	},
	{
		unique: true,
		fields: ['phoneNo']
	},
	{
		fields: ['role'] // Index for foreign key
	},
	{
		fields: ['address'] // Index for foreign key
	}
]

export interface UserCreatinAttributes extends Optional<UserAttributes, 'id'> { }

@Table({
	tableName: 'users',
	timestamps: true,
	indexes: indexes
})
export class UserModel extends BaseModel<UserCreatinAttributes> {
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
	firstName!: string;

	@AllowNull(false)
	@Column({
		type: DataType.STRING,
		allowNull: false,
	})
	lastName!: string;

	@AllowNull(true)
	@Column({
		type: DataType.STRING,
		allowNull: true,
	})
	middleName!: string | "";

	@AllowNull(false)
	@Unique(true)
	@Column({
		type: DataType.STRING,
		allowNull: false,
		unique: true,
	})
	email!: string;

	@AllowNull(false)
	@Unique(true)
	@Column({
		type: DataType.STRING,
		allowNull: false,
	})
	phoneNo!: string;

	@ForeignKey(() => AddressModel)
	@AllowNull(false)
	@Column({
		type: DataType.STRING,
		allowNull: false
	})
	address!: string

	@ForeignKey(() => RoleModel)
	@AllowNull(false)
	@Column({
		type: DataType.UUID,
		allowNull: false,
	})
	role!: string;

	@AllowNull(false)
	@Column({
		type: DataType.ARRAY(DataType.STRING),
		defaultValue: [],
	})
	images!: string[];

	@Default(false)
	@Column({
		type: DataType.BOOLEAN
	})
	isKYCVerified!: boolean | false

	@BelongsTo(() => RoleModel, { foreignKey: 'role', targetKey: 'id' })
	roleData!: RoleModel;

	@BelongsTo(() => AddressModel, { foreignKey: 'address', targetKey: 'id' })
	addressData!: AddressModel;

	@HasMany(() => AuthModel, { foreignKey: 'userId', sourceKey: 'id' })
	socialAuths!: AuthModel[];
}
