import { PRICE, BILLING_PERIOD } from '../config';

/**
 * Reusable subscription price. Single source of truth is PRICE /
 * BILLING_PERIOD in config.js — never hardcode "$15" at a call site.
 *
 *   <Price />          → "$15"
 *   <Price period />   → "$15/month"   (compact, for inline button text)
 *
 * Any extra props (style, className…) are forwarded to the wrapping <span>,
 * so callers style it exactly like the literal they're replacing.
 */
export default function Price({ period = false, ...rest }) {
  return (
    <span {...rest}>
      {PRICE}{period ? `/${BILLING_PERIOD}` : ''}
    </span>
  );
}
