import { Table, Column, PrimaryKey, DataType, AllowNull, Unique } from "sequelize-typescript"
import { BaseModel } from "./BaseModel"
import { DataTypes, Optional } from "sequelize"

export interface BusinessDetailAttributes {
    id: string,
    storeName: string,
    storeAddress: string,
    gstNo: string,
    gstCertificateImage: string,
    panCardNo: string,
    panCardImage: string,
    isDeleted: boolean | false
}

export interface BusinessDetailCreationAttributes extends Optional<BusinessDetailAttributes, "id"> { }

@Table({
    tableName: 'businessDetails',
    timestamps: true
})
export class BusinessDetailModel extends BaseModel<BusinessDetailCreationAttributes> {
    @PrimaryKey
    @Column({
        type: DataTypes.UUIDV4,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4
    })
    id!: string

    @AllowNull(false)
    @Column({
        type: DataType.STRING
    })
    storeName!: string

    @AllowNull(false)
    @Unique(true)
    @Column({
        type: DataType.STRING
    })
    storeAddress!: string

    @AllowNull(false)
    @Unique(true)
    @Column({
        type: DataType.STRING
    })
    gstNo!: string

    @AllowNull(false)
    @Column({
        type: DataType.STRING
    })
    gstCertificateImage!: string

    @AllowNull(false)
    @Unique(true)
    @Column({
        type: DataType.STRING
    })
    panCardNo!: string

    @AllowNull(false)
    @Column({
        type: DataType.STRING,
        allowNull: false
    })
    panCardImage!: string

    @Column({
        type: DataType.BOOLEAN,
        defaultValue: false
    })
    isDeleted!: boolean | false

}




