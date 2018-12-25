import { fetchAllWatching, unsubscribeRepository, Repository } from "./github";


export interface RawConfig {
    unwatch?: {
        rules?: string[];
        ignores?: string[];
    };
}

export interface Config {
    githubToken?: string;
    unwatch: {
        rules: RegExp[];
        ignores: RegExp[];
    }
}


export function toConfig(rawConfig: RawConfig): Config {
    const config: Config = {
        unwatch: {
            rules: [],
            ignores: [],
        },
    };
    if (!rawConfig.unwatch) {
        return config;
    }
    if (Array.isArray(rawConfig.unwatch.rules)) {
        config.unwatch.rules = rawConfig.unwatch.rules.map(v => new RegExp(v));
    }
    if (Array.isArray(rawConfig.unwatch.ignores)) {
        config.unwatch.ignores = rawConfig.unwatch.ignores.map(v => new RegExp(v));
    }

    return config;
}

export async function fetchWatchingList(config: Config) {
    const repoList = await fetchAllWatching(config);
    if (repoList.some(repo => !repo)) {
        throw new Error(`null repo found: SSO is disabled? https://github.com/settings/tokens`);
    }
    const resultList = repoList
        .filter(repo => {
            const target = !!config.unwatch.rules.find(re => re.test(`${repo.owner.login}/${repo.name}`));
            const ignore = !!config.unwatch.ignores.find(re => re.test(`${repo.owner.login}/${repo.name}`));
            return target && !ignore;
        });
    return resultList;
}

export async function execUnwatch(config: Config, unwatchList: Repository[]) {
    const waitList = unwatchList.map(repo => {
        return unsubscribeRepository(config, repo.id);
    });
    await Promise.all(waitList);
}

