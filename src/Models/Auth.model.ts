import {
  Table,
  Column,
  DataType,
  ForeignKey,
  BelongsTo,
  AllowNull,
  PrimaryKey,
  Unique,
  Model,
} from 'sequelize-typescript';
import { Optional } from 'sequelize';
import { BaseModel } from './BaseModel';
import { UserModel } from './User.model';
import { SOCIAL_PROVIDER } from '../Common/Constants/enums';

export interface AuthAttributes {
  id: string;
  userId: string;
  provider: SOCIAL_PROVIDER;
  providerId?: string;
  password?: string;
  metadata?: Record<string, any>;
  accessToken?: string;
  refreshToken?: string;
  tokenExpiry?: Date;
  sessionToken?: string;
  sessionExpiry?: Date;
  lastLogin?: Date;
  createdAt?: Date,
  updatedAt?: Date
}

export interface AuthAttributesCreation
  extends Optional<AuthAttributes, 'id'> { }

const indexes = [
  {
    unique: true,
    fields: ['provider', 'providerId'],
  },
  {
    fields: ['userId'],
  },
];

@Table({
  tableName: 'Auth',
  timestamps: true,
  indexes: indexes,
})
export class AuthModel extends Model<AuthAttributesCreation> {
  @PrimaryKey
  @Column({
    type: DataType.UUID,
    defaultValue: DataType.UUIDV4,
  })
  id!: string;

  @ForeignKey(() => UserModel)
  @AllowNull(false)
  @Column({
    type: DataType.UUID,
  })
  userId!: string;

  @AllowNull(true)
  @Column(DataType.STRING)
  password?: string;

  @AllowNull(false)
  @Column({
    type: DataType.ENUM(...Object.values(SOCIAL_PROVIDER)),
  })
  provider!: SOCIAL_PROVIDER;

  @AllowNull(true)
  @Column(DataType.STRING)
  providerId?: string;

  @AllowNull(true)
  @Column(DataType.JSON)
  metadata?: Record<string, any>;

  @AllowNull(true)
  @Column(DataType.TEXT)
  accessToken?: string;

  @AllowNull(true)
  @Column(DataType.TEXT)
  refreshToken?: string;

  @AllowNull(true)
  @Column(DataType.TEXT)
  sessionToken?: string;

  @AllowNull(true)
  @Column(DataType.DATE)
  sessionExpiry?: Date;

  @AllowNull(true)
  @Column(DataType.DATE)
  tokenExpiry?: Date;

  @AllowNull(true)
  @Column(DataType.DATE)
  lastLogin?: Date;

  @BelongsTo(() => UserModel, { foreignKey: 'userId', targetKey: 'id' })
  user!: UserModel;
}
