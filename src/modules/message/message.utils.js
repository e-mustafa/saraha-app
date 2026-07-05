import { configEnv } from '../../config/env.js';
import { decrypt } from '../../utils/security/encryption.security.js';

// format message and remove from field (sender) if message is anonymous
// export function serializeMessage(message) {
// 	if (message.attachments && message.attachments?.length > 0) {
// 		message.attachments = message.attachments.map((attachment) => {
// 			return {
// 				url: `${configEnv.appUrl}/${attachment.url.replace(/\\/g, '/')}`,
// 				fileType: attachment.fileType,
// 			};
// 		});
// 	}

// 	if (message.isConfidential) {
// 		message.content = decrypt(message.content);
// 	}

// 	return {
// 		id: message._id,
// 		content: message.content,
// 		attachments: message.attachments,
// 		createdAt: message.createdAt,
// 		isFavorite: message.isFavorite,
// 		from: message.isAnonymous ? null : message.from,
// 		to: message.to ? message.to : null,
// 	};
// }

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

		if (!message.isAnonymous && message.from) {
			message.from = {
				id: message.from._id,
				name: `${message.from.firstName} ${message.from.lastName}`,
				avatar: message.from.avatar ? `${configEnv.appUrl}/${message.from.avatar.replace(/\\/g, '/')}` : null,
			};
		}

		// return data;
		return {
			id: message._id,
			content: message.content,
			attachments: message.attachments,
			createdAt: message.createdAt,
			isFavorite: message.isFavorite,
			from: !isAdmin && message.isAnonymous ? null : message.from,
			to: message.to ? message.to : null,

			isConfidential: message.isConfidential,
			isAnonymous: message.isAnonymous,
		};
	}

	static list = function (messages, isAdmin = false) {
		// console.log('messages', messages);
		if (!messages || !Array.isArray(messages)) return [];

		return messages.map((message) => this.single(message, isAdmin)) || [];
	};
}
