import { Router } from 'express';
import { requireAuth } from '../../middlewares/authentication.middleware.js';
import validation from '../../middlewares/validation.middleware.js';
import asyncHandler from '../../utils/error-handler/async-handler.js';
import { localUpload } from '../../utils/multer/local.multer.js';
import { successResponse } from '../../utils/response/success.response.js';
import {
	deleteAvatarService,
	deleteSingleCoverService,
	getProfileService,
	getUsersService,
	uploadAvatarService,
	uploadCoversService,
} from './user.services.js';
import { deleteImageSchema } from './user.validation.js';

const router = Router();

export const routes = {
	base: '/users',
	profile: '/profile',
	uploadAvatar: '/profile-avatar',
	deleteAvatar: '/profile-avatar',
	uploadCovers: '/profile-covers',
	deleteCovers: '/profile-covers',
	getUsers: '/',
};

router.get(
	routes.profile,
	requireAuth(),
	asyncHandler(async (req, res) => {
		const { user } = req;
		const data = await getProfileService(user);

		successResponse({ res, data });
	}),
);

// add or update user avatar
router.patch(
	routes.uploadAvatar,
	requireAuth(),
	localUpload({ dir: 'users' }).single('avatar'),
	asyncHandler(async (req, res) => {
		const { user, file } = req;
		const data = await uploadAvatarService(user, file);

		successResponse({ res, message: 'Avatar updated successfully', data });
	}),
);

// delete user avatar
router.delete(
	routes.deleteAvatar,
	requireAuth(),
	asyncHandler(async (req, res) => {
		const data = await deleteAvatarService(req.user);

		successResponse({ res, message: 'Avatar deleted successfully', data });
	}),
);

// add or update user covers
router.patch(
	routes.uploadCovers,
	requireAuth(),
	localUpload({ dir: 'users' }).array('coverImgs', 2),
	asyncHandler(async (req, res) => {
		const { user, files } = req;
		const filePaths = files ? files.map((file) => file.filePath) : [];
		const data = await uploadCoversService(user, filePaths);

		successResponse({ res, message: 'Covers updated successfully', data });
	}),
);

// delete user cover
router.delete(
	routes.deleteCovers,
	requireAuth(),
	validation(deleteImageSchema),
	asyncHandler(async (req, res) => {
		const data = await deleteSingleCoverService(req.user, req.body.image);

		successResponse({ res, message: 'Cover Image deleted successfully', data });
	}),
);

router.get(
	routes.getUsers,
	asyncHandler(async (req, res) => {
		const data = await getUsersService();
		successResponse({ res, data });
	}),
);

export default router;
