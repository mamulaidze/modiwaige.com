import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

type RequestBody = {
  postId?: string;
};

type ProfileRow = {
  id: string;
  display_name: string;
  phone_number: string | null;
};

type PostRow = {
  id: string;
  owner_id: string;
  status: string;
  title: string;
};

const corsHeaders = {
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Origin': '*',
};

Deno.serve(async (request) => {
  if (request.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  if (request.method !== 'POST') {
    return jsonError('Method not allowed.', 405);
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

  if (!supabaseUrl || !serviceRoleKey) {
    return jsonError('Supabase environment is not configured.', 500);
  }

  const authorization = request.headers.get('Authorization');

  if (!authorization) {
    return jsonError('Missing authorization header.', 401);
  }

  let body: RequestBody;

  try {
    body = await request.json();
  } catch {
    return jsonError('Invalid JSON body.', 400);
  }

  if (!body.postId) {
    return jsonError('postId is required.', 400);
  }

  const userClient = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false },
    global: { headers: { Authorization: authorization } },
  });

  const { data: currentProfileId, error: profileIdError } =
    await userClient.rpc('current_profile_id');

  if (profileIdError) {
    return jsonError(profileIdError.message, 401);
  }

  if (!currentProfileId) {
    return jsonError('Authentication is required.', 401);
  }

  const adminClient = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false },
  });

  const [
    { data: requester, error: requesterError },
    { data: penaltyUntil, error: penaltyError },
  ] = await Promise.all([
    adminClient
      .from('profiles')
      .select('id, display_name, phone_number')
      .eq('id', currentProfileId)
      .single<ProfileRow>(),
    adminClient.rpc('reservation_penalty_until', {
      target_profile_id: currentProfileId,
    }),
  ]);

  if (requesterError) {
    return jsonError(requesterError.message, 500);
  }

  if (!requester.phone_number) {
    return jsonError(
      'A mobile phone number is required before reserving items.',
      400,
    );
  }

  if (penaltyError) {
    return jsonError(penaltyError.message, 500);
  }

  if (penaltyUntil) {
    return jsonError(
      `You can reserve or post items again after ${penaltyUntil}.`,
      403,
    );
  }

  const { data: post, error: postError } = await adminClient
    .from('posts')
    .select('id, owner_id, status, title')
    .eq('id', body.postId)
    .single<PostRow>();

  if (postError) {
    return jsonError(postError.message, 404);
  }

  if (post.owner_id === currentProfileId) {
    return jsonError('Owners cannot reserve their own posts.', 400);
  }

  if (post.status !== 'available') {
    return jsonError('This item is not available.', 409);
  }

  const { data: existingReservation, error: existingReservationError } =
    await adminClient
      .from('reservations')
      .select('id, status')
      .eq('post_id', post.id)
      .eq('requester_id', currentProfileId)
      .in('status', ['pending', 'accepted'])
      .maybeSingle();

  if (existingReservationError) {
    return jsonError(existingReservationError.message, 500);
  }

  if (existingReservation) {
    return jsonError('You already requested this item.', 409);
  }

  const { data: acceptedReservation, error: acceptedReservationError } =
    await adminClient
      .from('reservations')
      .select('id')
      .eq('post_id', post.id)
      .eq('status', 'accepted')
      .limit(1)
      .maybeSingle();

  if (acceptedReservationError) {
    return jsonError(acceptedReservationError.message, 500);
  }

  if (acceptedReservation) {
    return jsonError('This item is already reserved.', 409);
  }

  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
  const { data: reservation, error: reservationError } = await adminClient
    .from('reservations')
    .insert({
      expires_at: expiresAt,
      owner_id: post.owner_id,
      post_id: post.id,
      requester_id: currentProfileId,
      status: 'pending',
    })
    .select()
    .single();

  if (reservationError) {
    return jsonError(reservationError.message, 500);
  }

  const { error: notificationError } = await adminClient
    .from('notifications')
    .insert({
      body: `${requester.display_name || 'A member'} reserved "${post.title}".`,
      post_id: post.id,
      recipient_id: post.owner_id,
      reservation_id: reservation.id,
      title: 'New reservation request',
      type: 'reservation_requested',
    });

  if (notificationError) {
    await adminClient.from('reservations').delete().eq('id', reservation.id);
    return jsonError(notificationError.message, 500);
  }

  return Response.json({ reservation }, { headers: corsHeaders });
});

function jsonError(message: string, status: number) {
  return Response.json({ error: message }, { headers: corsHeaders, status });
}
