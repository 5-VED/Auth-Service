import { Router } from 'express'
import UserController from '../Controllers/User.controller'
import ValidationMiddleware from '../Middlewares/Validation.middleware';
import { SignupDto, LoginDto, ResetPasswordDto, ForgotPasswordDto } from '../Validators/User.dto';
import passport from 'passport';
import SocialAuthController from '../Controllers/SocialAuth.controller';



const router = Router({ mergeParams: true });

router.post('/signup', ValidationMiddleware(SignupDto, 'body'), UserController.signup);

router.post('/login', ValidationMiddleware(LoginDto, 'body'), UserController.login);

router.post("/forgot_password", ValidationMiddleware(ForgotPasswordDto, 'body'), UserController.forgotPassword)

router.post("/reset_password",ValidationMiddleware(ResetPasswordDto, 'body'), UserController.resetPassword)

export default router;


