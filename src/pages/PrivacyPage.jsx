import LegalPage from './LegalPage';
import { LEGAL } from '../config';

export default function PrivacyPage() {
  const email = LEGAL.contactEmail;
  return (
    <LegalPage title="Privacy Policy" updated={LEGAL.effectiveDate}>
      <p>
        Did·It is operated by {LEGAL.entity}, based in {LEGAL.location}.
        Contact: <a href={`mailto:${email}`}>{email}</a>.
      </p>

      <h2>1. Accounts are for adults</h2>
      <p>Did·It is set up and managed by a parent or carer. We don't knowingly collect personal information from children. The games don't ask children for personal details.</p>

      <h2>2. What we collect</h2>
      <p>To run Did·It and process your purchase, we collect:</p>
      <ul>
        <li>the details you give us (such as your email, and your name if you choose to sign in with it);</li>
        <li>a record of your purchase — your payment is handled securely by a third-party payment provider, and <strong>we don't store your card details</strong>; and</li>
        <li>basic information about how the app is used, so we can keep it working and improve it.</li>
      </ul>
      <p>We <strong>don't run ads</strong>, and we <strong>don't sell your information</strong>.</p>

      <h2>3. How we use it</h2>
      <p>To provide and secure Did·It, remember your purchase and sign you in, improve the games, understand how families find us, and respond to you.</p>

      <h2>4. Service providers and storage</h2>
      <p>We use a small number of trusted third-party providers to help us run the service (such as hosting, payments, and usage analytics). They handle information on our behalf, and some may store it <strong>overseas, including outside Australia</strong>.</p>

      <h2>5. Cookies and local storage</h2>
      <p>We use your browser's storage to keep you signed in and for basic, non-advertising analytics. We don't use advertising cookies or third-party trackers.</p>

      <h2>6. Keeping and deleting your information</h2>
      <p>We keep your information while your account is active and delete it on request.</p>

      <h2>7. Your rights</h2>
      <p>Depending on where you live, you may have rights to access, correct, or delete your information, or to complain to a privacy regulator. Email <a href={`mailto:${email}`}>{email}</a> and we'll help.</p>

      <h2>8. Changes</h2>
      <p>We may update this policy and will post the new version here with a new date.</p>

      <h2>9. Contact</h2>
      <p>Email <a href={`mailto:${email}`}>{email}</a>.</p>
    </LegalPage>
  );
}
