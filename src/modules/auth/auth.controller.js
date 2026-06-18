import { Router } from 'express';
import { requireAuth } from '../../middlewares/authentication.middleware.js';
import validation from '../../middlewares/validation.middleware.js';
import { PROVIDERS_ENUM } from '../../utils/enums/user.enum.js';
import asyncHandler from '../../utils/error-handler/async-handler.js';
import { successResponse } from '../../utils/response/success.response.js';
import { loginService, refreshAccessTokenService, signupService, socialLoginService } from './auth.services.js';
import { loginSchema, registerSchema } from './auth.validation.js';

const router = Router();

export const routes = {
	base: '/auth',

	login: '/login',
	register: '/signup',
	refreshToken: '/refresh-token',
	socialLogin: '/social-login',
};

router.post(
	routes.register,
	validation(registerSchema),
	asyncHandler(async (req, res) => {
		const { firstName, lastName, username, email, password, phone, gender, birthdate } = req.body || {};
		const data = await signupService({ firstName, lastName, username, email, password, phone, gender, birthdate });
		successResponse({ res, message: 'User created successfully, please login', data });
	}),
);

router.post(
	routes.login,
	validation(loginSchema),
	asyncHandler(async (req, res) => {
		const { email, password } = req.body || {};
		const data = await loginService({ email, password });
		successResponse({ res, message: 'Logged in successfully', data });
	}),
);

router.post(
	routes.refreshToken,
	requireAuth(),
	asyncHandler(async (req, res) => {
		const data = await refreshAccessTokenService(req.cookies?.refreshToken || '');
		successResponse({ res, message: 'Token refreshed successfully', data });
	}),
);

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
