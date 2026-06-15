import { model, Schema } from 'mongoose';
import { GENDERS, GENDERS_ENUM, PROVIDERS, PROVIDERS_ENUM, USER_ROLES } from '../../utils/enums/user.enum.js';
import { calcAge } from '../../utils/utils.js';

const userSchema = new Schema(
	{
		firstName: {
			type: String,
			required: [true, 'User Name required.'],
			minLength: [2, 'Name must be at least 2 characters'],
			maxLength: [25, 'Name must be at most 25 characters'],
			trim: true,
		},

		lastName: {
			type: String,
			required: [true, 'User Name required.'],
			minLength: [2, 'Name must be at least 2 characters'],
			maxLength: [25, 'Name must be at most 25 characters'],
			trim: true,
		},

		username: {
			type: String,
			required: [true, 'Username required.'],
			unique: [true, 'Username must be unique, entered username already in use!'],
			trim: true,
		},
		email: {
			type: String,
			required: [true, 'Email required.'],
			unique: [true, 'Email must be unique, entered email already in use!'],
			trim: true,
			lowercase: true,
			match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please add a valid email'],
		},
		confirmEmail: {
			type: Date,
			default: null,
		},
		isActive: {
			type: Boolean,
			default: true,
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
		phone: {
			type: String,
			// required: [true, 'User phone number required.'],
			validate: {
				validator: function (value) {
					return /^01[0125][0-9]{8}$/.test(value);
				},
				// message: (props) => `${props.value} is not a valid phone number, enter 010, 011, 012, or 015 followed by 8 digits`,
				message: 'Invalid number, enter 010, 011, 012, or 015 followed by 8 digits',
			},
		},
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
				message: 'Birthdate must be at least 18 years old!',
			},
		},

		avatar: String,
		description: String,

		role: {
			type: String,
			enum: USER_ROLES,
			default: 'user',
		},
		provider: {
			type: String,
			enum: PROVIDERS,
			default: PROVIDERS_ENUM.LOCAL,
		},
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

const User = model('user', userSchema);
export default User;
