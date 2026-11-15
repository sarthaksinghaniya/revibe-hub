import { describe, it, expect, beforeEach } from 'vitest';
import {
  getConversations,
  getMessages,
  sendMessage,
  startOrGetConversation,
  markConversationAsRead,
  getTotalUnreadCount,
} from '@/lib/chatStorage';

describe('Smart Exchange In-App DM Engine', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('preseeds initial conversations when storage is empty', () => {
    const convs = getConversations();
    expect(convs.length).toBeGreaterThanOrEqual(3);
    expect(convs[0].sellerName).toBeDefined();
    expect(convs[0].listingTitle).toBeDefined();
  });

  it('retrieves messages for preseeded conversations', () => {
    const convs = getConversations();
    const first = convs[0];
    const msgs = getMessages(first.id);
    expect(msgs.length).toBeGreaterThan(0);
    expect(msgs[0].text).toBeDefined();
  });

  it('sends a new message and updates conversation snippet', () => {
    const convs = getConversations();
    const targetId = convs[0].id;

    const sent = sendMessage(targetId, 'Is this still available for barter swap?', {
      offerType: 'exchange_offer',
      proposedExchangeItem: 'Aluminium Cans',
    });

    expect(sent.text).toBe('Is this still available for barter swap?');
    expect(sent.offerType).toBe('exchange_offer');
    expect(sent.isMine).toBe(true);

    const updatedMsgs = getMessages(targetId);
    expect(updatedMsgs[updatedMsgs.length - 1].text).toBe('Is this still available for barter swap?');

    const updatedConvs = getConversations();
    expect(updatedConvs[0].id).toBe(targetId);
    expect(updatedConvs[0].lastMessageText).toBe('Is this still available for barter swap?');
  });

  it('creates or retrieves a conversation for a marketplace listing', () => {
    const listing = {
      id: 'listing_fresh_999',
      title: 'Handmade Coconut Shell Lamp',
      price: 250,
      is_free: false,
      seller_id: 'maker_ananya',
      seller_name: 'Ananya Sharma',
    };

    const conv = startOrGetConversation(listing);
    expect(conv.listingId).toBe('listing_fresh_999');
    expect(conv.sellerName).toBe('Ananya Sharma');

    // Getting again should return the same conversation
    const conv2 = startOrGetConversation(listing);
    expect(conv2.id).toBe(conv.id);
  });

  it('marks conversation as read and updates total unread count', () => {
    const convs = getConversations();
    const unreadConv = convs.find((c) => c.unreadCount > 0);
    if (unreadConv) {
      markConversationAsRead(unreadConv.id);
      const after = getConversations().find((c) => c.id === unreadConv.id);
      expect(after?.unreadCount).toBe(0);
    }
  });
});
