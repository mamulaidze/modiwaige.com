const configuredSupportEmail = import.meta.env.VITE_SUPPORT_EMAIL as
  | string
  | undefined;

export const supportEmail =
  configuredSupportEmail?.trim() || 'support@gaachuqe.com';

export const supportMailto = `mailto:${supportEmail}`;
