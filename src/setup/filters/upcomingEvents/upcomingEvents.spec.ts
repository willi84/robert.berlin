import { filterUpcomingEvents, parseEventDate } from './upcomingEvents';

const hackathons = [
        { status: "done", title: "Hack A", start: "24.10.2015", end: "25.10.2015" },
        { status: "done", title: "Hack B", start: "24.10.2026", end: "25.10.2015" },
        { status: "done", title: "Hack C", start: "24.09.2026", end: "25.09.2026" },
];
const talks = [
            { status: "done", event: "Talk A", start: "02.08.2019" },
            { status: "done", event: "Talk B", start: "01.08.2022" },
            { status: "done", event: "Talk C", start: "07.08.2026" },
            { status: "done", event: "Talk D", start: "17.05.2026" },
            { status: "done", event: "Talk E", start: "18.05.2026" },
];
const conferences = [
    { title: "Craft Conference 2024", start: "02.06.2024", end: "05.06.2024" },
    { title: "Craft Conference 2026", start: "03.06.2026", end: "05.06.2026" },
    { title: "Craft Conference 2025", start: "04.06.2025", end: "05.06.2025" },
];
const workshops = [
    { title: "Crafting Code 2026", start: "22.7.2026" },
    { title: "Other Workshop", start: "22.8.2026", end: "23.8.2026" },
    { title: "Before Workshop", start: "2.6.2026" },
    { title: "Crafting Code 2025", start: "22.4.2025" },
    { title: "A Workshop", start: "1.6.2026" },
    { title: "Crafting Code 2024", start: "22.4.2024", end: "" },
];
const projects = [
            {
                "title": "MetaCollect",
                "🔑name": "MetaCollect",
            }
];

const SAMPLE_DATA = {
    hackathons,
    talks,
    conferences,
    workshops,
    projects
};
describe('parseEventDate()', () => {
    const FN = parseEventDate;
    it('should parse valid date string', () => {
        // const date = FN('24.10.2025');
        // expect(date).toBeInstanceOf(Date);
        // expect(date?.getFullYear()).toBe(2025);
        // expect(date?.getMonth()).toBe(9); // Month is zero-based
        // expect(date?.getDate()).toBe(24);
        const month = 4;
        const year = 2026;
        const day = 12;
        const d = new Date(year, month - 1, day)
        console.log(d);
        expect(FN(`${day}.${month}.${year}`)).toEqual(new Date(year, month - 1, day));
        expect(FN(`${day}.0${month}.${year}`)).toEqual(new Date(year, month - 1, day));
    });
});

describe('filterUpcomingEvents()', () => {
    const FN = filterUpcomingEvents;
    it('should return only upcoming events', () => {
        const now = new Date('2026-05-17 00:00:00');
        const EXPECTED = [
            // { status: "done", title: "Hack B", start: "24.10.2026", end: "25.10.2015" },

            { status: "today", event: "Talk D", start: "17.05.2026" },
            { status: "tomorrow", event: "Talk E", start: "18.05.2026" },
            { title: "A Workshop", start: "1.6.2026" },
            { title: "Before Workshop", start: "2.6.2026" },
            { title: "Craft Conference 2026", start: "03.06.2026", end: "05.06.2026" },
            { title: "Crafting Code 2026", start: "22.7.2026" },
            { status: "done", event: "Talk C", start: "07.08.2026" },
            { title: "Other Workshop", start: "22.8.2026", end: "23.8.2026" },
            { status: "done", title: "Hack C", start: "24.09.2026", end: "25.09.2026" },
        ]
        expect(FN(SAMPLE_DATA, now)).toEqual(EXPECTED);
    });
    it('should return only upcoming events', () => {
        const now = new Date('2026-05-17 23:00:00');
        const EXPECTED = [
            // { status: "done", title: "Hack B", start: "24.10.2026", end: "25.10.2015" },

            { status: "today", event: "Talk D", start: "17.05.2026" },
            { status: "tomorrow", event: "Talk E", start: "18.05.2026" },
            { title: "A Workshop", start: "1.6.2026" },
            { title: "Before Workshop", start: "2.6.2026" },
            { title: "Craft Conference 2026", start: "03.06.2026", end: "05.06.2026" },
            { title: "Crafting Code 2026", start: "22.7.2026" },
            { status: "done", event: "Talk C", start: "07.08.2026" },
            { title: "Other Workshop", start: "22.8.2026", end: "23.8.2026" },
            { status: "done", title: "Hack C", start: "24.09.2026", end: "25.09.2026" },
        ]
        expect(FN(SAMPLE_DATA, now)).toEqual(EXPECTED);
    });
});