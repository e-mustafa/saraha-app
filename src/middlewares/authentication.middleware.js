import { ADMIN_ROLES, USER_ROLES_ENUM } from '../utils/enums/user.enum.js';
import asyncHandler from '../utils/error-handler/async-handler.js';
import { UnauthorizedException } from '../utils/response/throw.exceptions.js';
import { decodeToken } from '../utils/security/tokens/token.js';

export const auth = (isOptional = false) => {
	return asyncHandler(async (req, res, next) => {
		const authorization = req.headers.authorization;
		if (!authorization) {
			if (isOptional) {
				return next();
			}
			UnauthorizedException(401, 'Authorization header is required');
		}
		const { user, decoded } = (await decodeToken(authorization)) || {};
		req.user = user;
		req.decoded = decoded;
		return next();
	});
};

export const authorization = (allowedRoles = []) => {
	return asyncHandler(async (req, res, next) => {
		if (!allowedRoles?.includes(req.user?.role || '')) {
			UnauthorizedException(403, 'Unauthorized Access!!');
		}
		return next();
	});
};

// All users authentication
export const authOptional = () => {
	return auth(true);
};

// All admins authorization
export const requireAuthAdmins = () => {
	return authorization(ADMIN_ROLES);
};

// User authorization
export const requireAuthUser = () => {
	return authorization([USER_ROLES_ENUM.USER]);
};
