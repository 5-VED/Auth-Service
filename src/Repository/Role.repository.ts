import { Transaction } from 'sequelize';
import { RoleModel, RoleAttributes, RoleCreatinAttributes } from '../Models/Role.model';

export class RoleRepository {
	static async create(payload: RoleCreatinAttributes, transaction?: Transaction): Promise<RoleAttributes> {
		return await RoleModel.create(payload, { transaction });
	}

	static async findById(id: string, transaction?: Transaction): Promise<RoleAttributes | null> {
		return await RoleModel.findByPk(id, { transaction });
	}

	static async findByRole(role: string, transaction?: Transaction): Promise<RoleAttributes | null> {
		return await RoleModel.findOne({ where: { role }, transaction });
	}

	static async removeById(id: string, transaction?: Transaction): Promise<number> {
		return await RoleModel.destroy({ where: { id }, transaction });
	}
}


