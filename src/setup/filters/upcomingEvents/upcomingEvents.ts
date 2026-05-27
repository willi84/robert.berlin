export const parseEventDate = (dateStr: string): Date | null => {
    if (!dateStr) return null;

    const match = String(dateStr).trim().match(/^(\d{1,2})\.(\d{1,2})\.(\d{4})$/);
    if (!match) return null;

    const [, day, month, year] = match;
    const result = new Date(Number(year), Number(month) - 1, Number(day));
    return result;
};

export const filterUpcomingEvents = (projects: any, now: Date) => {
    const types = Object.keys(projects);
    const upcomingEvents: any[] = [];

    for (const type of types) {
        const items = projects[type];
        for (const item of items) {
            const hasStart = item.start && item.start !== '';
            if (!hasStart) continue;
            const startDate = parseEventDate(item.start);
            if (!startDate) continue;
            const endDate = parseEventDate(item.end);
            if(endDate && endDate.getTime() < now.getTime()) continue;
            const sD = new Date(startDate).setHours(0, 0, 0, 0);

            const nD = new Date(now).setHours(0, 0, 0, 0);
            const isUpcoming = sD >= nD;
            if (isUpcoming) {
                const newItem = { ...item };
                // today
                if(sD === nD) {
                    newItem.status = 'today';
                }

                // tomorrow
                if(startDate && startDate.getTime() > now.getTime() && startDate.getTime() <= now.getTime() + 24 * 60 * 60 * 1000) {
                    newItem.status = 'tomorrow';
                }
                upcomingEvents.push(newItem);
            }
        }
    }
    
    
    // sort by start date
    upcomingEvents.sort((a, b) => {
        const dateA = parseEventDate(a.start)?.getTime() || Number.POSITIVE_INFINITY;
        const dateB = parseEventDate(b.start)?.getTime() || Number.POSITIVE_INFINITY;
        return dateA - dateB;
    });

    return upcomingEvents;
}