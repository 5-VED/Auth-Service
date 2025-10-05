import message from "../Common/Constants/Messages";
import ApiError from "../Common/ErrorResponse";
import logger from "../Config/Logger";
import { UserAttributes, UserCreatinAttributes } from "../Models/User.model";
import { RoleRepository, AddressRepository, AuthRepository, NotificationRepository } from "../Repository";
import { UserRepository } from "../Repository/User.repository";
import sequelize from "../Database/PostgresConnection";
import bcrypt from 'bcrypt';
import jwt, { SignOptions } from 'jsonwebtoken';
import { config } from "../Config/config";
import { KAFKA_TOPICS, LAYER, SOCIAL_PROVIDER } from "../Common/Constants/enums"
import { generateOTP, setJSON, comparePassword, hashPassword } from "../Utils/Auth_Methods";
import runProducer from "../Config/Kafka/producer";


interface TokenPayload {
	id: string;
	email: string;
	role?: string;
}

export default class UserService {

	private static readonly JWT_SECRET_KEY = config.jwt.secret as string;
	private static readonly JWT_EXPIRES_IN = '24h';


	public static async create(payload: any): Promise<UserAttributes> {
		const transaction = await sequelize.transaction();
		try {
			const existingUser = await UserRepository.findUserByEmail(payload.email, transaction);

			if (existingUser) {
				throw ApiError.conflict(message.USER_ALREADY_EXISTS, { email: payload.email });
			}

			let roleId: string = payload.role;
			if (!roleId) {
				const defaultRole = await RoleRepository.findById(roleId, transaction);

				if (!defaultRole) {
					throw ApiError.notFound('Default role not found');
				}
				roleId = defaultRole.id;
			} else {
				let role = await RoleRepository.findById(roleId, transaction);

				if (!role) {
					throw ApiError.notFound('Role not found');
				}
				roleId = role.id;
			}

			// Resolve address
			let address_id = payload.address;
			if (!address_id.id) {
				if (!payload.address) {
					throw ApiError.validationError('Either addressId or address object is required');
				}
				const address = await AddressRepository.create({
					line1: payload.address.line1,
					line2: payload.address.line2,
					city: payload.address.city,
					state: payload.address.state,
					country: payload.address.country,
				}, transaction);
				address_id = address.id;

			} else {
				const existingAddress = await AddressRepository.findById(address_id.id, transaction);
				if (!existingAddress) {
					throw ApiError.notFound('Address not found');
				}
			}

			const user = await UserRepository.create({
				firstName: payload.firstName,
				lastName: payload.lastName,
				middleName: payload.middleName,
				email: payload.email,
				phoneNo: payload.phoneNo,
				role: roleId as string,
				address: address_id,
			} as UserCreatinAttributes, transaction);

			// Hash and store password in Auth table
			const hashedPassword = await bcrypt.hash(payload.password, 10);
			await AuthRepository.create({
				userId: user.id,
				provider: SOCIAL_PROVIDER.PASSWORD,
				providerId: payload.email,
				password: hashedPassword,
			}, transaction);

			await transaction.commit();
			return user;

		} catch (error) {
			logger.error(`Error in ${LAYER.SERVICE_LAYER}:--> ${error}`)
			await transaction.rollback();
			throw ApiError.internal('Failed to create user');
		}
	}

	public static async login(email: string, password: string) {
		const transaction = await sequelize.transaction();
		try {
			const user = await UserRepository.findUserByEmail(email, transaction);

			if (!user) {
				throw ApiError.notFound(message.USER_NOT_FOUND);
			}

			// Verify password
			// const isPasswordValid = await bcrypt.compare(password, user.password);
			// if (!isPasswordValid) {
			// 	throw ApiError.unauthorized(message.INVALID_PASSWORD);
			// }

			// Generate JWT token
			const tokenPayload: TokenPayload = {
				id: user.id,
				email: user.email,
				role: user.role
			};

			const signOptions: SignOptions = {
				expiresIn: UserService.JWT_EXPIRES_IN
			};

			const token = jwt.sign(
				tokenPayload,
				UserService.JWT_SECRET_KEY,
				signOptions
			);

			// Remove password from response
			const userResponse = {
				id: user.id,
				email: user.email,
				role: user.role,
				createdAt: user.createdAt,
				updatedAt: user.updatedAt
			};

			await transaction.commit()
			return {
				user: userResponse,
				token
			};

		} catch (error) {
			await transaction.rollback()
			logger.error(`Error in ${LAYER.SERVICE_LAYER}:--> ${error}`)
			throw ApiError.internal('Failed to login user');
		}
	}

	public static async forgotPassword(email?: string, phoneNo?: string, countryCode?: string) {
		const transaction = await sequelize.transaction();
		try {
			let user: any = ""

			if (email) {
				user = await UserRepository.findUserByEmail(email, transaction);
			} else if (phoneNo) {
				user = await UserRepository.findUserByPhone(phoneNo, transaction); // Fixed typo: phoneN0 -> phoneNo
			}

			if (!user) {
				throw ApiError.validationError('Email or Mobile no required');
			}

			const otp = generateOTP()

			// send otp on email (template) or sms and expire it in 1 hour.






			//  store otp in redis database.
			// await setJSON(`user_${user.id}`, user.id)
			return {
				user: user.id
			}

		} catch (error) {
			logger.error(`Error in ${LAYER.SERVICE_LAYER}:--> ${error}`)
			throw ApiError.internal('Failed to login user');
		}
	}

	public static async resetPassword(email: string, password: string) {
		const transaction = await sequelize.transaction();
		try {

			let user: any = ""

			if (email) {
				user = await UserRepository.findUserByEmail(email, transaction);
			}

			if (!user) {
				throw ApiError.validationError('User Not Found');
			}

			let isPasswordCorrect = await comparePassword({ password, hashedPassword: user.password })
			if (!isPasswordCorrect) {
				throw ApiError.validationError('Enter valid password');
			}

			// Create hash of new password and update in db
			const newPassword = await hashPassword({ password })
			await UserRepository.update({ email, isActive: user.isActive, isDeleted: user.isDeleted, payload: newPassword })

			await transaction.commit()
			return {
				user: user.id
			}

		} catch (error) {
			logger.error(`Error in ${LAYER.SERVICE_LAYER}:--> ${error}`)
			await transaction.rollback()
			throw ApiError.internal('Failed to login user');
		}
	}
}
