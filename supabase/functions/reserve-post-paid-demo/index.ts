import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

type RequestBody = {
  postId?: string;
};

type ProfileRow = {
  id: string;
  display_name: string;
  phone_number: string | null;
  role: 'member' | 'admin';
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

  const [{ data: currentProfileId, error: profileIdError }, { data: isAdmin, error: adminError }] =
    await Promise.all([
      userClient.rpc('current_profile_id'),
      userClient.rpc('is_admin'),
    ]);

  if (profileIdError) {
    return jsonError(profileIdError.message, 401);
  }

  if (adminError) {
    return jsonError(adminError.message, 401);
  }

  if (!currentProfileId) {
    return jsonError('Authentication is required.', 401);
  }

  if (!isAdmin) {
    return jsonError(
      'Instant reservation is available to admins only during demo testing.',
      403,
    );
  }

  const adminClient = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false },
  });

  const { data: requester, error: requesterError } = await adminClient
    .from('profiles')
    .select('id, display_name, phone_number, role')
    .eq('id', currentProfileId)
    .single<ProfileRow>();

  if (requesterError) {
    return jsonError(requesterError.message, 500);
  }

  if (requester.role !== 'admin') {
    return jsonError(
      'Instant reservation is available to admins only during demo testing.',
      403,
    );
  }

  if (!requester.phone_number) {
    return jsonError(
      'A mobile phone number is required before reserving items.',
      400,
    );
  }

  const { data: penaltyUntil, error: penaltyError } = await adminClient.rpc(
    'reservation_penalty_until',
    { target_profile_id: currentProfileId },
  );

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

  const { data: reservedPost, error: reservePostError } = await adminClient
    .from('posts')
    .update({ status: 'reserved' })
    .eq('id', post.id)
    .eq('status', 'available')
    .select('id, owner_id, title')
    .single<PostRow>();

  if (reservePostError || !reservedPost) {
    return jsonError('This item is not available.', 409);
  }

  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
  const { data: reservation, error: reservationError } = await adminClient
    .from('reservations')
    .insert({
      expires_at: expiresAt,
      owner_id: reservedPost.owner_id,
      post_id: reservedPost.id,
      requester_id: currentProfileId,
      status: 'accepted',
    })
    .select()
    .single();

  if (reservationError) {
    await adminClient
      .from('posts')
      .update({ status: 'available' })
      .eq('id', reservedPost.id)
      .eq('status', 'reserved');

    return jsonError(reservationError.message, 500);
  }

  const { error: conversationError } = await adminClient
    .from('conversations')
    .upsert(
      {
        closed_at: null,
        owner_id: reservedPost.owner_id,
        post_id: reservedPost.id,
        requester_id: currentProfileId,
        reservation_id: reservation.id,
        status: 'active',
      },
      { onConflict: 'reservation_id' },
    );

  if (conversationError) {
    await adminClient.from('reservations').delete().eq('id', reservation.id);
    await adminClient
      .from('posts')
      .update({ status: 'available' })
      .eq('id', reservedPost.id)
      .eq('status', 'reserved');

    return jsonError(conversationError.message, 500);
  }

  await adminClient
    .from('reservations')
    .update({ status: 'declined', updated_at: new Date().toISOString() })
    .eq('post_id', reservedPost.id)
    .neq('id', reservation.id)
    .eq('status', 'pending');

  await adminClient.from('notifications').insert([
    {
      body: `${requester.display_name || 'A member'} instantly reserved "${reservedPost.title}" in demo mode.`,
      post_id: reservedPost.id,
      recipient_id: reservedPost.owner_id,
      reservation_id: reservation.id,
      title: 'Instant reservation created',
      type: 'reservation_accepted',
    },
    {
      body: 'Your instant demo reservation was accepted. The owner can still cancel it.',
      post_id: reservedPost.id,
      recipient_id: currentProfileId,
      reservation_id: reservation.id,
      title: 'Reservation accepted',
      type: 'reservation_accepted',
    },
  ]);

  return Response.json({ reservation }, { headers: corsHeaders });
});

function jsonError(message: string, status: number) {
  return Response.json({ error: message }, { headers: corsHeaders, status });
}
