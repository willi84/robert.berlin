import { FS } from "../../_shared/fs/fs";
import { convertText2JSON, getCellValue, getHeaders, getProjects, getSheetTab } from '../../_shared/google/google';
import { LOG } from "../../_shared/log/log";
import type{ DATA_CATEGORIES } from './data/data.d';
import { checkKeys, fixImages, getFinalData } from './data/data';
import { getHttpStatus } from '../../_shared/http/http';

const TARGET_ID = "1R6C_CmAt8Z6-fMObyP355mZJM71cQ4dJPXmS-fhk1pQ";
const OUTPUT_PATH = "src/_data/projects.json";
const FINAL_PATH = "src/_data/all.json";
const EMOJI_PATH = "src/_data/emojis.json";

const CONFIG_TAB = '⚙️ CONFIG';
const COLUMNS_TAB = 'COLUMNS';

const main = async () => {
    try {
        // connection check
        const status = getHttpStatus('github.com', true, 500);
        if(status >= 400 || status < 200 ){
            LOG.FAIL(`[${status}] no connection currently available`);
            return;
        }
        LOG.OK(`[${status}] connection check`);
        // get config
        const config = await getSheetTab(TARGET_ID, CONFIG_TAB, []);
        // console.log(config)
        // TABS
        const ACTIVE_TABS = config
        .filter((row) => row['status'] === 'active')
        const TABS = ACTIVE_TABS
        .map((row) => row['tab']);
        LOG.INFO(`active tabs: ${TABS.join(', ')}`);
        let result: any = {};
        for(const TAB of ACTIVE_TABS) {
            const tab = TAB['tab'];
            const tabItem = config.filter((row) => row['status'] === 'active' && row['tab'] === tab)[0];
            const data = await getSheetTab(TARGET_ID, tab, tabItem['filtered'].split(',').map((item: string) => item.trim()));
            const isValid = checkKeys(Object.keys(data[0] || {}), TAB['value'], tab);
            if(!isValid) {
                return;
            }
            result[tab] = data;
            result = fixImages(result);
        }
        FS.writeFile(OUTPUT_PATH, result);
        FS.writeFile(FINAL_PATH, getFinalData(result));

        const TABS_EMOJIS = 'EMOJIS';
        let dataEmojis: any = await getSheetTab(TARGET_ID, TABS_EMOJIS, []);
        FS.writeFile(EMOJI_PATH, dataEmojis);


    } catch (error) {
        const message = error instanceof Error ? error.message : `${error}`;
        LOG.FAIL(`API export failed: ${message}`);
        process.exitCode = 1;
    }
};

void main();
