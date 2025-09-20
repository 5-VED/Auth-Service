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

// Google OAuth under /users/login path
router.get('/login/google', passport.authenticate('google', { scope: ['profile', 'email'], session: false }));
router.get(
	'/login/google/callback',
	passport.authenticate('google', { session: false, failureRedirect: '/login?error=google' }),
	SocialAuthController.googleCallback
);

// Facebook
router.get('/login/facebook', passport.authenticate('facebook', { scope: ['email'], session: false }));
router.get(
	'/login/facebook/callback',
	passport.authenticate('facebook', { session: false, failureRedirect: '/login?error=facebook' }),
	SocialAuthController.facebookCallback
);

// Apple
router.get('/login/apple', passport.authenticate('apple'));
router.post(
	'/login/apple/callback',
	passport.authenticate('apple', { session: false, failureRedirect: '/login?error=apple' }),
	SocialAuthController.appleCallback
);

export default router;


