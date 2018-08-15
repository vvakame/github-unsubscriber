
import { defaultClient as cli } from "./graphql";

// https://developer.github.com/v4/explorer/

export interface QueryResponse {
    viewer: {
        watching: RepositoryConnection;
    };
}

export interface RepositoryConnection {
    pageInfo: PageInfo;
    nodes: Repository[];
}

export interface PageInfo {
    endCursor: string | null;
    hasNextPage: boolean;
}

export interface Repository {
    id: string;
    owner: RepositoryOwner;
    name: string;
}

export interface RepositoryOwner {
    id: string;
    login: string;
}

export interface Config {
    githubToken?: string;
}

export async function fetchAllWatching(config: Config): Promise<Repository[]> {
    cli.authToken = config.githubToken || "";

    const query = `
    query ($after: String) {
        viewer {
            watching(first: 100, privacy: PRIVATE, after: $after) {
                pageInfo {
                    endCursor
                    hasNextPage
                }
                nodes {
                    id
                    owner {
                        id
                        login
                    }
                    name
                }
            }
        }
    }
    `;

    let repoList: Repository[] = [];
    let variables: { after?: string | null } = {};
    while (true) {
        const resp = await cli.execOperation<QueryResponse>({
            query,
            variables,
        });
        const watching = resp.data.viewer.watching;
        repoList = [...repoList, ...watching.nodes];
        if (!watching.pageInfo.hasNextPage) {
            break;
        }
        variables.after = watching.pageInfo.endCursor;
    }
    return repoList;
}

export async function unsubscribeRepository(config: Config, id: string): Promise<{}> {
    cli.authToken = config.githubToken || "";

    const query = `
    mutation ($id: ID!) {
        updateSubscription(input: {subscribableId: $id, state: UNSUBSCRIBED}) {
            clientMutationId
        }
    }
    `;
    let variables = { id };

    const resp = await cli.execOperation<QueryResponse>({
        query,
        variables,
    });

    return resp;
}
