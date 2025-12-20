import { useState, useEffect, useRef } from 'react';
import { useDisclosure, useToast } from '@chakra-ui/react';
import ReactMarkdown from 'react-markdown';
import { Settings, Zap, ArrowUp } from 'lucide-react';
import { getOrCreateVisitorId } from '../utils/visitorId';
import { ChatPaymentModal } from './ChatPaymentModal';

type Message = { role: 'user' | 'assistant'; content: string; timestamp?: string };

interface AccessInfo {
  canChat: boolean;
  needsPayment: boolean;
  accessType: 'free' | 'paid' | 'expired';
  messagesRemaining?: number | 'unlimited';
  messagesUsed?: number;
  totalFreeMessages?: number;
  timeRemaining?: string;
  message?: string;
}

// Hushh Assistant Avatar Component
const HushhAvatar = ({ size = 'md', showOnline = false }: { size?: 'sm' | 'md' | 'lg'; showOnline?: boolean }) => {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-24 h-24'
  };

  return (
    <div className="relative">
      <div className={`${sizeClasses[size]} rounded-full overflow-hidden bg-gradient-to-br from-[#2B8CEE] to-[#1a5fb4] shadow-lg`}>
        <img 
          src="https://lh3.googleusercontent.com/aida-public/AB6AXuC08-3GaLjs5qUt0RxfxZrjwSYnS21Obhn5xhgcEj_ZJccfPabdJxXVXTbqFSuJFnzYGN3Cs5dVhVvVSm2F3gh9SE2G1Es32wiQ60IM-VTZ93ySh6uTGAxTp59AJKc1Iy3YYM6bQJTQHHgrFTyVpkcXx1CjbVBlXiho5va9tOgzeHWrpMR8HCBn4mtlBhsVc4sLbrRyN9mCKXRCu94ycCgPDxTMQaAKEqqgEKCEeCxxhyXq1KkmPtQBsSAxL8NkYsKVqDT0FoUgjNDe"
          alt="Hushh Assistant"
          className="w-full h-full object-cover"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.style.display = 'none';
          }}
        />
        {/* Fallback gradient avatar */}
        <div className="absolute inset-0 flex items-center justify-center text-white font-bold text-lg">
          H
        </div>
      </div>
      {showOnline && (
        <div className={`absolute ${size === 'lg' ? 'bottom-1 right-1 w-6 h-6' : 'bottom-0 right-0 w-3 h-3'} bg-green-500 border-2 border-white rounded-full`} />
      )}
    </div>
  );
};

export function InvestorChatWidget({ slug, investorName }: { slug: string; investorName: string }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [accessInfo, setAccessInfo] = useState<AccessInfo | null>(null);
  const [visitorId] = useState(() => getOrCreateVisitorId());
  const { isOpen, onOpen, onClose } = useDisclosure();
  const toast = useToast();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Check access on mount and handle payment success
  useEffect(() => {
    checkAccess();
    handlePaymentReturn();
  }, []);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = '52px';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }
  }, [input]);

  const checkAccess = async () => {
    try {
      const res = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/chat-check-access`,
        {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY || ''
          },
          body: JSON.stringify({ visitorId, slug }),
        }
      );
      
      if (res.ok) {
        const data = await res.json();
        setAccessInfo(data);
      }
    } catch (err) {
      console.error('Access check error:', err);
    }
  };

  const handlePaymentReturn = async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const paymentStatus = urlParams.get('payment');
    const sessionId = urlParams.get('session_id');

    if (paymentStatus === 'success' && sessionId) {
      try {
        const res = await fetch(
          `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/chat-verify-payment`,
          {
            method: 'POST',
            headers: { 
              'Content-Type': 'application/json',
              'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY || ''
            },
            body: JSON.stringify({ sessionId, visitorId, slug }),
          }
        );

        if (res.ok) {
          toast({
            title: 'Payment Successful!',
            description: 'You now have unlimited access for 30 minutes.',
            status: 'success',
            duration: 5000,
          });
          await checkAccess();
        }
      } catch (err) {
        console.error('Payment verification error:', err);
      }
      window.history.replaceState({}, '', window.location.pathname);
    } else if (paymentStatus === 'cancel') {
      toast({
        title: 'Payment Cancelled',
        description: 'You can try again when ready.',
        status: 'info',
        duration: 3000,
      });
      window.history.replaceState({}, '', window.location.pathname);
    }
  };

  const handlePayment = async () => {
    setProcessing(true);
    try {
      const res = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/chat-create-checkout`,
        {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY || ''
          },
          body: JSON.stringify({ visitorId, slug }),
        }
      );

      if (res.ok) {
        const data = await res.json();
        window.location.href = data.checkoutUrl;
      } else {
        throw new Error('Failed to create checkout session');
      }
    } catch (err) {
      console.error('Payment error:', err);
      toast({
        title: 'Payment Error',
        description: 'Failed to initiate payment. Please try again.',
        status: 'error',
        duration: 5000,
      });
      setProcessing(false);
    }
  };

  const sendMessage = async () => {
    const text = input.trim();
    if (!text || loading) return;
    
    if (accessInfo && !accessInfo.canChat) {
      onOpen();
      return;
    }

    const now = new Date();
    const timestamp = now.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
    
    const userMsg: Message = { role: 'user', content: text, timestamp };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);
    
    try {
      const history = messages.map(m => ({ role: m.role, content: m.content }));
      
      const res = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/investor-chat`,
        {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY || ''
          },
          body: JSON.stringify({ slug, message: text, visitorId, history }),
        }
      );
      
      if (res.status === 402) {
        const data = await res.json();
        setMessages(prev => prev.slice(0, -1));
        setInput(text);
        toast({
          title: 'Payment Required',
          description: data.message || 'Please pay to continue chatting.',
          status: 'warning',
          duration: 5000,
        });
        await checkAccess();
        onOpen();
        return;
      }

      if (!res.ok) {
        throw new Error('Failed to get response');
      }
      
      const data = await res.json();
      const replyTimestamp = new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
      setMessages(prev => [...prev, { role: 'assistant', content: data.reply, timestamp: replyTimestamp }]);
      
      if (data.accessInfo) {
        setAccessInfo(prev => ({ ...prev!, ...data.accessInfo }));
      } else {
        await checkAccess();
      }
    } catch (err) {
      console.error(err);
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: 'Sorry, I encountered an error. Please try again.',
        timestamp: new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })
      }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  // Calculate messages quota display
  const messagesUsed = accessInfo?.messagesUsed ?? 0;
  const totalMessages = accessInfo?.totalFreeMessages ?? 10;
  const messagesRemaining = typeof accessInfo?.messagesRemaining === 'number' 
    ? accessInfo.messagesRemaining 
    : totalMessages - messagesUsed;

  const showEmptyState = messages.length === 0;

  return (
    <>
      <div className="flex flex-col h-full min-h-[600px] bg-white rounded-2xl overflow-hidden" style={{ fontFamily: "'Inter', 'Manrope', sans-serif" }}>
        
        {/* Header Section */}
        <header className="flex flex-col bg-white pt-2 pb-2 sticky top-0 z-20 border-b border-slate-100">
          {/* Top Bar */}
          <div className="flex items-center justify-between px-4 h-14">
            <div className="flex items-center gap-3">
              <h1 className="text-xl font-bold text-slate-900 leading-tight">Hushh Assistant</h1>
            </div>
            <button className="flex items-center justify-center w-10 h-10 rounded-full text-slate-600 hover:bg-slate-100 transition-colors">
              <Settings className="w-5 h-5" />
            </button>
          </div>
          
          {/* Quota Badge */}
          <div className="px-4 pb-2">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border border-[#2B8CEE]/30 bg-[#2B8CEE]/5 text-[#2B8CEE] text-sm font-semibold">
              <Zap className="w-4 h-4" />
              <span>
                {accessInfo?.accessType === 'paid' 
                  ? `Unlimited • ${accessInfo.timeRemaining} remaining`
                  : `${messagesRemaining}/${totalMessages} Free Messages`
                }
              </span>
            </div>
          </div>
        </header>

        {/* Chat Area */}
        <main className="flex-1 overflow-y-auto px-4 py-6 scroll-smooth">
          
          {/* Empty State / Intro */}
          {showEmptyState && (
            <div className="flex flex-col items-center justify-center mb-10 mt-4">
              {/* Avatar with glow effect */}
              <div className="relative mb-6 group cursor-pointer">
                <div className="absolute inset-0 bg-[#2B8CEE]/20 rounded-full blur-xl opacity-50 group-hover:opacity-75 transition-opacity" />
                <div className="relative">
                  <HushhAvatar size="lg" showOnline />
                </div>
              </div>
              
              {/* Title - 22px, center, bold */}
              <h2 
                className="font-bold text-center text-slate-900 mb-2 max-w-[280px]"
                style={{ fontSize: '22px', lineHeight: '1.3' }}
              >
                Hello! How can I help you today?
              </h2>
              
              {/* Subtitle - 14px, center, gray */}
              <p 
                className="text-center text-slate-500 max-w-[300px] leading-relaxed"
                style={{ fontSize: '14px' }}
              >
                I'm ready to assist with questions about {investorName}'s investment profile and preferences.
              </p>
            </div>
          )}

          {/* Date Separator */}
          {messages.length > 0 && (
            <div className="flex justify-center mb-8">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest bg-white px-2">
                Today
              </span>
            </div>
          )}

          {/* Messages */}
          {messages.map((msg, i) => (
            <div key={i}>
              {msg.role === 'assistant' ? (
                /* Assistant Message */
                <div className="flex gap-3 items-end mb-6">
                  <div className="shrink-0 self-start mt-1">
                    <HushhAvatar size="sm" />
                  </div>
                  <div className="flex flex-col gap-1 max-w-[85%]">
                    <span className="text-xs font-semibold text-[#2B8CEE] ml-1 mb-0.5">
                      Hushh Assistant
                    </span>
                    <div className="bg-[#F6F8FA] text-slate-900 px-4 py-3 rounded-2xl rounded-tl-none border border-slate-100 shadow-sm">
                      <div 
                        className="text-[15px] leading-relaxed prose prose-sm max-w-none"
                        style={{
                          '--tw-prose-body': '#1e293b',
                          '--tw-prose-headings': '#0f172a',
                        } as React.CSSProperties}
                      >
                        <ReactMarkdown>{msg.content}</ReactMarkdown>
                      </div>
                    </div>
                    {msg.timestamp && (
                      <span className="text-xs text-slate-400 ml-1 mt-0.5">{msg.timestamp}</span>
                    )}
                  </div>
                </div>
              ) : (
                /* User Message */
                <div className="flex gap-3 items-end mb-6 justify-end">
                  <div className="flex flex-col gap-1 max-w-[85%] items-end">
                    <div className="bg-[#2B8CEE] text-white px-4 py-3 rounded-2xl rounded-tr-none shadow-sm shadow-blue-500/20">
                      <p className="text-[15px] leading-relaxed whitespace-pre-wrap">
                        {msg.content}
                      </p>
                    </div>
                    {msg.timestamp && (
                      <span className="text-xs text-slate-400 mr-1 mt-0.5">{msg.timestamp}</span>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}

          {/* Loading indicator */}
          {loading && (
            <div className="flex gap-3 items-end mb-6">
              <div className="shrink-0 self-start mt-1">
                <HushhAvatar size="sm" />
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-xs font-semibold text-[#2B8CEE] ml-1 mb-0.5">
                  Hushh Assistant
                </span>
                <div className="bg-[#F6F8FA] text-slate-500 px-4 py-3 rounded-2xl rounded-tl-none border border-slate-100 shadow-sm">
                  <div className="flex items-center gap-2">
                    <div className="flex gap-1">
                      <span className="w-2 h-2 bg-[#2B8CEE] rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                      <span className="w-2 h-2 bg-[#2B8CEE] rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                      <span className="w-2 h-2 bg-[#2B8CEE] rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                    <span className="text-sm">Thinking...</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </main>

        {/* Composer Section */}
        <footer className="bg-white px-4 py-3 pb-6 border-t border-slate-200 relative z-20">
          <div className="flex items-end gap-3">
            {/* Input Field */}
            <div className="relative flex-1">
              <textarea
                ref={textareaRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyPress}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3.5 text-base text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#2B8CEE] focus:ring-1 focus:ring-[#2B8CEE] transition-all resize-none overflow-hidden"
                placeholder="Type a message..."
                rows={1}
                style={{ minHeight: '52px', maxHeight: '120px' }}
                disabled={loading}
              />
            </div>
            
            {/* Send Button */}
            <button
              onClick={sendMessage}
              disabled={loading || !input.trim()}
              className="flex items-center justify-center shrink-0 w-[52px] h-[52px] bg-[#2B8CEE] text-white rounded-xl hover:bg-blue-600 active:scale-95 transition-all shadow-md shadow-blue-500/20 disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100"
            >
              <ArrowUp className="w-6 h-6" />
            </button>
          </div>
          
          <p className="text-center text-[11px] text-slate-400 mt-3 font-medium">
            AI can make mistakes. Please verify important information.
          </p>
        </footer>
      </div>

      {/* Payment Modal */}
      <ChatPaymentModal
        isOpen={isOpen}
        onClose={onClose}
        onPayment={handlePayment}
        isProcessing={processing}
      />
    </>
  );
}
