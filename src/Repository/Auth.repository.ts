import { Transaction } from 'sequelize';
import { SOCIAL_PROVIDER } from '../Common/Constants/enums';
import { AuthAttributes, AuthAttributesCreation, AuthModel } from '../Models';

export class AuthRepository {
	static async create(payload: AuthAttributesCreation, transaction?: Transaction): Promise<AuthAttributes> {
		return await AuthModel.create(payload, { transaction });
	}

	static async findById(id: string, transaction?: Transaction): Promise<AuthAttributes | null> {
		return await AuthModel.findByPk(id, { transaction });
	}

	static async findByUserId(userId: string, transaction?: Transaction): Promise<AuthAttributes | null> {
		return await AuthModel.findOne({ where: { userId }, transaction });
	}

	static async findByProvider(provider: SOCIAL_PROVIDER, providerId?: string, transaction?: Transaction): Promise<AuthAttributes | null> {
		return await AuthModel.findOne({ where: { provider, providerId }, transaction });
	}

	static async updateById(id: string, payload: Partial<Omit<AuthAttributes, 'id' | 'userId'>>, transaction?: Transaction) {
		return await AuthModel.update(payload, { where: { id }, transaction });
	}

	static async destroyById(id: string, transaction?: Transaction) {
		return await AuthModel.destroy({ where: { id }, transaction });
	}
}


