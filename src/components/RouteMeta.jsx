import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { applyMeta } from '../seo';

/**
 * Keeps the document <head> (title, description, canonical, OG/Twitter tags)
 * in sync with the current route. Renders nothing. See src/seo.js for the
 * per-route metadata and the crawlability caveats.
 */
export default function RouteMeta() {
  const { pathname } = useLocation();
  useEffect(() => {
    applyMeta(pathname);
  }, [pathname]);
  return null;
}
