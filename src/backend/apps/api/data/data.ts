import { KEY_VALUES } from '../../..';
import { LOG } from '../../../_shared/log/log';
import { CONFIG_KEYS } from '../config';
import type { DATA_CATEGORIES, DataList, REPLACE_CONFIG, SYNONYM_ITEM } from "./data.d";

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

export const replaceValues = (items: DataList, config: REPLACE_CONFIG) => {
    const images = config.images;
    const locations = config.locations;
    for(const item of items){
        const keys = Object.keys(item);
        for(const key of keys){
            switch(key){
                case '🖼️':
                    const imageKey = item['🔑name'];
                    if(imageKey && images[imageKey]){
                        item[key] = images[imageKey];
                    }
                    break;
                case '🌐':
                    const locationKey = item['📍location'];
                    if(locationKey && locations[locationKey]){
                        item[key] = locations[locationKey];
                    }
                    break;
            }
        }
    }
    return items;
}
export const getFinalData = (input: DATA_CATEGORIES) => {
    const data: any = {};
    const TABS = Object.keys(input);
    let configuration: any = {};
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
        // console.log(categories)
        const isCategory = categories.some(category => tab.toLowerCase().indexOf(category) > -1);
        if(isCategory){
            const categoryKey = categories.filter(category => tab.toLowerCase().indexOf(category) > -1)[0];
            if(categoryKey && Array.isArray(input[tab])){
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
            } else {
                configuration = input[tab];
            }
        }
    }
    return {
        configuration,
        categories,
        data,
    };
}

export const doCheck = (keys: string[], CONFIG_KEYS: string[], tab: string) => {
    if(keys.length === 0 || CONFIG_KEYS.length === 0) {
        return false;
    }
    if(keys.filter((key) => CONFIG_KEYS.includes(key)).length !== CONFIG_KEYS.length) {
        LOG.FAIL(`config sheet must contain columns: ${CONFIG_KEYS.join(', ')} for tab: ${tab}`);
        return false
    }
    return true;
}

export const checkKeys = (keys: string[], type: string, tab: string) => {
    switch(type){
        case 'config':
            return doCheck(keys, ['🖼️', 'value', '🔑name'], tab);
        case 'data':
            return doCheck(keys, ['🖼️', '🔑name', 'status'], tab);
        default:
            LOG.WARN(`no type found for tab: ${tab}`);
            return false;
    }
}
export const checkColumns = (items: DataList, colsConfig: SYNONYM_ITEM[]) => {
    // const categories = Object.keys(data);
    const mapping: { [key: string]: SYNONYM_ITEM } = {};
    for(const colConfig of colsConfig){
        mapping[colConfig.value] = {
            synonym: colConfig.synonym,
            status: colConfig.status,
            value: colConfig.value,
            note: colConfig.note,
        }
    }
    const synonymKeys = colsConfig.map(col => col.synonym).filter(value => value.trim() !== '');
    const newItems = [];
    const result: any = {};
    // for(const category of categories){
    //     const items = data[category];
        for(const item of items){
                const keys = Object.keys(item);
                const newItem: any = {};
                for(const key of keys){
                    const mapItem: SYNONYM_ITEM | undefined = mapping[key];
                    if(mapItem){
                        const status = mapItem.status;
                        const isActive = status === 'active' || !status;
                        if(isActive){
                            const synonym = mapItem?.synonym && mapItem.synonym.trim() !== '' ? mapItem.synonym : null;
                            if(synonym){
                                newItem[synonym] = item[key];
                            } else {
                                newItem[key] = item[key];
                            }
                        } else {
                            console.log('filtered', key, item[key])
                        }
                    } else {
                        // Workaround
                        if(synonymKeys.includes(key)){
                            newItem[key] = item[key];
                        } else {
                            console.log('no mapping for', key, item[key])
                        }
                        // dont show if not defined
                    }
                }
                newItems.push(newItem);
        }
        // result[category] = newItems;
    // }
    return newItems;
}
export const getKeyValuePairs = (items: DataList): KEY_VALUES => {
    const result: any = {};
    for(const item of items){
        result[item['🔑name']] = item.value;
    }
    return result;
}
