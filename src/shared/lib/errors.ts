const fallbackMessage = 'Please try again.';
const knownFriendlyMessages = new Set([
  'This item is no longer available.',
  'Log in to reserve this item.',
  'Reservation was not found.',
  'Post was not found.',
  'Instant reservation RPC is not available to this Supabase API role yet. Grant execute to public, reload the schema cache, and try again.',
  'Instant reservation RPC permission is still blocked. Grant execute to public, reload the schema cache, and try again.',
  'Instant reservation is available to admins only during demo testing.',
  'Owners cannot reserve their own posts.',
  'This item is not available.',
  'You cannot reserve or post items yet because you recently cancelled a reservation.',
  'Log in to report this item.',
  'Image compression failed.',
]);

type ErrorPattern = {
  message: string;
  patterns: RegExp[];
};

const errorPatterns: ErrorPattern[] = [
  {
    message: 'Email or password is incorrect.',
    patterns: [
      /invalid login credentials/i,
      /invalid credentials/i,
      /invalid email or password/i,
    ],
  },
  {
    message: 'An account with this email already exists.',
    patterns: [
      /email.*already.*registered/i,
      /already.*registered/i,
      /user.*already.*exists/i,
      /already.*exists/i,
      /duplicate key/i,
    ],
  },
  {
    message: 'Use a stronger password.',
    patterns: [
      /weak password/i,
      /password.*weak/i,
      /password.*at least/i,
      /password.*characters/i,
    ],
  },
  {
    message: 'Confirm your email before logging in.',
    patterns: [/email not confirmed/i, /email.*confirm/i],
  },
  {
    message: 'This link has expired. Please request a new one.',
    patterns: [
      /expired.*token/i,
      /token.*expired/i,
      /invalid.*token/i,
      /jwt.*expired/i,
      /refresh.*token/i,
      /otp.*expired/i,
    ],
  },
  {
    message: 'You do not have permission to do that.',
    patterns: [
      /permission denied/i,
      /row-level security/i,
      /\brls\b/i,
      /not authorized/i,
      /unauthorized/i,
      /forbidden/i,
      /violates row-level security/i,
    ],
  },
  {
    message: 'The selected file is too large.',
    patterns: [
      /file.*too large/i,
      /payload too large/i,
      /entity too large/i,
      /exceeds.*size/i,
      /maximum.*size/i,
    ],
  },
  {
    message: 'Upload failed. Please try again.',
    patterns: [
      /upload/i,
      /storage/i,
      /bucket/i,
      /object.*not found/i,
      /failed to.*file/i,
    ],
  },
  {
    message: 'Check your internet connection and try again.',
    patterns: [
      /failed to fetch/i,
      /network/i,
      /offline/i,
      /internet/i,
      /load failed/i,
      /connection/i,
      /timeout/i,
    ],
  },
  {
    message: 'Fill in all required fields.',
    patterns: [
      /required/i,
      /missing/i,
      /null value/i,
      /not-null/i,
      /not null/i,
      /violates.*constraint/i,
    ],
  },
];

export function getFriendlyErrorMessage(
  error: unknown,
  fallback = fallbackMessage,
) {
  if (isOffline()) {
    return 'Check your internet connection and try again.';
  }

  const penaltyUntil = getReservationPenaltyUntil(error);

  if (penaltyUntil) {
    return `RESERVATION_PENALTY_UNTIL:${penaltyUntil}`;
  }

  const message = getErrorText(error);

  if (!message) {
    return fallback;
  }

  if (message.startsWith('RESERVATION_PENALTY_UNTIL:')) {
    return message;
  }

  if (knownFriendlyMessages.has(message)) {
    return message;
  }

  const match = errorPatterns.find(({ patterns }) =>
    patterns.some((pattern) => pattern.test(message)),
  );

  return match?.message ?? fallback;
}

export function logErrorDetails(context: string, error: unknown) {
  if (import.meta.env.DEV) {
    console.error(context, error);
  }
}

function getErrorText(error: unknown) {
  if (error instanceof Error) {
    return error.message;
  }

  if (typeof error === 'string') {
    return error;
  }

  if (hasMessage(error)) {
    return error.message;
  }

  return '';
}

function hasMessage(value: unknown): value is { message: string } {
  return (
    typeof value === 'object' &&
    value !== null &&
    'message' in value &&
    typeof value.message === 'string'
  );
}

function getReservationPenaltyUntil(error: unknown) {
  if (
    typeof error === 'object' &&
    error !== null &&
    'penaltyUntil' in error &&
    typeof error.penaltyUntil === 'string'
  ) {
    return error.penaltyUntil;
  }

  return null;
}

function isOffline() {
  return typeof navigator !== 'undefined' && navigator.onLine === false;
}
