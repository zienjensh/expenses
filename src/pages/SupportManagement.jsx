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
  Search,
  Filter,
  Mail,
  Calendar,
  AlertCircle
} from 'lucide-react';
import toast from 'react-hot-toast';

const SupportManagement = () => {
  const { currentUser } = useAuth();
  const { theme } = useTheme();
  const { language } = useLanguage();
  const t = getTranslation(language);
  
  const [conversations, setConversations] = useState([]);
  const [filteredConversations, setFilteredConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Listen to all conversations
  useEffect(() => {
    const conversationsQuery = query(
      collection(db, 'supportConversations'),
      orderBy('updatedAt', 'desc')
    );

    const unsubscribe = onSnapshot(conversationsQuery, (snapshot) => {
      const conversationsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate?.() || new Date(),
        updatedAt: doc.data().updatedAt?.toDate?.() || new Date(),
        lastMessageAt: doc.data().lastMessageAt?.toDate?.() || null
      }));

      setConversations(conversationsData);
      setFilteredConversations(conversationsData);
      setLoading(false);
    }, (error) => {
      console.error('Error listening to conversations:', error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Filter conversations
  useEffect(() => {
    let filtered = [...conversations];

    // Filter by status
    if (filterStatus !== 'all') {
      filtered = filtered.filter(conv => conv.status === filterStatus);
    }

    // Filter by search term
    if (searchTerm.trim()) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(conv => {
        return (
          conv.userName?.toLowerCase().includes(searchLower) ||
          conv.userEmail?.toLowerCase().includes(searchLower) ||
          conv.lastMessage?.toLowerCase().includes(searchLower)
        );
      });
    }

    setFilteredConversations(filtered);
  }, [searchTerm, filterStatus, conversations]);

  // Listen to messages for selected conversation
  useEffect(() => {
    if (!selectedConversation) {
      setMessages([]);
      return;
    }

    // Use query without orderBy to avoid index requirement, we'll sort manually
    const messagesQuery = query(
      collection(db, 'supportMessages'),
      where('conversationId', '==', selectedConversation.id)
    );

    // Function to fetch messages
    const fetchMessages = async () => {
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

        // Update conversation unread count
        if (selectedConversation) {
          updateDoc(doc(db, 'supportConversations', selectedConversation.id), {
            'unreadCount.admin': 0
          }).catch(err => console.error('Error updating unread count:', err));
        }
      } catch (error) {
        console.error('Error fetching messages:', error);
        if (!error.message?.includes('index')) {
          toast.error(language === 'ar' ? 'حدث خطأ في تحميل الرسائل' : 'Error loading messages');
        }
      }
    };

    // Initial fetch
    fetchMessages();

    // Try to use onSnapshot for real-time updates, but fallback to polling if it fails
    let unsubscribe;
    let pollInterval;
    
    try {
      unsubscribe = onSnapshot(
        messagesQuery,
        (snapshot) => {
          let messagesData = snapshot.docs.map(doc => {
            const data = doc.data();
            return {
              id: doc.id,
              ...data,
              createdAt: data.createdAt?.toDate?.() || (data.createdAt ? new Date(data.createdAt) : new Date())
            };
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

          // Update conversation unread count
          if (selectedConversation) {
            updateDoc(doc(db, 'supportConversations', selectedConversation.id), {
              'unreadCount.admin': 0
            }).catch(err => console.error('Error updating unread count:', err));
          }
          
          // Clear polling if onSnapshot works
          if (pollInterval) {
            clearInterval(pollInterval);
            pollInterval = null;
          }
        },
        (error) => {
          console.warn('onSnapshot failed, using polling instead:', error);
          // If onSnapshot fails, use polling as fallback
          if (!pollInterval) {
            pollInterval = setInterval(() => {
              fetchMessages();
            }, 2000); // Poll every 2 seconds
          }
        }
      );
    } catch (error) {
      console.warn('onSnapshot setup failed, using polling only:', error);
      // Use polling only
      pollInterval = setInterval(() => {
        fetchMessages();
      }, 2000);
    }

    return () => {
      if (unsubscribe) unsubscribe();
      if (pollInterval) clearInterval(pollInterval);
    };
  }, [selectedConversation, currentUser, language]);

  const sendMessage = async (e) => {
    e.preventDefault();
    
    if (!newMessage.trim() || !selectedConversation || sending) return;

    try {
      setSending(true);
      
      const messageData = {
        conversationId: selectedConversation.id,
        sender: 'admin',
        senderId: currentUser.uid,
        senderEmail: currentUser.email,
        senderName: currentUser.displayName || 'Admin',
        message: newMessage.trim(),
        readBy: [currentUser.uid],
        createdAt: Timestamp.now()
      };

      await addDoc(collection(db, 'supportMessages'), messageData);
      
      // Update conversation
      await updateDoc(doc(db, 'supportConversations', selectedConversation.id), {
        updatedAt: Timestamp.now(),
        lastMessage: newMessage.trim(),
        lastMessageAt: Timestamp.now(),
        'unreadCount.user': (selectedConversation.unreadCount?.user || 0) + 1
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

  const closeConversation = async () => {
    if (!selectedConversation) return;
    
    if (!confirm(language === 'ar' ? 'هل أنت متأكد من إغلاق هذه المحادثة؟' : 'Are you sure you want to close this conversation?')) {
      return;
    }

    try {
      await updateDoc(doc(db, 'supportConversations', selectedConversation.id), {
        status: 'closed',
        updatedAt: Timestamp.now()
      });
      toast.success(t.ticketClosed);
    } catch (error) {
      console.error('Error closing conversation:', error);
      toast.error(t.error);
    }
  };

  const reopenConversation = async () => {
    if (!selectedConversation) return;

    try {
      await updateDoc(doc(db, 'supportConversations', selectedConversation.id), {
        status: 'open',
        updatedAt: Timestamp.now()
      });
      toast.success(t.ticketReopened);
    } catch (error) {
      console.error('Error reopening conversation:', error);
      toast.error(t.error);
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
        title={`${t.supportManagementTitle} - ${t.appName}`}
        description={t.supportManagementDescription}
        keywords={language === 'ar' ? 'إدارة الدعم, محادثات, دعم' : 'support management, conversations, support'}
      />
      <div className="space-y-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2 flex items-center gap-3">
            <Shield className="text-fire-red" size={32} />
            {t.supportManagementTitle}
          </h1>
          <p className="text-gray-600 dark:text-light-gray/70">
            {t.supportManagementDescription}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Conversations List */}
          <div className="lg:col-span-1">
            <div className={`rounded-xl border ${
              theme === 'dark' 
                ? 'bg-charcoal border-white/10' 
                : 'bg-white border-gray-200'
            }`}>
              {/* Search and Filter */}
              <div className={`p-4 border-b ${
                theme === 'dark' ? 'border-white/10' : 'border-gray-200'
              } space-y-3`}>
                {/* Search */}
                <div className="relative">
                  <Search className={`absolute ${language === 'ar' ? 'right-3' : 'left-3'} top-1/2 transform -translate-y-1/2 text-gray-400`} size={18} />
                  <input
                    type="text"
                    placeholder={t.searchConversations}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className={`w-full ${language === 'ar' ? 'pr-10 pl-4' : 'pl-10 pr-4'} py-2 rounded-lg ${
                      theme === 'dark'
                        ? 'bg-white/5 border border-white/10 text-white placeholder-gray-400 focus:border-fire-red'
                        : 'bg-gray-50 border border-gray-300 text-gray-900 placeholder-gray-500 focus:border-fire-red'
                    } focus:outline-none focus:ring-2 focus:ring-fire-red/20 transition-all text-sm`}
                  />
                </div>

                {/* Filter */}
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className={`w-full px-3 py-2 rounded-lg text-sm border ${
                    theme === 'dark'
                      ? 'bg-white/5 border-white/10 text-white focus:border-fire-red'
                      : 'bg-white border-gray-300 text-gray-900 focus:border-fire-red'
                  } focus:outline-none focus:ring-2 focus:ring-fire-red/20 transition-all`}
                >
                  <option value="all">{t.allStatuses}</option>
                  <option value="open">{t.statusOpen}</option>
                  <option value="pending">{t.statusPending}</option>
                  <option value="closed">{t.statusClosed}</option>
                  <option value="resolved">{t.statusResolved}</option>
                </select>
              </div>

              {/* Conversations */}
              <div className="divide-y divide-gray-200 dark:divide-white/10 max-h-[600px] overflow-y-auto">
                {filteredConversations.length === 0 ? (
                  <div className="p-8 text-center">
                    <MessageCircle className="mx-auto text-gray-400 mb-4" size={48} />
                    <p className="text-gray-600 dark:text-gray-400">
                      {t.noConversations}
                    </p>
                  </div>
                ) : (
                  filteredConversations.map((conv) => {
                    const isSelected = selectedConversation?.id === conv.id;
                    const unreadCount = conv.unreadCount?.admin || 0;
                    
                    return (
                      <div
                        key={conv.id}
                        onClick={() => setSelectedConversation(conv)}
                        className={`p-4 cursor-pointer transition-all ${
                          isSelected
                            ? theme === 'dark'
                              ? 'bg-fire-red/20 border-l-4 border-fire-red'
                              : 'bg-fire-red/10 border-l-4 border-fire-red'
                            : theme === 'dark'
                              ? 'hover:bg-white/5'
                              : 'hover:bg-gray-50'
                        }`}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                                theme === 'dark'
                                  ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                                  : 'bg-blue-500/10 text-blue-600 border border-blue-500/20'
                              }`}>
                                {conv.userName?.[0]?.toUpperCase() || conv.userEmail?.[0]?.toUpperCase() || 'U'}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className={`font-semibold text-sm truncate ${
                                  theme === 'dark' ? 'text-white' : 'text-gray-900'
                                }`}>
                                  {conv.userName || conv.userEmail}
                                </p>
                                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                                  {conv.userEmail}
                                </p>
                              </div>
                            </div>
                          </div>
                          {unreadCount > 0 && (
                            <span className="bg-fire-red text-white text-xs font-bold px-2 py-1 rounded-full">
                              {unreadCount > 9 ? '9+' : unreadCount}
                            </span>
                          )}
                        </div>
                        
                        {conv.lastMessage && (
                          <p className={`text-xs truncate mb-2 ${
                            theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                          }`}>
                            {conv.lastMessage}
                          </p>
                        )}
                        
                        <div className="flex items-center justify-between">
                          <span className={`text-xs px-2 py-1 rounded ${
                            conv.status === 'open'
                              ? 'bg-green-500/20 text-green-500'
                              : conv.status === 'closed'
                              ? 'bg-gray-500/20 text-gray-500'
                              : conv.status === 'resolved'
                              ? 'bg-blue-500/20 text-blue-500'
                              : 'bg-orange-500/20 text-orange-500'
                          }`}>
                            {conv.status === 'open' ? t.statusOpen :
                             conv.status === 'closed' ? t.statusClosed :
                             conv.status === 'resolved' ? t.statusResolved :
                             t.statusPending}
                          </span>
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            {formatDate(conv.updatedAt)}
                          </span>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>

          {/* Chat Area */}
          <div className="lg:col-span-2">
            {selectedConversation ? (
              <div className={`rounded-xl border ${
                theme === 'dark' 
                  ? 'bg-charcoal border-white/10' 
                  : 'bg-white border-gray-200'
              } flex flex-col h-[600px]`}>
                {/* Chat Header */}
                <div className={`p-4 border-b ${
                  theme === 'dark' ? 'border-white/10' : 'border-gray-200'
                } flex items-center justify-between`}>
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold ${
                      theme === 'dark'
                        ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                        : 'bg-blue-500/10 text-blue-600 border border-blue-500/20'
                    }`}>
                      {selectedConversation.userName?.[0]?.toUpperCase() || selectedConversation.userEmail?.[0]?.toUpperCase() || 'U'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className={`font-bold text-lg truncate ${
                        theme === 'dark' ? 'text-white' : 'text-gray-900'
                      }`}>
                        {selectedConversation.userName || selectedConversation.userEmail}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                        {selectedConversation.userEmail}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-xs px-2 py-1 rounded ${
                      selectedConversation.status === 'open'
                        ? 'bg-green-500/20 text-green-500'
                        : 'bg-gray-500/20 text-gray-500'
                    }`}>
                      {selectedConversation.status === 'open' ? t.statusOpen : t.statusClosed}
                    </span>
                    {selectedConversation.status === 'open' ? (
                      <button
                        onClick={closeConversation}
                        className="px-3 py-1.5 text-xs bg-red-500/20 hover:bg-red-500/30 text-red-500 rounded-lg transition-all"
                      >
                        {t.closeTicket}
                      </button>
                    ) : (
                      <button
                        onClick={reopenConversation}
                        className="px-3 py-1.5 text-xs bg-green-500/20 hover:bg-green-500/30 text-green-500 rounded-lg transition-all"
                      >
                        {t.reopenTicket}
                      </button>
                    )}
                  </div>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {messages.length === 0 ? (
                    <div className="flex items-center justify-center h-full">
                      <div className="text-center">
                        <MessageCircle className="mx-auto text-gray-400 mb-4" size={48} />
                        <p className="text-gray-600 dark:text-gray-400">
                          {t.noMessages}
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
                          className={`flex ${isUser ? 'justify-start' : 'justify-end'}`}
                        >
                          <div className={`max-w-[70%] ${isUser ? 'items-start' : 'items-end'} flex flex-col gap-1`}>
                            <div className={`flex items-center gap-2 ${isUser ? 'flex-row' : 'flex-row-reverse'}`}>
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
                                  ? 'bg-white/10 text-gray-200'
                                  : 'bg-gray-100 text-gray-900'
                                : theme === 'dark'
                                  ? 'bg-fire-red/20 text-white'
                                  : 'bg-fire-red text-white'
                            }`}>
                              <p className="text-sm whitespace-pre-wrap break-words">
                                {message.message}
                              </p>
                            </div>
                            <span className={`text-xs ${isUser ? 'text-left' : 'text-right'} ${
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
                {selectedConversation.status === 'open' && (
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

                {selectedConversation.status === 'closed' && (
                  <div className={`p-4 border-t ${
                    theme === 'dark' ? 'border-white/10 bg-orange-500/10' : 'border-gray-200 bg-orange-50'
                  }`}>
                    <p className="text-sm text-center text-orange-600 dark:text-orange-400 flex items-center justify-center gap-2">
                      <AlertCircle size={16} />
                      {language === 'ar' ? 'هذه المحادثة مغلقة.' : 'This conversation is closed.'}
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <div className={`rounded-xl border ${
                theme === 'dark' 
                  ? 'bg-charcoal border-white/10' 
                  : 'bg-white border-gray-200'
              } h-[600px] flex items-center justify-center`}>
                <div className="text-center">
                  <MessageCircle className="mx-auto text-gray-400 mb-4" size={48} />
                  <p className="text-gray-600 dark:text-gray-400">
                    {t.selectConversation}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default SupportManagement;

