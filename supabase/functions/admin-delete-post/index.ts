import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

type DeletePostResponse = {
  deletedImageCount: number;
  deletedPostId: string;
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
    return Response.json(
      { error: 'Method not allowed.' },
      { headers: corsHeaders, status: 405 },
    );
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

  if (!supabaseUrl || !serviceRoleKey) {
    return Response.json(
      { error: 'Supabase environment is not configured.' },
      { headers: corsHeaders, status: 500 },
    );
  }

  const authorization = request.headers.get('Authorization');

  if (!authorization) {
    return Response.json(
      { error: 'Missing authorization header.' },
      { headers: corsHeaders, status: 401 },
    );
  }

  let body: { postId?: string };

  try {
    body = await request.json();
  } catch {
    return Response.json(
      { error: 'Invalid JSON body.' },
      { headers: corsHeaders, status: 400 },
    );
  }

  if (!body.postId) {
    return Response.json(
      { error: 'postId is required.' },
      { headers: corsHeaders, status: 400 },
    );
  }

  const userClient = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false },
    global: { headers: { Authorization: authorization } },
  });

  const { data: isAdmin, error: authError } = await userClient.rpc('is_admin');

  if (authError) {
    return Response.json(
      { error: authError.message },
      { headers: corsHeaders, status: 401 },
    );
  }

  if (!isAdmin) {
    return Response.json(
      { error: 'Admin access is required.' },
      { headers: corsHeaders, status: 403 },
    );
  }

  const adminClient = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false },
  });

  const { data: images, error: imagesError } = await adminClient
    .from('post_images')
    .select('storage_path')
    .eq('post_id', body.postId);

  if (imagesError) {
    return Response.json(
      { error: imagesError.message },
      { headers: corsHeaders, status: 500 },
    );
  }

  const storagePaths = (images ?? []).map((image) => image.storage_path);

  if (storagePaths.length > 0) {
    const { error: storageError } = await adminClient.storage
      .from('post-images')
      .remove(storagePaths);

    if (storageError) {
      return Response.json(
        { error: storageError.message },
        { headers: corsHeaders, status: 500 },
      );
    }
  }

  const { error: deleteError } = await adminClient
    .from('posts')
    .delete()
    .eq('id', body.postId);

  if (deleteError) {
    return Response.json(
      { error: deleteError.message },
      { headers: corsHeaders, status: 500 },
    );
  }

  return Response.json(
    {
      deletedImageCount: storagePaths.length,
      deletedPostId: body.postId,
    } satisfies DeletePostResponse,
    { headers: corsHeaders },
  );
});
