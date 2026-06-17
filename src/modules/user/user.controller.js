import { Router } from 'express';
import { requireAuth } from '../../middlewares/authentication.middleware.js';
import { successResponse } from '../../utils/response/success.response.js';
import { getProfileService, getUsersService } from './user.services.js';

const router = Router();

export const routes = {
	base: '/users',
	profile: '/profile',
	getUsers: '/',
};

router.get(routes.profile, requireAuth(), async (req, res) => {
	const { user } = req;
	const data = await getProfileService(user);

	successResponse({ res, data });
});

router.get(routes.getUsers, async (req, res) => {
	const data = await getUsersService();
	successResponse({ res, data });
});

export default router;
