export type ChatOfferType =
  | 'text'
  | 'inquiry'
  | 'exchange_offer'
  | 'price_offer'
  | 'deal_accepted';

export interface ChatMessage {
  id: string;
  conversationId: string;
  senderId: string;
  senderName: string;
  senderAvatar?: string;
  text: string;
  timestamp: string; // ISO string or readable time
  isMine: boolean;
  isRead: boolean;
  offerType?: ChatOfferType;
  proposedExchangeItem?: string;
  proposedPrice?: number;
}

export interface ChatConversation {
  id: string;
  listingId: string;
  listingTitle: string;
  listingImage?: string;
  listingPrice?: number;
  isFree?: boolean;
  wasteType?: string;
  sellerId: string;
  sellerName: string;
  sellerAvatar?: string;
  isOnline?: boolean;
  lastMessageText: string;
  lastMessageTime: string;
  unreadCount: number;
  status: 'active' | 'exchanged' | 'closed';
}

export interface QuickOfferOption {
  label: string;
  text: string;
  offerType: ChatOfferType;
  price?: number;
}
