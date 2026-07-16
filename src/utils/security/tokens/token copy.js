import jwt from 'jsonwebtoken';
import { configEnv, jwtSignatureLevel } from '../../../config/env.js';
import User from '../../../DB/models/user.model.js';
import { TOKEN_TYPES_ENUM } from '../../enums/security,enum.js';
import { ADMIN_ROLES, USER_ROLES_ENUM } from '../../enums/user.enum.js';
import { throwException, throwInternalException } from '../../response/throw.exceptions.js';

export const generateToken = (payload, secretKey, options = {}) => {
	if (!secretKey) {
		throwInternalException('JWT Secret key is missing or undefined.');
	}
	const appOptions = {
		// algorithm: 'HS256',
		issuer: configEnv.appName,
		audience: ['web', 'mobile'],
		subject: 'User Authentication',
		...options,
	};
	return jwt.sign(payload, secretKey, appOptions);
};

export const verifyToken = (token, secretKey) => {
	if (!secretKey) {
		throwInternalException('JWT Secret key is missing or undefined.');
	}
	return jwt.verify(token, secretKey);
};

export const getSignature = (role) => {
	let signature;
	if (ADMIN_ROLES?.includes(Number(role))) {
		signature = jwtSignatureLevel.admin;
	} else if (Number(role) === USER_ROLES_ENUM.USER) {
		signature = jwtSignatureLevel.user;
	} else {
		throwException('Invalid token');
	}
	return signature;
};

/**
 * Generate access or/and refresh tokens for a user
 * @param {Object} user - User data object
 * @param {string} type - Token type (0 for both, "ACCESS" for access only, "REFRESH" for refresh only)
 * @param {Object} customPayload - Custom payload to include in the token, Default payload is { id, email, role }
 * @returns {Object} - Object containing accessToken and refreshToken
 */
export const generateTokens = (user, type = 'BOTH', customPayload) => {
	if (!user || user.role === undefined) {
		throwInternalException('Token generation failed: User role is missing or undefined');
	}

	const signature = getSignature(user.role);
	if (!signature) {
		throwInternalException(`Unauthorized or Invalid role: ${user?.role}`);
	}
	const payload = {
		id: user._id,
		email: user.email,
		...customPayload,
		role: user.role,
	};

	let accessToken = null;
	let refreshToken = null;

	if (type === 'BOTH') {
		if (type === TOKEN_TYPES_ENUM.ACCESS) {
			accessToken = generateToken(payload, signature.ACCESS_TOKEN_SECRET, {
				expiresIn: signature.ACCESS_TOKEN_EXPIRES,
			});
		}

		if (type === TOKEN_TYPES_ENUM.REFRESH) {
			refreshToken = generateToken(payload, signature.REFRESH_TOKEN_SECRET, {
				expiresIn: signature.REFRESH_TOKEN_EXPIRES,
			});
		}

		return { accessToken, refreshToken };
	}
};

// const adminBearer = 'ADMIN';
// const userBearer = 'Bearer';

// /**
//  * Decodes a JWT token based on the bearer type (admin or user)
//  * @param {string} authorization - The authorization header value (e.g., "Bearer <token>" or "ADMIN <token>")
//  * @param {boolean} isRefreshToken - Whether this is a refresh token (default: false)
//  * @returns {Object} The decoded token payload
//  * @throws {Error} If token is invalid or missing
//  */
// export const decodeToken = async (authorization, isRefreshToken = false) => {
// 	// const tokenType = isRefreshToken ? TOKEN_TYPES_ENUM.REFRESH : TOKEN_TYPES_ENUM.ACCESS;
// 	if (!authorization) {
// 		throwInternalException('Authorization header is required');
// 	}
// 	const [bearer, token] = authorization.split(' ');

// 	if (!token) {
// 		throwInternalException('Token not found');
// 	}

// 	// Determine signature based on bearer type (admin or user)
// 	let signature;
// 	if (bearer === adminBearer) {
// 		signature = jwtSignatureLevel.admin;
// 	} else if (bearer === userBearer) {
// 		signature = jwtSignatureLevel.user;
// 	} else {
// 		throwInternalException('Invalid token');
// 	}

// 	// Verify token using the appropriate secret
// 	const decoded = await verifyToken(
// 		token,
// 		// tokenType === TOKEN_TYPES_ENUM.ACCESS ? signature.ACCESS_TOKEN_SECRET : signature.REFRESH_TOKEN_SECRET,
// 		isRefreshToken ? signature.REFRESH_TOKEN_SECRET : signature.ACCESS_TOKEN_SECRET,
// 	);

// 	const user = await User.findById(decoded.id);
// 	return { user, decoded };
// };

/**
 * Decodes a JWT token based on the bearer type (admin or user)
 * @param {string} authorization - The authorization header value (e.g., "Bearer <token>" or "ADMIN <token>")
 * @param {boolean} isRefreshToken - Whether this is a refresh token (default: false)
 * @returns {Object} The decoded token payload
 * @throws {Error} If token is invalid or missing
 */
export const decodeToken = async (authorization, isRefreshToken = false) => {
	if (!authorization) {
		throwException('Authorization header is required');
	}
	const token = authorization.split(' ')[1];

	if (!token) {
		throwException('Token not found');
	}

	const decodedPayload = jwt.decode(token) || {};

	if (!decodedPayload.role || !decodedPayload.id) {
		throwException('Invalid token structure or corrupted payload');
	}

	// Determine signature based on bearer type (admin or user)
	const signature = getSignature(decodedPayload.role);

	// Verify token using the appropriate secret
	const decoded = await verifyToken(
		token,
		// tokenType === TOKEN_TYPES_ENUM.ACCESS ? signature.ACCESS_TOKEN_SECRET : signature.REFRESH_TOKEN_SECRET,
		isRefreshToken ? signature.REFRESH_TOKEN_SECRET : signature.ACCESS_TOKEN_SECRET,
	);

	const user = await User.findById(decoded.id).lean();
	return { user, decoded };
};
