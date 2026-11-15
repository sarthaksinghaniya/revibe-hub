import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { MessageCircle, Search, ShieldCheck, Sparkles, ShoppingBag, ArrowLeft, Send, CheckCheck, RefreshCw } from 'lucide-react';
import { Link } from 'react-router-dom';
import { ChatConversation, ChatMessage } from '@/types/chat';
import { getConversations, getMessages, sendMessage, markConversationAsRead } from '@/lib/chatStorage';
import { InstagramDmModal } from '@/components/Chat/InstagramDmModal';
import { soundFx } from '@/lib/soundFx';

const Messages = () => {
  const [conversations, setConversations] = useState<ChatConversation[]>([]);
  const [search, setSearch] = useState('');
  const [activeConv, setActiveConv] = useState<ChatConversation | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [filter, setFilter] = useState<'all' | 'unread' | 'barter'>('all');

  const refreshList = () => {
    const list = getConversations();
    setConversations(list);
    if (!activeConv && list.length > 0) {
      setActiveConv(list[0]);
    }
  };

  useEffect(() => {
    refreshList();
    const handleUpdate = () => refreshList();
    window.addEventListener('w2w_chat_updated', handleUpdate);
    return () => window.removeEventListener('w2w_chat_updated', handleUpdate);
  }, []);

  const filteredConversations = conversations.filter((c) => {
    const matchesSearch =
      c.sellerName.toLowerCase().includes(search.toLowerCase()) ||
      c.listingTitle.toLowerCase().includes(search.toLowerCase()) ||
      c.lastMessageText.toLowerCase().includes(search.toLowerCase());

    if (!matchesSearch) return false;
    if (filter === 'unread') return (c.unreadCount || 0) > 0;
    if (filter === 'barter') return c.isFree || c.lastMessageText.toLowerCase().includes('barter') || c.lastMessageText.toLowerCase().includes('exchange');
    return true;
  });

  const handleSelect = (conv: ChatConversation) => {
    setActiveConv(conv);
    markConversationAsRead(conv.id);
    setModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-background pt-6 lg:pt-24 pb-24 px-4 sm:px-6 max-w-5xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-data font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 uppercase">
              Smart Exchange
            </span>
            <span className="text-xs font-data text-muted-foreground">Instagram-Style DMs</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-display font-bold text-foreground">Direct Messages</h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Connect directly with local eco-makers to negotiate trades and exchange upcycled items.
          </p>
        </div>

        <Link
          to="/marketplace"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-surface-alt hover:bg-muted border border-border text-xs font-display font-bold text-foreground transition-colors self-start sm:self-auto"
        >
          <ShoppingBag size={14} className="text-emerald-400" />
          Browse Marketplace
        </Link>
      </div>

      {/* Search & Filters */}
      <div className="flex flex-col sm:flex-row items-center gap-3 mb-6">
        <div className="relative w-full sm:flex-1">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search conversations, creators, or items..."
            className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-card border border-border text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-emerald-500/50 transition-colors"
          />
        </div>

        <div className="flex items-center gap-1.5 w-full sm:w-auto">
          {(['all', 'unread', 'barter'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-xl text-xs font-data font-semibold capitalize transition-all ${
                filter === f
                  ? 'bg-emerald-500 text-zinc-950 shadow-sm'
                  : 'bg-card text-muted-foreground hover:text-foreground border border-border'
              }`}
            >
              {f === 'barter' ? '🔄 Barter Offers' : f}
            </button>
          ))}
        </div>
      </div>

      {/* Conversations Grid */}
      {filteredConversations.length === 0 ? (
        <div className="text-center py-16 px-4 rounded-3xl bg-card border border-border">
          <MessageCircle size={36} className="mx-auto text-muted-foreground/50 mb-3" />
          <h3 className="text-base font-display font-bold text-foreground">No conversations found</h3>
          <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
            Explore upcycled creations on the marketplace and tap &ldquo;Chat to Exchange&rdquo; to start a direct barter channel!
          </p>
          <Link to="/marketplace">
            <button className="mt-4 px-6 py-2.5 rounded-xl bg-emerald-500 text-zinc-950 text-xs font-display font-bold hover:bg-emerald-400 transition-colors">
              Explore Marketplace
            </button>
          </Link>
        </div>
      ) : (
        <div className="grid gap-3">
          {filteredConversations.map((c) => (
            <motion.div
              key={c.id}
              onClick={() => handleSelect(c)}
              className="group p-4 rounded-2xl bg-card border border-border hover:border-emerald-500/40 cursor-pointer transition-all flex items-center justify-between gap-4 shadow-sm hover:shadow-md"
              whileHover={{ scale: 1.005, y: -1 }}
              whileTap={{ scale: 0.995 }}
            >
              <div className="flex items-center gap-3.5 min-w-0">
                {/* Instagram Gradient Ring Avatar */}
                <div className="relative flex-shrink-0">
                  <div className="w-12 h-12 rounded-full p-0.5 bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600">
                    <div className="w-full h-full rounded-full overflow-hidden bg-background">
                      {c.sellerAvatar ? (
                        <img src={c.sellerAvatar} alt={c.sellerName} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center font-bold text-sm">
                          {c.sellerName.slice(0, 2).toUpperCase()}
                        </div>
                      )}
                    </div>
                  </div>
                  {c.isOnline && (
                    <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-emerald-400 ring-2 ring-card" />
                  )}
                </div>

                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-display font-bold text-foreground truncate">{c.sellerName}</h3>
                    <ShieldCheck size={13} className="text-emerald-400 flex-shrink-0" />
                    <span className="text-[10px] font-data text-muted-foreground flex-shrink-0">· {c.lastMessageTime}</span>
                  </div>

                  <p className="text-xs text-muted-foreground truncate mt-0.5 group-hover:text-foreground/90 transition-colors">
                    {c.lastMessageText}
                  </p>

                  <div className="flex items-center gap-2 mt-1.5">
                    <span className="inline-flex items-center gap-1 text-[10px] font-data text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20">
                      <ShoppingBag size={10} />
                      {c.listingTitle}
                    </span>
                    <span className="text-[10px] font-data text-muted-foreground">
                      {c.isFree ? 'Free Barter' : `₹${c.listingPrice}`}
                    </span>
                  </div>
                </div>
              </div>

              {/* Right Side: Unread Count / Action */}
              <div className="flex items-center gap-2 flex-shrink-0">
                {(c.unreadCount || 0) > 0 && (
                  <span className="w-5 h-5 rounded-full bg-emerald-500 text-zinc-950 text-[10px] font-data font-bold flex items-center justify-center shadow-sm">
                    {c.unreadCount}
                  </span>
                )}
                <button
                  type="button"
                  className="px-3 py-1.5 rounded-xl bg-surface-alt group-hover:bg-emerald-500/15 border border-border group-hover:border-emerald-500/30 text-xs font-display font-bold text-foreground group-hover:text-emerald-400 transition-colors"
                >
                  Open Chat
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Instagram DM Modal */}
      <InstagramDmModal
        conversation={activeConv}
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
      />
    </div>
  );
};

export default Messages;
