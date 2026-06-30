import { supabase } from '@/shared/lib/supabase';

export type ChatMessage = {
  id: string;
  senderId: string;
  body: string;
  createdAt: string;
};

export type ChatContext = {
  conversationId: string;
  reservationId: string;
  postId: string;
  postTitle: string;
  ownerId: string;
  ownerName: string;
  requesterId: string;
  requesterName: string;
  status: 'active' | 'closed';
  reservationStatus:
    | 'pending'
    | 'accepted'
    | 'declined'
    | 'cancelled'
    | 'completed';
  expiresAt: string | null;
  messages: ChatMessage[];
};

export async function fetchChatContext(
  reservationId: string,
): Promise<ChatContext> {
  const { data: conversation, error: conversationError } = await supabase
    .from('conversations')
    .select(
      'id, reservation_id, post_id, owner_id, requester_id, status, closed_at',
    )
    .eq('reservation_id', reservationId)
    .limit(1)
    .then(({ data, error }) => ({
      data: data?.[0] ?? null,
      error,
    }));

  if (conversationError) {
    throw new Error(conversationError.message);
  }

  if (!conversation) {
    throw new Error('Chat is not ready yet. Please try again in a moment.');
  }

  const [reservationResult, postResult, profilesResult, messagesResult] =
    await Promise.all([
      supabase
        .from('reservations')
        .select('status, expires_at')
        .eq('id', reservationId)
        .single(),
      supabase
        .from('posts')
        .select('title')
        .eq('id', conversation.post_id)
        .single(),
      supabase
        .from('profiles')
        .select('id, display_name')
        .in('id', [conversation.owner_id, conversation.requester_id]),
      supabase
        .from('messages')
        .select('id, sender_id, body, created_at')
        .eq('conversation_id', conversation.id)
        .order('created_at', { ascending: true })
        .limit(200),
    ]);

  const error =
    reservationResult.error ??
    postResult.error ??
    profilesResult.error ??
    messagesResult.error;

  if (error) {
    throw new Error(error.message);
  }

  if (!reservationResult.data || !postResult.data) {
    throw new Error('Chat details could not be loaded.');
  }

  const profiles = profilesResult.data ?? [];
  const owner = profiles.find(
    (profile) => profile.id === conversation.owner_id,
  );
  const requester = profiles.find(
    (profile) => profile.id === conversation.requester_id,
  );

  return {
    conversationId: conversation.id,
    reservationId: conversation.reservation_id,
    postId: conversation.post_id,
    postTitle: postResult.data.title,
    ownerId: conversation.owner_id,
    ownerName: owner?.display_name ?? 'Gaachuqe member',
    requesterId: conversation.requester_id,
    requesterName: requester?.display_name ?? 'Gaachuqe member',
    status: conversation.status,
    reservationStatus: reservationResult.data.status,
    expiresAt: reservationResult.data.expires_at,
    messages: (messagesResult.data ?? []).map((message) => ({
      id: message.id,
      senderId: message.sender_id,
      body: message.body,
      createdAt: message.created_at,
    })),
  };
}

export async function sendChatMessage(
  reservationId: string,
  messageBody: string,
) {
  const { data, error } = await supabase.rpc('send_chat_message', {
    target_reservation_id: reservationId,
    message_body: messageBody,
  });

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

export async function markChatNotificationsRead(
  reservationId: string,
  userId: string,
) {
  const { error } = await supabase
    .from('notifications')
    .update({ read_at: new Date().toISOString() })
    .eq('recipient_id', userId)
    .eq('reservation_id', reservationId)
    .eq('type', 'chat_message')
    .is('read_at', null);

  if (error) {
    throw new Error(error.message);
  }
}
