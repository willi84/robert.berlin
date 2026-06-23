import Ajv from "ajv";
import addFormats from "ajv-formats";
import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, statSync, writeFileSync } from "node:fs";
import { dirname } from "node:path";
import { LOG } from '../../_shared/log/log';
import { command } from '../../_shared/cmd/cmd';
import { getGithubData } from '../../_shared/github/github';
import type { CONFIG } from './index.d';

const IS_DEV = process.env.NODE_ENV !== "production";
const DEBUG = IS_DEV;
const per_page = DEBUG ? 3: 100;
const MAX_PAGE = DEBUG ? 1 : 20;
let TOKENS_USED = 0;

const OWNER = process.env.GITHUB_OWNER || "willi84";
const TOKEN = process.env.GITHUB_ROBERT_BERLIN_PAT || "";
const OUT = process.env.OUT || "src/_data/github.json";

const token = {
    PAT: TOKEN, // as reference
    used: TOKENS_USED
}

const SCHEMA_FILE = command(`curl "https://willi84.github.io/project-tracking-record/project.schema.json"`);

const ONE_DAY_MS = 24 * 60 * 60 * 1000;

type Json = any;

const isFresh = (file: string) => {
    if(DEBUG){
        LOG.INFO(`DEBUG: skip refresh check for ${file}`);
        return false;
    }
    if (!existsSync(file)) return false;

    const stat = statSync(file);
    return Date.now() - stat.birthtimeMs < ONE_DAY_MS;
};

if (isFresh(OUT)) {
    LOG.INFO(`skip: ${OUT} wurde vor weniger als 1 Tag erstellt`);
    process.exit(0);
}

const sleep = (seconds: number) => {
    execFileSync(process.platform === "win32" ? "timeout" : "sleep", [String(seconds)]);
};

const getRepos = (config: CONFIG) => {
    const repos: Json[] = [];
   

    for (let page = 1; page <= MAX_PAGE; page++) {
        LOG.INFO(`fetching page ${page} of repos for owner ${OWNER}...`);
        const url = `https://api.github.com/users/${OWNER}/repos?per_page=${per_page}&page=${page}&sort=updated`;
        const result = getGithubData(url, config);
        const batch = result.json;

        if (!Array.isArray(batch) || batch.length === 0) break;

        repos.push(...batch);
        if(result.remaining.current < 1000){
            sleep(1);
        }
    }

    return repos;
};

const readProjectJson = (repo: string, config: CONFIG): { exists: boolean; json?: Json; error?: string } => {
    try {
        const FILE = `PROJECT.json`;
        const TARGET_FILE_META = `https://api.github.com/repos/${OWNER}/${repo}/contents/${FILE}`;
        const TARGET_FILE_RAW = `https://raw.githubusercontent.com/${OWNER}/${repo}/main/${FILE}`;
        const result = getGithubData(TARGET_FILE_META, config, { failMsg: `no file found`, failType: 'WARN', target: FILE, showLog: false });
        const data = result.json;
        
        if (!data) {
            LOG.WARN(`PROJECT.json not found for repo ${repo}`);
            return {
                exists: false,
                json: null
            }
        }
        const result2 = getGithubData(TARGET_FILE_RAW, config);
        const json = result2.json;
        const fileExists = result2.header.status === '200';
        if(!fileExists){
            LOG.WARN(`Failed to fetch raw PROJECT.json for repo ${repo}, status: ${result2.header.status}`);
            return {
                exists: false,
                json: null,
                error: `Failed to fetch raw PROJECT.json, status: ${result2.header.status}`
            }
        }

        if(result.remaining.current < 1000){
            sleep(1);
        }
        return {
            exists: true,
            json
        };
    } catch (error) {
        LOG.FAIL(`Failed to fetch PROJECT.json for repo ${repo}: ${error instanceof Error ? error.message : `${error}`}`);
        return {
            exists: false,
            error: String(error)
        };
    }
};

const main = (config: CONFIG) => {
    const schema = JSON.parse(SCHEMA_FILE);
    const ajv = new Ajv({ allErrors: true });
    addFormats(ajv);

    const validate = ajv.compile(schema);

    const createdAt = new Date().toISOString();
    const repos = getRepos(config);

    const result = {
        createdAt,
        owner: OWNER,
        count: repos.length,
        repos: repos.map((repo) => {
            const project = readProjectJson(repo.name, config);
            const valid = project.exists && project.json ? validate(project.json) : false;

            return {
                repo: {
                    name: repo.name,
                    url: repo.html_url,
                    license: repo.license?.spdx_id || null,
                    author: repo.owner?.login || null,
                    created: repo.created_at,
                    lastChange: repo.updated_at
                },
                hasProjectJson: project.exists,
                validation: project.exists
                    ? {
                          valid,
                          errors: valid ? [] : validate.errors ?? []
                      }
                    : null
            };
        })
    };

    mkdirSync(dirname(OUT), { recursive: true });
    writeFileSync(OUT, JSON.stringify(result, null, 2));

    LOG.OK(`wrote ${OUT} with ${result.count} repos, created at ${createdAt} [🥮: ${config.used}]`);
};

main(token);
