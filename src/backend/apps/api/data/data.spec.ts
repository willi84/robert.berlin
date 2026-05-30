import { LOG } from '../../../_shared/log/log';
import type { DataList, SYNONYM_ITEM } from './data.d';
import { checkKeys, doCheck, replaceValues, getFinalData, getTabValue, setTabValue, checkColumns } from './data';


const IMAGE_NGGIRLS = "https://www.ng-girls.org/favicon.ico";
const IMAGE_CRAFT = "https://craft-conf.com/images/icons/craft.ico";

const CONFIG = {
    images: {
        "ng-girls": IMAGE_NGGIRLS,
        "craft": IMAGE_CRAFT
    },
    locations: {
        "Berlin": "DE",
        "Budapest": "HU"
    }
}



const EXPECTED = {
    "📍 LOCATIONS": [
        {
            "🖼️": "",
            "🔑name": "Berlin",
            "value": "DE"
        },
        {
            "🖼️": "",
            "🔑name": "Budapest",
            "value": "HU"
        }
    ],
    "🖼️ ICONS": [
        {
            "🖼️": "https://www.ng-girls.org/favicon.ico",
            "🔑name": "ngGirls",
            "value": "https://www.ng-girls.org/favicon.ico"
        },
        {
            "🖼️": "https://craft-conf.com/images/icons/craft.ico",
            "🔑name": "craft",
            "value": "https://craft-conf.com/images/icons/craft.ico"
        }
    ],
    "PROJECTS": [
        {
            "📌": "TRUE",
            "🖼️": "https://www.ng-girls.org/favicon.ico",
            "status": "inactive",
            "🌐": "DE",
            "📍location": "Berlin",
            "🔑name": "ngGirls",
        },
        {
            "📌": "TRUE",
            "🖼️": "https://craft-conf.com/images/icons/craft.ico",
            "status": "refactoring",
             "🌐": "HU",
            "📍location": "Budapest",
            "🔑name": "craft",
        },
    ],
    "STATUS": [
        {
            "🔑name": "upcoming",
            "color": "yellow",
            "value": "text-bg-warning"
        },
        {
            "🔑name": "done",
            "color": "green",
            "value": "text-bg-success"
        },
    ]
}
const EXPECTED_STEP_2 = {
    configuration: {
        "locations": {
                "Berlin": "de",
                "Budapest": "hu"
        },
        "icons": {
                "ngGirls": "https://www.ng-girls.org/favicon.ico",
                "craft": "https://craft-conf.com/images/icons/craft.ico"
        },
        "status": {
            "upcoming": "text-bg-warning",
            "done": "text-bg-success"
        }
    },
    categories: ['projects'],
    data: {
        projects: [
            {
                "📌": "TRUE",
                "🖼️": "https://www.ng-girls.org/favicon.ico",
                "status": "inactive",
                "🌐": "DE",
                "📍location": "Berlin",
                "🔑name": "ngGirls",
            },
            {
                "📌": "TRUE",
                "🖼️": "https://craft-conf.com/images/icons/craft.ico",
                "status": "refactoring",
                "🌐": "HU",
                "📍location": "Budapest",
                "🔑name": "craft",
            },
        ]
    }
}

export const COLS_CONFIG: SYNONYM_ITEM[] = [
     { value: '📌', synonym: 'pinned', status: 'active', note: '' },
    { value: '🖼️', synonym: 'logo', status: '', note: '' },
    { value: 'title', synonym: '', status: 'active', note: '' },
    { value: 'status', synonym: '', status: 'active', note: '' },
    { value: '🔑name', synonym: 'name', status: 'active', note: '' },
    { value: '🏷️ tags', synonym: 'tags', status: 'active', note: '' },
    { value: '🌐', synonym: 'country', status: 'active', note: '' },
    { value: 'note', synonym: 'my-note', status: 'inactive', note: 'not show this tab' },
]

describe('✅ getTabValue()', () => {
    const FN = getTabValue;
    it('should return the value for the given tab and searched value', () => {
        expect(FN(EXPECTED, '📍 LOCATIONS', 'Berlin')).toEqual('DE');
        expect(FN(EXPECTED, '🖼️ ICONS', 'craft')).toEqual('https://craft-conf.com/images/icons/craft.ico');
    });
});
describe('✅ setTabValue()', () => {
    const FN = setTabValue;
    it('should return the value for the given tab and searched value if it exists', () => {
        expect(FN(EXPECTED, '📍 LOCATIONS', '', 'Berlin')).toEqual('DE');
        expect(FN(EXPECTED, '🖼️ ICONS', '', 'craft')).toEqual('https://craft-conf.com/images/icons/craft.ico');
    });
    it('should return the current value if the value for the given tab and searched value does not exist', () => {
        expect(FN(EXPECTED, '📍 LOCATIONS', '', 'NonExisting')).toEqual('');
        expect(FN(EXPECTED, '🖼️ ICONS', '', 'NonExisting')).toEqual('');
    });
});
describe('✅ replaceValues()', () => {
    const FN = replaceValues;
    it('should fix the image urls', () => {
        const INPUT: DataList = [
            {
                "📌": "TRUE",
                "🖼️": "",
                "status": "inactive",
                "🔑name": "craft",
                "🌐": "",
                "📍location": "Budapest",
            },
            {
                "📌": "TRUE",
                "🖼️": "",
                "🔑name": "ng-girls",
                "status": "inactive",
                "🌐": "",
                "📍location": "Berlin",
            }
        ];
        const EXPECTED = [
            {
                "📌": "TRUE",
                "🖼️": IMAGE_CRAFT,
                "🔑name": "craft",
                "status": "inactive",
                "🌐": "HU",
                "📍location": "Budapest",
            },
            {
                "📌": "TRUE",
                "🖼️": IMAGE_NGGIRLS,
                "status": "inactive",
                "🔑name": "ng-girls",
                "🌐": "DE",
                "📍location": "Berlin",
            }

        ];
        expect(FN(INPUT, CONFIG)).toEqual(EXPECTED);

    });
});
describe('getFinalData()', () => {
    const FN = getFinalData;
    it('should return the final data structure', () => {
        expect(FN(EXPECTED)).toEqual(EXPECTED_STEP_2);
    });
});
describe('doCheck()', () => {
    const FN = doCheck;
    it('should compare two Array of strings and return true if all values of the second array are present in the first array', () => {
        expect(FN(['a', 'b', 'c'], ['a', 'b'], 'tabName')).toBe(true);
        expect(FN(['a', 'b', 'c'], ['a', 'd'], 'tabName')).toBe(false);
        expect(FN(['a', 'b', 'c'], ['d'], 'tabName')).toBe(false);
        expect(FN([], ['a'], 'tabName')).toBe(false);
        expect(FN(['a'], [], 'tabName')).toBe(false);
    });
    it('should return a fail message if arrays differ', () => {
        const spy = jest.spyOn(LOG, 'FAIL');
        expect(FN(['a', 'b', 'c'], ['d'], 'tabName')).toBe(false);
        expect(spy).toHaveBeenCalledWith('config sheet must contain columns: d for tab: tabName');
    });
});
describe('checkKeys()', () => {
    const FN = checkKeys;
    it('should check data keys', () => {
        expect(FN(['🖼️', '🔑name', 'status'], 'data', 'tabName')).toBe(true);
        expect(FN(['🖼️', '🔑name'], 'data', 'tabName')).toBe(false);
        expect(FN(['🖼️', 'value', '🔑name'], 'config', 'tabName')).toBe(true);
        expect(FN(['🖼️', 'value'], 'config', 'tabName')).toBe(false);
        expect(FN(['🖼️', 'value'], '', 'tabName')).toBe(false);
        expect(FN(['🖼️', 'value'], 'xxx', 'tabName')).toBe(false);
    });
    it('should return a warning message if no type is found', () => {
        const spy = jest.spyOn(LOG, 'WARN');
        expect(FN(['🖼️', 'value'], '', 'tabName')).toBe(false);
        expect(spy).toHaveBeenCalledWith('no type found for tab: tabName');
        expect(FN(['🖼️', 'value'], 'xxx', 'tabName')).toBe(false);
        expect(spy).toHaveBeenCalledWith('no type found for tab: tabName');
    });
});
describe('checkColumns()', () => {
    const FN = checkColumns;
    it('should check column keys', () => {
        const INPUT = [
                {
                    "📌": "TRUE",
                    "🖼️": "https://www.ng-girls.org/favicon.ico",
                    "status": "inactive",
                    "note": "dont show this note",
                    "lorem": "dont show",
                    "country": "DE",
                    "🔑name": "ng-girls",
                },
                {
                    "📌": "TRUE",
                    "🖼️": "https://craft-conf.com/images/icons/craft.ico",
                    "status": "refactoring",
                    "note": "refactoring",
                    "lorem": "dont show",
                    "country": "HU",
                    "🔑name": "craft",

                },
            ];
        const EXPECTED = [
                {
                    "pinned": "TRUE",
                    "logo": "https://www.ng-girls.org/favicon.ico",
                    "status": "inactive",
                    "name": "ng-girls",
                    "country": "DE"
                },
                {
                    "pinned": "TRUE",
                    "logo": "https://craft-conf.com/images/icons/craft.ico",
                    "status": "refactoring",
                    "name": "craft",
                    "country": "HU"
                },
            ];
        const result = FN(INPUT, COLS_CONFIG);
        expect(result).toEqual(EXPECTED);
    });
});