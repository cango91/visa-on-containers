interface IRequestOptions{
    method: string;
    headers?: any;
    body?: any;
}

export function sendServiceRequest(url: string, serviceSecret: string, method = "GET", payload?: any) {
    const options: IRequestOptions = {
        method,
        headers: {
            "x-service-secret": serviceSecret,
            "Content-Type": "application/json"
        },
    };
    if(payload){
        options.body = JSON.stringify(payload);
    }
    return fetch(url,options);
}