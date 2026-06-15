import { Router } from 'express';
import asyncHandler from '../../utils/error-handler/async-handler.js';
import { signupService } from './auth.services.js';

const router = Router();

export const routes = {
	base: '/auth',
	login: '/login',
	register: '/signup',
};

import { successResponse } from '../../utils/response/success.response.js';

router.post(
	routes.register,
	asyncHandler(async (req, res) => {
		const { firstName, lastName, email, password } = req.body || {};
		const data = await signupService({ firstName, lastName, email, password });
		successResponse({ res, message: 'Signup successful', data });
	}),
);

export default router;
