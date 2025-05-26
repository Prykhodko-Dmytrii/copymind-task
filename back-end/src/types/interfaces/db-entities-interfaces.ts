export interface UserEntity {
    id: string;
    userName: string;
    email: string;
    password: string;
}

export interface RefreshTokenEntity {
    token: string;
    userId: string;
}

export interface ConversationEntity {
    id: string;
    title: string;
    userId: string;
    createdDateTime: string;  // ISO timestamp
}

export interface MessageEntity {
    id: string;
    userId: string;
    parentMessageId?: string;
    conversationId: string;
    status: 'error' | 'success' | 'pending';
    description: string;
    decision: string;
    considerations: string[];
    createdDateTime: string;  // ISO timestamp
}

export interface AiResponseEntity {
    id: string;
    messageId: string;
    decisionCategory: string;
    cognitiveBiases: string[];
    version: number;
    missingAlternatives: string[];
    createdDateTime: string;  // ISO timestamp
}