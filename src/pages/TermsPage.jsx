import LegalPage from './LegalPage';
import { LEGAL } from '../config';

export default function TermsPage() {
  const email = LEGAL.contactEmail;
  return (
    <LegalPage title="Terms of Use" updated={LEGAL.effectiveDate}>
      <p>
        Did·It is operated by {LEGAL.entity}, based in {LEGAL.location} ("we", "us").
        Contact: <a href={`mailto:${email}`}>{email}</a>.
      </p>

      <h2>1. These terms</h2>
      <p>By creating an account or buying the Founding Membership Pass, you agree to these terms. If you don't agree, please don't use Did·It.</p>

      <h2>2. What Did·It is</h2>
      <p>Did·It is a collection of web-based learning games for young children, designed to be played by a child together with a parent or carer. Accounts are created and managed by an adult.</p>

      <h2>3. What you get</h2>
      <p><strong>Right now, access to Did·It is free.</strong> During our current launch period we're not charging — you unlock the games in the library by entering a promo code at checkout, at no cost.</p>
      <p>We plan to introduce a paid <strong>Founding Membership Pass</strong> in future — a <strong>one-time purchase</strong> (not a subscription) that would unlock the games then in the Did·It library. When that happens, these terms will apply to it.</p>
      <ul>
        <li>The library <strong>may change over time</strong> — we may add, update, improve, replace, or remove games and features.</li>
        <li>Access (free now, or paid later) is to the library <strong>as it exists from time to time</strong> — not to any specific game, any guaranteed number of games, or any promise of future games.</li>
        <li>We may, but are not obligated to, add new games, at our discretion.</li>
      </ul>

      <h2>4. Your licence</h2>
      <p>Your access gives you a personal, non-exclusive, non-transferable, non-commercial licence to use Did·It for you and your household. You don't own the games or content — we and our licensors do. You may not resell, share, sublicense, copy, or reverse-engineer the games, or let others use your access outside your household.</p>

      <h2>5. Price and payment</h2>
      <p><strong>We're not collecting payment at the moment.</strong> Access is currently free — you unlock everything with a promo code at checkout, and no money is charged.</p>
      <p>If we introduce paid pricing later, prices will be shown at checkout (including any applicable taxes), and payments will be handled securely by a third-party payment provider — we won't store your card details. Any "founding" price would be a limited-time introductory price that may change for future buyers.</p>

      <h2>6. Refunds</h2>
      <p>Access is free right now, so there's nothing to pay and nothing to refund. <strong>Nothing in these terms limits any rights you have under consumer laws that apply to you — including the Australian Consumer Law — which we do not exclude.</strong></p>
      <p>If we start charging later: because the pass gives immediate access to digital content, we generally won't offer change-of-mind refunds, and (in the EU/UK) by getting immediate access you'd ask us to begin straight away and lose the standard 14-day cancellation right once access begins. Your consumer-law rights would still apply, and if something is seriously wrong we'll make it right, including a refund where the law requires.</p>

      <h2>7. Your account</h2>
      <p>You're responsible for keeping your login secure. Access is tied to your account, so if you change devices, just sign in with the email you signed up with. Tell us promptly if you think your account has been misused.</p>

      <h2>8. Acceptable use</h2>
      <p>Use Did·It lawfully and as intended. Don't attempt to break, copy, scrape, disrupt, or gain unauthorised access to the service, and don't use it to harm anyone.</p>

      <h2>9. Availability and changes</h2>
      <p>We provide Did·It with reasonable care, but we don't guarantee it will always be available, uninterrupted, or error-free. We may update, change, or discontinue games or features. This is subject to your non-excludable consumer guarantees.</p>

      <h2>10. If we wind down Did·It</h2>
      <p>If we ever stop operating Did·It, we'll aim to give you reasonable notice, and where we reasonably can, we may offer a way for you to keep playing the games you've unlocked (for example, an offline version). This is something we'll try to do in good faith — <strong>not a guarantee</strong> — and may not be possible in every case.</p>

      <h2>11. Liability</h2>
      <p>To the extent permitted by law, we're not liable for indirect or consequential loss, and our total liability to you is limited to the amount you paid for your pass. <strong>Nothing in these terms excludes or limits liability that can't legally be excluded, including under the Australian Consumer Law.</strong></p>

      <h2>12. Privacy</h2>
      <p>Our <a href="/privacy">Privacy Policy</a> explains how we handle your information.</p>

      <h2>13. Changes to these terms</h2>
      <p>We may update these terms from time to time. If we make material changes, we'll take reasonable steps to let you know. Continuing to use Did·It after changes means you accept them.</p>

      <h2>14. Governing law</h2>
      <p>These terms are governed by the laws of New South Wales, Australia, and you and we submit to the courts of that place — without affecting any consumer-law rights you have where you live.</p>

      <h2>15. Contact</h2>
      <p>Questions? Email <a href={`mailto:${email}`}>{email}</a>.</p>
    </LegalPage>
  );
}
