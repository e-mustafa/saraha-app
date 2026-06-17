import { Router } from 'express';
import validation from '../../middlewares/validation.middleware.js';
import asyncHandler from '../../utils/error-handler/async-handler.js';
import { successResponse } from '../../utils/response/success.response.js';
import { loginService, refreshAccessTokenService, signupService } from './auth.services.js';
import { loginSchema, registerSchema } from './auth.validation.js';

const router = Router();

export const routes = {
	base: '/auth',
	login: '/login',
	register: '/signup',
	refreshToken: '/refresh-token',
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
	// requireAuth(true),
	asyncHandler(async (req, res) => {
		const data = await refreshAccessTokenService(req.cookies?.refreshToken || '');
		successResponse({ res, message: 'Token refreshed successfully', data });
	}),
);

export default router;
