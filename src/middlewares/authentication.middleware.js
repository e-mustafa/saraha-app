import { ADMIN_ROLES, USER_ROLES_ENUM } from '../utils/enums/user.enum.js';
import asyncHandler from '../utils/error-handler/async-handler.js';
import { throwException } from '../utils/response/throw.exceptions.js';
import { decodeToken } from '../utils/security/tokens/token.js';

export const authentication = (isRefreshToken = false) => {
	return asyncHandler(async (req, res, next) => {
		const { user, decoded } = (await decodeToken(req.headers.authorization, isRefreshToken)) || {};
		req.user = user;
		req.decoded = decoded;
		return next();
	});
};

export const authorization = (allowedRoles = []) => {
	return asyncHandler(async (req, res, next) => {
		if (!allowedRoles?.includes(req.user?.role || '')) {
			throwException(403, 'Unauthorized Access!!');
		}
		return next();
	});
};

// All users authentication
export const requireAuth = (isRefreshToken = false) => {
	return authentication(isRefreshToken);
};

// All admins authorization
export const requireAuthAdmins = () => {
	return authorization(ADMIN_ROLES);
};

// User authorization
export const requireAuthUser = () => {
	return authorization([USER_ROLES_ENUM.USER]);
};
