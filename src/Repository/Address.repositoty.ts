import { AddressAttributes, AddressCreationAttributes, AddressModel } from '../Models';
import { Transaction } from 'sequelize';

export class AddressRepository {
	static async create(address: AddressCreationAttributes, transaction?: Transaction): Promise<AddressAttributes> {
		return await AddressModel.create(address, { transaction });
	}

	static async findById(id: string, transaction?: Transaction): Promise<AddressAttributes | null> {
		return await AddressModel.findByPk(id, { transaction });
	}

	static async findAll({ page = 1, limit = 10 }: { page?: number; limit?: number } = {}) {
		const addresses = await AddressModel.findAll({
			offset: (page - 1) * limit,
			limit,
		});
		const count = await AddressModel.count();
		return { addresses, count };
	}

	static async updateById(id: string, payload: Partial<Omit<AddressAttributes, 'id'>>, transaction?: Transaction) {
		return await AddressModel.update(payload, { where: { id }, transaction });
	}

	static async destroyById(id: string, transaction?: Transaction) {
		return await AddressModel.destroy({ where: { id }, transaction });
	}
}


