import jwt from 'jsonwebtoken';
import User from '../../DB/models/user.model.js';
import { TOKEN_TYPES_ENUM } from '../../utils/enums/security,enum.js';
import { PROVIDERS_ENUM } from '../../utils/enums/user.enum.js';
import { throwException } from '../../utils/response/throw.exceptions.js';
import { verifyHash } from '../../utils/security/hash.security.js';
import { verifyOAuth2Google } from '../../utils/security/tokens/providers/google.token.js';
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
		password, //: hashedPassword, in user model password is hashed automatically with pre save middleware
		phone, //: encryptedPhone, in user model phone is encrypted automatically with pre save middleware
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

	const user = await User.findOne({ email });
	if (!user) {
		throwException(404, 'Invalid email or password');
	}

	const isPasswordValid = await verifyHash(password, user.password);
	if (!isPasswordValid) {
		throwException(401, 'Invalid email or password');
	}

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

export const socialLoginService = async (provider, idToken) => {
	if (!provider || !Object.values(PROVIDERS_ENUM).includes(provider)) {
		throwException(400, 'Invalid provider');
	}

	let payload = {};
	if (provider === PROVIDERS_ENUM.GOOGLE) {
		payload = await verifyOAuth2Google(idToken);
	}

	payload = await verifyOAuth2Google(idToken);

	const { email_verified, email, given_name, family_name, picture, ...rest } = payload;

	if (!email_verified) throwException(400, 'Email not verified, Use another account', 'socialLogin-google');

	const user = await User.findOne({ email }).lean();
	if (user) {
		// login existing user ->> generate access token
		if (user.provider !== PROVIDERS_ENUM.GOOGLE) {
			if (user.provider === PROVIDERS_ENUM.SYSTEM) {
				throwException(400, 'User already exists, please login with your password');
			} else {
				throwException(400, 'User already exists with different provider');
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
