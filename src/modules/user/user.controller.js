import { Router } from 'express';
import { appConfig } from '../../config/app.config.js';
import { auth, authOptional } from '../../middlewares/authentication.middleware.js';
import validation from '../../middlewares/validation.middleware.js';
import asyncHandler from '../../utils/error-handler/async-handler.js';
import { successResponse } from '../../utils/response/success.response.js';
import { uploadCloud } from '../../utils/upload-files/multer.js';
import {
	deleteAvatarService,
	deleteSingleCoverService,
	getProfileService,
	getUsersService,
	replaceCoverService,
	updateProfileService,
	uploadAvatarService,
	uploadCoversService,
	visitUserService,
} from './user.services.js';
import { UserDTO } from './user.utils.js';
import { avatarUserSchema, coverUserSchema, deleteImageSchema, replaceCoverUserSchema, visitUserSchema } from './user.validation.js';

const router = Router();

export const routes = {
	base: '/users',

	visitUser: '/visit/:username',

	getProfile: '/profile',
	updataProfile: '/profile',

	uploadAvatar: '/profile-avatar',
	deleteAvatar: '/profile-avatar',
	uploadCovers: '/profile-covers',
	deleteCovers: '/profile-covers',

	getUsers: '/',
};

router.get(
	routes.getProfile,
	auth(),
	asyncHandler(async (req, res) => {
		const { user } = req;
		const data = await getProfileService(user);

		successResponse({ res, data: UserDTO.single(data) });
	}),
);

router.patch(
	routes.updataProfile,
	auth(),
	asyncHandler(async (req, res) => {
		const { user, body } = req;
		const data = await updateProfileService(user, body);

		successResponse({ res, message: 'Profile updated successfully', data: UserDTO.single(data) });
	}),
);

// add or update user avatar
router.patch(
	routes.uploadAvatar,
	auth(),
	// uploadLocal({ dir: 'users' }).single('avatar'),
	uploadCloud().single('avatar'),
	validation(avatarUserSchema),
	asyncHandler(async (req, res) => {
		const { user, body } = req;
		const data = await uploadAvatarService(user, body.avatar);

		successResponse({ res, message: 'Avatar updated successfully', data });
	}),
);

// delete user avatar
router.delete(
	routes.deleteAvatar,
	auth(),
	asyncHandler(async (req, res) => {
		const data = await deleteAvatarService(req.user);

		successResponse({ res, message: 'Avatar deleted successfully', data });
	}),
);

// add or update user covers
router.post(
	routes.uploadCovers,
	auth(),
	// uploadLocal({ dir: 'users' }).array('covers', 2),
	uploadCloud().array('covers', appConfig.user.maxCovers),
	validation(coverUserSchema), // copy files content to body under field key
	asyncHandler(async (req, res) => {
		const { user, body } = req;
		const data = await uploadCoversService(user, body.covers);

		successResponse({ res, message: 'Covers updated successfully', data });
	}),
);

// replace user cover
router.patch(
	routes.uploadCovers,
	auth(),
	// uploadLocal({ dir: 'users' }).array('covers', 2),
	uploadCloud().single('cover'),
	validation(replaceCoverUserSchema),
	asyncHandler(async (req, res) => {
		const { user, body } = req;
		const data = await replaceCoverService(user, body.cover, body.id);

		successResponse({ res, message: 'Cover replaced successfully', data });
	}),
);

// delete user cover
router.delete(
	routes.deleteCovers,
	auth(),
	validation(deleteImageSchema),
	asyncHandler(async (req, res) => {
		const data = await deleteSingleCoverService(req.user, req?.body?.id || '');

		successResponse({ res, message: 'Cover Image deleted successfully', data });
	}),
);

// visit user
router.get(
	routes.visitUser,
	validation(visitUserSchema),
	authOptional(),
	asyncHandler(async (req, res) => {
		const { username } = req.params || {};
		const data = await visitUserService(req.user, username);
		successResponse({ res, data });
	}),
);

// get all users - for admins (can see visit count)
router.get(
	routes.getUsers,
	auth(),
	// authorization(ADMIN_ROLES),
	// requireAuthAdmins(),
	asyncHandler(async (req, res) => {
		const { data, metadata } = await getUsersService(req.query || {});
		const formattedData = UserDTO.list(data, true);
		successResponse({ res, data: formattedData, metadata });
	}),
);
export default router;
