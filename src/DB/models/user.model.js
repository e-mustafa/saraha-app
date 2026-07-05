import { model, Schema } from 'mongoose';
import {
	GENDERS,
	GENDERS_ENUM,
	PROVIDERS,
	PROVIDERS_ENUM,
	USER_ROLES,
	USER_ROLES_ENUM,
} from '../../utils/enums/user.enum.js';
import { calcAge } from '../../utils/general/date.utils.js';
import { encrypt } from '../../utils/security/encryption.security.js';
import { generateHash } from '../../utils/security/hash.security.js';

const userSchema = new Schema(
	{
		firstName: {
			type: String,
			required: [true, 'FirstName required.'],
			minLength: [3, 'FirstName must be at least 3 characters'],
			maxLength: [30, 'FirstName must be at most 30 characters'],
			trim: true,
		},

		lastName: {
			type: String,
			required: [true, 'LastName required.'],
			minLength: [2, 'LastName must be at least 2 characters'],
			maxLength: [30, 'LastName must be at most 30 characters'],
			trim: true,
		},

		username: {
			type: String,
			required: [true, 'Username required.'],
			unique: true,
			trim: true,
			lowercase: true,
		},
		email: {
			type: String,
			required: [true, 'Email required.'],
			unique: [true, 'Email must be unique, entered email already in use!'],
			trim: true,
			lowercase: true,
			match: [/^\w+([-.]?\w+)*@\w+([-.]?\w+)*(\.\w{2,3})+$/, 'Please add a valid email'],
		},
		password: {
			type: String,
			required: [
				function () {
					return this.provider === PROVIDERS_ENUM.SYSTEM;
				},
				'Password required.',
			],
			minLength: [6, 'Password must be at least 6 characters'],
		},
		phone: String,
		// required: [true, 'User phone number required.'],
		// validate: {
		// 	validator: function (value) {
		// 		return /^01[0125][0-9]{8}$/.test(value);
		// 	},
		// 	// message: (props) => `${props.value} is not a valid phone number, enter 010, 011, 012, or 015 followed by 8 digits`,
		// 	message: 'Invalid number, enter 010, 011, 012, or 015 followed by 8 digits',
		// },

		gender: {
			type: Number,
			enum: GENDERS,
			default: GENDERS_ENUM.MALE,
		},

		birthdate: {
			type: Date,
			validate: {
				validator: function (value) {
					return calcAge(value) > 18;
				},
				message: 'Age must be at least 18 years old!',
			},
		},

		bio: String,
		avatar: String,
		covers: {
			type: Array,
			maxLength: 2,
			default: [],
		},

		role: {
			type: String,
			enum: USER_ROLES,
			default: USER_ROLES_ENUM.USER,
			// save as number in database
			transform: function (value) {
				return Number(value);
			},
		},
		provider: {
			type: String,
			enum: PROVIDERS,
			default: PROVIDERS_ENUM.LOCAL,
		},
		verified: {
			type: Date,
			default: null,
			nullify: true,
		},
		passwordChangedAt: {
			type: Date,
			default: null,
			nullify: true,
		},

		isActive: {
			type: Boolean,
			default: true,
		},

		visitCount: { type: Number, default: 0 },

		loggedOutAllAt: { type: Date, default: null },

		// deletedAt: {
		// 	type: Date,
		// 	default: null,
		// },
	},
	{
		timestamps: true,
		toJSON: { virtuals: true },
		toObject: { virtuals: true },
		strict: true,
		strictQuery: true,
		optimisticConcurrency: true,
	},
);

// Virtuals --------------------------------------------------------------
userSchema.virtual('fullName').get(function () {
	if (!this.firstName || !this.lastName) return undefined;
	return `${this.firstName} ${this.lastName}`;
});

userSchema.virtual('age').get(function () {
	return calcAge(this.birthdate);
});

// userSchema.virtual('messages', {
// 	ref: 'message',
// 	localField: '_id',
// 	foreignField: 'to',
// });

userSchema.virtual('sentMessages', {
	ref: 'message',
	localField: '_id',
	foreignField: 'from',
});

userSchema.virtual('receivedMessages', {
	ref: 'message',
	localField: '_id',
	foreignField: 'to',
});

// userSchema
// 	.virtual('avatar')
// 	.get(function () {
// 		if (!this.profileImage) return undefined;

// 		// if the profileImage starts with http:// or https:// return it as is
// 		if (this.profileImage.startsWith('http://') || this.profileImage.startsWith('https://')) {
// 			return this.profileImage;
// 		}

// 		// if the profileImage is a local file, return it with the appUrl
// 		return `${configEnv.appUrl}/${this.profileImage.replace(/\\/g, '/')}`;
// 	})
// 	.set(function (value) {
// 		// the Setter makes Mongoose understand where to store the value when writing User.create({ avatar: ... })
// 		this.profileImage = value;
// 	});

// userSchema
// 	.virtual('covers')
// 	.get(function () {
// 		return this.coverImages && this.coverImages?.length > 0
// 			? this.coverImages.map((image) => `${configEnv.appUrl}/${image.replace(/\\/g, '/')}`)
// 			: [];
// 	})
// 	.set(function (value) {
// 		this.coverImages = value;
// 	});

// Hooks -----------------------------------------------------------------------------------------
userSchema.pre('save', async function () {
	if (this.isModified('password')) {
		this.password = await generateHash(this.password);
	}

	if (this.isModified('phone')) {
		this.phone = encrypt(this.phone);
	}
});

// userSchema.set('toJSON', {
// 	transform: function (doc, data) {
// 		if (data.isConfidential) {
// 			data.content = decrypt(data.content);
// 		}
// 	},
// });

const User = model('user', userSchema);
export default User;
