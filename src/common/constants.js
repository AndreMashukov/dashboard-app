export const isProd = process.env.NODE_ENV === 'production';

// key store
export const REFRESH_TOKEN_KEY = isProd ? 'rft' : 'dev_refreshToken';
export const ACCESS_TOKEN_KEY = isProd ? 'at' : 'dev_accessToken';
export const REDIRECT_URL = isProd ? 'redirect_url' : 'dev_redirect_url';
export const USER_INFO_KEY = isProd ? 'user_info' : 'dev_user_info';
