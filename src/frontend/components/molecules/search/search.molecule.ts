const getSearchValue = (element: HTMLInputElement): string => element.value.trim().toLowerCase();

const updateProjectVisibility = (cards: HTMLElement[], query: string): number => {
    let visibleCount = 0;

    cards.forEach((card) => {
        const haystack = card.dataset.search ?? '';
        const isVisible = haystack.includes(query);

        card.classList.toggle('hidden', !isVisible);
        visibleCount += isVisible ? 1 : 0;
    });

    return visibleCount;
};

const updateEmptyState = (emptyState: HTMLElement, visibleCount: number): void => {
    emptyState.classList.toggle('is-visible', visibleCount === 0);
};

export const setupSearch = (): void => {
    const allContexts = document.querySelectorAll<HTMLElement>('[search-context]');
    if (allContexts.length === 0) {
        return;
    }
    for(const context of allContexts) {
        const root = context;
        const input = root.querySelector<HTMLInputElement>('[data-search-input]');
        const emptyState = root.querySelector<HTMLElement>('[data-search-empty]');
    
        if (!input || !emptyState) {
            return;
        }
    
        const cards = Array.from(root.querySelectorAll<HTMLElement>('[data-search-item]'));
        const applySearch = (): void => {
            const visibleCount = updateProjectVisibility(cards, getSearchValue(input));
            updateEmptyState(emptyState, visibleCount);
        };
    
        input.addEventListener('input', applySearch);
        applySearch();
    }
};
