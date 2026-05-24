import { CONFIG_KEYS } from '../config';
import type { DATA_CATEGORIES } from "./data.d";

export const getTabValue = (data: DATA_CATEGORIES, neededTab: string, searchedValue: string) => {
    const value = data[neededTab]?.find((i: any) => i["🔑name"] === searchedValue)?.value;
    if(value){
        return value;
    }
}
export const setTabValue = (data: DATA_CATEGORIES, tab: string, currentValue: any, searchedValue: any) => {
    const value = getTabValue(data, tab, searchedValue);
    if(value){
        return value;
    } else {
        return currentValue;
    }
}

export const fixImages = (data: DATA_CATEGORIES) => {
    const TABS = Object.keys(data);
    for(const tab of TABS) {
        const items = data[tab];
        for(const item of items){
            const keys = Object.keys(item);
            for(const key of keys){
                if(item[key].trim() === ''){
                    const neededTab = TABS.filter(tabI => tabI.indexOf(key) > -1)[0];
                    if(neededTab){
                        item[key] = setTabValue(data, neededTab, item[key], item['🔑name']);
                    } else {
                        switch(key){
                            case '🌐':
                                item[key] = setTabValue(data, '📍 LOCATIONS', item[key], item['📍location']);
                                break;
                        }
                    }
                }
            }
        }
    }
    return data;
}
export const getFinalData = (input: DATA_CATEGORIES) => {
    const data: any = {};
    const TABS = Object.keys(input);
    const configuration: any = {};
    const categories = TABS
                        .filter(tab => !CONFIG_KEYS.some(configKey => tab.toLowerCase().indexOf(configKey.toLowerCase()) > -1))
                        .map(tab => tab.toLowerCase());
    const configuration_keys = TABS.filter(tab => CONFIG_KEYS.some(configKey => tab.toLowerCase().indexOf(configKey.toLowerCase()) > -1 ? configKey : false));
    for(const configKey of configuration_keys){
        const tab = TABS.filter(tab => tab.toLowerCase().indexOf(configKey.toLowerCase()) > -1)[0];
        if(tab){
            const tabKey = CONFIG_KEYS.filter(configKey => tab.toLowerCase().indexOf(configKey.toLowerCase()) > -1)[0];
            if(tabKey){
                configuration[tabKey] = input[tab].reduce((acc: any, item: any) => {
                    acc[item["🔑name"]] = item.value.toLowerCase();
                    return acc;
                }, {});
            }
        }
    }
    for(const tab of TABS) {
        const isCategory = categories.some(category => tab.toLowerCase().indexOf(category) > -1);
        if(isCategory){
            const categoryKey = categories.filter(category => tab.toLowerCase().indexOf(category) > -1)[0];
            if(categoryKey){
                console.log('categoryKey', categoryKey);
                data[categoryKey] = input[tab].map((item: any) => {
                    const newItem: any = {};
                    const keys = Object.keys(item);
                    for(const key of keys){
                        if(key === '🔑name'){
                            newItem[key] = item[key];
                        } else {
                            newItem[key] = item[key];
                        }
                    }
                    return newItem;
                });
            }
        }
    }
    return {
        configuration,
        categories,
        data,
    };
}