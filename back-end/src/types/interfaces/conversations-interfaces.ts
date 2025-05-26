
export interface ConversationDTO {
    id: string;
    title: string;
    createdDateTime: string;
}

export interface MessageDTO {
    id: string;
    parentMessageId?: string;
    status: 'error' | 'success' | 'pending';
    description: string;
    decision: string;
    considerations: string[];
    createdDateTime: string;
    aiResponse?: AiResponseDTO;
}

export interface AiResponseDTO {
    id: string;
    decisionCategory: string;
    cognitiveBiases: string[];
    version: number;
    missingAlternatives: string[];
    createdDateTime: string;
}

export interface CreateConversationRequest{
    title:string;
}

export interface CreateConversationResponse{
    conversationId:string;
}