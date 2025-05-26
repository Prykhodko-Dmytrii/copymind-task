import type {
    LoginRequest,
    LoginResponse,
    RegisterRequest,
    RegisterResponse,
    TokenRefreshResponse,
    UserDto
} from "../types";
import {baseApiClient, type BaseClientResponse} from "./base-api-client.ts";

export class AuthClient{
    public static async login(payload:LoginRequest):Promise<BaseClientResponse<LoginResponse>>{
        return await baseApiClient<LoginResponse>('/auth/login','POST',payload)
    }
    public static async register(payload:RegisterRequest):Promise<BaseClientResponse<RegisterResponse>>{
        return await baseApiClient<RegisterResponse>('/auth/register','POST',payload)
    }
    public static async logout():Promise<BaseClientResponse<boolean>>{
        return await baseApiClient<boolean>('/auth/logout','POST',)
    }
    public static async refreshToken():Promise<BaseClientResponse<TokenRefreshResponse>>{
        return await baseApiClient<TokenRefreshResponse>('/auth/token','POST',)
    }
    public static async  getSystemUser ():Promise<BaseClientResponse<UserDto>>{
        return await baseApiClient<UserDto>('/auth/me','GET',)
    }

    public static setAccessTokenToStorage (token:string){
        localStorage.setItem('accessToken',token);
    }
    public static getAccessTokenFromStorage (){
       const res = localStorage.getItem('accessToken');
       if(res){
           return res;
       }else{
           return null;
       }
    }
}