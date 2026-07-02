import { ADMIN_ROLES, USER_ROLES_ENUM } from '../utils/enums/user.enum.js';
import asyncHandler from '../utils/error-handler/async-handler.js';
import { BadRequestException, UnauthorizedException } from '../utils/response/throw.exceptions.js';
// import User from '../DB/models/user.model.js';
import { decodeToken } from '../utils/security/tokens/token.js';

export const auth = (isOptional = false) => {
	return asyncHandler(async (req, res, next) => {
		const authorization = req.headers.authorization;
		if (!authorization) {
			if (isOptional) {
				return next();
			}
			BadRequestException('Authorization header is required', 'Auth-middleware-no-auth-header');
		}
		const decoded = (await decodeToken(authorization)) || {};
		// const user = await User.findById(decoded.id).select('-password');
		req.user = decoded;
		req.decoded = decoded;
		return next();
	});
};

export const authorization = (allowedRoles = []) => {
	return asyncHandler(async (req, res, next) => {
		if (!allowedRoles?.includes(req.user?.role || '')) {
			UnauthorizedException('Unauthorized Access!!', 'Auth-middleware-unauthorized');
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
