import type { $HTMLElement, $string } from '../../../_shared/index.d';
import { getButtons, getElement, getElements } from '../../../_shared/select/select';


export const changeDocumentAttribute = (key: string, value: string, defaultValue: string) => {
    document.documentElement.setAttribute(key, value ?? defaultValue);
}




export const createPortfolio = (base: any = document) => {
const root: $HTMLElement = getElement(base as HTMLElement, '[data-portfolio]');
        if (!root) return;

        const searchInput = getElement<HTMLInputElement>(root, '[data-search-input]');
        const items = getElements(root, '[data-search-item]');
        const sections = getElements(root, '[data-category-section]');
        const filterButtons = getButtons(root, '[data-filter-button]');
        const viewButtons = getButtons(root, '[data-view-button]');
        // createDropDowns(root)
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
                const matchesCategory = currentCategory === 'all' || item.dataset.category === currentCategory;
                const matchesSearch = !query || (item.dataset.search || '').includes(query);
                const visible = matchesCategory && matchesSearch;
                item.classList.toggle('d-none', !visible);
                if (visible) visibleCount += 1;
            });

            sections.forEach((section) => {
                const hasVisibleItems = section.querySelectorAll('[data-search-item]:not(.d-none)').length > 0;
                section.classList.toggle('d-none', !hasVisibleItems);
            });

            filterButtons.forEach((button) => {
                button.classList.toggle('active', button.dataset.filterButton === currentCategory);
            });

            empty?.classList.toggle('d-none', visibleCount > 0);
        };

        filterButtons.forEach((button) => {
            button.addEventListener('click', () => {
                currentCategory = button.dataset.filterButton || 'all';
                applyFilters();
            });
        });

        viewButtons.forEach((button) => {
            button.addEventListener('click', () => {
                currentView = button.dataset.viewButton || 'cards';
                applyView();
                save();
            });
        });

        searchInput?.addEventListener('input', applyFilters);

        applyView();
        applyFilters();

}