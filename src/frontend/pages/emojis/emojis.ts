import { $HTMLElement } from '../../_shared';
import { getButtons, getElement, getElements } from '../../_shared/select/select';

export const createEmoji = (base: any = document) => {
    const STORAGE_KEY = "emoji-copy-counts";
    const searchInput = getElement<HTMLInputElement>(base, "[data-emoji-search]");
    const list = getElement(base, "[data-emoji-list]");
    const items = getElements(base, "[data-emoji-item]");
    const count = getElement(base, "[data-emoji-count]");
    const emptyState = getElement(base, "[data-emoji-empty]");
    const copyButtons = getButtons(base, "[data-copy-emoji]");

    const readCopyCounts = () => {
        try {
            return JSON.parse(window.localStorage.getItem(STORAGE_KEY) || "{}");
        } catch (error) {
            console.error("Loading copy counts failed", error);
            return {};
        }
    };

    const copyCounts = readCopyCounts();

    const getItemId = (item: HTMLElement) => item.dataset.emojiId || "";
    const getCopyCount = (item: HTMLElement) => copyCounts[getItemId(item)] || 0;

    const saveCopyCounts = () => {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(copyCounts));
    };

    const updateCopyCountLabel = (item: HTMLElement) => {
        const label = getElement(item, "[data-copy-count]") as $HTMLElement;

        if (!label) {
            return;
        }

        const value = getCopyCount(item);
        label.textContent = `${value}`;
        label.style.display = value > 0 ? "block" : "none";
    };

    const sortItems = () => {
        if (!list) {
            return;
        }

        items
            .slice()
            .sort((left, right) => {
                const countDiff = getCopyCount(right) - getCopyCount(left);

                if (countDiff !== 0) {
                    return countDiff;
                }

                return Number(left.dataset.originalOrder || 0) - Number(right.dataset.originalOrder || 0);
            })
            .forEach((item) => {
                list.appendChild(item);
            });
    };

    const incrementCopyCount = (button: HTMLButtonElement) => {
        const item = button.closest("[data-emoji-item]") as $HTMLElement;

        if (!item) {
            return;
        }

        const itemId = getItemId(item);

        if (!itemId) {
            return;
        }

        copyCounts[itemId] = getCopyCount(item) + 1;
        saveCopyCounts();
        updateCopyCountLabel(item);
    };

    const updateResults = () => {
        const query = (searchInput?.value || "").trim().toLowerCase();
        let visibleItems = 0;

        items.forEach((item) => {
            const haystack = item.dataset.search || "";
            const isVisible = !query || haystack.includes(query);

            item.classList.toggle("d-none", !isVisible);

            if (isVisible) {
                visibleItems += 1;
            }
        });

        if (count) {
            count.textContent = `${visibleItems} Emojis`;
        }

        if (emptyState) {
            emptyState.classList.toggle("d-none", visibleItems > 0);
        }
    };

    const showFeedback = (button: HTMLButtonElement) => {
        const feedback = getElement(button, "[data-copy-feedback]") as $HTMLElement;

        if (!feedback) {
            return;
        }

        feedback.classList.remove("opacity-0");

        window.setTimeout(() => {
            feedback.classList.add("opacity-0");
        }, 700);
    };

    items.forEach((item) => {
        updateCopyCountLabel(item);
    });

    sortItems();
    updateResults();
    searchInput?.addEventListener("input", () => {
        sortItems();
        updateResults();
    });

    copyButtons.forEach((button) => {
        button.addEventListener("click", async () => {
            const value = button.getAttribute("data-copy-emoji") || "";

            if (!value) {
                return;
            }

            try {
                await navigator.clipboard.writeText(value);
                incrementCopyCount(button);
                showFeedback(button);
            } catch (error) {
                console.error("Copy failed", error);
            }
        });
    });
};