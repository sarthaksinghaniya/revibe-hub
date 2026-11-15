import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, Sparkles, Check, CheckCheck, ArrowRight, RefreshCw, ShoppingBag, ShieldCheck, Phone, ChevronRight } from 'lucide-react';
import { ChatConversation, ChatMessage, QuickOfferOption } from '@/types/chat';
import { getMessages, sendMessage, markConversationAsRead } from '@/lib/chatStorage';
import { soundFx } from '@/lib/soundFx';
import { toast } from 'sonner';

interface InstagramDmModalProps {
  conversation: ChatConversation | null;
  isOpen: boolean;
  onClose: () => void;
}

const QUICK_OFFERS: QuickOfferOption[] = [
  { label: '👋 Is it available?', text: 'Hi! Is this upcycled item still available?', offerType: 'inquiry' },
  { label: '🔄 Barter Exchange', text: 'Hey, would you be open to an eco-barter exchange with clean scrap materials?', offerType: 'exchange_offer' },
  { label: '🚚 Today Pickup', text: 'I can come pick this up today from campus/your location!', offerType: 'text' },
  { label: '💰 Offer ₹120', text: 'Would you accept ₹120 for this piece?', offerType: 'price_offer', price: 120 },
];

export const InstagramDmModal = ({ conversation, isOpen, onClose }: InstagramDmModalProps) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const loadMessages = () => {
    if (!conversation) return;
    const msgs = getMessages(conversation.id);
    setMessages(msgs);
    markConversationAsRead(conversation.id);
  };

  useEffect(() => {
    if (isOpen && conversation) {
      loadMessages();
    }
  }, [isOpen, conversation]);

  useEffect(() => {
    const handleUpdate = () => {
      if (isOpen && conversation) {
        loadMessages();
      }
    };
    window.addEventListener('w2w_chat_updated', handleUpdate);
    return () => window.removeEventListener('w2w_chat_updated', handleUpdate);
  }, [isOpen, conversation]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  if (!isOpen || !conversation) return null;

  const handleSend = (textToSend?: string, offerType: ChatMessage['offerType'] = 'text') => {
    const text = (textToSend || inputText).trim();
    if (!text) return;

    soundFx.playSuccessTone();
    sendMessage(conversation.id, text, {
      offerType,
      isMine: true,
      senderName: 'You',
    });
    setInputText('');
    loadMessages();

    // Trigger realistic AI seller auto-reply after 1.4s
    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
      let replyText = 'Thanks for your message! Sounds good to me.';
      let replyType: ChatMessage['offerType'] = 'text';

      if (text.toLowerCase().includes('available')) {
        replyText = `Yes, the "${conversation.listingTitle}" is available! You can inspect the upcycled build in 3D too.`;
      } else if (text.toLowerCase().includes('exchange') || text.toLowerCase().includes('barter')) {
        replyText = 'I would love to barter! Clean PET bottles or e-waste scrap are super welcome. Where are you located?';
        replyType = 'exchange_offer';
      } else if (text.toLowerCase().includes('offer') || text.toLowerCase().includes('₹')) {
        replyText = 'That offer works for me! Happy to pass this on to someone who appreciates zero-waste craftsmanship.';
        replyType = 'deal_accepted';
        soundFx.playCoinSound();
      } else if (text.toLowerCase().includes('pickup') || text.toLowerCase().includes('today')) {
        replyText = 'Perfect! I am around campus until 5:30 PM. Let me know when you arrive.';
      }

      sendMessage(conversation.id, replyText, {
        offerType: replyType,
        isMine: false,
        senderName: conversation.sellerName,
      });
      loadMessages();
    }, 1400);
  };

  const handleAcceptDeal = (msg: ChatMessage) => {
    soundFx.playCoinSound();
    sendMessage(conversation.id, '🎉 Exchange deal confirmed! Marking this listing as connected.', {
      offerType: 'deal_accepted',
      isMine: true,
      senderName: 'You',
    });
    toast.success('🎉 Barter Exchange Confirmed! Added to your sustainability achievements.');
    loadMessages();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-background/80 backdrop-blur-md">
        <motion.div
          className="relative w-full max-w-lg h-[92vh] sm:h-[84vh] max-h-[760px] flex flex-col rounded-3xl bg-card border border-emerald-500/30 shadow-2xl overflow-hidden"
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ duration: 0.2 }}
        >
          {/* Instagram-Style Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-card/90 backdrop-blur-md z-10">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-10 h-10 rounded-full p-0.5 bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600">
                  <div className="w-full h-full rounded-full overflow-hidden bg-background">
                    {conversation.sellerAvatar ? (
                      <img src={conversation.sellerAvatar} alt={conversation.sellerName} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-xs font-bold text-foreground">
                        {conversation.sellerName.slice(0, 2).toUpperCase()}
                      </div>
                    )}
                  </div>
                </div>
                {conversation.isOnline && (
                  <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-400 ring-2 ring-background" />
                )}
              </div>

              <div>
                <div className="flex items-center gap-1.5">
                  <h3 className="text-sm font-display font-bold text-foreground">{conversation.sellerName}</h3>
                  <ShieldCheck size={14} className="text-emerald-400" />
                </div>
                <p className="text-[10px] font-data text-emerald-400 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Active now · Smart Exchange
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-surface-alt hover:bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
            >
              <X size={18} />
            </button>
          </div>

          {/* Mini Pinned Listing Banner */}
          <div className="px-4 py-2 bg-emerald-500/10 border-b border-emerald-500/20 flex items-center justify-between">
            <div className="flex items-center gap-2.5 min-w-0">
              {conversation.listingImage ? (
                <img src={conversation.listingImage} alt={conversation.listingTitle} className="w-8 h-8 rounded-lg object-cover flex-shrink-0" />
              ) : (
                <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center text-sm flex-shrink-0">♻️</div>
              )}
              <div className="truncate">
                <p className="text-xs font-display font-bold text-foreground truncate">{conversation.listingTitle}</p>
                <p className="text-[10px] font-data text-emerald-400">
                  {conversation.isFree ? 'Free Exchange' : `₹${conversation.listingPrice}`}
                  {conversation.wasteType && ` · ${conversation.wasteType}`}
                </p>
              </div>
            </div>
            <span className="text-[10px] font-data uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              Barter Item
            </span>
          </div>

          {/* Messages Feed */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {/* Context Notice */}
            <div className="text-center py-2">
              <span className="inline-block px-3 py-1 rounded-full bg-muted/60 text-[10px] font-data text-muted-foreground border border-border/50">
                🔒 Direct Encrypted Exchange Channel
              </span>
            </div>

            {messages.map((m) => (
              <motion.div
                key={m.id}
                className={`flex flex-col ${m.isMine ? 'items-end' : 'items-start'}`}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.15 }}
              >
                <div
                  className={`max-w-[82%] px-4 py-2.5 rounded-2xl text-xs leading-relaxed shadow-sm ${
                    m.isMine
                      ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-br-xs'
                      : 'bg-surface-alt text-foreground border border-border rounded-bl-xs'
                  }`}
                >
                  <p>{m.text}</p>

                  {/* Special Offer / Barter Pill */}
                  {m.offerType === 'exchange_offer' && !m.isMine && (
                    <div className="mt-2 pt-2 border-t border-white/20 flex items-center justify-between gap-2">
                      <span className="text-[10px] font-data opacity-90">Proposed Barter Swap</span>
                      <button
                        onClick={() => handleAcceptDeal(m)}
                        className="px-2.5 py-1 rounded-md bg-white text-zinc-950 text-[10px] font-display font-bold hover:bg-zinc-100 transition-colors shadow-sm"
                      >
                        Accept Deal
                      </button>
                    </div>
                  )}

                  {m.offerType === 'deal_accepted' && (
                    <div className="mt-1.5 flex items-center gap-1 text-[10px] font-data text-emerald-200">
                      <Sparkles size={11} />
                      <span>Smart Exchange Confirmed</span>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-1 mt-1 px-1">
                  <span className="text-[9px] font-data text-muted-foreground">{m.timestamp}</span>
                  {m.isMine && (
                    <span className="text-emerald-400">
                      <CheckCheck size={11} />
                    </span>
                  )}
                </div>
              </motion.div>
            ))}

            {/* Typing Indicator */}
            {isTyping && (
              <motion.div
                className="flex items-center gap-1 px-3 py-2 rounded-2xl bg-surface-alt border border-border w-16"
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-bounce" />
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-bounce [animation-delay:0.2s]" />
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-bounce [animation-delay:0.4s]" />
              </motion.div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick Offer Pills */}
          <div className="px-3 py-1.5 border-t border-border/60 bg-card/60 overflow-x-auto flex items-center gap-1.5 no-scrollbar">
            {QUICK_OFFERS.map((q, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleSend(q.text, q.offerType)}
                className="flex-shrink-0 px-2.5 py-1 rounded-full bg-surface-alt hover:bg-emerald-500/15 border border-border hover:border-emerald-500/30 text-[11px] font-data text-foreground/80 hover:text-emerald-400 transition-all"
              >
                {q.label}
              </button>
            ))}
          </div>

          {/* Input Bar */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="p-3 border-t border-border bg-card flex items-center gap-2"
          >
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder={`Message ${conversation.sellerName}...`}
              className="flex-1 px-4 py-2.5 rounded-full bg-surface-alt border border-border text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-emerald-500/50 transition-colors"
            />
            <button
              type="submit"
              disabled={!inputText.trim()}
              className="w-9 h-9 rounded-full bg-emerald-500 text-zinc-950 flex items-center justify-center disabled:opacity-40 disabled:cursor-not-allowed hover:bg-emerald-400 transition-all flex-shrink-0"
            >
              <Send size={15} />
            </button>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
