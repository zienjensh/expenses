import { useState, useEffect, useRef } from 'react';
import { 
  collection, 
  query, 
  where, 
  orderBy, 
  addDoc, 
  onSnapshot, 
  Timestamp,
  updateDoc,
  doc,
  getDocs
} from 'firebase/firestore';
import { db } from '../firebase/config';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import { getTranslation } from '../utils/i18n';
import SEO from '../components/SEO';
import { 
  MessageCircle, 
  Send, 
  User, 
  Shield,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle
} from 'lucide-react';
import toast from 'react-hot-toast';

const Support = () => {
  const { currentUser } = useAuth();
  const { theme } = useTheme();
  const { language } = useLanguage();
  const t = getTranslation(language);
  
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [conversation, setConversation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Find or create conversation
  useEffect(() => {
    if (!currentUser) return;

    const findOrCreateConversation = async () => {
      try {
        setLoading(true);
        
        // Check if user has an existing open conversation
        // Try with status filter first, if it fails, fetch all and filter manually
        let conversationsQuery;
        let conversationsSnapshot;
        
        try {
          conversationsQuery = query(
            collection(db, 'supportConversations'),
            where('userId', '==', currentUser.uid),
            where('status', 'in', ['open', 'pending'])
          );
          conversationsSnapshot = await getDocs(conversationsQuery);
        } catch (error) {
          // If 'in' query fails (needs index), fetch all user conversations and filter manually
          console.warn('Status filter failed, fetching all conversations:', error);
          conversationsQuery = query(
            collection(db, 'supportConversations'),
            where('userId', '==', currentUser.uid)
          );
          conversationsSnapshot = await getDocs(conversationsQuery);
          
          // Filter manually
          const filteredDocs = conversationsSnapshot.docs.filter(doc => {
            const status = doc.data().status;
            return status === 'open' || status === 'pending';
          });
          
          // Create a new snapshot-like object
          conversationsSnapshot = {
            docs: filteredDocs,
            empty: filteredDocs.length === 0
          };
        }
        
        if (conversationsSnapshot.docs && conversationsSnapshot.docs.length > 0) {
          // Use existing conversation
          const existingConv = {
            id: conversationsSnapshot.docs[0].id,
            ...conversationsSnapshot.docs[0].data()
          };
          console.log('Found existing conversation:', existingConv.id, existingConv);
          setConversation(existingConv);
        } else {
          // Create new conversation
          const newConversation = {
            userId: currentUser.uid,
            userEmail: currentUser.email,
            userName: currentUser.displayName || currentUser.email,
            status: 'open',
            createdAt: Timestamp.now(),
            updatedAt: Timestamp.now(),
            unreadCount: {
              user: 0,
              admin: 0
            }
          };
          
          const convRef = await addDoc(collection(db, 'supportConversations'), newConversation);
          const newConv = { id: convRef.id, ...newConversation };
          console.log('Created new conversation:', newConv.id);
          setConversation(newConv);
          toast.success(t.conversationStarted);
        }
      } catch (error) {
        console.error('Error finding/creating conversation:', error);
        toast.error(t.error);
      } finally {
        setLoading(false);
      }
    };

    findOrCreateConversation();
  }, [currentUser]);

  // Listen to messages for this conversation
  useEffect(() => {
    if (!conversation) {
      setMessages([]);
      return;
    }

    // Function to fetch messages - use query with where clause
    const fetchMessages = async () => {
      try {
        const messagesQuery = query(
          collection(db, 'supportMessages'),
          where('conversationId', '==', conversation.id)
        );
        
        try {
          const snapshot = await getDocs(messagesQuery);
          
          let messagesData = snapshot.docs.map(doc => {
            const data = doc.data();
            return {
              id: doc.id,
              ...data,
              createdAt: data.createdAt?.toDate?.() || (data.createdAt ? new Date(data.createdAt) : new Date())
            };
          });
          
          // Sort manually by createdAt (ascending - oldest first)
          messagesData.sort((a, b) => {
            const aTime = a.createdAt instanceof Date ? a.createdAt.getTime() : new Date(a.createdAt).getTime();
            const bTime = b.createdAt instanceof Date ? b.createdAt.getTime() : new Date(b.createdAt).getTime();
            return aTime - bTime;
          });
          
          setMessages(messagesData);
          
          // Mark admin messages as read
          const unreadMessages = messagesData.filter(m => 
            m.sender === 'admin' && !m.readBy?.includes(currentUser.uid)
          );
          
          if (unreadMessages.length > 0) {
            unreadMessages.forEach(async (msg) => {
              try {
                await updateDoc(doc(db, 'supportMessages', msg.id), {
                  readBy: [...(msg.readBy || []), currentUser.uid]
                });
              } catch (error) {
                console.error('Error marking message as read:', error);
              }
            });
          }
        } catch (queryError) {
          // If query fails due to missing index, try to read conversation subcollection approach
          // or just show empty messages for now
          if (queryError.code === 'failed-precondition' || queryError.message?.includes('index')) {
            console.warn('Index required for messages query, messages will appear once index is created');
            setMessages([]);
          } else {
            throw queryError;
          }
        }
      } catch (error) {
        console.error('Error fetching messages:', error);
        if (error.code !== 'permission-denied') {
          toast.error(language === 'ar' ? 'حدث خطأ في تحميل الرسائل' : 'Error loading messages');
        }
      }
    };

    // Initial fetch
    fetchMessages();

    // Set up polling to refresh messages every 2 seconds as fallback
    let pollInterval = setInterval(() => {
      fetchMessages();
    }, 2000);

    // Try to use onSnapshot for real-time updates
    let unsubscribe;
    const messagesQuery = query(
      collection(db, 'supportMessages'),
      where('conversationId', '==', conversation.id)
    );
    
    unsubscribe = onSnapshot(
      messagesQuery,
      (snapshot) => {
        let messagesData = [];
        snapshot.docs.forEach(doc => {
          try {
            const data = doc.data();
            messagesData.push({
              id: doc.id,
              ...data,
              createdAt: data.createdAt?.toDate?.() || (data.createdAt ? new Date(data.createdAt) : new Date())
            });
          } catch (error) {
            console.warn('Error processing message:', error);
          }
        });
        
        // Sort manually
        messagesData.sort((a, b) => {
          const aTime = a.createdAt instanceof Date ? a.createdAt.getTime() : new Date(a.createdAt).getTime();
          const bTime = b.createdAt instanceof Date ? b.createdAt.getTime() : new Date(b.createdAt).getTime();
          return aTime - bTime;
        });
        
        setMessages(messagesData);
        
        // Mark admin messages as read
        const unreadMessages = messagesData.filter(m => 
          m.sender === 'admin' && !m.readBy?.includes(currentUser.uid)
        );
        
        if (unreadMessages.length > 0) {
          unreadMessages.forEach(async (msg) => {
            try {
              await updateDoc(doc(db, 'supportMessages', msg.id), {
                readBy: [...(msg.readBy || []), currentUser.uid]
              });
            } catch (error) {
              console.error('Error marking message as read:', error);
            }
          });
        }
        
        // Clear polling if onSnapshot works successfully
        if (pollInterval) {
          clearInterval(pollInterval);
          pollInterval = null;
        }
      },
      (error) => {
        // onSnapshot failed, keep using polling
        console.warn('onSnapshot failed, continuing with polling:', error.message);
        // Polling will continue running
      }
    );

    return () => {
      if (unsubscribe) unsubscribe();
      if (pollInterval) clearInterval(pollInterval);
    };
  }, [conversation, currentUser, language]);

  const sendMessage = async (e) => {
    e.preventDefault();
    
    if (!newMessage.trim() || !conversation || sending) return;

    try {
      setSending(true);
      
      const messageData = {
        conversationId: conversation.id,
        sender: 'user',
        senderId: currentUser.uid,
        senderEmail: currentUser.email,
        senderName: currentUser.displayName || currentUser.email,
        message: newMessage.trim(),
        readBy: [currentUser.uid],
        createdAt: Timestamp.now()
      };

      await addDoc(collection(db, 'supportMessages'), messageData);
      
      // Update conversation
      await updateDoc(doc(db, 'supportConversations', conversation.id), {
        updatedAt: Timestamp.now(),
        lastMessage: newMessage.trim(),
        lastMessageAt: Timestamp.now(),
        'unreadCount.admin': (conversation.unreadCount?.admin || 0) + 1
      });

      setNewMessage('');
      inputRef.current?.focus();
      toast.success(t.messageSent);
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error(t.messageError);
    } finally {
      setSending(false);
    }
  };

  const formatDate = (date) => {
    if (!date) return '';
    try {
      const dateObj = date instanceof Date ? date : new Date(date);
      const now = new Date();
      const diff = now.getTime() - dateObj.getTime();
      const minutes = Math.floor(diff / 60000);
      const hours = Math.floor(minutes / 60);
      const days = Math.floor(hours / 24);

      if (language === 'ar') {
        if (minutes < 1) return 'الآن';
        if (minutes < 60) return `منذ ${minutes} دقيقة`;
        if (hours < 24) return `منذ ${hours} ساعة`;
        if (days < 7) return `منذ ${days} يوم`;
        return dateObj.toLocaleDateString('ar-SA', { 
          year: 'numeric', 
          month: 'short', 
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        });
      } else {
        if (minutes < 1) return 'Just now';
        if (minutes < 60) return `${minutes} min ago`;
        if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
        if (days < 7) return `${days} day${days > 1 ? 's' : ''} ago`;
        return dateObj.toLocaleDateString('en-US', { 
          year: 'numeric', 
          month: 'short', 
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        });
      }
    } catch {
      return '';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-fire-red text-2xl">{t.loading}</div>
      </div>
    );
  }

  return (
    <>
      <SEO 
        title={`${t.supportTitle} - ${t.appName}`}
        description={t.supportDescription}
        keywords={language === 'ar' ? 'دعم, مساعدة, محادثة' : 'support, help, chat'}
      />
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2 flex items-center gap-3">
            <MessageCircle className="text-fire-red" size={32} />
            {t.supportTitle}
          </h1>
          <p className="text-gray-600 dark:text-light-gray/70">
            {t.supportDescription}
          </p>
        </div>

        <div className={`rounded-xl border ${
          theme === 'dark' 
            ? 'bg-charcoal border-white/10' 
            : 'bg-white border-gray-200'
        }`}>
          {/* Chat Header */}
          <div className={`p-4 border-b ${
            theme === 'dark' ? 'border-white/10' : 'border-gray-200'
          } flex items-center justify-between`}>
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${
                theme === 'dark' ? 'bg-fire-red/20' : 'bg-fire-red/10'
              }`}>
                <MessageCircle className="text-fire-red" size={24} />
              </div>
              <div>
                <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                  {t.supportChat}
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {conversation?.status === 'open' ? (
                    <span className="flex items-center gap-1 text-green-500">
                      <CheckCircle size={14} />
                      {t.statusOpen}
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-gray-500">
                      <XCircle size={14} />
                      {t.statusClosed}
                    </span>
                  )}
                </p>
              </div>
            </div>
          </div>

          {/* Messages Container */}
          <div className="h-[500px] overflow-y-auto p-4 space-y-4">
            {!conversation ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <MessageCircle className="mx-auto text-gray-400 mb-4" size={48} />
                  <p className="text-gray-600 dark:text-gray-400">
                    {t.loading}
                  </p>
                </div>
              </div>
            ) : messages.length === 0 ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <MessageCircle className="mx-auto text-gray-400 mb-4" size={48} />
                  <p className="text-gray-600 dark:text-gray-400">
                    {t.noMessages}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">
                    {t.startConversation}
                  </p>
                  <p className="text-xs text-gray-400 mt-2">
                    Conversation ID: {conversation.id}
                  </p>
                </div>
              </div>
            ) : (
              messages.map((message) => {
                const isUser = message.sender === 'user';
                const isAdmin = message.sender === 'admin';
                
                return (
                  <div
                    key={message.id}
                    className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`max-w-[70%] ${isUser ? 'items-end' : 'items-start'} flex flex-col gap-1`}>
                      <div className={`flex items-center gap-2 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                          isAdmin
                            ? theme === 'dark'
                              ? 'bg-fire-red/20 text-fire-red border border-fire-red/30'
                              : 'bg-fire-red/10 text-fire-red border border-fire-red/20'
                            : theme === 'dark'
                              ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                              : 'bg-blue-500/10 text-blue-600 border border-blue-500/20'
                        }`}>
                          {isAdmin ? (
                            <Shield size={16} />
                          ) : (
                            <User size={16} />
                          )}
                        </div>
                        <span className={`text-xs font-medium ${
                          theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                        }`}>
                          {isAdmin ? t.supportAgent : message.senderName}
                        </span>
                      </div>
                      <div className={`p-3 rounded-lg ${
                        isUser
                          ? theme === 'dark'
                            ? 'bg-fire-red/20 text-white'
                            : 'bg-fire-red text-white'
                          : theme === 'dark'
                            ? 'bg-white/10 text-gray-200'
                            : 'bg-gray-100 text-gray-900'
                      }`}>
                        <p className="text-sm whitespace-pre-wrap break-words">
                          {message.message}
                        </p>
                      </div>
                      <span className={`text-xs ${
                        theme === 'dark' ? 'text-gray-500' : 'text-gray-400'
                      }`}>
                        {formatDate(message.createdAt)}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Message Input */}
          {conversation?.status === 'open' && (
            <form onSubmit={sendMessage} className={`p-4 border-t ${
              theme === 'dark' ? 'border-white/10' : 'border-gray-200'
            }`}>
              <div className="flex gap-2">
                <input
                  ref={inputRef}
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder={t.typeMessage}
                  className={`flex-1 px-4 py-2 rounded-lg border ${
                    theme === 'dark'
                      ? 'bg-white/5 border-white/10 text-white placeholder-gray-500 focus:border-fire-red'
                      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400 focus:border-fire-red'
                  } focus:outline-none focus:ring-2 focus:ring-fire-red/20 transition-all`}
                  disabled={sending}
                />
                <button
                  type="submit"
                  disabled={!newMessage.trim() || sending}
                  className="px-6 py-2 bg-fire-red hover:bg-fire-red/90 text-white rounded-lg font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {sending ? (
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  ) : (
                    <>
                      <Send size={18} />
                      <span>{t.send}</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          )}

          {conversation?.status === 'closed' && (
            <div className={`p-4 border-t ${
              theme === 'dark' ? 'border-white/10 bg-orange-500/10' : 'border-gray-200 bg-orange-50'
            }`}>
              <p className="text-sm text-center text-orange-600 dark:text-orange-400 flex items-center justify-center gap-2">
                <AlertCircle size={16} />
                {language === 'ar' ? 'هذه المحادثة مغلقة. يمكنك بدء محادثة جديدة.' : 'This conversation is closed. You can start a new conversation.'}
              </p>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default Support;

