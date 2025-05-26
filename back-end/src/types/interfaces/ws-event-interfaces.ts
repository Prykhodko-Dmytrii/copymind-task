import {LLMAnalysis} from "./llm-interfaces";

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
}

export interface MessageErrorEvent {
    messageId: string;
    error: string;
}

export interface RetrySuccessEvent {
    messageId: string;
    analysis: LLMAnalysis;
    responseId: string;
}

export interface RetryErrorEvent {
    messageId: string;
    error: string;
}

export interface RegenerateSuccessEvent {
    messageId: string;
    analysis: LLMAnalysis;
    responseId: string;
}

export interface RegenerateErrorEvent {
    messageId: string;
    error: string;
}
