const configuredSupportEmail = import.meta.env.VITE_SUPPORT_EMAIL as
  | string
  | undefined;

export const supportEmail =
  configuredSupportEmail?.trim() || 'gaachuqegeorgia@gmail.com';

export const supportMailto = `mailto:${supportEmail}`;
