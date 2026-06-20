import jwt from 'jsonwebtoken';
import User from '../../DB/models/user.model.js';
import { TOKEN_TYPES_ENUM } from '../../utils/enums/security,enum.js';
import { PROVIDERS_ENUM } from '../../utils/enums/user.enum.js';
import {
	BadRequestException,
	ConflictException,
	NotFoundException,
	UnauthorizedException,
} from '../../utils/response/throw.exceptions.js';
import { verifyHash } from '../../utils/security/hash.security.js';
import { verifyOAuth2Google } from '../../utils/security/tokens/providers/google.token.js';
import { generateTokens, getSignature } from '../../utils/security/tokens/token.js';

export const signupService = async ({ firstName, lastName, username, email, password, phone, gender, birthdate }) => {
	if (!firstName || !lastName || !username || !email || !password || !phone || gender === undefined || !birthdate) {
		NotFoundException('Please enter required fields', 'signupService');
	}
	// check if user already exists
	const isExist = await User.findOne({ email });
	if (isExist) {
		ConflictException('This email is already registered', 'signupService');
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
		password, //: hashedPassword, in user model password is hashed automatically with pre save middleware
		phone, //: encryptedPhone, in user model phone is encrypted automatically with pre save middleware
		gender,
		birthdate,
	});

	return user;
};

export const loginService = async ({ email, password }) => {
	if (!email || !password) {
		BadRequestException('Please enter required fields email and password', 'loginService-missing-fields');
	}

	const user = await User.findOne({ email });
	if (!user) {
		NotFoundException('Invalid email or password', 'loginService-invalid-email');
	}

	const isPasswordValid = await verifyHash(password, user.password);
	if (!isPasswordValid) {
		UnauthorizedException('Invalid email or password', 'loginService-invalid-password');
	}

	const tokens = generateTokens(user);
	return tokens;
};

export const refreshAccessTokenService = async (refreshToken) => {
	if (!refreshToken) {
		UnauthorizedException('Refresh token is required, please login again.', 'refreshAccessTokenService-missing-token');
	}

	// decode token to get role and id
	const decodedPayload = jwt.decode(refreshToken) || {};

	if (!decodedPayload.aud || !decodedPayload.id) {
		UnauthorizedException('Refresh token is corrupted.', 'refreshAccessTokenService-invalid-token');
	}

	// get signature by audience
	const signature = getSignature(decodedPayload.aud);

	// try {
	// verify refresh token
	const decoded = jwt.verify(refreshToken, signature.REFRESH_TOKEN_SECRET);

	// get user from database by id to check if user is active and not banned
	const user = await User.findById(decoded.id).lean();
	if (!user) {
		UnauthorizedException('User associated with this token no longer exists.', 'refreshAccessTokenService-user-not-found');
	}

	// generate access token
	const { accessToken } = generateTokens(user, TOKEN_TYPES_ENUM.ACCESS);

	return { accessToken };
	// } catch (error) {
	// 	// throw exception if token is expired or invalid
	// 	UnauthorizedException(
	// 		'Refresh token expired or invalid. Please login again.',
	// 		'refreshAccessTokenService-token-expired',
	// 	);
	// }
};

export const socialLoginService = async (provider, idToken) => {
	if (!provider || !Object.values(PROVIDERS_ENUM).includes(provider)) {
		BadRequestException('Invalid provider', 'socialLoginService-invalid-provider');
	}

	let payload = {};
	if (provider === PROVIDERS_ENUM.GOOGLE) {
		payload = await verifyOAuth2Google(idToken);
	}

	// payload = await verifyOAuth2Google(idToken);

	const { email_verified, email, given_name, family_name, picture } = payload;

	if (!email_verified) BadRequestException('Email not verified, Use another account', 'socialLogin-google');

	const user = await User.findOne({ email }).lean();
	if (user) {
		// login existing user ->> generate access token
		if (user.provider !== PROVIDERS_ENUM.GOOGLE) {
			if (user.provider === PROVIDERS_ENUM.SYSTEM) {
				BadRequestException('User already exists, please login with your password', 'socialLogin-user-exists-system');
			} else {
				BadRequestException('User already exists with different provider', 'socialLogin-user-exists-different-provider');
			}
		}
		// generate access token
		const tokens = generateTokens(user);
		return { isNew: false, tokens }; // message: 'Login successfully'
	}

	// Register create new user
	const newUser = await User.create({
		email,
		firstName: given_name,
		lastName: family_name,
		username: `${email.split('@')[0]}_${Math.floor(Math.random() * 1000)}`,
		avatar: picture,
		provider,
	});
	// generate access token
	const tokens = generateTokens(newUser);
	return { isNew: true, tokens }; // message: 'User created successfully'
};
