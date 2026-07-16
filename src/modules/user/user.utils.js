import { v2 as cloudinary } from 'cloudinary';
import streamifier from 'streamifier';
import { formatFilePath } from '../../utils/general/format-file-path.js';
import { MessageDTO } from '../message/message.utils.js';
import { throwInternalException } from '../response/throw.exceptions.js';

export class UserDTO {
	static single(user, isAdmin = false) {
		if (!user) return null;
		// if (user.phone) {
		// 	user.phone = decrypt(user.phone);
		// }

		if (user?.covers) {
			if (Array.isArray(user.covers) && user.covers.length > 0) {
				// user.covers = user.covers.map((cover) => `${configEnv.appUrl}/${cover.replace(/\\/g, '/')}`);
				user.covers = user.covers.map((cover) => ({ ...cover, url: formatFilePath(cover.url) }));
			}
		}

		const messages = {};
		if (user.sentMessages) {
			messages.sentMessages = MessageDTO.list(user.sentMessages, isAdmin);
		}
		if (user.receivedMessages) {
			messages.receivedMessages = MessageDTO.list(user.receivedMessages, isAdmin);
		}

		let more = {};
		if (isAdmin) {
			more = {
				role: user.role,
				provider: user.provider,
				passwordChangedAt: user.passwordChangedAt,
				// visitCount: user.visitCount,
			};
		}

		return {
			id: user._id,
			name: `${user.firstName} ${user.lastName}`,
			firstName: user.firstName,
			lastName: user.lastName,
			avatar: { ...user.avatar, url: formatFilePath(user.avatar?.url) },
			covers: user.covers || [],
			username: user.username,
			email: user.email,
			gender: user.gender,
			birthdate: user.birthdate ? new Date(user.birthdate).toISOString().split('T')[0] : '',
			bio: user.bio,
			phone: user.phone,
			age: user.age,

			verified: user.verified,
			isActive: user.isActive,
			visitCount: user.visitCount,
			...more,
			...messages,
		};
	}

	static list(users, isAdmin = false) {
		if (!users || !Array.isArray(users)) return [];
		return users.map((user) => this.single(user, isAdmin)) || [];
	}
}

// Clean and reusable Cloudinary buffer uploader helper
export const uploadToCloudinary = (file, userId, customPublicId) => {
	if (!file) {
		throwInternalException('No file provided', 'uploadUserImageService');
	}
	return new Promise((resolve, reject) => {
		// Generate a truly unique ID for this cover to allow dynamic sorting/deleting
		const uniqueId = customPublicId || `cover_${Date.now()}_${Math.round(Math.random() * 1e5)}`;

		const uploadStream = cloudinary.uploader.upload_stream(
			{
				folder: `users/${userId}`,
				public_id: uniqueId,
				overwrite: true,
				invalidate: true,
			},
			(error, result) => {
				if (error) return reject(error);
				resolve({ id: result.public_id, url: result.secure_url });
			},
		);

		streamifier.createReadStream(file.buffer).pipe(uploadStream);
	});
};
