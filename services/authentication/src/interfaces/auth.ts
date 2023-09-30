export interface IOAuthRequest{
    authorizationCode: string;
    state: string;
}

export interface IOAuthResponse{
    accessToken: string;
    refreshToken: string;
    additionalData?: any;
}

export interface ILocalAuthRequest{
    email: string;
    password: string;
}

export interface ILocalAuthResponse{
    accessToken: string;
    refreshToken: string;
}