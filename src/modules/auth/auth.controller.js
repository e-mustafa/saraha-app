import { Router } from 'express';
import { auth, authOptional } from '../../middlewares/authentication.middleware.js';
import validation from '../../middlewares/validation.middleware.js';
import { cookiesKeysEnum } from '../../utils/enums/security,enum.js';
import { PROVIDERS_ENUM } from '../../utils/enums/user.enum.js';
import asyncHandler from '../../utils/error-handler/async-handler.js';
import { successResponse } from '../../utils/response/success.response.js';
import { setCookies } from '../../utils/security/set-cookies.security.js';
import { UserDTO } from '../user/user.utils.js';
import {
	changeEmailRequestService,
	changeEmailService,
	changePasswordService,
	checkIfUsernameExists,
	forgetPasswordService,
	loginService,
	logoutAllService,
	logoutService,
	refreshAccessTokenService,
	registerService,
	resendOtpService,
	resetPasswordService,
	revertEmailService,
	socialLoginService,
	verifyEmailService,
} from './auth.services.js';
import {
	changeEmailRequestSchema,
	changeEmailSchema,
	changePasswordSchema,
	checkUsernameSchema,
	forgetPasswordSchema,
	loginSchema,
	refreshTokenSchema,
	registerSchema,
	resendOtpSchema,
	resetPasswordSchema,
	revertEmailSchema,
	verifyEmailSchema,
} from './auth.validation.js';

const router = Router();

export const routes = {
	base: '/auth',

	login: '/login',
	checkUsername: '/check-username',
	register: '/signup',
	refreshToken: '/refresh-token',
	socialLogin_google: '/social-login/google',
	verifyEmail: '/verify-account',
	resendOtp: '/resend-otp',

	forgetPassword: '/forget-password',
	resetPassword: '/reset-password',
	changePassword: '/change-password',

	requestChangeEmail: '/request-change-email',
	changeEmail: '/change-email',
	revertEmail: '/revert-email',

	logout: '/logout',
	logoutAll: '/logout-all',
};

// check if username already exists or available
router.post(
	routes.checkUsername,
	authOptional(),
	validation(checkUsernameSchema),
	asyncHandler(async (req, res) => {
		const { username } = req.body || {};
		const data = await checkIfUsernameExists(req.user._id || null, username);
		successResponse({ res, message: 'Username is available', data });
	}),
);

// register
router.post(
	routes.register,
	validation(registerSchema),
	asyncHandler(async (req, res) => {
		const { firstName, lastName, username, email, password, phone, gender, birthdate } = req.body || {};
		const data = await registerService({ firstName, lastName, username, email, password, phone, gender, birthdate });
		const user = UserDTO.single(data);
		successResponse({ res, message: 'Account created successfully, please verify your account', data: user });
	}),
);

// login
router.post(
	routes.login,
	validation(loginSchema),
	asyncHandler(async (req, res) => {
		const { email, password, rememberMe } = req.body || {};
		const data = await loginService({ email, password, rememberMe });

		// set tokens in cookie
		setCookies(res, data);

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

		// set tokens in cookie
		setCookies(res, data);

		successResponse({ res, message: 'Tokens refreshed successfully', data });
	}),
);

// social login
router.post(
	routes.socialLogin_google,
	asyncHandler(async (req, res) => {
		const { isNew, tokens } = await socialLoginService(PROVIDERS_ENUM.GOOGLE, req.body.idToken);
		if (isNew) {
			successResponse({ res, status: 201, message: 'Your account has been created successfully', data: tokens });
		} else {
			successResponse({ res, message: 'Login successfully', data: tokens });
		}
	}),
);

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
		const { token, password, logoutAll } = req.body || {};
		await resetPasswordService(token, password, logoutAll);

		successResponse({ res, message: 'Password reset successfully' });
	}),
);

// change password
router.post(
	routes.changePassword,
	auth(),
	validation(changePasswordSchema),
	asyncHandler(async (req, res) => {
		const { oldPassword, newPassword, isConfirmed, logoutAll } = req.body || {};
		await changePasswordService({ userId: req.user._id, oldPassword, newPassword, isConfirmed, logoutAll });

		successResponse({ res, message: 'Password changed successfully' });
	}),
);

router.post(
	routes.requestChangeEmail,
	auth(),
	validation(changeEmailRequestSchema),
	asyncHandler(async (req, res) => {
		const { newEmail, password } = req.body || {};
		await changeEmailRequestService({ userId: req.user._id, newEmail, password });

		successResponse({ res, message: 'An OTP has been sent to your new email' });
	}),
);

router.patch(
	routes.changeEmail,
	auth(),
	validation(changeEmailSchema),
	asyncHandler(async (req, res) => {
		await changeEmailService(req.user._id, req.body.otp || '');

		successResponse({ res, message: 'Email changed successfully' });
	}),
);

// revert email
router.patch(
	routes.revertEmail,
	// auth(),
	validation(revertEmailSchema),
	asyncHandler(async (req, res) => {
		await revertEmailService(req.user._id, req.body.token || '');

		successResponse({ res, message: 'Email reverted successfully' });
	}),
);

// logout
router.patch(
	routes.logout,
	asyncHandler(async (req, res) => {
		await logoutService(req.cookies?.refreshToken || '');

		res.clearCookie(cookiesKeysEnum.accessToken);
		res.clearCookie(cookiesKeysEnum.refreshToken);

		successResponse({ res, message: 'Logged out successfully' });
	}),
);

router.patch(
	routes.logoutAll,
	auth(),
	asyncHandler(async (req, res) => {
		await logoutAllService(req.user, req.cookies?.refreshToken || '');

		res.clearCookie(cookiesKeysEnum.accessToken);
		res.clearCookie(cookiesKeysEnum.refreshToken);

		successResponse({ res, message: 'Logged out from all sessions successfully' });
	}),
);

export default router;
