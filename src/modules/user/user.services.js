import { appConfig } from '../../config/app.config.js';
import User from '../../DB/models/user.model.js';
import { formatFilePath } from '../../utils/general/format-file-path.js';
import { getDataWithPagination } from '../../utils/queries/get-data-with pagination.js';
import { BadRequestException, ConflictException, NotFoundException } from '../../utils/response/throw.exceptions.js';
import { decrypt } from '../../utils/security/encryption.security.js';
import cloudinary from '../../utils/upload-files/cloudinary.utils.js';
import { checkIfUsernameExists } from '../auth/auth.services.js';
import { uploadToCloudinary } from './user.utils.js';

// Get user profile data
export const getProfileService = async (user) => {
	const userData = await User.findById(user._id).select('-password -__v -role -provider');
	if (userData.phone) {
		userData.phone = decrypt(userData.phone);
	}
	return userData;
};

export const updateProfileService = async (
	user,
	{ firstName, lastName, username, bio, phone, gender, birthdate, allowAnonymousUsers },
) => {
	if (username) {
		await checkIfUsernameExists(user._id, username);
	}

	const updatedUser = await User.findByIdAndUpdate(
		user._id,
		{ firstName, lastName, username, bio, phone, gender, birthdate, allowAnonymousUsers },
		{ returnDocument: 'after' },
	)
		.lean()
		.select('-password -__v -role -provider');

	if (updatedUser.phone) {
		updatedUser.phone = decrypt(updatedUser.phone);
	}

	return updatedUser;
};

// Upload and Update Profile Avatar - local upload
// export const uploadAvatarService = async (user, file) => {
// 	if (!file) {
// 		throwInternalException('No file provided', 'uploadAvatarService');
// 	}

// 	const oldAvatar = user.avatar;
// 	try {
// 		// Update only the avatar field with the new file path
// 		const updatedUser = await User.findByIdAndUpdate(
// 			user._id,
// 			{ avatar: file.filePath },
// 			{ returnDocument: 'after' },
// 			// ).select('-password -__v -role -provider');
// 		).lean().select('avatar');

// 		// if (updatedUser.phone) {
// 		// 	updatedUser.phone = decrypt(updatedUser.phone);
// 		// }

// 		// Delete the old avatar from the disk in the background safely
// 		if (oldAvatar) {
// 			// delete old avatar if exists
// 			deleteFileHelper(oldAvatar);
// 			// move old avatar to gallery
// 			// moveFileHelper(oldAvatar, ['uploads', 'users', user._id.toString(), 'gallery']).catch((err) => {
// 			// 	console.error('❌ Background task [moveFileHelper] failed:', err.message);
// 			// });
// 		}

// 		updatedUser.avatar = formatFilePath(updatedUser.avatar);

// 		return updatedUser;
// 	} catch (error) {
// 		// If database operation fails, rollback and delete the newly uploaded file immediately
// 		deleteFileHelper(file.filePath);
// 		throw error;
// 	}
// };

// Upload Avatar Service (Handles overwriting automatically via fixed public_id)
export const uploadAvatarService = async (user, file) => {
	if (!file) BadRequestException('No file provided', 'uploadAvatarService');

	// Upload buffer stream to Cloudinary directly from RAM
	const avatarData = await uploadToCloudinary(file, user._id, `avatar_${user._id}`);

	const updatedUser = await User.findByIdAndUpdate(user._id, { $set: { avatar: avatarData } }, { returnDocument: 'after' })
		.lean()
		.select('avatar');

	return updatedUser;
};

// Delete Profile Avatar locale upload - local upload
// export const deleteAvatarService = async (user) => {
// 	const oldAvatar = user.avatar;

// 	if (!oldAvatar) {
// 		throwInternalException('You do not have an avatar to delete');
// 	}

// 	const updatedUser = await User.findByIdAndUpdate(
// 		user._id,
// 		{ avatar: null },
// 		{ returnDocument: 'after' },

// 		// ).select('-password -__v -role -provider')
// 	).lean().select('avatar');

// 	// Delete the physical file from the disk in the background
// 	deleteFileHelper(oldAvatar);

// 	return updatedUser;
// };

export const deleteAvatarService = async (user) => {
	const oldAvatar = user.avatar;

	if (!oldAvatar?.url || !oldAvatar?.id) {
		BadRequestException('You do not have an avatar to delete', 'deleteAvatarService');
	}

	// Delete from Cloudinary using await (No callback needed, errors bubble up to asyncHandler)
	await cloudinary.uploader.destroy(oldAvatar.id, { invalidate: true });

	const updatedUser = await User.findByIdAndUpdate(
		user._id,
		{ $set: { avatar: {} } }, // Set to empty object instead of deleting key completely to maintain schema
		{ returnDocument: 'after' },
	)
		.lean()
		.select('avatar');

	return updatedUser;
};

// Upload Cover Images (Cumulative up to 2) - local upload
// export const uploadCoversService = async (user, files) => {
// 	if (!files || files?.length === 0) {
// 		throwInternalException('No files provided');
// 	}

// 	const oldcovers = user.covers || [];
// 	const totalCoversCount = oldcovers.length + files?.length;

// 	// Extract only the file into a flat array of strings to avoid DB pollution
// 	const newFilePaths = files.map((file) => file).filter(Boolean);

// 	try {
// 		// If the cumulative total exceeds the business rule limit of 2
// 		if (totalCoversCount > 2) {
// 			// Leverage our updated helper to delete all new files at once in the background
// 			deleteFileHelper(newFilePaths);

// 			ConflictException(`Upload failed. Total covers cannot exceed 2. You currently have ${oldcovers.length}.`);
// 		}

// 		// Perform cumulative update saving only clean string paths
// 		const updatedUser = await User.findByIdAndUpdate(
// 			user._id,
// 			{ $push: { covers: { $each: newFilePaths } } },
// 			{ returnDocument: 'after' },
// 			// ).select('-password -__v -visitCount -role -provider');
// 		)
// 			.lean()
// 			.select('covers');

// 		updatedUser.covers = updatedUser.covers.map((cover) => formatFilePath(cover));

// 		return updatedUser;
// 	} catch (error) {
// 		// If database fails, rollback and purge all newly written files atomically
// 		deleteFileHelper(newFilePaths);
// 		throw error;
// 	}
// };

export const uploadCoversService = async (user, files) => {
	if (!files || files.length === 0) {
		BadRequestException('No files provided', 'uploadCoversService');
	}

	const MAX_COVERS = appConfig.user.maxCovers;
	const oldCovers = user.covers || [];
	const totalCoversCount = oldCovers.length + files.length;

	// Block requests exceeding the cumulative business limit
	if (totalCoversCount > MAX_COVERS) {
		ConflictException(`Upload limit reached. Maximum allowed covers is ${MAX_COVERS}`, 'covers_limit_reached');
	}

	const coverData = await Promise.all(files.map((file) => uploadToCloudinary(file, user._id)));

	const updatedUser = await User.findByIdAndUpdate(
		user._id,
		{ $push: { covers: { $each: coverData } } },
		{ returnDocument: 'after' },
	)
		.lean()
		.select('covers');

	return updatedUser;
};

export const replaceCoverService = async (user, file, imageId) => {
	if (!file) BadRequestException('No file provided', 'replaceCoverService');
	if (!imageId) BadRequestException('No image id provided', 'replaceCoverService');

	// Verify image ownership before starting the replacement process
	const ownThisCover = user.covers?.some((cover) => cover.id === imageId);
	// const ownThisCover = await User.findOne({ _id: user._id, covers: { $elemMatch: { id: imageId } } })
	// 	.lean()
	// 	.select('covers');

	if (!ownThisCover) {
		BadRequestException('Image not found in your profile', 'replaceCoverService');
	}

	// Delete the old asset from Cloudinary (Awaited securely)
	await cloudinary.uploader.destroy(imageId, { invalidate: true });

	// Upload the new asset to Cloudinary
	const newCover = await uploadToCloudinary(file, user._id);

	// Update only the targeted object inside the MongoDB array
	const updatedUser = await User.findOneAndUpdate(
		{ _id: user._id, 'covers.id': imageId },
		{ $set: { 'covers.$': newCover } },
		{ returnDocument: 'after' },
	)
		.lean()
		.select('covers');

	return updatedUser;
};

// Delete a Specific Single Cover Image - local upload
// export const deleteSingleCoverService = async (user, imagePath) => {
// 	if (!imagePath) {
// 		throwInternalException('No image path provided');
// 	}

// 	const relativePath = imagePath?.startsWith(configEnv.appUrl) ? imagePath.replace(`${configEnv.appUrl}/`, '') : imagePath;

// 	// Validate that the image actually belongs to the requesting user
// 	if (!user.covers || !user.covers.includes(relativePath)) {
// 		NotFoundException('Image not found in your profile');
// 	}

// 	// Update the database first to pull the specific string path from the array
// 	const updatedUser = await User.findByIdAndUpdate(
// 		user._id,
// 		{ $pull: { covers: relativePath } },
// 		{ returnDocument: 'after' },
// 		// ).select('-password -__v -visitCount -role -provider');
// 	).select('covers');

// 	return updatedUser;
// };

export const deleteSingleCoverService = async (user, imageId) => {
	if (!imageId) {
		BadRequestException('No image id provided', 'deleteSingleCoverService');
	}

	// Verify that the image actually belongs to the requesting user first
	const hasCover = user.covers?.some((cover) => cover.id === imageId);
	if (!hasCover) {
		BadRequestException('Image not found in your profile', 'deleteSingleCoverService');
	}

	// Delete the asset from Cloudinary
	await cloudinary.uploader.destroy(imageId, { invalidate: true });

	// Update the database to pull the specific asset from the array
	const updatedUser = await User.findByIdAndUpdate(
		user._id,
		{ $pull: { covers: { id: imageId } } },
		{ returnDocument: 'after' },
	)
		.lean()
		.select('covers');

	return updatedUser;
};

// Increment visit count
export const visitUserService = async (user, username) => {
	const visitorId = user?._id;
	const isSelfVisit = user && user.username === username;

	// Base query by username
	const query = { username };

	// Atomic Mutual Block Check at Database Level
	if (visitorId) {
		// 1. Ensure target user has not blocked the visitor
		query.blockedUsers = { $ne: visitorId };

		// 2. Ensure visitor has not blocked the target user
		if (user.blockedUsers?.length) {
			query._id = { $nin: user.blockedUsers };
		}
	}

	// Fetch user and atomically increment visit count only for valid non-self visits
	let targetUser;

	if (isSelfVisit) {
		targetUser = await User.findOne(query).lean().select('-password -__v -phone -role -provider');
	} else {
		targetUser = await User.findOneAndUpdate(query, { $inc: { visitCount: 1 } }, { returnDocument: 'after' })
			.lean()
			.select('-password -__v -phone -role -provider');
	}

	// Validate existence (Triggers if user doesn't exist OR if blocked in either direction)
	if (!targetUser) NotFoundException('User not found', 'VISIT_USER.USER_NOT_FOUND');

	// Return formatted public user payload
	return {
		id: targetUser._id,
		_id: targetUser._id,
		name: `${targetUser.firstName} ${targetUser.lastName}`,
		username: targetUser.username,
		gender: targetUser.gender,
		avatar: targetUser.avatar?.url
			? { ...targetUser.avatar, url: formatFilePath(targetUser.avatar?.url) }
			: targetUser.avatar,
	};
};

// Get all users
export const getUsersService = async ({ search, page, limit, sort }) => {
	const data = await getDataWithPagination({
		Model: User,
		search: search || '',
		searchField: 'username',
		page: page,
		limit: limit,
		sort: sort,
		select: '-password -__v',
		populate: ['receivedMessages', 'sentMessages'],
	});
	return data;
};

export const blockUserService = async (user, id) => {
	const update = await User.findByIdAndUpdate(
		user?._id,
		{ $addToSet: { blockedUsers: id } },
		{ returnDocument: 'after' },
	).select('-__v -password');

	if (!update) {
		NotFoundException('User not found', 'block_user');
	}

	return update;
};

export const unBlockUserService = async (user, id) => {
	const update = await User.findByIdAndUpdate(
		user?._id,
		{ $pull: { blockedUsers: id } },
		{ returnDocument: 'after' },
	).select('-__v -password');

	if (!update) {
		NotFoundException('User not found', 'unblock_user');
	}

	return update;
};

export const getBlockedUsersService = async (userId) => {
	const data = await User.findById(userId).select('blockedUsers').populate({
		path: 'blockedUsers',
		select: 'username firstName lastName avatar',
	});
	// .lean();

	if (!data) {
		NotFoundException('User not found', 'GET_BLOCKED_USERS.USER_NOT_FOUND');
	}
	return data;
};
