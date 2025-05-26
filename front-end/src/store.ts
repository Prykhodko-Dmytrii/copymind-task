import {create} from 'zustand';
import {subscribeWithSelector} from 'zustand/middleware';
import {io, Socket} from 'socket.io-client';
import type {
    AiResponseDTO,
    ConversationDTO,
    CreateConversationRequest,
    LoginRequest,
    MessageDTO, MessageProcessedEvent,
    RegenerateSuccessEvent, RetrySuccessEvent
} from "./types";
import {AuthClient} from "./api/auth-client.ts";
import {ConversationClient} from "./api/conversation-client.ts";
import {toaster} from "./components/ui/toaster.tsx";

interface AuthState {
    userName: null | string,
    isAuthenticated: boolean,
    isLoadingAuth: boolean;
    setAuth: (isAuthenticated: boolean, isLoadingAuth: boolean) => void,
    login: (payload: LoginRequest) => Promise<void>,
    logout: () => Promise<void>,
    getSystemUser: () => Promise<void>
}

interface ConversationState {
    conversations: ConversationDTO[];
    setConversations: (list: ConversationDTO[]) => void;
    isLoadingConversations: boolean;
    isPendingCreateConversation: boolean;
    errorLoadingConversations: string | null;
    errorCreateConversation: string | null;
    createConversation: (payload: CreateConversationRequest) => Promise<string>;
    getConversations: () => Promise<void>
}

interface MessageState {
    messages: MessageDTO[];
    isLoadingMessages: boolean;
    errorLoadingMessages: string | null;
    setMessages: (list: MessageDTO[]) => void;
    addMessage: (msg: MessageDTO) => void;
    updateMessage: (id: string, updates: Partial<MessageDTO>) => void;
    getConversationMessages: (conversationId: string) => Promise<void>;
    activeMessageHistory: {
        messageId: string,
        responses: AiResponseDTO[],
        error: null | string;
        isLoading: boolean;
    } | null,
    getActiveMessageHistory: (messageId: string) => Promise<void>;
    closeMessageHistory: () => void,
}

interface SocketState {
    socket: Socket | null;
    joined: string[];
    connect: (token: string) => void;
    disconnect: () => void;
    join: (conversationId: string) => void;
    leave: (conversationId: string) => void;
    send: (data: { conversationId: string; description: string; decision: string; considerations: string[] }) => void;
    retry: (conversationId: string, messageId: string) => void;
    regenerate: (conversationId: string, messageId: string) => void;
}

export const useAuthStore = create<AuthState>(set => ({
    userName: null,
    isAuthenticated: false,
    isLoadingAuth: true,
    setAuth: (isAuthenticated, isLoadingAuth) => set({isLoadingAuth, isAuthenticated}),
    getSystemUser: async () => {
        set({isLoadingAuth: true, isAuthenticated: false, userName: null});
        const res = await AuthClient.getSystemUser();
        if (res.data && !res.error) {
            set({isLoadingAuth: true, userName: res.data.userName, isAuthenticated: true})
        } else {
            set({isLoadingAuth: false, userName: null, isAuthenticated: false})
        }
    },
    login: async (payload) => {
        const res = await AuthClient.login(payload);
        if (res.data && res.error === null) {
            set({userName: res.data.userName, isAuthenticated: true});
            AuthClient.setAccessTokenToStorage(res.data.accessToken)
        } else {
            toaster.create({
                description: res.error?.message ?? 'Ooups something went wrong...',
                type: 'error',
                title: "Failed Sing in"
            })
        }
    },
    logout: async () => {
        const res = await AuthClient.logout();
        if (res.data && res.error === null) {
            AuthClient.setAccessTokenToStorage('')
            window.location.reload()
        } else {
            toaster.create({
                description: res.error?.message ?? 'Ooups something went wrong...',
                type: 'error',
                title: "Failed Logout"
            })
        }

    }
}));

export const useConversationStore = create<ConversationState>((set, getState) => ({
    conversations: [],
    errorLoadingConversations: null,
    errorCreateConversation: null,
    isLoadingConversations: true,
    isPendingCreateConversation: false,
    setConversations: list => set({conversations: list}),
    createConversation: async (payload) => {
        set({isPendingCreateConversation: true, errorCreateConversation: null})
        const res = await ConversationClient.createConversation(payload);
        if (res.data && res.error === null) {
            const conversations = getState().conversations;
            set({
                isPendingCreateConversation: false,
                errorCreateConversation: null,
                conversations: [...conversations, {
                    id: res.data.conversationId,
                    title: payload.title,
                    createdDateTime: new Date().toISOString()
                }]
            });
            return res.data.conversationId;
        } else {
            set({
                isPendingCreateConversation: false,
                errorCreateConversation: res.error?.message ?? 'Ooups something went wrong...',
            });
            return '';
        }
    },
    getConversations: async () => {
        set({isLoadingConversations: true, errorLoadingConversations: null, conversations: []});
        const res = await ConversationClient.getAllUserConversations();
        if (res.data && !res.error) {
            set({conversations: res.data, errorLoadingConversations: null, isLoadingConversations: false})
        } else {
            set({
                isLoadingConversations: false,
                errorLoadingConversations: res.error?.message ?? 'Ooups something went wrong...'
            });
        }
    },
}));

export const useMessageStore = create<MessageState>(set => ({
    messages: [],
    errorLoadingMessages: null,
    isLoadingMessages: true,
    setMessages: list => set({messages: list}),
    addMessage: msg => set(state => ({messages: [...state.messages, msg]})),
    updateMessage: (id, updates) => set(state => ({
        messages: state.messages.map(m => m.id === id ? {...m, ...updates} : m)
    })),
    getConversationMessages: async (conversationId) => {
        set({isLoadingMessages: true, errorLoadingMessages: null, messages: []})
        const res = await ConversationClient.getConversationMessages(conversationId);
        if (res.data && res.error === null) {
            set({isLoadingMessages: false, errorLoadingMessages: null, messages: res.data})
        } else {
            set({isLoadingMessages: true, errorLoadingMessages: res.error?.message ?? 'Ooups something went wrong...'});
        }
    },
    activeMessageHistory: null,
    closeMessageHistory: () => set({activeMessageHistory: null}),
    getActiveMessageHistory: async (messageId) => {
        set({activeMessageHistory: {messageId, error: null, isLoading: true, responses: []}})
        const res = await ConversationClient.getMessageResponsesHistory(messageId);
        if (res.data && res.error === null) {
            set({activeMessageHistory: {messageId, error: null, isLoading: false, responses: res.data}})
        } else {
            set({
                activeMessageHistory: {
                    messageId,
                    error: res.error?.message ?? 'Ooups something went wrong...',
                    isLoading: false,
                    responses: []
                }
            })
        }
    },
}));

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001';

export const useSocketStore = create<SocketState>()(
    subscribeWithSelector((set, get) => ({
        socket: null,
        joined: [],

        connect: token => {
            if (get().socket) return;
            const s = io(API_BASE, {auth: {token}});
            set({socket: s});

            // Setup listeners once
            s.on('message:pending', (msg: MessageDTO) => {
                console.log('message:pending', {msg})
                useMessageStore.getState().addMessage({...msg, status: 'pending',createdDateTime:new Date().toISOString()});
            });
            s.on('message:processed', ({messageId, analysis, responseId,version} : MessageProcessedEvent) => {
                console.log('message:processed', {messageId, analysis, responseId})
                useMessageStore.getState().updateMessage(messageId, {
                    status: 'success',
                    aiResponse: {id: responseId, ...analysis,version,createdDateTime:new Date().toISOString()}
                });
            });
            s.on('message:error', ({messageId, error}) => {
                console.log('message:error', {messageId, error})
                useMessageStore.getState().updateMessage(messageId, {status: 'error'});
            });
            s.on('message:retrySuccess', ({messageId, analysis, responseId,version}: RetrySuccessEvent) => {
                console.log('message:retrySuccess', {messageId, analysis, responseId})
                useMessageStore.getState().updateMessage(messageId, {
                    status: 'success',
                    aiResponse: {id: responseId, ...analysis,version,createdDateTime:new Date().toISOString()}
                });
            });
            s.on('message:retryError', ({messageId, error}) => {
                console.log('message:retrySuccess', {messageId, error})
                useMessageStore.getState().updateMessage(messageId, {status: 'error'});
            });
            s.on('message:regenerateSuccess', ({messageId, analysis, responseId,version} : RegenerateSuccessEvent) => {
                console.log('message:regenerateSuccess', {messageId, analysis, responseId})
                useMessageStore.getState().updateMessage(messageId, {
                    status: 'success',
                    aiResponse: {id: responseId, ...analysis,version,createdDateTime:new Date().toISOString()}
                });
            });
            s.on('message:regenerateError', ({messageId, error}) => {
                console.log('message:regenerateError', {messageId, error})
                useMessageStore.getState().updateMessage(messageId, {status: 'error'});
            });

            // Auto-join existing rooms
            get().joined.forEach(id => s.emit('conversation:join', id));
        },

        disconnect: () => {
            const s = get().socket;
            if (s) {
                get().joined.forEach(id => s.emit('conversation:leave', id));
                s.disconnect();
                set({socket: null, joined: []});
            }
        },
        leave:conversationId => {
            const s = get().socket;
            set(state => ({
                joined: state.joined.filter(el=>el !== conversationId)
            }));
            s?.emit('conversation:leave', conversationId);
        },
        join: conversationId => {
            const s = get().socket;
            set(state => ({
                joined: state.joined.includes(conversationId)
                    ? state.joined
                    : [...state.joined, conversationId]
            }));
            s?.emit('conversation:join', conversationId);
        },

        send: data => {
            get().socket?.emit('message:send', data);
        },

        retry: (conversationId, messageId) => {
            get().socket?.emit('message:retry', {conversationId, messageId});
        },

        regenerate: (conversationId, messageId) => {
            get().socket?.emit('message:regenerate', {conversationId, messageId});
            useMessageStore.getState().updateMessage(messageId, {
                status: 'pending',
                aiResponse:undefined,
            });
        },
    }))
);
