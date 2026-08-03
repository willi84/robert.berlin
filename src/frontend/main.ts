// import 'vite/dynamic-import-polyfill'; // for prod mode
import './_shared/index.css';
import { createDropdowns } from './components/molecules/dropdown/dropdown';
import { activateFilterButtons } from './components/molecules/filter-button/filter-button';
import { setupSearch } from './components/molecules/search/search.molecule';
import { createPortfolio } from './components/organisms/portfolio/portfolio';
import { createEmoji } from './pages/emojis/emojis';

const isNeutralMode = (): boolean => {
        const params = new URLSearchParams(window.location.search);
        return window.location.pathname === '/' && params.has('neutral');
};

const getNeutralHref = (isNeutral: boolean): string => {
        const url = new URL(window.location.href);
        const entries = Array.from(url.searchParams.entries()).filter(([key]) => key !== 'neutral');
        const query = entries.map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`);

        if (isNeutral) {
                query.unshift('neutral');
        }

        const search = query.length > 0 ? '?' + query.join('&') : '';
        return url.pathname + search + url.hash;
};

const applyNeutralMode = () => {
        document.body.classList.toggle('is-neutral', isNeutralMode());
};

const setupNeutralToggle = () => {
        const radios = document.querySelectorAll<HTMLInputElement>('input[name="neutral-mode"]');

        if (radios.length === 0) {
                return;
        }

        const neutral = isNeutralMode();
        radios.forEach((radio) => {
                radio.checked = radio.value === (neutral ? 'neutral' : 'default');
                radio.addEventListener('change', () => {
                        window.location.assign(getNeutralHref(radio.value === 'neutral'));
                });
        });
};

(() => {
        applyNeutralMode();
        setupNeutralToggle();
        setupSearch();
        createPortfolio();
        createEmoji();
        createDropdowns();
        activateFilterButtons('all');

        if ('serviceWorker' in navigator && import.meta.env.PROD) {
                window.addEventListener('load', () => {
                        navigator.serviceWorker.register('/sw.js').catch(() => undefined);
                });
        }
})();
