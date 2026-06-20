import { model, Schema } from 'mongoose';
import {
	GENDERS,
	GENDERS_ENUM,
	PROVIDERS,
	PROVIDERS_ENUM,
	USER_ROLES,
	USER_ROLES_ENUM,
} from '../../utils/enums/user.enum.js';
import { encrypt } from '../../utils/security/encryption.security.js';
import { generateHash } from '../../utils/security/hash.security.js';
import { calcAge } from '../../utils/utils.js';

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
			unique: [true, 'Entered username already in use, please choose another username.'],
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
					return this.provider === PROVIDERS_ENUM.LOCAL;
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

		avatar: String,
		description: String,

		role: {
			type: String,
			enum: USER_ROLES,
			default: USER_ROLES_ENUM.USER,
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
		otp: {
			type: String,
			default: null,
			nullify: true,
		},

		isActive: {
			type: Boolean,
			default: true,
		},
		// deletedAt: {
		// 	type: Date,
		// 	default: null,
		// },

		messages: {
			type: Schema.Types.ObjectId,
			ref: 'message',
		},

		virtuals: {
			fullName: {
				type: String,
				virtual: true,
				get() {
					return `${this.firstName} ${this.lastName}`;
				},
			},
			age: {
				type: Number,
				virtual: true,
				get() {
					console.log('calcAge(this)', calcAge(this.birthdate));
					return calcAge(this.birthdate);
				},
			},
		},
	},
	{
		timestamps: true,
		toJSON: { virtuals: true },
		toObject: { virtuals: true },
	},
);

userSchema.pre('save', async function () {
	if (this.provider === PROVIDERS_ENUM.LOCAL && this.isModified('password')) {
		this.password = await generateHash(this.password);
	}

	if (this.isModified('phone')) {
		this.phone = encrypt(this.phone);
	}
});

const User = model('user', userSchema);
export default User;
