const configuredSupportEmail = import.meta.env.VITE_SUPPORT_EMAIL as
  | string
  | undefined;
const configuredInstagramUrl = import.meta.env.VITE_INSTAGRAM_URL as
  | string
  | undefined;

export const supportEmail =
  configuredSupportEmail?.trim() || 'gaachuqegeorgia@gmail.com';

export const supportMailto = `mailto:${supportEmail}`;

export const instagramUrl =
  configuredInstagramUrl?.trim() || 'https://www.instagram.com/gaachuqe_/';
