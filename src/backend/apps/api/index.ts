import { FS } from "../../_shared/fs/fs";
import { convertText2JSON, getCellValue, getHeaders, getProjects, getSheetTab } from '../../_shared/google/google';
import { LOG } from "../../_shared/log/log";
import type{ DATA_CATEGORIES } from './data/data.d';
import { fixImages, getFinalData } from './data/data';

const TARGET_ID = "1R6C_CmAt8Z6-fMObyP355mZJM71cQ4dJPXmS-fhk1pQ";
const TARGET_TAB = "PROJEKTE";
const OUTPUT_PATH = "src/_data/projects.json";
const FINAL_PATH = "src/_data/all.json";

const main = async () => {
    try {
        const TABS = ["📍 LOCATIONS", "🖼️ ICONS", "PROJECTS", "HACKATHONS", "CONFERENCES", "WORKSHOPS", "STATUS", "TECH"];
        let result: any = {};
        for(const tab of TABS) {
            const data = await getSheetTab(TARGET_ID, tab);
            result[tab] = data;
            result = fixImages(result);
        }
        FS.writeFile(OUTPUT_PATH, result);
        FS.writeFile(FINAL_PATH, getFinalData(result));
    } catch (error) {
        const message = error instanceof Error ? error.message : `${error}`;
        LOG.FAIL(`API export failed: ${message}`);
        process.exitCode = 1;
    }
};

void main();
