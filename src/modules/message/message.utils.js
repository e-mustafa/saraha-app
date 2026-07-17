import { v2 as cloudinary } from 'cloudinary';
import streamifier from 'streamifier';
import { formatFilePath } from '../../utils/general/format-file-path.js';
import { throwInternalException } from '../../utils/response/throw.exceptions.js';

export class MessageDTO {
	static single(message, isAdmin = false) {
		if (!message) return null;

		let formattedAttachments = [];
		if (message.attachments && message.attachments.length > 0) {
			formattedAttachments = message.attachments.map((attachment) => ({
				...attachment,
				url: formatFilePath(attachment.url),
			}));
		}

		let formattedFrom = null;
		// Ensure 'from' exists, and message is either not anonymous OR requester is an admin
		if (message.from && (!message.isAnonymous || isAdmin)) {
			if (typeof message.from === 'object' && '_id' in message.from) {
				const { firstName, lastName, username, avatar, _id } = message.from;
				formattedFrom = {
					id: _id?.toString() || '',
					name: firstName ? `${firstName} ${lastName || ''}`.trim() : undefined,
					username: username || undefined,
					avatar: avatar ? { ...avatar, url: formatFilePath(avatar.url) } : avatar,
				};
			} else {
				// Fallback if 'from' is just an ID string or ObjectId due to strict pipeline constraints
				formattedFrom = { id: message.from.toString() };
			}
		}

		let formattedTo = null;
		if (message.to) {
			if (typeof message.to === 'object' && '_id' in message.to) {
				const { firstName, lastName, username, avatar, _id } = message.to;
				formattedTo = {
					id: _id?.toString() || '',
					name: firstName ? `${firstName} ${lastName || ''}`.trim() : undefined,
					username: username || undefined,
					avatar: avatar ? { ...avatar, url: formatFilePath(avatar.url) } : avatar,
				};
			} else {
				formattedTo = { id: message.to.toString() };
			}
		}

		return {
			id: message._id || message.id,
			content: message.content || '',
			attachments: formattedAttachments,
			createdAt: message.createdAt,
			fromFavorite: message.fromFavorite || false,
			toFavorite: message.toFavorite || false,
			from: formattedFrom,
			to: formattedTo,
			isAnonymous: message.isAnonymous || false,
			isPublic: message.isPublic || false,
		};
	}

	static list(messages, isAdmin = false) {
		if (!messages || !Array.isArray(messages)) return [];
		return messages.map((message) => this.single(message, isAdmin)).filter(Boolean);
	}
}

export const uploadToCloudinaryMessage = async (receiverId, file, messageId) => {
	if (!file) {
		throwInternalException('No file provided', 'uploadMessageAttachmentService');
	}

	const customPublicId = `msg_${messageId}_${Math.floor(Math.random() * 10000)}`;
	const folderPath = `users/${receiverId}/messages`;

	const uploadResult = await new Promise((resolve, reject) => {
		const uploadStream = cloudinary.uploader.upload_stream(
			{
				folder: folderPath,
				public_id: customPublicId,
				resource_type: 'auto',
			},
			(error, result) => {
				if (error) return reject(error);
				resolve({ id: result.public_id, url: result.secure_url, fileType: result.resource_type });
			},
		);

		streamifier.createReadStream(file.buffer).pipe(uploadStream);
	});

	return uploadResult;
};

export const deleteMessageAttachments = async (attachments) => {
	if (!attachments || attachments.length === 0) return;

	const groupedByFileType = attachments.reduce((acc, file) => {
		const type = file.fileType || 'image';
		if (!acc[type]) acc[type] = [];
		acc[type].push(file.id);
		return acc;
	}, {});

	const deletePromises = Object.entries(groupedByFileType).map(([fileType, publicIds]) => {
		return cloudinary.api.delete_resources(publicIds, {
			resource_type: fileType,
		});
	});

	await Promise.all(deletePromises);
};
