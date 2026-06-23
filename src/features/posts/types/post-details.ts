import type { FeedCategory, FeedStatus } from '@/features/feed/types/feed';

export type PostDetailsImage = {
  id: string;
  storagePath: string;
  url: string | null;
};

export type PostOwner = {
  id: string;
  displayName: string;
  location: string;
  avatarUrl: string | null;
  phoneNumber: string | null;
};

export type ReservationStatus =
  | 'pending'
  | 'accepted'
  | 'declined'
  | 'cancelled'
  | 'completed';

export type PostReservation = {
  id: string;
  requesterId: string;
  requesterName: string;
  requesterPhoneNumber: string | null;
  status: ReservationStatus;
  expiresAt: string | null;
  createdAt: string;
};

export type PostDetails = {
  id: string;
  ownerId: string;
  title: string;
  description: string;
  category: FeedCategory;
  condition: 'new' | 'good' | 'used' | 'needs_repair';
  location: string;
  status: FeedStatus;
  createdAt: string;
  expiresAt: string;
  boostExpiresAt: string | null;
  isBoosted: boolean;
  images: PostDetailsImage[];
  owner: PostOwner | null;
  reservations: PostReservation[];
  activeReservation: PostReservation | null;
};
