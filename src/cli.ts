import fs from "fs";
import path from "path";
import * as commandpost from "commandpost";
import yaml from "js-yaml";

import * as lib from "./";

const packageJson = JSON.parse(fs.readFileSync(path.join(__dirname, "../package.json")).toString());

interface RootOptions {
    configPath: string;
    githubToken: string;
    run: boolean;
    version: boolean;
}

let root = commandpost
    .create<RootOptions, {}>("github-unsubscriber")
    .option("-c, --configPath <path>", "config file path", "unsubscribe-config.yml")
    .option("--githubToken", "GitHub token uses for API access", process.env["GITHUB_TOKEN"])
    .option("--run", "really run unsubscribe")
    .option("-v, --version", "output the version number")
    .action(opts => {
        if (opts.version) {
            console.log(`version: ${packageJson.version}`);
            return;
        }

        const rawConfig: lib.RawConfig = yaml.safeLoad(fs.readFileSync(opts.configPath[0], { encoding: "utf8" }));
        const config = lib.toConfig(rawConfig);
        config.githubToken = opts.githubToken;

        (async () => {
            const watchingList = await lib.fetchWatchingList(config);
            console.log("Below list will be unwatch...");
            watchingList.forEach(repo => {
                console.log(`\t${repo.owner.login}/${repo.name}`);
            });
            if (!opts.run) {
                console.log("Let's use the --run option if you really want to unwatch...");
                return;
            }
            await lib.execUnwatch(config, watchingList);
            console.log("done!");
        })()
            .catch(errorHandler);
    });

commandpost
    .exec(root, process.argv)
    .catch(errorHandler);

function errorHandler(err: any): Promise<any> {

    if (err instanceof Error) {
        console.error(err.stack);
    } else {
        console.error(err);
    }
    return Promise.resolve(null).then(() => {
        process.exit(1);
        return null;
    });
}
