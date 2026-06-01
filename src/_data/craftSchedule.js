const craft = require('./craft.json');

const STAGE_SVG_ID_ALIASES = {
    'Main Stage': ['MAIN_STAGE'],
    'Platform 2': ['PLATFORM_3'],
    'Focus Platform': ['FOCUS_PLATTFORM'],
    'Yellow Stage': ['YELLOW_STAGE'],
    'Telekom Stage': ['TELEKOM_STAGE'],
    'Purple Stage': ['PURPLE_STAGE'],
    'Green Stage': ['GREEN_STAGE'],
    'Innovation Stage': ['INNOVATION_STAGE_WORKSHOP_SPONSOR'],
    'Podcast Stage': ['PODCAST_STAGE'],
    'Tech Leaders\' Lounge': ['TECH_LEADERS_LOUNGE'],
    'Central Workshop Area': ['INNOVATION_STAGE_WORKSHOP_SPONSOR'],
    'Sponsor Arena': ['INNOVATION_STAGE_WORKSHOP_SPONSOR'],
};

const normalizeStageId = (value = '') => value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/&/g, 'AND')
    .replace(/[^a-zA-Z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '')
    .toUpperCase();

const getStageSvgIds = (stageName) => STAGE_SVG_ID_ALIASES[stageName] || [normalizeStageId(stageName)];

const formatDayLabel = (value) => new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
}).format(new Date(value));

const getSearchValue = (talk) => [
    talk.title,
    talk.stage,
    talk.day,
    talk.startTime,
    talk.endTime,
    talk.level,
    talk.description,
    ...(talk.speakers || []).map((speaker) => speaker.name),
    ...(talk.tags || []).map((tag) => tag.name),
].filter(Boolean).join(' ').toLowerCase();

const stageEntries = Object.entries(craft.data.stages).map(([stageName, stageData]) => {
    const stageColor = `#${stageData.color}`;
    const stageTextColor = stageData.color.toLowerCase() === '000000' ? '#ffffff' : stageColor;
    const stageSvgIds = getStageSvgIds(stageName);

    return {
        ...stageData,
        stageName,
        stageColor,
        stageTextColor,
        stageSvgIds,
        talks: stageData.talks.map((talkId) => {
            const talk = craft.data.talks[String(talkId)];
            const speakerNames = (talk.speakers || []).map((speaker) => speaker.name).join(', ');
            const tagNames = (talk.tags || []).map((tag) => tag.name).join(', ');

            return {
                ...talk,
                speakerNames,
                tagNames,
                hasLongDescription: (talk.description || '').length > 360,
                searchValue: getSearchValue(talk),
                stageColor,
                stageTextColor,
                stageSvgIds,
            };
        }),
    };
});

const talks = stageEntries
    .flatMap((stage) => stage.talks)
    .sort((first, second) => {
        const firstKey = `${first.day} ${first.startTime} ${first.stage} ${first.title}`;
        const secondKey = `${second.day} ${second.startTime} ${second.stage} ${second.title}`;

        return firstKey.localeCompare(secondKey);
    });

const dayMap = new Map();

talks.forEach((talk) => {
    const dayKey = talk.day;
    const slotKey = `${talk.startTime}-${talk.endTime}`;

    if (!dayMap.has(dayKey)) {
        dayMap.set(dayKey, {
            day: dayKey,
            label: formatDayLabel(dayKey),
            slots: new Map(),
        });
    }

    const dayEntry = dayMap.get(dayKey);

    if (!dayEntry.slots.has(slotKey)) {
        dayEntry.slots.set(slotKey, {
            id: `${dayKey}-${slotKey}`,
            day: dayKey,
            startTime: talk.startTime,
            endTime: talk.endTime,
            talks: [],
        });
    }

    dayEntry.slots.get(slotKey).talks.push(talk);
});

const days = Array.from(dayMap.values()).map((dayEntry) => ({
    day: dayEntry.day,
    label: dayEntry.label,
    slots: Array.from(dayEntry.slots.values()).sort((first, second) => first.startTime.localeCompare(second.startTime)),
}));

module.exports = {
    stageEntries,
    days,
    talks,
};
