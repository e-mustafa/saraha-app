import { configEnv } from '../../config/env.js';
import { decrypt } from '../../utils/security/encryption.security.js';
export class MessageDTO {
	static single(message, isAdmin = false) {
		// remove from (sender) data if message is anonymous
		if (message.isAnonymous) {
			message.from = null;
		}

		// decrypt content if message is confidential
		if (message?.isConfidential && message?.content) {
			// message.content = '🔒 This message is confidential';
			message.content = decrypt(message.content);
		}

		if (message.attachments && message.attachments?.length > 0) {
			message.attachments = message.attachments.map((attachment) => {
				return {
					url: `${configEnv.appUrl}/${attachment.url.replace(/\\/g, '/')}`,
					fileType: attachment.fileType,
				};
			});
		}

		if (message.from) {
			const { firstName, lastName, username, avatar, _id } = message.from || {};
			message.from = {
				id: _id?.toString() || '',
				name: firstName ? `${firstName || ''} ${lastName || ''}` : undefined,
				username: username ? username : undefined,
				avatar: avatar ? `${configEnv.appUrl}/${avatar.replace(/\\/g, '/')}` : null,
			};
		}

		if (message.to) {
			const { firstName, lastName, username, avatar, _id } = message.to || {};
			message.to = {
				id: _id?.toString() || '',
				name: firstName ? `${firstName || ''} ${lastName || ''}` : undefined,
				username: username ? username : undefined,
				avatar: avatar ? `${configEnv.appUrl}/${avatar.replace(/\\/g, '/')}` : null,
			};
		}

		// return data;
		return {
			id: message._id,
			content: message.content,
			attachments: message.attachments,
			createdAt: message.createdAt,
			fromFavorite: message.fromFavorite,
			toFavorite: message.toFavorite,
			from: !isAdmin && message.isAnonymous ? null : message.from,
			to: message.to ? message.to : null,

			isConfidential: message.isConfidential,
			isAnonymous: message.isAnonymous,
		};
	}

	static list = function (messages, isAdmin = false) {
		if (!messages || !Array.isArray(messages)) return [];

		return messages.map((message) => this.single(message, isAdmin)) || [];
	};
}
