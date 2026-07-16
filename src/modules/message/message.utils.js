import { v2 as cloudinary } from 'cloudinary';
import streamifier from 'streamifier';
import { configEnv } from '../../config/env.js';
import { formatFilePath } from '../../utils/general/format-file-path.js';
import { throwInternalException } from '../../utils/response/throw.exceptions.js';

export class MessageDTO {
	static single(message, isAdmin = false) {
		if (!message) return null;

		// تنسيق المرفقات وتحويل المسارات لروابط كاملة
		let formattedAttachments = [];
		if (message.attachments && message.attachments.length > 0) {
			formattedAttachments = message.attachments.map((attachment) => ({
				...attachment,
				url: formatFilePath(attachment.url),
				// type: attachment.type,
			}));
		}

		// تنسيق بيانات المرسل (from) مع حماية الهوية المجهولة
		let formattedFrom = null;
		if (message.from && (!message.isAnonymous || isAdmin)) {
			const { firstName, lastName, username, avatar, _id } = message.from || {};
			formattedFrom = {
				id: _id?.toString() || '',
				name: firstName ? `${firstName || ''} ${lastName || ''}`.trim() : undefined,
				username: username || undefined,
				avatar: formatFilePath(avatar),
			};
		}

		// تنسيق بيانات المستقبل (to)
		let formattedTo = null;
		if (message.to) {
			const { firstName, lastName, username, avatar, _id } = message.to || {};
			formattedTo = {
				id: _id?.toString() || '',
				name: firstName ? `${firstName} ${lastName || ''}`.trim() : undefined,
				username: username || undefined,
				avatar: avatar ? `${configEnv.appUrl}/${avatar.replace(/\\/g, '/')}` : null,
			};
		}

		// بناء كائن الرد النظيف الموحد للـ Frontend
		return {
			id: message._id || message.id,
			content: message.content || '', // يأتي دائماً مفكوك التشفير وجاهز للعرض من الـ Services
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

// Service to upload files attached to anonymous messages
export const uploadToCloudinaryMessage = async (receiverId, file, messageId) => {
	if (!file) {
		throwInternalException('No file provided', 'uploadMessageAttachmentService');
	}

	// Upload directly to the receiver's message subfolder
	const customPublicId = `msg_${messageId}_${Math.floor(Math.random() * 10000)}`;
	const folderPath = `users/${receiverId}/messages`;

	const uploadResult = await new Promise((resolve, reject) => {
		const uploadStream = cloudinary.uploader.upload_stream(
			{
				folder: folderPath,
				public_id: customPublicId,
				resource_type: 'auto', // Auto-detects if it is an image or audio file
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

// delete message attachments
export const deleteMessageAttachments = async (attachments) => {
	if (!attachments || attachments.length === 0) return;

	// Group attachments by their Cloudinary resource_type (image, video, raw)
	const groupedByFileType = attachments.reduce((acc, file) => {
		const type = file.fileType || 'image'; // Fallback to image if undefined
		if (!acc[type]) acc[type] = [];
		acc[type].push(file.id); // 'id' contains the public_id
		return acc;
	}, {});

	// Execute deletion for each group with the correct resource_type
	const deletePromises = Object.entries(groupedByFileType).map(([fileType, publicIds]) => {
		return cloudinary.api.delete_resources(publicIds, {
			resource_type: fileType,
		});
	});

	await Promise.all(deletePromises);
};
