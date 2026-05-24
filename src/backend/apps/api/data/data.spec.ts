import { fixImages, getFinalData, getTabValue, setTabValue } from './data';

const INPUT = {
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
            "🖼️": "",
            "🔑name": "ngGirls",
            "value": "https://www.ng-girls.org/favicon.ico"
        },
        {
            "🖼️": "",
            "🔑name": "craft",
            "value": "https://craft-conf.com/images/icons/craft.ico"
        }
    ],
    "PROJECTS": [
        {
            "📌": "TRUE",
            "🖼️": "",
             "🌐": "",
            "📍location": "Berlin",
            "status": "inactive",
            "🔑name": "ngGirls",
        },
        {
            "📌": "TRUE",
            "🖼️": "",
             "🌐": "",
            "📍location": "Budapest",
            "status": "refactoring",
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
const EXPECTED_FINAL = {
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
describe('✅ fixImages()', () => {
    const FN = fixImages;
    it('should fix the image urls', () => {
        expect(FN(INPUT)).toEqual(EXPECTED);
    });
});
describe('getFinalData()', () => {
    const FN = getFinalData;
    it('should return the final data structure', () => {
        expect(FN(EXPECTED)).toEqual(EXPECTED_FINAL);
    });
});