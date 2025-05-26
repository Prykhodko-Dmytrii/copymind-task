import type {
    AiResponseDTO,
    ConversationDTO, CreateConversationRequest, CreateConversationResponse, MessageDTO,

} from "../types";
import {baseApiClient, type BaseClientResponse} from "./base-api-client.ts";

export class ConversationClient {
    public static async getAllUserConversations():Promise<BaseClientResponse<ConversationDTO[]>>{
        return await baseApiClient<ConversationDTO[]>('/conversations','GET',)
    }
    public static async createConversation(payload:CreateConversationRequest):Promise<BaseClientResponse<CreateConversationResponse>>{
        return await baseApiClient<CreateConversationResponse>('/conversations','POST',payload)
    }
    public static async getConversationMessages(conversationId:string):Promise<BaseClientResponse<MessageDTO[]>>{
        return await baseApiClient<MessageDTO[]>(`/conversations/${conversationId}`,'GET')
    }
    public static async getMessageResponsesHistory(messageId:string):Promise<BaseClientResponse<AiResponseDTO[]>>{
        return await baseApiClient<AiResponseDTO[]>(`/conversations/${messageId}/responses`,'GET')
    }

}