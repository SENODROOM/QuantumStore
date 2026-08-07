import { useEffect } from 'react';

export function usePageMeta({ title, description, image }) {
  useEffect(() => {
    if (title) document.title = title;

    const ensureMeta = (selector, attr, value) => {
      if (!value) return;
      let el = document.querySelector(selector);
      if (!el) {
        el = document.createElement('meta');
        if (selector.includes('property=')) {
          el.setAttribute('property', selector.match(/property="([^"]+)"/)[1]);
        } else {
          el.setAttribute('name', selector.match(/name="([^"]+)"/)[1]);
        }
        document.head.appendChild(el);
      }
      el.setAttribute('content', value);
    };

    ensureMeta('meta[name="description"]', 'name', description);
    ensureMeta('meta[property="og:title"]', 'property', title);
    ensureMeta('meta[property="og:description"]', 'property', description);
    ensureMeta('meta[property="og:image"]', 'property', image);
  }, [title, description, image]);
}
