import { Router } from 'express'
import RoleController from '../Controllers/Role.controller'
import ValidationMiddleware from '../Middlewares/Validation.middleware'
import { RoleDto } from '../Validators/Role.dto'    

const router = Router({ mergeParams: true });

// Create a new role (Super Admin only)
router.post('/add_role', ValidationMiddleware(RoleDto, 'body'), RoleController.create)

// Remove a role (Super Admin only)
router.delete('/remove_role/:id', RoleController.remove)

export default router
