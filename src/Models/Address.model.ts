import { BaseModel } from "./BaseModel";
import { DataTypes, Optional } from "sequelize"
import { Column, PrimaryKey, Table } from "sequelize-typescript";

export interface AddressAttributes {
    id: string,
    line1: string,
    line2: string,
    city: string,
    country: string,
    state: string,
    // postalCode?: string
}

export interface AddressCreationAttributes extends Optional<AddressAttributes, 'id'> { }

@Table({
    tableName: 'address',
    timestamps: true,
})
export class AddressModel extends BaseModel<AddressCreationAttributes> {
    @PrimaryKey
    @Column({
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    })
    id!: string

    @Column({
        type: DataTypes.STRING,
        allowNull: false
    })
    line1!: string

    @Column({
        type: DataTypes.STRING,
        allowNull: false
    })
    line2!: string

    @Column({
        type: DataTypes.STRING,
        allowNull: false
    })
    city!: string

    @Column({
        type: DataTypes.STRING,
        allowNull: false
    })
    state!: string

    @Column({
        type: DataTypes.STRING,
        allowNull: false
    })
    country!: string
}

