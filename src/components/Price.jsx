import { PRICE, PRICE_MODEL } from '../config';

/**
 * Reusable price. Single source of truth is PRICE / PRICE_MODEL in config.js —
 * never hardcode "$29" at a call site. Did·It sells a one-time pass, so the
 * suffix reads "one-time" (not "/month").
 *
 *   <Price />          → "$29"
 *   <Price suffix />   → "$29 one-time"
 *
 * Any extra props (style, className…) are forwarded to the wrapping <span>,
 * so callers style it exactly like the literal they're replacing.
 */
export default function Price({ suffix = false, ...rest }) {
  return (
    <span {...rest}>
      {PRICE}{suffix ? ` ${PRICE_MODEL}` : ''}
    </span>
  );
}
