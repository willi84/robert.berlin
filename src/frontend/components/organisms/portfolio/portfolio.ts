export const createPortfolio = () => {
const root = document.querySelector('[data-portfolio]');
        if (!root) return;

        const searchInput = root.querySelector('[data-search-input]');
        const sortSelect = root.querySelector('[data-sort-select]');
        const items = Array.from(root.querySelectorAll('[data-search-item]'));
        const sections = Array.from(root.querySelectorAll('[data-category-section]'));
        const filterButtons = Array.from(root.querySelectorAll('[data-filter-button]'));
        const viewButtons = Array.from(root.querySelectorAll('[data-view-button]'));
        const themeButtons = Array.from(root.querySelectorAll('[data-theme-button]'));
        const empty = root.querySelector('[data-search-empty]');

        const storageKey = 'portfolio-ui';
        const stored = JSON.parse(localStorage.getItem(storageKey) || '{}');
        let currentCategory = 'all';
        let currentView = stored.view || 'cards';
        let currentTheme = stored.theme || 'dark';
        let currentSort = stored.sort || 'date-desc';

        const save = () => localStorage.setItem(storageKey, JSON.stringify({ view: currentView, theme: currentTheme, sort: currentSort }));

        const applyTheme = () => {
            root.dataset.theme = currentTheme;
            document.documentElement.setAttribute('data-bs-theme', currentTheme === 'light' || currentTheme === 'yellow' ? 'light' : 'dark');
        };

        const applyView = () => {
            root.dataset.view = currentView;
            viewButtons.forEach((button) => button.classList.toggle('active', button.dataset.viewButton === currentView));
        };

        const parseDate = (value) => {
            if (!value) return Number.NEGATIVE_INFINITY;

            const match = String(value).trim().match(/^(\d{1,2})\.(\d{1,2})\.(\d{4})$/);
            if (!match) return Number.NEGATIVE_INFINITY;

            const [, day, month, year] = match;
            return new Date(Number(year), Number(month) - 1, Number(day)).getTime();
        };

        const compareText = (a, b, key) => (a.dataset[key] || '').localeCompare(b.dataset[key] || '', 'de', { sensitivity: 'base' });

        const sortItems = () => {
            const mode = currentSort;

            sections.forEach((section) => {
                const grid = section.querySelector('.portfolio-grid');
                if (!grid) return;

                const sectionItems = Array.from(grid.querySelectorAll('[data-search-item]'));
                sectionItems.sort((a, b) => {
                    const pinnedDiff = Number(b.dataset.pinned || 0) - Number(a.dataset.pinned || 0);
                    if (pinnedDiff) return pinnedDiff;

                    if (mode === 'title-asc') return compareText(a, b, 'title');
                    if (mode === 'title-desc') return compareText(b, a, 'title');
                    if (mode === 'status-asc') return compareText(a, b, 'status') || compareText(a, b, 'title');

                    const dateA = parseDate(a.dataset.start);
                    const dateB = parseDate(b.dataset.start);

                    if (mode === 'date-asc') return dateA - dateB || compareText(a, b, 'title');
                    return dateB - dateA || compareText(a, b, 'title');
                });

                sectionItems.forEach((item) => grid.appendChild(item));
            });
        };

        const applySort = () => {
            if (sortSelect) sortSelect.value = currentSort;
            sortItems();
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

        themeButtons.forEach((button) => {
            button.addEventListener('click', () => {
                currentTheme = button.dataset.themeButton || 'dark';
                applyTheme();
                save();
            });
        });

        sortSelect?.addEventListener('change', () => {
            currentSort = sortSelect.value || 'date-desc';
            applySort();
            applyFilters();
            save();
        });

        searchInput?.addEventListener('input', applyFilters);

        applyTheme();
        applyView();
        applySort();
        applyFilters();

}