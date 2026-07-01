import { supabase } from '@/shared/lib/supabase';

import type { PostDetails, ReservationStatus } from '../types/post-details';
import type { CreatePostFormValues } from '../validation/create-post-schema';

type PostDetailsRow = {
  id: string;
  owner_id: string;
  title: string;
  description: string;
  category: PostDetails['category'];
  condition: PostDetails['condition'];
  location: string;
  status: PostDetails['status'] | 'archived';
  created_at: string;
  expires_at: string;
  boost_expires_at: string | null;
  profiles: {
    id: string;
    display_name: string;
    location: string;
    avatar_url: string | null;
    phone_number: string | null;
  } | null;
  post_images: Array<{
    id: string;
    storage_path: string;
    sort_order: number;
  }> | null;
  reservations: Array<{
    id: string;
    requester_id: string;
    status: ReservationStatus;
    expires_at: string | null;
    created_at: string;
    requester: {
      display_name: string;
      phone_number: string | null;
    } | null;
  }> | null;
};

export class ReservationPenaltyError extends Error {
  readonly penaltyUntil: string;

  constructor(penaltyUntil: string) {
    super(
      'You cannot reserve or post items yet because you recently cancelled a reservation.',
    );
    this.name = 'ReservationPenaltyError';
    this.penaltyUntil = penaltyUntil;
  }
}

export async function fetchPostDetails(postId: string): Promise<PostDetails> {
  const { data, error } = await supabase
    .from('posts')
    .select(
      `
        id,
        owner_id,
        title,
        description,
        category,
        condition,
        location,
        status,
        created_at,
        expires_at,
        boost_expires_at,
        profiles (
          id,
          display_name,
          location,
          avatar_url,
          phone_number
        ),
        post_images (
          id,
          storage_path,
          sort_order
        ),
        reservations (
          id,
          requester_id,
          status,
          expires_at,
          created_at,
          requester:profiles!reservations_requester_id_fkey (
            display_name,
            phone_number
          )
        )
      `,
    )
    .eq('id', postId)
    .single();

  if (error) {
    throw new Error(error.message);
  }

  const row = data as unknown as PostDetailsRow;

  if (row.status === 'archived') {
    throw new Error('This item is no longer available.');
  }

  const sortedImages = [...(row.post_images ?? [])].sort(
    (first, second) => first.sort_order - second.sort_order,
  );

  const images = await Promise.all(
    sortedImages.map(async (image) => ({
      id: image.id,
      storagePath: image.storage_path,
      url: await createSignedImageUrl(image.storage_path),
    })),
  );

  const reservations = (row.reservations ?? [])
    .map((reservation) => ({
      id: reservation.id,
      requesterId: reservation.requester_id,
      requesterName: reservation.requester?.display_name ?? 'Gaachuqe member',
      requesterPhoneNumber: reservation.requester?.phone_number ?? null,
      status: reservation.status,
      expiresAt: reservation.expires_at,
      createdAt: reservation.created_at,
    }))
    .sort(
      (first, second) =>
        new Date(second.createdAt).getTime() -
        new Date(first.createdAt).getTime(),
    );
  const activeReservation =
    reservations.find(
      (reservation) =>
        reservation.status === 'accepted' && Boolean(reservation.expiresAt),
    ) ?? null;

  return {
    id: row.id,
    ownerId: row.owner_id,
    title: row.title,
    description: row.description,
    category: row.category,
    condition: row.condition,
    location: row.location,
    status: row.status,
    createdAt: row.created_at,
    expiresAt: row.expires_at,
    boostExpiresAt: row.boost_expires_at,
    isBoosted:
      Boolean(row.boost_expires_at) &&
      new Date(row.boost_expires_at ?? 0).getTime() > Date.now(),
    images,
    owner: row.profiles
      ? {
          id: row.profiles.id,
          displayName: row.profiles.display_name,
          location: row.profiles.location,
          avatarUrl: row.profiles.avatar_url,
          phoneNumber: row.profiles.phone_number,
        }
      : null,
    reservations,
    activeReservation,
  };
}

export async function reservePost(postId: string) {
  const { error } = await supabase.functions.invoke('reserve-post-free', {
    body: { postId },
    method: 'POST',
  });

  if (error) {
    throw getReservationRpcError({
      message: await getFunctionErrorMessage(error),
    });
  }
}

export async function reservePostInstantDemo(postId: string) {
  const { error } = await supabase.functions.invoke('reserve-post-paid-demo', {
    body: { postId },
    method: 'POST',
  });

  if (error) {
    throw getReservationRpcError(
      { message: await getFunctionErrorMessage(error) },
      'instant',
    );
  }
}

export async function cancelReservation(reservationId: string) {
  const { error } = await supabase.rpc('cancel_reservation', {
    target_reservation_id: reservationId,
  });

  if (error) {
    throw new Error(error.message);
  }
}

export async function markPostGiven(postId: string) {
  const { error } = await supabase.rpc('mark_post_given', {
    target_post_id: postId,
  });

  if (error) {
    throw new Error(error.message);
  }
}

export async function manageReservation(
  reservationId: string,
  nextStatus: 'accepted' | 'declined' | 'cancelled' | 'completed',
) {
  const { error } = await supabase.rpc('manage_reservation', {
    target_reservation_id: reservationId,
    next_status: nextStatus,
  });

  if (error) {
    throw new Error(error.message);
  }
}

export async function deletePost(post: PostDetails) {
  const storagePaths = post.images.map((image) => image.storagePath);

  if (storagePaths.length > 0) {
    const { error: storageError } = await supabase.storage
      .from('post-images')
      .remove(storagePaths);

    if (storageError) {
      throw new Error(storageError.message);
    }
  }

  const { error } = await supabase.from('posts').delete().eq('id', post.id);

  if (error) {
    throw new Error(error.message);
  }
}

export async function updatePostDetails(
  postId: string,
  values: Omit<CreatePostFormValues, 'photos'>,
) {
  const { error } = await supabase
    .from('posts')
    .update({
      title: values.title,
      description: values.description,
      category: values.category,
      location: values.city,
    })
    .eq('id', postId);

  if (error) {
    throw new Error(error.message);
  }
}

export async function createPostReport(input: {
  body: string;
  postId: string;
  reporterId: string;
  subject: string;
}) {
  const { error } = await supabase.from('reports').insert({
    body: input.body,
    post_id: input.postId,
    reporter_id: input.reporterId,
    subject: input.subject,
  });

  if (error) {
    throw new Error(error.message);
  }
}

async function createSignedImageUrl(storagePath: string) {
  const { data, error } = await supabase.storage
    .from('post-images')
    .createSignedUrl(storagePath, 600);

  if (error) {
    console.error('Unable to create post image URL', error);
    return null;
  }

  return data.signedUrl;
}

function getReservationRpcError(
  error: { message?: string; code?: string; details?: string | null },
  mode: 'free' | 'instant' = 'free',
) {
  const message = getReservationErrorText(error);
  const penaltyUntil = getReservationPenaltyUntil(message);

  if (penaltyUntil) {
    return new ReservationPenaltyError(penaltyUntil);
  }

  return new Error(getReservationRpcErrorMessage(error, mode));
}

function getReservationRpcErrorMessage(
  error: { message?: string; code?: string; details?: string | null },
  mode: 'free' | 'instant' = 'free',
) {
  const message = getReservationErrorText(error);

  if (
    mode === 'instant' &&
    /schema cache|could not find.*function|function.*does not exist|pgrst202/i.test(
      message,
    )
  ) {
    return 'Instant reservation RPC is not available to this Supabase API role yet. Grant execute to public, reload the schema cache, and try again.';
  }

  if (mode === 'instant' && /permission denied/i.test(message)) {
    return 'Instant reservation RPC permission is still blocked. Grant execute to public, reload the schema cache, and try again.';
  }

  if (/authentication is required|not authenticated/i.test(message)) {
    return 'Log in to reserve this item.';
  }

  if (/admins only|admin/i.test(message)) {
    return 'Instant reservation is available to admins only during demo testing.';
  }

  if (/phone number|mobile phone/i.test(message)) {
    return 'Add phone number';
  }

  if (/owner.*own|owners cannot reserve/i.test(message)) {
    return 'Owners cannot reserve their own posts.';
  }

  if (
    /already requested|already have.*reservation|reservations_one_active_per_post_requester/i.test(
      message,
    )
  ) {
    return 'You already requested this item.';
  }

  if (/already reserved/i.test(message)) {
    return 'This item is already reserved.';
  }

  if (/not available/i.test(message)) {
    return 'This item is not available.';
  }

  if (/reserve or post items again after|5 hours|penalty/i.test(message)) {
    return 'You cannot reserve or post items yet because you recently cancelled a reservation.';
  }

  if (message.trim()) {
    return message;
  }

  return 'Could not reserve item.';
}

function getReservationErrorText(error: {
  message?: string;
  code?: string;
  details?: string | null;
}) {
  return [error.message, error.details, error.code].filter(Boolean).join(' ');
}

function getReservationPenaltyUntil(message: string) {
  const match = message.match(
    /after\s+([0-9]{4}-[0-9]{2}-[0-9]{2}[T\s][0-9:.+-]+Z?)/i,
  );

  if (!match?.[1]) {
    return null;
  }

  const rawValue = match[1].trim().replace(/\.$/, '');
  const normalizedValue = rawValue
    .replace(' ', 'T')
    .replace(/([+-]\d{2})$/, '$1:00');
  const date = new Date(normalizedValue);

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return date.toISOString();
}

async function getFunctionErrorMessage(error: unknown) {
  const fallback =
    error instanceof Error ? error.message : 'Edge function request failed.';
  const response = (error as { context?: unknown }).context;

  if (!(response instanceof Response)) {
    return fallback;
  }

  try {
    const payload = (await response.clone().json()) as { error?: unknown };

    if (typeof payload.error === 'string' && payload.error.trim()) {
      return payload.error;
    }
  } catch {
    try {
      const text = await response.clone().text();

      if (text.trim()) {
        return text;
      }
    } catch {
      return fallback;
    }
  }

  return fallback;
}
