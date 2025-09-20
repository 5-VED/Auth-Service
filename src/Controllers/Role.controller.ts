import { Request, Response, NextFunction } from 'express';
import { HTTP_CODES, LAYER, ROLE } from '../Common/Constants/enums';
import message from '../Common/Constants/Messages';
import logger from '../Config/Logger';
import { sendResponse } from '../Utils/Auth_Methods';
import RoleService from '../Services/Role.service';

export default class RoleController {
    public static async create(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { role } = req.body as { role: string };

            const created = await RoleService.create({ role });
            sendResponse(res, created, message.ROLE_CREATED, true, HTTP_CODES.OK);
        } catch (error: any) {
            logger.error(`Error in ${LAYER.CONTROLLER_LAYER}:--> ${error}`);
            next(error);
        }
    }

    public static async remove(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { id } = req.params as { id: string };
            const result = await RoleService.remove(id);
            sendResponse(res, result, message.ROLE_REMOVED, true, HTTP_CODES.OK);
        } catch (error: any) {
            logger.error(`Error in ${LAYER.CONTROLLER_LAYER}:--> ${error}`);
            next(error);
        }
    }
}


