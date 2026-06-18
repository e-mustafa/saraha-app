import jwt from 'jsonwebtoken';
import { jwtSignatureLevel } from '../../../config/env.js';
import User from '../../../DB/models/user.model.js';
import { TOKEN_TYPES_ENUM } from '../../enums/security,enum.js';
import { ADMIN_ROLES, USER_ROLES_ENUM } from '../../enums/user.enum.js';
import { throwInternalException } from '../../response/throw.exceptions.js';

export const generateToken = (payload, secretKey, options = {}) => {
	if (!secretKey) {
		throwInternalException('JWT Secret key is missing or undefined.');
	}
	const appOptions = {
		// algorithm: 'HS256',
		issuer: 'Saraha App',
		subject: 'User Authentication',
		...options,
		audience: String(options.audience) ?? USER_ROLES_ENUM.USER,
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
		throwInternalException(500, 'Invalid token Signature', 'getSignature');
	}
	return signature;
};

/**
 * Generate access or/and refresh tokens for a user
 * @param {Object} user - User data object, *Must have _id and role properties
 * @param {string} type - Token type (default BOTH, "ACCESS" for access only, "REFRESH" for refresh only)
 * @param {Object} customPayload - Custom payload to include in the token, Default payload is { id, email, role }
 * @returns {Object} - Object containing accessToken and refreshToken
 */
export const generateTokens = (user, type = 'BOTH', customPayload) => {
	if (!user || user.role === undefined) {
		throwInternalException('Token generation failed: User role is missing or undefined');
	}

	const signature = getSignature(user.role);
	if (!signature) {
		throwInternalException('Unauthorized or Invalid role');
	}
	const payload = {
		id: user._id,
		// email: user.email,
		// firstName: user.firstName,
		// lastName: user.lastName,
		// avatar: user.avatar,
		...customPayload,
	};

	const tokens = {};

	if (type === 'BOTH' || type === TOKEN_TYPES_ENUM.ACCESS) {
		tokens.accessToken = generateToken(payload, signature.ACCESS_TOKEN_SECRET, {
			expiresIn: signature.ACCESS_TOKEN_EXPIRES,
			audience: user.role,
		});
	}

	if (type === 'BOTH' || type === TOKEN_TYPES_ENUM.REFRESH) {
		tokens.refreshToken = generateToken(payload, signature.REFRESH_TOKEN_SECRET, {
			expiresIn: signature.REFRESH_TOKEN_EXPIRES,
			audience: user.role,
		});
	}

	return tokens;
};

/**
 * Decodes a JWT token based on token audience (admin or user)
 * @param {string} authorization - The authorization header value (e.g., "Bearer <token>")
 * @param {boolean} isRefreshToken - Whether this is a refresh token (default: false)
 * @returns {Object} The decoded token payload
 * @throws {Error} If token is invalid or missing
 */
export const decodeToken = async (authorization, isRefreshToken = false) => {
	if (!authorization) {
		throwInternalException(500, 'Authorization header is required', 'decodeToken');
	}
	const token = authorization.split(' ')[1];

	if (!token) {
		throwInternalException(500, 'Token is required', 'decodeToken');
	}

	const decodedPayload = jwt.decode(token) || {};

	if (!decodedPayload.aud || !decodedPayload.id) {
		throwInternalException(500, 'Invalid token structure or corrupted payload', 'decodeToken');
	}

	// Determine signature based on audience
	const signature = getSignature(decodedPayload.aud);

	// use try catch to handle token expiration exception
	// Verify token using the appropriate secret
	const decoded = await verifyToken(token, isRefreshToken ? signature.REFRESH_TOKEN_SECRET : signature.ACCESS_TOKEN_SECRET);

	const user = await User.findById(decoded.id).lean();
	return { user, decoded };
};
