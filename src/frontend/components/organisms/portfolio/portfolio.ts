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

const getSearchQuery = (value = ''): string => value
    .trim()
    .toLowerCase()
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

const getStageIds = (value = ''): string[] => value
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);

const applyCraftExperience = (root: HTMLElement, filterButtons: HTMLButtonElement[], viewButtons: HTMLButtonElement[], empty: HTMLElement | null) => {
    const searchInput = getElement<HTMLInputElement>(root, '[data-search-input]');
    const scheduleItems = getElements(root, '[data-schedule-item]');
    const scheduleDays = getElements(root, '[data-schedule-day]');
    const talkItems = getElements(root, '[data-talk-item]');
    const mapRoot = getElement(root, '[data-craft-map]');
    const jumpLinks = getElements<HTMLAnchorElement>(root, '[data-talk-jump]');

    if (scheduleItems.length === 0 && !mapRoot) {
        return;
    }

    let currentCategory = 'all';
    let currentStageIds: string[] = [];
    let hoveredStageIds: string[] = [];

    const stageIds = new Set<string>();
    talkItems.forEach((item) => getStageIds(item.dataset.stageSvgIds).forEach((stageId) => stageIds.add(stageId)));
    filterButtons.forEach((button) => getStageIds(button.dataset.stageSvgIds).forEach((stageId) => stageIds.add(stageId)));

    const stageElementMap = new Map<string, HTMLElement[]>();
    const stageButtonMap = new Map<string, HTMLButtonElement>();

    if (mapRoot) {
        stageIds.forEach((stageId) => {
            const matchedElements = Array.from(mapRoot.querySelectorAll<HTMLElement>(`#${stageId}`));
            if (matchedElements.length === 0) return;

            matchedElements.forEach((element) => {
                element.classList.add('craft-map-stage');
                element.setAttribute('tabindex', '0');
                element.setAttribute('role', 'button');
                element.setAttribute('aria-label', `Highlight ${stageId.replace(/_/g, ' ').toLowerCase()}`);
            });

            stageElementMap.set(stageId, matchedElements);
        });
    }

    filterButtons.forEach((button) => {
        const ids = getStageIds(button.dataset.stageSvgIds);
        ids.forEach((stageId) => {
            if (!stageButtonMap.has(stageId)) {
                stageButtonMap.set(stageId, button);
            }
        });
    });

    const applyMapHighlight = () => {
        const activeIds = new Set(hoveredStageIds.length > 0 ? hoveredStageIds : currentStageIds);
        const hasActiveIds = activeIds.size > 0;

        stageElementMap.forEach((elements, stageId) => {
            const isActive = activeIds.has(stageId);
            elements.forEach((element) => {
                element.classList.toggle('is-active', isActive);
                element.classList.toggle('is-dimmed', hasActiveIds && !isActive);
            });
        });
    };

    const applyScheduleFilters = () => {
        if (scheduleItems.length === 0) {
            return;
        }

        const query = getSearchQuery(searchInput?.value || '');
        let visibleCount = 0;

        scheduleItems.forEach((item) => {
            const matchesCategory = currentCategory === 'all' || item.dataset.category === currentCategory;
            const matchesSearch = !query || (item.dataset.search || '').includes(query);
            const isVisible = matchesCategory && matchesSearch;

            item.classList.toggle('d-none', !isVisible);
            visibleCount += isVisible ? 1 : 0;
        });

        scheduleDays.forEach((day) => {
            const visibleItems = day.querySelectorAll('[data-schedule-item]:not(.d-none)').length;
            day.classList.toggle('d-none', visibleItems === 0);
        });

        if (empty) {
            empty.classList.toggle('is-visible', visibleCount === 0);
            empty.classList.toggle('d-none', visibleCount !== 0);
        }
    };

    const syncCurrentStage = () => {
        const activeButton = filterButtons.find((button) => button.classList.contains('active'));
        currentCategory = activeButton?.dataset.filterButton || 'all';
        currentStageIds = getStageIds(activeButton?.dataset.stageSvgIds || '');
        applyScheduleFilters();
        applyMapHighlight();
    };

    const bindHoverHighlight = (element: HTMLElement) => {
        const stageIdsOfElement = getStageIds(element.dataset.stageSvgIds || '');
        if (stageIdsOfElement.length === 0) return;

        const activate = () => {
            hoveredStageIds = stageIdsOfElement;
            applyMapHighlight();
        };

        const deactivate = () => {
            hoveredStageIds = [];
            applyMapHighlight();
        };

        element.addEventListener('mouseenter', activate);
        element.addEventListener('mouseleave', deactivate);
        element.addEventListener('focusin', activate);
        element.addEventListener('focusout', deactivate);
    };

    talkItems.forEach(bindHoverHighlight);
    filterButtons.forEach((button) => {
        button.addEventListener('click', () => {
            syncCurrentStage();
        });
        bindHoverHighlight(button);
    });

    if (mapRoot) {
        stageElementMap.forEach((elements, stageId) => {
            const relatedButton = stageButtonMap.get(stageId);

            const activate = () => {
                hoveredStageIds = [stageId];
                applyMapHighlight();
            };

            const deactivate = () => {
                hoveredStageIds = [];
                applyMapHighlight();
            };

            const select = () => {
                relatedButton?.click();
            };

            elements.forEach((element) => {
                element.addEventListener('mouseenter', activate);
                element.addEventListener('mouseleave', deactivate);
                element.addEventListener('focus', activate);
                element.addEventListener('blur', deactivate);
                element.addEventListener('click', select);
                element.addEventListener('keydown', (event: KeyboardEvent) => {
                    if (event.key === 'Enter' || event.key === ' ') {
                        event.preventDefault();
                        select();
                    }
                });
            });
        });
    }

    jumpLinks.forEach((link) => {
        link.addEventListener('click', (event) => {
            event.preventDefault();
            const targetId = link.dataset.talkJump;
            if (!targetId) return;

            const listButton = viewButtons.find((button) => button.dataset.viewButton === 'list');
            listButton?.click();

            window.requestAnimationFrame(() => {
                const target = document.getElementById(targetId);
                target?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                window.location.hash = targetId;
            });
        });
    });

    searchInput?.addEventListener('input', applyScheduleFilters);
    syncCurrentStage();
};

export const createPortfolio = (base: any = document) => {
    const root: $HTMLElement = getElement(base as HTMLElement, '[data-portfolio]');
    if (!root) return;

    const filterButtons = getButtons(root, '[data-filter-button]');
    const viewButtons = getButtons(root, '[data-view-button]');
    const empty = getElement(root, '[data-search-empty]');

    const storageKey = 'portfolio-ui';
    const stored = JSON.parse(localStorage.getItem(storageKey) || '{}');
    let currentView = stored.view || 'cards';

    const save = () => localStorage.setItem(storageKey, JSON.stringify({ view: currentView }));

    const applyView = () => {
        root.dataset.view = currentView;
        viewButtons.forEach((button) => button.classList.toggle('active', button.dataset.viewButton === currentView));
    };

    viewButtons.forEach((button) => {
        button.addEventListener('click', () => {
            currentView = button.dataset.viewButton || 'cards';
            applyView();
            save();
        });
    });

    applyView();
    applyCraftExperience(root as HTMLElement, filterButtons, viewButtons, empty);
};
