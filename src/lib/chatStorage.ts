import { ChatConversation, ChatMessage, ChatOfferType } from '@/types/chat';

const CONVERSATIONS_KEY = 'w2w_chat_conversations_v1';
const MESSAGES_KEY_PREFIX = 'w2w_chat_messages_v1_';

const DEFAULT_CONVERSATIONS: ChatConversation[] = [
  {
    id: 'conv_planter_01',
    listingId: 'listing_01',
    listingTitle: 'Self-Watering PET Bottle Planter',
    listingImage: 'https://images.unsplash.com/photo-1485955900006-10f4d324d411?auto=format&fit=crop&w=400&q=80',
    listingPrice: 150,
    isFree: false,
    wasteType: 'Plastic Bottle',
    sellerId: 'user_akshara',
    sellerName: 'Akshara Dixit',
    sellerAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=120&q=80',
    isOnline: true,
    lastMessageText: 'Deal! You can pick it up from Campus Block B tomorrow at 3 PM.',
    lastMessageTime: '10m ago',
    unreadCount: 1,
    status: 'active',
  },
  {
    id: 'conv_organizer_02',
    listingId: 'listing_02',
    listingTitle: 'Geometric Cardboard Desk Organizer',
    listingImage: 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=400&q=80',
    listingPrice: 0,
    isFree: true,
    wasteType: 'Cardboard',
    sellerId: 'user_junaid',
    sellerName: 'Junaid Khan',
    sellerAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=120&q=80',
    isOnline: true,
    lastMessageText: 'Yes, this is still available! Would love to exchange for empty copper wires.',
    lastMessageTime: '2h ago',
    unreadCount: 0,
    status: 'active',
  },
  {
    id: 'conv_clock_03',
    listingId: 'listing_03',
    listingTitle: 'Cyberpunk Upcycled PCB Wall Clock',
    listingImage: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=400&q=80',
    listingPrice: 450,
    isFree: false,
    wasteType: 'E-Waste',
    sellerId: 'user_hardik',
    sellerName: 'Hardik Talwar',
    sellerAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=120&q=80',
    isOnline: false,
    lastMessageText: 'Can you offer ₹400 for this?',
    lastMessageTime: '1d ago',
    unreadCount: 0,
    status: 'active',
  },
];

const DEFAULT_MESSAGES: Record<string, ChatMessage[]> = {
  conv_planter_01: [
    {
      id: 'm1',
      conversationId: 'conv_planter_01',
      senderId: 'me',
      senderName: 'You',
      text: 'Hi Akshara! Is this Self-Watering Planter still available?',
      timestamp: '11:15 AM',
      isMine: true,
      isRead: true,
      offerType: 'inquiry',
    },
    {
      id: 'm2',
      conversationId: 'conv_planter_01',
      senderId: 'user_akshara',
      senderName: 'Akshara Dixit',
      senderAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=120&q=80',
      text: 'Hey! Yes it is. Made from two 2L Coke bottles with cotton wicking.',
      timestamp: '11:18 AM',
      isMine: false,
      isRead: true,
      offerType: 'text',
    },
    {
      id: 'm3',
      conversationId: 'conv_planter_01',
      senderId: 'me',
      senderName: 'You',
      text: 'Awesome! Can we do ₹130 or barter for 10 empty glass jars?',
      timestamp: '11:22 AM',
      isMine: true,
      isRead: true,
      offerType: 'price_offer',
      proposedPrice: 130,
    },
    {
      id: 'm4',
      conversationId: 'conv_planter_01',
      senderId: 'user_akshara',
      senderName: 'Akshara Dixit',
      senderAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=120&q=80',
      text: 'Deal! You can pick it up from Campus Block B tomorrow at 3 PM.',
      timestamp: '11:25 AM',
      isMine: false,
      isRead: false,
      offerType: 'deal_accepted',
    },
  ],
  conv_organizer_02: [
    {
      id: 'm5',
      conversationId: 'conv_organizer_02',
      senderId: 'me',
      senderName: 'You',
      text: 'Hello Junaid! Love the origami joints on this cardboard organizer.',
      timestamp: 'Yesterday',
      isMine: true,
      isRead: true,
      offerType: 'text',
    },
    {
      id: 'm6',
      conversationId: 'conv_organizer_02',
      senderId: 'user_junaid',
      senderName: 'Junaid Khan',
      senderAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=120&q=80',
      text: 'Yes, this is still available! Would love to exchange for empty copper wires.',
      timestamp: 'Yesterday',
      isMine: false,
      isRead: true,
      offerType: 'exchange_offer',
      proposedExchangeItem: 'Copper Wires',
    },
  ],
};

function isClient(): boolean {
  return typeof window !== 'undefined' && typeof localStorage !== 'undefined';
}

export function getConversations(): ChatConversation[] {
  if (!isClient()) return DEFAULT_CONVERSATIONS;
  try {
    const raw = localStorage.getItem(CONVERSATIONS_KEY);
    if (!raw) {
      localStorage.setItem(CONVERSATIONS_KEY, JSON.stringify(DEFAULT_CONVERSATIONS));
      // Also preseed default messages
      Object.entries(DEFAULT_MESSAGES).forEach(([cid, msgs]) => {
        localStorage.setItem(MESSAGES_KEY_PREFIX + cid, JSON.stringify(msgs));
      });
      return DEFAULT_CONVERSATIONS;
    }
    return JSON.parse(raw);
  } catch {
    return DEFAULT_CONVERSATIONS;
  }
}

export function saveConversations(convs: ChatConversation[]): void {
  if (!isClient()) return;
  try {
    localStorage.setItem(CONVERSATIONS_KEY, JSON.stringify(convs));
    window.dispatchEvent(new CustomEvent('w2w_chat_updated'));
  } catch (e) {
    console.error('Failed to save conversations:', e);
  }
}

export function getMessages(conversationId: string): ChatMessage[] {
  if (!isClient()) return DEFAULT_MESSAGES[conversationId] || [];
  try {
    const raw = localStorage.getItem(MESSAGES_KEY_PREFIX + conversationId);
    if (!raw) {
      const def = DEFAULT_MESSAGES[conversationId] || [];
      localStorage.setItem(MESSAGES_KEY_PREFIX + conversationId, JSON.stringify(def));
      return def;
    }
    return JSON.parse(raw);
  } catch {
    return DEFAULT_MESSAGES[conversationId] || [];
  }
}

export function saveMessages(conversationId: string, messages: ChatMessage[]): void {
  if (!isClient()) return;
  try {
    localStorage.setItem(MESSAGES_KEY_PREFIX + conversationId, JSON.stringify(messages));
    window.dispatchEvent(new CustomEvent('w2w_chat_updated'));
  } catch (e) {
    console.error('Failed to save messages:', e);
  }
}

export function markConversationAsRead(conversationId: string): void {
  const convs = getConversations();
  const target = convs.find((c) => c.id === conversationId);
  if (target && target.unreadCount > 0) {
    target.unreadCount = 0;
    saveConversations(convs);
  }

  const messages = getMessages(conversationId);
  let changed = false;
  messages.forEach((m) => {
    if (!m.isMine && !m.isRead) {
      m.isRead = true;
      changed = true;
    }
  });
  if (changed) {
    saveMessages(conversationId, messages);
  }
}

export function getTotalUnreadCount(): number {
  const convs = getConversations();
  return convs.reduce((sum, c) => sum + (c.unreadCount || 0), 0);
}

export function sendMessage(
  conversationId: string,
  text: string,
  options?: {
    offerType?: ChatOfferType;
    proposedPrice?: number;
    proposedExchangeItem?: string;
    isMine?: boolean;
    senderName?: string;
  }
): ChatMessage {
  const messages = getMessages(conversationId);
  const now = new Date();
  const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  const newMessage: ChatMessage = {
    id: `msg_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    conversationId,
    senderId: options?.isMine !== false ? 'me' : 'seller',
    senderName: options?.senderName || (options?.isMine !== false ? 'You' : 'Seller'),
    text,
    timestamp: timeStr,
    isMine: options?.isMine !== false,
    isRead: options?.isMine !== false,
    offerType: options?.offerType || 'text',
    proposedPrice: options?.proposedPrice,
    proposedExchangeItem: options?.proposedExchangeItem,
  };

  messages.push(newMessage);
  saveMessages(conversationId, messages);

  // Update conversation record
  const convs = getConversations();
  const cIndex = convs.findIndex((c) => c.id === conversationId);
  if (cIndex !== -1) {
    convs[cIndex].lastMessageText = text;
    convs[cIndex].lastMessageTime = 'Just now';
    if (options?.isMine === false) {
      convs[cIndex].unreadCount = (convs[cIndex].unreadCount || 0) + 1;
    }
    // Bump to top
    const [moved] = convs.splice(cIndex, 1);
    convs.unshift(moved);
    saveConversations(convs);
  }

  return newMessage;
}

export function startOrGetConversation(listing: {
  id: string;
  title: string;
  price?: number;
  is_free?: boolean;
  images?: string[];
  waste_type?: string;
  seller_id?: string;
  seller_name?: string;
}): ChatConversation {
  const convs = getConversations();
  const existing = convs.find((c) => c.listingId === listing.id);
  if (existing) {
    return existing;
  }

  const newId = `conv_${listing.id}_${Date.now().toString(36)}`;
  const newConv: ChatConversation = {
    id: newId,
    listingId: listing.id,
    listingTitle: listing.title,
    listingImage: listing.images && listing.images.length > 0 ? listing.images[0] : undefined,
    listingPrice: listing.price,
    isFree: listing.is_free,
    wasteType: listing.waste_type,
    sellerId: listing.seller_id || 'seller_user',
    sellerName: listing.seller_name || 'Upcycle Creator',
    sellerAvatar: `https://api.dicebear.com/7.x/bottts/svg?seed=${listing.seller_name || listing.id}`,
    isOnline: true,
    lastMessageText: 'Started conversation',
    lastMessageTime: 'Just now',
    unreadCount: 0,
    status: 'active',
  };

  convs.unshift(newConv);
  saveConversations(convs);

  // Seed welcome system message
  const welcomeMsg: ChatMessage = {
    id: `msg_init_${Date.now()}`,
    conversationId: newId,
    senderId: 'seller',
    senderName: newConv.sellerName,
    senderAvatar: newConv.sellerAvatar,
    text: `Hi! Thanks for your interest in "${listing.title}". Feel free to propose a barter exchange or cash offer!`,
    timestamp: 'Just now',
    isMine: false,
    isRead: true,
    offerType: 'text',
  };
  saveMessages(newId, [welcomeMsg]);

  return newConv;
}
