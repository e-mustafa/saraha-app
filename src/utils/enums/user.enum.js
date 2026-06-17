export const GENDERS_ENUM = {
	MALE: 0,
	FEMALE: 1,
};
export const GENDERS = Object.values(GENDERS_ENUM);

export const USER_ROLES_ENUM = {
	USER: 0,
	ADMIN: 1,
	EDITOR: 2,
	MANAGER: 3,
	OWNER: 4,
};

export const USER_ROLES = Object.values(USER_ROLES_ENUM);
export const ADMIN_ROLES = [USER_ROLES_ENUM.ADMIN, USER_ROLES_ENUM.EDITOR, USER_ROLES_ENUM.MANAGER, USER_ROLES_ENUM.OWNER];

export const PROVIDERS_ENUM = {
	LOCAL: 'local',
	GOOGLE: 'google',
	FACEBOOK: 'facebook',
};
export const PROVIDERS = Object.values(PROVIDERS_ENUM);
