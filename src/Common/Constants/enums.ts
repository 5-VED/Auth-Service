export enum HTTP_CODES {
	BAD_REQUEST = 400,
	DUPLICATE_VALUE = 409,
	FORBIDDEN = 403,
	INTERNAL_SERVER_ERROR = 500,
	METHOD_NOT_ALLOWED = 405,
	MOVED_PERMANENTLY = 301,
	NOT_ACCEPTABLE = 406,
	NOT_FOUND = 404,
	NO_CONTENT_FOUND = 204,
	OK = 200,
	PERMANENT_REDIRECT = 308,
	UNAUTHORIZED = 401,
	UPGRADE_REQUIRED = 426,
	VALIDATION_ERROR = 422,
}

export enum LAYER {
	CONTROLLER_LAYER = "Controller Layer",
	SERVICE_LAYER = "Service Layer"
}

export enum ROLE {
	ADMIN = 'Admin',
	USER = 'User',
	SELLER = 'Seller',
	SUPER_ADMIN = 'Super Admin',
}

export enum USER_STATUS {
	ACTIVE = 'Active',
	INACTIVE = 'Inactive',
}

export enum PAYMENT_STATUS {
	SUCCEDED = 'succeeded',
}

export enum ORDER_STATUS {
	SUCCEDED = 'succeeded',
	PENDING = 'Pending',
	ACCEPTED = 'Accepted',
	REJECTED = 'Rejected',
	COMPLETED = 'Completed',
}

export enum SOCIAL_PROVIDER {
	GOOGLE = 'GOOGLE',
	FACEBOOK = 'FACEBOOK',
	APPLE = 'APPLE',
	PASSWORD = 'PASSWORD'
}

export enum KAFKA_TOPICS {
	EMAIL_NOTIFICATION = 'notifications.email',
	INAPP_NOTIFICATION = 'notifications.inapp',
	PUSH_NOTIFICATION = 'notifications.push',
}
