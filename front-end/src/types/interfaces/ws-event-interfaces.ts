import type {LLMAnalysis} from "./llm-interfaces.ts";

export interface SendMessageEvent {
    conversationId: string;
    description: string;
    decision: string;
    considerations: string[];
}

export interface RetryEvent {
    messageId: string;
}

export interface RegenerateEvent {
    messageId: string;
}

export interface MessagePendingEvent {
    messageId: string;
    conversationId: string;
    description: string;
    decision: string;
    considerations: string[];
}

export interface MessageProcessedEvent {
    messageId: string;
    analysis: LLMAnalysis;
    responseId: string;
    version:number;
}

export interface MessageErrorEvent {
    messageId: string;
    error: string;
}

export interface RetrySuccessEvent {
    messageId: string;
    analysis: LLMAnalysis;
    responseId: string;
    version:number;
}

export interface RetryErrorEvent {
    messageId: string;
    error: string;
}

export interface RegenerateSuccessEvent {
    messageId: string;
    analysis: LLMAnalysis;
    responseId: string;
    version:number;
}

export interface RegenerateErrorEvent {
    messageId: string;
    error: string;
}
