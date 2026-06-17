import User from '../../DB/models/user.model.js';
import { decrypt } from '../../utils/security/encryption.security.js';

// export const getProfileService = async (id) => {
// 	const user = await User.findById(id).select('-password -__v');
// 	if (!user) {
// 		throwException(404, 'User not found');
// 	}

// 	user.phone = decrypt(user.phone);

// 	return user;
// };

export const getProfileService = async (user) => {
	user.phone = decrypt(user.phone);
	return user;
};

export const getUsersService = async () => {
	const users = await User.find(); // .select('-password -__v');
	return users;
};
