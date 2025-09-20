import { Table, Column, Model, DataType, CreatedAt, UpdatedAt } from 'sequelize-typescript';


export interface BaseModelAttributes {
	id: string;
	createdAt: Date;
	updatedAt: Date;
	deletedAt?: Date;
	isActive: boolean;
}


const indexes = [
	{
		unique: true,
		fields: ["storeAddress"],
	},
	{
		unique: true,
		fields: ["gstNo"],
	},
	{
		unique: true,
		fields: ["panCardNo"],
	},
	{
		fields: ["storeName"], 
	},
	{
		fields: ["isDeleted"],
	},
	{
		unique: true,
		fields: ["storeName", "gstNo"],
		name: "storeName_gstNo_unique_idx"
	},
	{
		fields: ["storeName", "isDeleted"], 
		name: "storeName_isDeleted_idx"
	}
];

@Table({
	tableName: 'Base',
	timestamps: true,
	indexes: indexes

})
export abstract class BaseModel<T extends {} = any> extends Model<T> {
	@Column({
		type: DataType.BOOLEAN,
		defaultValue: true,
		allowNull: false,
	})
	isActive!: boolean;

	@Column({
		type: DataType.BOOLEAN,
		defaultValue: false,
		allowNull: false,
	})
	isDeleted!: boolean;

	@Column({
		type: DataType.DATE,
		defaultValue: DataType.NOW,
		allowNull: false,
	})
	createdAt!: Date;

	@Column({
		type: DataType.DATE,
		defaultValue: DataType.NOW,
		allowNull: false,
	})
	updatedAt!: Date;
}
