import { configEnv } from '../../config/env.js';
import { formatFilePath } from '../../utils/general/format-file-path.js';

export class MessageDTO {
	static single(message, isAdmin = false) {
		if (!message) return null;

		// تنسيق المرفقات وتحويل المسارات لروابط كاملة
		let formattedAttachments = [];
		if (message.attachments && message.attachments.length > 0) {
			formattedAttachments = message.attachments.map((attachment) => ({
				url: formatFilePath(attachment.url),
				fileType: attachment.fileType,
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
