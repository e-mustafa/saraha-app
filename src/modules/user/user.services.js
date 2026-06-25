import User from '../../DB/models/user.model.js';
import { deleteFileHelper } from '../../utils/general/file.util.js';
import { ConflictException, NotFoundException, throwInternalException } from '../../utils/response/throw.exceptions.js';
import { decrypt } from '../../utils/security/encryption.security.js';

// Get user profile data
export const getProfileService = async (user) => {
	if (user.phone) {
		user.phone = decrypt(user.phone);
	}
	return user;
};

// Upload and update profile avatar
export const uploadAvatarService = async (user, file) => {
	if (!file) {
		throwInternalException('No file provided');
	}

	const oldAvatar = user.avatar;

	// Update only the avatar field with the new file path
	const updatedUser = await User.findByIdAndUpdate(user._id, { avatar: file.filePath }, { returnDocument: 'after' }).select(
		'-password -__v -role -provider -otp',
	);

	// Delete the old avatar from the disk in the background
	if (oldAvatar) {
		deleteFileHelper(oldAvatar).catch((e) => console.error('Avatar deletion failed:', e));
	}

	return updatedUser;
};

// Delete profile avatar
export const deleteAvatarService = async (user) => {
	const oldAvatar = user.avatar;

	if (!oldAvatar) {
		throwInternalException('You do not have an avatar to delete');
	}

	const updatedUser = await User.findByIdAndUpdate(user._id, { avatar: null }, { returnDocument: 'after' }).select(
		'-password -__v -role -provider -otp',
	);

	// Delete the physical file from the disk in the background
	deleteFileHelper(oldAvatar).catch((e) => console.error('Avatar file deletion failed:', e));

	return updatedUser;
};

// Upload cover images (cumulative up to a limit of 2)
export const uploadCoversService = async (user, files) => {
	if (!files || files.length === 0) {
		throwInternalException('No files provided');
	}

	const oldCoverImgs = user.coverImgs || [];
	const totalCoversCount = oldCoverImgs.length + files.length;

	// If the total count exceeds 2, clean up the files and throw an exception
	if (totalCoversCount > 2) {
		files.forEach((path) => {
			if (path) deleteFileHelper(path);
		});
		ConflictException(`Upload failed. Total covers cannot exceed 2. You currently have ${oldCoverImgs.length}.`);
	}

	// Perform cumulative update using $push and $each, $each to save as flat array
	const updatedUser = await User.findByIdAndUpdate(
		user._id,
		{ $push: { coverImgs: { $each: files } } },
		{ returnDocument: 'after' },
	).select('-password -__v -role -provider -otp');

	return updatedUser;
};

// Delete a specific single cover image
export const deleteSingleCoverService = async (user, imagePath) => {
	if (!imagePath) {
		throwInternalException('No image path provided');
	}

	// Validate that the image actually belongs to the user
	if (!user.coverImgs || !user.coverImgs.includes(imagePath)) {
		NotFoundException('Image not found in your profile');
	}

	// Update the database first to remove the path from the array
	const updatedUser = await User.findByIdAndUpdate(
		user._id,
		{ $pull: { coverImgs: imagePath } },
		{ returnDocument: 'after' },
	).select('-password -__v -role -provider -otp');

	// Delete the actual file from disk after successful database update
	deleteFileHelper(imagePath).catch((e) => {
		console.error('Failed to delete cover file from disk:', e);
	});

	return updatedUser;
};

// Get all users
export const getUsersService = async () => {
	const users = await User.find(); // .select('-password -__v');
	return users;
};
