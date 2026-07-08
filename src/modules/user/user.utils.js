import { configEnv } from '../../config/env.js';
import { decrypt } from '../../utils/security/encryption.security.js';
import { MessageDTO } from '../message/message.utils.js';

export class UserDTO {
	static single(user, isAdmin = false) {
		if (user.phone) {
			user.phone = decrypt(user.phone);
		}

		if (user.covers && Array.isArray(user.covers) && user.covers.length > 0) {
			user.covers = user.covers.map((cover) => `${configEnv.appUrl}/${cover.replace(/\\/g, '/')}`);
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

		const userAvatar = user.avatar
			? user.avatar.startsWith('http')
				? user.avatar
				: `${configEnv.appUrl}/${user.avatar.replace(/\\/g, '/')}`
			: null;

		return {
			id: user._id,
			name: `${user.firstName} ${user.lastName}`,
			firstName: user.firstName,
			lastName: user.lastName,
			avatar: userAvatar,
			covers: user.covers || [],
			username: user.username,
			email: user.email,
			gender: user.gender,
			birthdate: user.birthdate,
			bio: user.bio,

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
