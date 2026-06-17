import jwt from 'jsonwebtoken';
import User from '../../DB/models/user.model.js';
import { TOKEN_TYPES_ENUM } from '../../utils/enums/security,enum.js';
import { throwException } from '../../utils/response/throw.exceptions.js';
import { verifyHash } from '../../utils/security/hash.security.js';
import { generateTokens, getSignature } from '../../utils/security/tokens/token.js';

export const signupService = async ({ firstName, lastName, username, email, password, phone, gender, birthdate }) => {
	if (!firstName || !lastName || !username || !email || !password || !phone || gender === undefined || !birthdate) {
		throwException(400, 'Please enter required fields');
	}
	// check if user already exists
	const isExist = await User.findOne({ email });
	if (isExist) {
		throwException(409, 'This email is already registered');
	}

	// const hashedPassword = await generateHash(password);
	// let encryptedPhone = null;
	// if (phone) {
	// 	encryptedPhone = await encrypt(phone);
	// }

	const user = await User.create({
		firstName,
		lastName,
		username,
		email,
		password, //: hashedPassword,
		phone, //: encryptedPhone,
		gender,
		birthdate,
	});

	if (!user) {
		throwException(500, 'Failed to create user');
	}

	return user;
};

export const loginService = async ({ email, password }) => {
	if (!email || !password) {
		throwException(400, 'Please enter required fields email and password');
	}

	console.log('body', { email, password });
	const user = await User.findOne({ email });
	if (!user) {
		throwException(404, 'Invalid email or password');
	}

	const isPasswordValid = await verifyHash(password, user.password);
	console.log('isPasswordValid', isPasswordValid);
	if (!isPasswordValid) {
		throwException(401, 'Invalid email or password');
	}
	console.log('TokenExpiredError', jwt.TokenExpiredError());

	const tokens = generateTokens(user);

	return tokens;
};

export const refreshAccessTokenService = async (refreshToken) => {
	if (!refreshToken) {
		throwException(401, 'Refresh token is required, please login again.');
	}

	// decode token to get role and id
	const decodedPayload = jwt.decode(refreshToken) || {};
	console.log('decodedPayload', decodedPayload);
	if (!decodedPayload.aud || !decodedPayload.id) {
		throwException(401, 'Refresh token is corrupted.');
	}

	// get signature by audience
	const signature = getSignature(decodedPayload.aud);

	try {
		// verify refresh token
		const decoded = jwt.verify(refreshToken, signature.REFRESH_TOKEN_SECRET);

		// get user from database by id to check if user is active and not banned
		const user = await User.findById(decoded.id).lean();
		if (!user) {
			throwException(401, 'User associated with this token no longer exists.');
		}

		// generate access token
		const { accessToken } = generateTokens(user, TOKEN_TYPES_ENUM.ACCESS);

		return { accessToken };
	} catch (error) {
		// throw exception if token is expired or invalid
		throwException(401, 'Refresh token expired or invalid. Please login again.');
	}
};
