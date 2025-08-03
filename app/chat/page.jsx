// app/chat/page.jsx
"use client";

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { Send, UserPlus, Users, Paperclip, X, CornerDownLeft, Pin, Trash2, ChevronLeft, ChevronRight } from 'lucide-react';
import LoadingSpinner from '../components/LoadingSpinner';
import { useNotification } from '../context/NotificationContext';
import Modal from '../components/Modal';
import NewConversationModal from '../components/modals/NewConversationModal';

const MessageMedia = ({ mediaUrl, mediaType }) => {
    if (!mediaUrl) return null;

    if (mediaType.startsWith('image/')) {
        return <img src={mediaUrl} alt="Shared media" className="mt-2 rounded-lg max-w-xs" />;
    }

    if (mediaType.startsWith('video/')) {
        return <video src={mediaUrl} controls className="mt-2 rounded-lg max-w-xs" />;
    }

    return (
        <a href={mediaUrl} target="_blank" rel="noopener noreferrer" className="mt-2 text-blue-500 hover:underline">
            View Attachment
        </a>
    );
};

const ReplyPreview = ({ message, onCancel }) => {
    if (!message) return null;
    return (
        <div className="p-2 mb-2 bg-gray-200 rounded-lg">
            <div className="flex justify-between items-center">
                <p className="text-sm font-bold">Replying to {message.sender.name}</p>
                <button onClick={onCancel} className="text-red-500 hover:text-red-700">
                    <X size={16} />
                </button>
            </div>
            <p className="text-sm truncate">{message.content}</p>
        </div>
    );
};

const PinnedMessages = ({ messages, onUnpin, onMessageSelect }) => {
    const pinnedMessages = messages.filter(m => m.isPinned);
    const scrollContainerRef = useRef(null);

    if (pinnedMessages.length === 0) return null;

    const scroll = (direction) => {
        if (scrollContainerRef.current) {
            const scrollAmount = direction === 'left' ? -300 : 300;
            scrollContainerRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
        }
    };

    return (
      <div className="p-4 border-b border-[color:var(--border)] bg-yellow-100/50">
        <div className="flex justify-between items-center mb-2">
          <h3 className="font-bold flex items-center gap-2">
            <Pin size={16} />
            Pinned Messages
          </h3>
          {pinnedMessages.length > 2 && (
            <div className="flex gap-2">
              <button
                onClick={() => scroll("left")}
                className="p-1 rounded-full bg-[color:var(--primary)] hover:bg-black/20"
              >
                <ChevronLeft size={16} />
              </button>
              <button
                onClick={() => scroll("right")}
                className="p-1 rounded-full bg-[color:var(--primary)] hover:bg-black/20"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          )}
        </div>
        <div
          ref={scrollContainerRef}
          className="flex gap-4 overflow-x-auto pb-2 no-scrollbar"
        >
          {pinnedMessages.map((msg) => (
            <div
              key={msg.id}
              onClick={() => onMessageSelect(msg.id)}
              className="flex-shrink-0 w-64 p-2 bg-[color:var(--secondary)] rounded-lg cursor-pointer hover:destructive"
            >
              <div className="flex justify-between items-center">
                <p className="font-bold text-sm">{msg.sender.name}</p>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onUnpin(msg.id);
                  }}
                  className="text-red-500 hover:text-red-700"
                >
                  <X size={14} />
                </button>
              </div>
              <p className="text-sm truncate">{msg.content}</p>
            </div>
          ))}
        </div>
      </div>
    );
};

const ChatPage = () => {
    const { data: session } = useSession();
    const { addNotification } = useNotification();
    
    const [conversations, setConversations] = useState([]);
    const [activeConversation, setActiveConversation] = useState(null);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [mediaFile, setMediaFile] = useState(null);
    const [replyingTo, setReplyingTo] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSending, setIsSending] = useState(false);
    const [deletingMessage, setDeletingMessage] = useState(null);
    const [hidingConversation, setHidingConversation] = useState(null);
    
    const [showNewConversationModal, setShowNewConversationModal] = useState(false);
    
    const ws = useRef(null);
    const messagesEndRef = useRef(null);
    const fileInputRef = useRef(null);
    const messageInputRef = useRef(null);
    const messagesContainerRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    const scrollToMessage = (messageId) => {
        const messageElement = messagesContainerRef.current.querySelector(`[data-message-id="${messageId}"]`);
        if (messageElement) {
            messageElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
            messageElement.classList.add('highlight-message');
            setTimeout(() => {
                messageElement.classList.remove('highlight-message');
            }, 2000);
        }
    };

    useEffect(scrollToBottom, [messages]);

    useEffect(() => {
        if (replyingTo) {
            messageInputRef.current?.focus();
        }
    }, [replyingTo]);

    // WebSocket connection
    useEffect(() => {
        if (!activeConversation) return;

        ws.current = new WebSocket('ws://localhost:8080');

        ws.current.onopen = () => {
            console.log('WebSocket connected');
            ws.current.send(JSON.stringify({ type: 'subscribe', conversationId: activeConversation.id }));
        };

        ws.current.onmessage = (event) => {
            const data = JSON.parse(event.data);
            if (data.type === 'new_message' && data.message.conversationId === activeConversation.id) {
                setMessages(prevMessages => [...prevMessages, data.message]);
            }
            if (data.type === 'message_deleted' && data.message.conversationId === activeConversation.id) {
                setMessages(prevMessages => 
                    prevMessages.map(m => m.id === data.message.id ? data.message : m)
                );
            }
        };

        ws.current.onclose = () => console.log('WebSocket disconnected');
        ws.current.onerror = (error) => {
            console.error('WebSocket error:', error);
            addNotification('Chat connection error.', 'error');
        };

        return () => ws.current?.close();
    }, [activeConversation, addNotification]);

    const fetchConversations = useCallback(async () => {
        setIsLoading(true);
        try {
            const res = await fetch('/api/chat/conversations');
            if (!res.ok) throw new Error('Failed to fetch conversations');
            let data = await res.json();
            
            data = data.sort((a, b) => {
                if (a.isPinned && !b.isPinned) return -1;
                if (!a.isPinned && b.isPinned) return 1;
                if (a.name === 'General Chat') return -1;
                if (b.name === 'General Chat') return 1;
                return new Date(b.updatedAt) - new Date(a.updatedAt);
            });

            setConversations(data);
            if (data.length > 0) {
                setActiveConversation(data[0]);
            }
        } catch (err) {
            addNotification(err.message, 'error');
        } finally {
            setIsLoading(false);
        }
    }, [addNotification]);

    useEffect(() => {
        if (session) {
            fetchConversations();
        }
    }, [session, fetchConversations]);

    const fetchMessages = useCallback(async () => {
        if (!activeConversation) return;
        try {
            const res = await fetch(`/api/chat/conversations/${activeConversation.id}/messages`);
            if (!res.ok) throw new Error('Failed to fetch messages');
            const data = await res.json();
            setMessages(data);
        } catch (err) {
            addNotification(err.message, 'error');
        }
    }, [activeConversation, addNotification]);

    useEffect(() => {
        fetchMessages();
    }, [fetchMessages]);

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if ((!newMessage.trim() && !mediaFile) || !activeConversation) return;
        setIsSending(true);

        let mediaUrl = null;
        let mediaType = null;

        if (mediaFile) {
            try {
                const formData = new FormData();
                formData.append('file', mediaFile);
                const res = await fetch('/api/upload', {
                    method: 'POST',
                    body: formData,
                });
                const data = await res.json();
                if (!data.success) throw new Error('File upload failed');
                mediaUrl = data.url;
                mediaType = data.type;
            } catch (err) {
                addNotification(err.message, 'error');
                setIsSending(false);
                return;
            }
        }

        const messageData = {
            content: newMessage,
            conversationId: activeConversation.id,
            mediaUrl,
            mediaType,
            repliedToId: replyingTo?.id,
        };

        try {
            const res = await fetch('/api/chat/messages', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(messageData),
            });

            if (!res.ok) throw new Error('Failed to send message');
            
            const sentMessage = await res.json();

            if (ws.current?.readyState === WebSocket.OPEN) {
                ws.current.send(JSON.stringify({ type: 'chat_message', message: sentMessage }));
            }
            
            setNewMessage('');
            setMediaFile(null);
            setReplyingTo(null);
        } catch (err) {
            addNotification(err.message, 'error');
        } finally {
            setIsSending(false);
        }
    };
    
    const handleFileChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            setMediaFile(e.target.files[0]);
        }
    };

    const handleCreateConversation = async (selectedUserIds, name = null) => {
        try {
            const res = await fetch('/api/chat/conversations', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userIds: selectedUserIds, name }),
            });
            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.error || 'Failed to create conversation');
            }
            const newConversation = await res.json();
            setConversations(prev => [newConversation, ...prev]);
            setActiveConversation(newConversation);
            setShowNewConversationModal(false);
            addNotification(name ? `${name} created!` : 'Conversation started!', 'success');
        } catch (err) {
            addNotification(err.message, 'error');
        }
    };

    const handleTogglePin = async (conversationId, isPinned) => {
        try {
            const method = isPinned ? 'DELETE' : 'POST';
            const res = await fetch(`/api/chat/conversations/${conversationId}/pin`, { method });
            if (!res.ok) throw new Error('Failed to update pin status');
            
            setConversations(prev => {
                const updatedConversations = prev.map(c => 
                    c.id === conversationId ? { ...c, isPinned: !isPinned } : c
                );
                return updatedConversations.sort((a, b) => {
                    if (a.isPinned && !b.isPinned) return -1;
                    if (!a.isPinned && b.isPinned) return 1;
                    if (a.name === 'General Chat') return -1;
                    if (b.name === 'General Chat') return 1;
                    return new Date(b.updatedAt) - new Date(a.updatedAt);
                });
            });

            addNotification(`Conversation ${isPinned ? 'unpinned' : 'pinned'}`, 'success');
        } catch (err) {
            addNotification(err.message, 'error');
        }
    };

    const handleToggleMessagePin = async (messageId, isPinned) => {
        try {
            const res = await fetch(`/api/chat/messages/${messageId}/pin`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ isPinned: !isPinned }),
            });
            if (!res.ok) throw new Error('Failed to update message pin status');

            setMessages(prev => prev.map(m => m.id === messageId ? { ...m, isPinned: !isPinned } : m));
            addNotification(`Message ${isPinned ? 'unpinned' : 'pinned'}`, 'success');
        } catch (err) {
            addNotification(err.message, 'error');
        }
    };

    const handleDeleteMessage = async () => {
        if (!deletingMessage) return;
        try {
            const res = await fetch(`/api/chat/messages/${deletingMessage.id}`, {
                method: 'DELETE',
            });
            if (!res.ok) throw new Error('Failed to delete message');
            
            const deletedMessage = await res.json();

            if (ws.current?.readyState === WebSocket.OPEN) {
                ws.current.send(JSON.stringify({ type: 'delete_message', message: deletedMessage }));
            }

            addNotification('Message deleted', 'success');
        } catch (err) {
            addNotification(err.message, 'error');
        } finally {
            setDeletingMessage(null);
        }
    };

    const handleHideConversation = async () => {
        if (!hidingConversation) return;
        try {
            const res = await fetch(`/api/chat/conversations/${hidingConversation.id}`, {
                method: 'DELETE',
            });
            if (!res.ok) throw new Error('Failed to hide conversation');
            
            setConversations(prev => prev.filter(c => c.id !== hidingConversation.id));
            if (activeConversation?.id === hidingConversation.id) {
                setActiveConversation(null);
            }
            addNotification('Conversation hidden', 'success');
        } catch (err) {
            addNotification(err.message, 'error');
        } finally {
            setHidingConversation(null);
        }
    };

    if (isLoading) {
        return <LoadingSpinner />;
    }

    return (
        <>
            <div className="flex h-[calc(100vh-120px)] border border-[color:var(--border)] rounded-lg">
                {/* Sidebar */}
                <div className="w-1/3 border-r border-[color:var(--border)] flex flex-col">
                    <div className="p-4 border-b border-[color:var(--border)] flex justify-between items-center">
                        <h2 className="text-lg font-bold">Conversations</h2>
                        <button onClick={() => setShowNewConversationModal(true)} className="btn-primary p-2">
                            <UserPlus size={20} />
                        </button>
                    </div>
                    <div className="flex-1 overflow-y-auto">
                        {conversations.map((convo) => (
                            <div
                                key={convo.id}
                                className={`group relative p-4 cursor-pointer ${activeConversation?.id === convo.id
                                        ? "bg-[color:var(--accent)]"
                                        : "hover:bg-[color:var(--muted)]"
                                    }`}
                                onClick={() => setActiveConversation(convo)}
                            >
                                <div className="flex justify-between items-start">
                                    <p className="font-semibold">
                                        {convo.name ||
                                            convo.participants
                                                .filter((p) => p.userId !== session.user.id)
                                                .map((p) => p.user.name)
                                                .join(", ")}
                                    </p>
                                    {convo.isPinned && (
                                        <Pin size={16} className="text-yellow-500" />
                                    )}
                                </div>
                                <p className="text-sm text-[color:var(--muted-foreground)] truncate">
                                    {convo.messages[0]?.mediaUrl
                                        ? "Sent an attachment"
                                        : convo.messages[0]?.content || "No messages yet"}
                                </p>
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleTogglePin(convo.id, convo.isPinned);
                                    }}
                                    className="absolute top-1/2 -translate-y-1/2 right-4 opacity-0 group-hover:opacity-100 transition-opacity p-1 bg-white rounded-full shadow-md"
                                    title={convo.isPinned ? "Unpin" : "Pin"}
                                >
                                    <Pin
                                        size={16}
                                        className={
                                            convo.isPinned ? "text-yellow-500" : "text-gray-500"
                                        }
                                    />
                                </button>
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setHidingConversation(convo);
                                    }}
                                    className="absolute top-1/2 -translate-y-1/2 right-12 opacity-0 group-hover:opacity-100 transition-opacity p-1 bg-white rounded-full shadow-md"
                                    title="Hide Conversation"
                                >
                                    <Trash2 size={16} className="text-red-500" />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Chat Window */}
                <div className="w-2/3 flex flex-col">
                    {activeConversation ? (
                        <>
                            <div className="p-4 border-b border-[color:var(--border)] flex items-center gap-3">
                                <Users size={20} />
                                <h2 className="text-lg font-bold">
                                    {activeConversation.name ||
                                        activeConversation.participants
                                            .filter((p) => p.userId !== session.user.id)
                                            .map((p) => p.user.name)
                                            .join(", ")}
                                </h2>
                            </div>
                            <PinnedMessages
                                messages={messages}
                                onUnpin={(messageId) => handleToggleMessagePin(messageId, true)}
                                onMessageSelect={scrollToMessage}
                            />
                            <div ref={messagesContainerRef} className="flex-1 p-4 overflow-y-auto bg-[color:var(--muted)]/50">
                                {messages.map((msg) => (
                                    <div
                                        key={msg.id}
                                        data-message-id={msg.id}
                                        className={`group relative flex mb-4 ${msg.senderId === session.user.id
                                                ? "justify-end"
                                                : "justify-start"
                                            }`}
                                    >
                                        <div
                                            className={`rounded-lg p-3 max-w-lg ${msg.senderId === session.user.id
                                                    ? "bg-[color:var(--primary)] text-white"
                                                    : "bg-[color:var(--info)]"
                                                }`}
                                        >
                                            {msg.senderId !== session.user.id && (
                                                <p className="font-bold text-sm">{msg.sender.name}</p>
                                            )}
                                            {msg.repliedTo && (
                                                <div className="p-2 mb-2 bg-black/10 rounded-lg">
                                                    <p className="text-sm font-bold">
                                                        {msg.repliedTo.sender.name}
                                                    </p>
                                                    <p className="text-sm truncate">
                                                        {msg.repliedTo.content}
                                                    </p>
                                                </div>
                                            )}
                                            {msg.content && <p>{msg.content}</p>}
                                            <MessageMedia
                                                mediaUrl={msg.mediaUrl}
                                                mediaType={msg.mediaType}
                                            />
                                            <p className="text-xs text-right mt-1 opacity-70">
                                                {new Date(msg.createdAt).toLocaleTimeString()}
                                            </p>
                                        </div>
                                        <div className="absolute top-1/2 -translate-y-1/2 -left-8 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                                            <button onClick={() => setReplyingTo(msg)} title="Reply">
                                                <CornerDownLeft size={16} />
                                            </button>
                                            <button
                                                onClick={() =>
                                                    handleToggleMessagePin(msg.id, msg.isPinned)
                                                }
                                                title={msg.isPinned ? "Unpin" : "Pin"}
                                            >
                                                <Pin
                                                    size={16}
                                                    className={
                                                        msg.isPinned ? "bg-[color:var(--primary)]" : ""
                                                    }
                                                />
                                            </button>
                                            {msg.senderId === session.user.id && !msg.deletedAt && (
                                                <button
                                                    onClick={() => setDeletingMessage(msg)}
                                                    title="Delete"
                                                >
                                                    <Trash2 size={16} className="text-red-500" />
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                ))}
                                <div ref={messagesEndRef} />
                            </div>
                            <div className="p-4 border-t border-[color:var(--border)]">
                                <ReplyPreview
                                    message={replyingTo}
                                    onCancel={() => setReplyingTo(null)}
                                />
                                {mediaFile && (
                                    <div className="flex items-center gap-2 mb-2">
                                        <Paperclip size={16} />
                                        <span className="text-sm">{mediaFile.name}</span>
                                        <button
                                            onClick={() => setMediaFile(null)}
                                            className="text-red-500 hover:text-red-700"
                                        >
                                            <X size={16} />
                                        </button>
                                    </div>
                                )}
                                <form
                                    onSubmit={handleSendMessage}
                                    className="flex items-center gap-4"
                                >
                                    <button
                                        type="button"
                                        onClick={() => fileInputRef.current.click()}
                                        className="btn-secondary p-3"
                                    >
                                        <Paperclip size={20} />
                                    </button>
                                    <input
                                        type="file"
                                        ref={fileInputRef}
                                        onChange={handleFileChange}
                                        className="hidden"
                                    />
                                    <input
                                        ref={messageInputRef}
                                        type="text"
                                        value={newMessage}
                                        onChange={(e) => setNewMessage(e.target.value)}
                                        className="input w-full"
                                        placeholder="Type a message..."
                                        disabled={isSending}
                                    />
                                    <button
                                        type="submit"
                                        className="btn-primary p-3"
                                        disabled={isSending || (!newMessage.trim() && !mediaFile)}
                                    >
                                        <Send size={20} />
                                    </button>
                                </form>
                            </div>
                        </>
                    ) : (
                        <div className="flex-1 flex items-center justify-center text-[color:var(--muted-foreground)]">
                            <p>
                                Select a conversation or create a new one to start chatting.
                            </p>
                        </div>
                    )}
                </div>

                {showNewConversationModal && (
                    <Modal onClose={() => setShowNewConversationModal(false)}>
                        <NewConversationModal
                            conversations={conversations}
                            onClose={() => setShowNewConversationModal(false)}
                            onCreateConversation={handleCreateConversation}
                        />
                    </Modal>
                )}

                {deletingMessage && (
                    <Modal
                        onClose={() => setDeletingMessage(null)}
                        onConfirm={handleDeleteMessage}
                        confirmText="Delete"
                        confirmButtonVariant="danger"
                    >
                        <h3 className="text-lg font-semibold">Delete Message</h3>
                        <p>
                            Are you sure you want to delete this message? This action cannot
                            be undone.
                        </p>
                    </Modal>
                )}

                {hidingConversation && (
                    <Modal
                        onClose={() => setHidingConversation(null)}
                        onConfirm={handleHideConversation}
                        confirmText="Hide"
                        confirmButtonVariant="danger"
                    >
                        <h3 className="text-lg font-semibold">Hide Conversation</h3>
                        <p>
                            Are you sure you want to hide this conversation? You will no
                            longer see it in your conversation list.
                        </p>
                    </Modal>
                )}
            </div>
        </>
    );
};

export default ChatPage;