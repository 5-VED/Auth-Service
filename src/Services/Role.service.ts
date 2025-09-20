import message from "../Common/Constants/Messages";
import { LAYER } from "../Common/Constants/enums"
import ApiError from "../Common/ErrorResponse";
import logger from "../Config/Logger";
import { RoleAttributes, RoleCreatinAttributes } from "../Models/Role.model";
import { RoleRepository, UserRepository } from "../Repository";

export default class RoleService {
    public static async create(payload: RoleCreatinAttributes): Promise<RoleAttributes> {
        try {
            const existing = await RoleRepository.findByRole(payload.role);
            if (existing) {
                throw ApiError.conflict(message.ROLE_EXISTS);
            }

            const created = await RoleRepository.create({ role: payload.role });
            return created as unknown as RoleAttributes;
        } catch (error: any) {
            logger.error(`Error in ${LAYER.SERVICE_LAYER}:--> ${error}`)
            throw ApiError.internal(message.ERROR_CREATING_ROLE)
        }
    }

    public static async remove(id: string): Promise<{ removed: boolean }> {
        try {
            const usageCount = await UserRepository.countByRole(id);
            if (usageCount > 0) {
                throw ApiError.forbidden(message.ROLE_ASSIGNED_TO_USERS);
            }

            const removedCount = await RoleRepository.removeById(id);
            if (removedCount === 0) {
                throw ApiError.notFound(message.ROLE_NOT_FOUND);
            }
            return { removed: true };
        } catch (error: any) {
            logger.error(`Error in ${LAYER.SERVICE_LAYER}:--> ${error}`)
            throw ApiError.internal(message.FAILED)
        }
    }
}


