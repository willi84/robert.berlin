// import 'vite/dynamic-import-polyfill'; // for prod mode
import './_shared/index.css';
import { createDropdowns } from './components/molecules/dropdown/dropdown';
import { createPortfolio } from './components/organisms/portfolio/portfolio';
import { createEmoji } from './pages/emojis/emojis';

(() => {
        createPortfolio();
        createEmoji();
        createDropdowns();
})();