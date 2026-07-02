import { Router } from 'express';
import { auth } from '../../middlewares/authentication.middleware.js';
import validation from '../../middlewares/validation.middleware.js';
import { PROVIDERS_ENUM } from '../../utils/enums/user.enum.js';
import asyncHandler from '../../utils/error-handler/async-handler.js';
import { successResponse } from '../../utils/response/success.response.js';
import {
	changePasswordService,
	forgetPasswordService,
	loginService,
	refreshAccessTokenService,
	registerService,
	resendOtpService,
	resetPasswordService,
	socialLoginService,
	verifyEmailService,
} from './auth.services.js';
import {
	changePasswordSchema,
	forgetPasswordSchema,
	loginSchema,
	refreshTokenSchema,
	registerSchema,
	resendOtpSchema,
	resetPasswordSchema,
	verifyEmailSchema,
} from './auth.validation.js';

const router = Router();

export const routes = {
	base: '/auth',

	login: '/login',
	register: '/signup',
	refreshToken: '/refresh-token',
	socialLogin: '/social-login',
	verifyEmail: '/verify-account',
	resendOtp: '/resend-otp',
	forgetPassword: '/forget-password',
	resetPassword: '/reset-password',
	changePassword: '/change-password',
};

// register
router.post(
	routes.register,
	validation(registerSchema),
	asyncHandler(async (req, res) => {
		const { firstName, lastName, username, email, password, phone, gender, birthdate } = req.body || {};
		const data = await registerService({ firstName, lastName, username, email, password, phone, gender, birthdate });
		successResponse({ res, message: 'Account created successfully, please verify your account', data });
	}),
);

// login
router.post(
	routes.login,
	validation(loginSchema),
	asyncHandler(async (req, res) => {
		const { email, password, rememberMe } = req.body || {};
		const data = await loginService({ email, password, rememberMe });
		successResponse({ res, message: 'Logged in successfully', data });
	}),
);

// refresh token
router.post(
	routes.refreshToken,
	// auth(),
	validation(refreshTokenSchema),
	asyncHandler(async (req, res) => {
		const data = await refreshAccessTokenService(req.cookies?.refreshToken || '');
		successResponse({ res, message: 'Token refreshed successfully', data });
	}),
);

// social login
router.post(
	routes.socialLogin,
	asyncHandler(async (req, res) => {
		const { isNew, tokens } = await socialLoginService(PROVIDERS_ENUM.GOOGLE, req.body.idToken);
		if (isNew) {
			successResponse({ res, status: 201, message: 'Your account has been created successfully', data: tokens });
		} else {
			successResponse({ res, message: 'Login successfully', data: tokens });
		}
	}),
);
export default router;

// verify account
router.post(
	routes.verifyEmail,
	validation(verifyEmailSchema),
	asyncHandler(async (req, res) => {
		const { email, otp } = req.body || {};
		await verifyEmailService(email, otp);

		successResponse({ res, message: 'Account verified successfully, Please login.' });
	}),
);

// resend otp
router.post(
	routes.resendOtp,
	validation(resendOtpSchema),
	asyncHandler(async (req, res) => {
		const { email } = req.body || {};
		await resendOtpService(email);

		successResponse({ res, message: 'OTP resent successfully' });
	}),
);

// forget password
router.post(
	routes.forgetPassword,
	validation(forgetPasswordSchema),
	asyncHandler(async (req, res) => {
		const { email } = req.body || {};
		await forgetPasswordService(email);

		successResponse({ res, message: 'If email exists, we will send you a link to reset your password.' });
	}),
);

// reset password
router.post(
	routes.resetPassword,
	validation(resetPasswordSchema),
	asyncHandler(async (req, res) => {
		const { token, password } = req.body || {};
		await resetPasswordService(token, password);

		successResponse({ res, message: 'Password reset successfully' });
	}),
);

// change password
router.post(
	routes.changePassword,
	auth(),
	validation(changePasswordSchema),
	asyncHandler(async (req, res) => {
		const { oldPassword, newPassword, isConfirmed } = req.body || {};
		await changePasswordService({ userId: req.user._id, oldPassword, newPassword, isConfirmed });

		successResponse({ res, message: 'Password changed successfully' });
	}),
);
