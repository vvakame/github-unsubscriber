import fetch from "node-fetch";

export interface Request<T=any> {
    query: string;
    variables?: T;
}

export interface Response<T=any> {
    data: T;
    errors?: {
        message: string;
        locations: { line: number; column: number; };
    }[];
}

export class Client {
    endpoint = "https://api.github.com/graphql";
    authToken = process.env["GITHUB_TOKEN"];

    async execOperation<T>(req: Request): Promise<Response<T>> {
        const resp = await fetch(this.endpoint, {
            method: "POST",
            headers: {
                Authorization: `bearer ${this.authToken}`,
            },
            body: JSON.stringify(req),
        });
        return await resp.json();
    }
}

export const defaultClient = new Client();
