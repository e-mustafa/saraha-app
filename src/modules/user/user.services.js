import { configEnv } from '../../config/env.js';
import User from '../../DB/models/user.model.js';
import { deleteFileHelper } from '../../utils/general/file.util.js';
import { formatFilePath } from '../../utils/general/format-file-path.js';
import { getDataWithPagination } from '../../utils/queries/get-data-with pagination.js';
import { ConflictException, NotFoundException, throwInternalException } from '../../utils/response/throw.exceptions.js';
import { decrypt } from '../../utils/security/encryption.security.js';
import { checkIfUsernameExists } from '../auth/auth.services.js';

// Get user profile data
export const getProfileService = async (user) => {
	const userData = await User.findById(user._id).select('-password -__v -role -provider');
	if (userData.phone) {
		userData.phone = decrypt(userData.phone);
	}
	return userData;
};

export const updateProfileService = async (user, { firstName, lastName, username, bio, phone, gender, birthdate }) => {
	if (username) {
		await checkIfUsernameExists(user._id, username);
	}

	const updatedUser = await User.findByIdAndUpdate(
		user._id,
		{ firstName, lastName, username, bio, phone, gender, birthdate },
		{ returnDocument: 'after' },
	).lean().select('-password -__v -role -provider -otp');

	if (updatedUser.phone) {
		updatedUser.phone = decrypt(updatedUser.phone);
	}

	console.log('updatedUser', updatedUser);

	return updatedUser;
};

// Upload and Update Profile Avatar
export const uploadAvatarService = async (user, file) => {
	if (!file) {
		throwInternalException('No file provided');
	}

	const oldAvatar = user.avatar;
	try {
		// Update only the avatar field with the new file path
		const updatedUser = await User.findByIdAndUpdate(
			user._id,
			{ avatar: file.filePath },
			{ returnDocument: 'after' },
			// ).select('-password -__v -role -provider -otp');
		).lean().select('avatar');

		// if (updatedUser.phone) {
		// 	updatedUser.phone = decrypt(updatedUser.phone);
		// }

		// Delete the old avatar from the disk in the background safely
		if (oldAvatar) {
			// delete old avatar if exists
			deleteFileHelper(oldAvatar);
			// move old avatar to gallery
			// moveFileHelper(oldAvatar, ['uploads', 'users', user._id.toString(), 'gallery']).catch((err) => {
			// 	console.error('❌ Background task [moveFileHelper] failed:', err.message);
			// });
		}

		updatedUser.avatar = formatFilePath(updatedUser.avatar);

		return updatedUser;
	} catch (error) {
		// If database operation fails, rollback and delete the newly uploaded file immediately
		deleteFileHelper(file.filePath);
		throw error;
	}
};

// Delete Profile Avatar
export const deleteAvatarService = async (user) => {
	const oldAvatar = user.avatar;

	if (!oldAvatar) {
		throwInternalException('You do not have an avatar to delete');
	}

	const updatedUser = await User.findByIdAndUpdate(
		user._id,
		{ avatar: null },
		{ returnDocument: 'after' },

		// ).select('-password -__v -role -provider -otp')
	).lean().select('avatar');

	// Delete the physical file from the disk in the background
	deleteFileHelper(oldAvatar);

	return updatedUser;
};

// Upload Cover Images (Cumulative up to 2)
export const uploadCoversService = async (user, files) => {
	if (!files || files?.length === 0) {
		throwInternalException('No files provided');
	}

	const oldcovers = user.covers || [];
	const totalCoversCount = oldcovers.length + files?.length;

	// Extract only the file into a flat array of strings to avoid DB pollution
	const newFilePaths = files.map((file) => file).filter(Boolean);

	try {
		// If the cumulative total exceeds the business rule limit of 2
		if (totalCoversCount > 2) {
			// Leverage our updated helper to delete all new files at once in the background
			deleteFileHelper(newFilePaths);

			ConflictException(`Upload failed. Total covers cannot exceed 2. You currently have ${oldcovers.length}.`);
		}

		// Perform cumulative update saving only clean string paths
		const updatedUser = await User.findByIdAndUpdate(
			user._id,
			{ $push: { covers: { $each: newFilePaths } } },
			{ returnDocument: 'after' },
			// ).select('-password -__v -visitCount -role -provider -otp');
		).lean().select('covers');
		
		updatedUser.covers = updatedUser.covers.map((cover) => formatFilePath(cover));

		return updatedUser;
	} catch (error) {
		// If database fails, rollback and purge all newly written files atomically
		deleteFileHelper(newFilePaths);
		throw error;
	}
};

// Delete a Specific Single Cover Image
export const deleteSingleCoverService = async (user, imagePath) => {
	if (!imagePath) {
		throwInternalException('No image path provided');
	}

	const relativePath = imagePath?.startsWith(configEnv.appUrl) ? imagePath.replace(`${configEnv.appUrl}/`, '') : imagePath;

	// Validate that the image actually belongs to the requesting user
	if (!user.covers || !user.covers.includes(relativePath)) {
		NotFoundException('Image not found in your profile');
	}

	// Update the database first to pull the specific string path from the array
	const updatedUser = await User.findByIdAndUpdate(
		user._id,
		{ $pull: { covers: relativePath } },
		{ returnDocument: 'after' },
		// ).select('-password -__v -visitCount -role -provider -otp');
	).select('covers');

	// Delete the actual physical file from disk after successful database update
	deleteFileHelper(relativePath);

	return updatedUser;
};

// Increment visit count
export const visitUserService = async (user, username) => {
	let targetUser;
	if (user && user.username === username) {
		targetUser = await User.findById(user._id).select('-visitCount -password -__v - -phone -role -provider -otp').lean();
	} else {
		targetUser = await User.findOneAndUpdate({ username }, { $inc: { visitCount: 1 } }, { returnDocument: 'after' })
			// .select('-visitCount -password -phone -__v -role -provider -otp')
			.lean()
			.select('firstName lastName username gender');
	}
	if (!targetUser) {
		NotFoundException('User not found');
	}

	// if (user && user.username === username && user.phone) {
	// 	targetUser.phone = decrypt(user.phone);
	// }
	targetUser.id = targetUser._id;
	return targetUser;
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
