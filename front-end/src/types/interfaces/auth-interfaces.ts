export interface RegisterRequest {
    userName: string;
    email: string;
    password: string;
}
export interface RegisterResponse {
    id: string;
    userName: string;
    email: string;
}

export interface LoginRequest {
    email: string;
    password: string;
}
export interface LoginResponse {
    accessToken: string;
    userName: string;
}

export interface TokenRefreshResponse {
    accessToken: string;
}

export interface UserDto{
    email:string,
    userName:string;
}