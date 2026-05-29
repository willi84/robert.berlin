import type { $HTMLElement, $string } from '../../../_shared/index.d';
import { getButtons, getElement, getElements } from '../../../_shared/select/select';

const COUNTDOWN_LIMIT_DAYS = 7;
const DAY_IN_MS = 24 * 60 * 60 * 1000;
const HOUR_IN_MS = 60 * 60 * 1000;

const parseEventDate = (value = ''): Date | null => {
    if (!value) return null;

    const isoMatch = value.match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if (isoMatch) {
        const [, year, month, day] = isoMatch;
        return new Date(Number(year), Number(month) - 1, Number(day), 23, 59, 59, 999);
    }

    const parsed = new Date(value);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
};

export const changeDocumentAttribute = (key: string, value: string, defaultValue: string) => {
    document.documentElement.setAttribute(key, value ?? defaultValue);
};

const formatCountdown = (target: Date, now: Date): $string => {
    const diff = target.getTime() - now.getTime();
    const days = Math.floor(diff / DAY_IN_MS);
    const hours = Math.floor((diff % DAY_IN_MS) / HOUR_IN_MS);

    if (diff <= 0) return 'heute';
    if (days >= 2) return `in ${days} Tagen`;
    if (days === 1) return hours > 0 ? `morgen · ${hours}h` : 'morgen';
    if (hours >= 1) return `in ${hours}h`;

    const minutes = Math.max(1, Math.floor((diff % HOUR_IN_MS) / (60 * 1000)));
    return `in ${minutes} min`;
};

// const setupUpcomingEvents = (root: HTMLElement) => {
//     const upcomingList = getElement(root, '[data-upcoming-list]');
//     if (!upcomingList) return;

//     const count = getElement(root, '[data-upcoming-count]');
//     const items = getElements(upcomingList, '[data-upcoming-item]');
//     const today = new Date();

//     today.setHours(0, 0, 0, 0);

//     let visibleCount = 0;
//     console.log(items);

//     items
//         .sort((first, second) => {
//             const firstDate = parseEventDate(first.dataset.eventStart);
//             const secondDate = parseEventDate(second.dataset.eventStart);

//             firstDate?.setHours(0, 0, 0, 0);
//             secondDate?.setHours(0, 0, 0, 0);

//             return (firstDate?.getTime() || Number.MAX_SAFE_INTEGER) - (secondDate?.getTime() || Number.MAX_SAFE_INTEGER);
//         })
//         .forEach((item) => {
//             const target = parseEventDate(item.dataset.eventStart);
//             const countdown = getElement(item, '[data-event-countdown]');

//             if (target) {
//                 target.setHours(0, 0, 0, 0);
//             }

//             const isVisible = true; // Boolean(target && target.getTime() >= today.getTime());

//             item.classList.toggle('d-none', !isVisible);
//             if (!isVisible || !target) return;

//             upcomingList.appendChild(item);
//             visibleCount += 1;

//             const diffDays = (target.getTime() - today.getTime()) / DAY_IN_MS;
//             const showCountdown = diffDays <= COUNTDOWN_LIMIT_DAYS;

//             countdown?.classList.toggle('d-none', !showCountdown);

//             if (countdown && showCountdown) {
//                 countdown.textContent = formatCountdown(target, today);
//             }
//         });

//     if (count) count.textContent = `${visibleCount} geplant`;
//     upcomingList.parentElement?.classList.toggle('d-none', visibleCount === 0);
// };


export const createPortfolio = (base: any = document) => {
    const root: $HTMLElement = getElement(base as HTMLElement, '[data-portfolio]');
    if (!root) return;

    const searchInput = getElement<HTMLInputElement>(root, '[data-search-input]');
    const items = getElements(root, '[data-search-item]');
    console.log(items);
    const sections = getElements(root, '[data-category-section]');
    const filterButtons = getButtons(root, '[data-filter-button]');
    const viewButtons = getButtons(root, '[data-view-button]');
    const empty = getElement(root, '[data-search-empty]');

    const storageKey = 'portfolio-ui';
    const stored = JSON.parse(localStorage.getItem(storageKey) || '{}');
    let currentCategory = 'all';
    let currentView = stored.view || 'cards';


    const save = () => localStorage.setItem(storageKey, JSON.stringify({ view: currentView }));

    const applyView = () => {
        root.dataset.view = currentView;
        viewButtons.forEach((button) => button.classList.toggle('active', button.dataset.viewButton === currentView));
    };

    const applyFilters = () => {
        const query = (searchInput?.value || '').trim().toLowerCase();
        let visibleCount = 0;

        items.forEach((item) => {
            const matchesCategory = currentCategory === 'all' || currentCategory === 'upcoming' || item.dataset.category === currentCategory;
            const matchesSearch = !query || (item.dataset.search || '').includes(query);
            const visible = matchesCategory && matchesSearch;
            item.classList.toggle('d-none', !visible);
            if (visible) visibleCount += 1;
        });
        sections.forEach((section) => {
            const hasVisibleItems = section.querySelectorAll('article:not(.d-none)').length > 0;
            // console.log(section, hasVisibleItems);
            // const hasVisibleItems = section.querySelectorAll('[data-search-item]:not(.d-none)').length > 0;
            section.classList.toggle('d-none', !hasVisibleItems);
        });

        filterButtons.forEach((button) => {
            button.classList.toggle('active', button.dataset.filterButton === currentCategory);
        });

        empty?.classList.toggle('d-none', visibleCount > 0);
    };

    filterButtons.forEach((button) => {
        // button.addEventListener('click', () => {
        //     currentCategory = button.dataset.filterButton || 'all';
        //     applyFilters();
        // });
    });

    viewButtons.forEach((button) => {
        button.addEventListener('click', () => {
            currentView = button.dataset.viewButton || 'cards';
            applyView();
            save();
        });
    });

    // searchInput?.addEventListener('input', applyFilters);

    // setupUpcomingEvents(root);
    applyView();
    // applyFilters();
};
