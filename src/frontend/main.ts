// import 'vite/dynamic-import-polyfill'; // for prod mode
import './_framework/css/index.css';
import { createPortfolio } from './components/organisms/portfolio/portfolio';


(() => {
        createPortfolio();
})();