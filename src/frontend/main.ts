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

const applyNeutralMode = () => {
        document.body.classList.toggle('is-neutral', isNeutralMode());
};

(() => {
        applyNeutralMode();
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
