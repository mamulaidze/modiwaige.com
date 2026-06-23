import type {
  ProfilePost,
  ReservedItem,
} from '@/features/account/api/profile-api';

export type ChatInboxRow = {
  id: string;
  counterpartName: string;
  itemTitle: string;
  role: 'owner' | 'requester';
  status: 'accepted';
  createdAt: string;
};

export function buildChatInboxRows(
  reservedItems: ReservedItem[],
  posts: ProfilePost[],
): ChatInboxRow[] {
  const requesterRows: ChatInboxRow[] = reservedItems
    .filter((reservation) => reservation.status === 'accepted' && reservation.post)
    .map((reservation) => ({
      id: reservation.id,
      counterpartName: reservation.post?.ownerName ?? 'Gaachuqe member',
      itemTitle: reservation.post?.title ?? 'Unavailable item',
      role: 'requester',
      status: 'accepted',
      createdAt: reservation.createdAt,
    }));

  const ownerRows: ChatInboxRow[] = posts.flatMap((post) =>
    post.reservations
      .filter((reservation) => reservation.status === 'accepted')
      .map((reservation) => ({
        id: reservation.id,
        counterpartName: reservation.requesterName,
        itemTitle: post.title,
        role: 'owner',
        status: 'accepted',
        createdAt: reservation.createdAt,
      })),
  );

  return [...requesterRows, ...ownerRows].sort(
    (first, second) =>
      new Date(second.createdAt).getTime() - new Date(first.createdAt).getTime(),
  );
}
