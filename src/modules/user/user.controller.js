import { Router } from 'express';
import { auth, authOptional } from '../../middlewares/authentication.middleware.js';
import validation from '../../middlewares/validation.middleware.js';
import asyncHandler from '../../utils/error-handler/async-handler.js';
import { successResponse } from '../../utils/response/success.response.js';
import { localUpload } from '../../utils/upload-files/local.multer.js';
import {
	deleteAvatarService,
	deleteSingleCoverService,
	getProfileService,
	getUsersService,
	uploadAvatarService,
	uploadCoversService,
	visitUserService,
} from './user.services.js';
import { coverUserSchema, deleteImageSchema, visitUserSchema } from './user.validation.js';

const router = Router();

export const routes = {
	base: '/users',
	profile: '/profile',
	uploadAvatar: '/profile-avatar',
	deleteAvatar: '/profile-avatar',
	uploadCovers: '/profile-covers',
	deleteCovers: '/profile-covers',

	visitUser: '/visit/:username',
	getUsers: '/',
};

router.get(
	routes.profile,
	auth(),
	asyncHandler(async (req, res) => {
		const { user } = req;
		const data = await getProfileService(user);

		successResponse({ res, data });
	}),
);

// add or update user avatar
router.patch(
	routes.uploadAvatar,
	auth(),
	localUpload({ dir: 'users' }).single('profileImage'),
	asyncHandler(async (req, res) => {
		const { user, file } = req;
		const data = await uploadAvatarService(user, file);

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
router.patch(
	routes.uploadCovers,
	auth(),
	localUpload({ dir: 'users' }).array('coverImages', 2),
	validation(coverUserSchema),
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
	auth(),
	validation(deleteImageSchema),
	asyncHandler(async (req, res) => {
		const data = await deleteSingleCoverService(req.user, req?.body?.image ||'');

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
		const data = await getUsersService();
		successResponse({ res, data });
	}),
);
export default router;
