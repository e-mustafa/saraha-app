import jwt from 'jsonwebtoken';
import { configEnv, jwtSignatureLevel } from '../../../config/env.js';
import User from '../../../DB/models/user.model.js';
import { TOKEN_TYPES_ENUM } from '../../enums/security,enum.js';
import { ADMIN_ROLES, USER_ROLES_ENUM } from '../../enums/user.enum.js';
import { throwInternalException, UnauthorizedException } from '../../response/throw.exceptions.js';

export const generateToken = (payload, secretKey, options = {}) => {
	if (!secretKey) {
		throwInternalException('JWT Secret key is missing or undefined.');
	}
	const appOptions = {
		// algorithm: 'HS256',
		issuer: configEnv.appName,
		subject: 'User Authentication',
		audience: Number(options.audience ?? USER_ROLES_ENUM.USER),
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
		throwInternalException('Invalid token Signature', 500, 'getSignature');
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
export const generateTokens = (user, rememberMe = false, type = 'BOTH', customPayload) => {
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
			expiresIn: rememberMe ? signature.REFRESH_TOKEN_EXPIRES * 2 : signature.REFRESH_TOKEN_EXPIRES,
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
		throwInternalException('Authorization header is required', 500, 'decodeToken');
	}
	const token = authorization.split(' ')[1];
	if (!token) {
		throwInternalException('Token is required', 500, 'decodeToken');
	}

	const decodedPayload = jwt.decode(token) || {};

	if (!decodedPayload.aud || !decodedPayload.id) {
		throwInternalException('Invalid token structure or corrupted payload', 500, 'decodeToken');
	}

	// Determine signature based on audience
	const signature = getSignature(decodedPayload.aud);

	// use try catch to handle token expiration exception
	// Verify token using the appropriate secret
	let decoded;
	try {
		decoded = await verifyToken(token, isRefreshToken ? signature.REFRESH_TOKEN_SECRET : signature.ACCESS_TOKEN_SECRET);
	} catch (error) {
		if (isRefreshToken) {
			UnauthorizedException('Token expired! Please login again.', 'decodeToken');
		} else {
			UnauthorizedException('Token expired! Please ask for a new one', 'decodeToken');
		}
	}
	const user = await User.findById(decoded.id).select('-password -verified -otp').lean();
	return { user, decoded };
};
