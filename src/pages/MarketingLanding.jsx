import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { captureMarketingSource } from '../analytics';
import ConversionLanding from './ConversionLanding';

/**
 * Marketing-source landing — /go/:source (e.g. /go/instagram, /go/facebook,
 * /go/newsletter). Renders the EXACT same landing page as `/`, but first tags
 * the visitor's first-touch `src` so you can tell which campaign/link drove
 * them. Put a different link in each channel; they all show one identical page.
 *
 * The source is captured during render (lazy useState initializer) so it lands
 * before ConversionLanding's page_view effect fires. First touch wins, so a
 * returning visitor keeps whatever source first brought them in.
 */
export default function MarketingLanding() {
  const { source } = useParams();
  useState(() => { captureMarketingSource(source); return true; });
  return <ConversionLanding />;
}
