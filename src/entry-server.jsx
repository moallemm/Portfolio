import { renderToString } from 'react-dom/server';
import App from './app.jsx';

// Executed only during the build. Both routes ship readable HTML before React loads.
export function render(locale) {
  return renderToString(<App initialLocale={locale} />);
}
