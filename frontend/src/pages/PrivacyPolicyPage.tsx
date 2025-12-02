import type { ReactNode } from "react";

/**
 * PrivacyPolicyPage - YouGnosis Privacy Policy
 * Adapted for MVP/development stage. No warranty or liability clauses.
 */
export default function PrivacyPolicyPage(): ReactNode {
  return (
    <div className="container mx-auto max-w-3xl px-4 py-12 text-gray-900 dark:text-gray-100">
      <h1 className="mb-6 text-3xl font-bold">Privacy Policy</h1>
      <section className="mb-8">
        <h2 className="mb-2 text-xl font-semibold">Introduction</h2>
        <p>
          Privacy and security are top priorities at YouGnosis. We are committed
          to protecting your personal information and being transparent about
          how we collect, use, and safeguard your data. By using YouGnosis, you
          consent to the practices described below. If you have questions,
          contact us at{" "}
          <a
            href="mailto:yougnosis@gmail.com"
            className="text-blue-600 underline"
          >
            yougnosis@gmail.com
          </a>
          .
        </p>
      </section>
      <section className="mb-8">
        <h2 className="mb-2 text-xl font-semibold">
          1. Information We Collect
        </h2>
        <p>
          We collect information to provide and improve our services,
          communicate with you, and personalize your experience. This includes:
        </p>
        <ul className="mt-2 ml-6 list-disc">
          <li>Identifiers (name, email, account name, IP address)</li>
          <li>Account and profile information</li>
          <li>Commercial information (products/services used)</li>
          <li>Internet/network activity (browsing, usage data)</li>
          <li>Geolocation data (IP-based location)</li>
          <li>Data from connected YouTube accounts and analytics APIs</li>
        </ul>
        <p className="mt-2">
          We may also collect information from third parties, such as social
          media, payment processors, and analytics providers.
        </p>
      </section>
      <section className="mb-8">
        <h2 className="mb-2 text-xl font-semibold">
          2. Automatically Collected Data
        </h2>
        <p>
          We use cookies, pixels, and similar technologies to collect technical
          information about your device and usage patterns. This helps us
          personalize your experience and improve our Platform. You can manage
          cookie preferences in your browser, but some features may not function
          properly if cookies are disabled.
        </p>
      </section>
      <section className="mb-8">
        <h2 className="mb-2 text-xl font-semibold">
          3. Third-Party Analytics & External Links
        </h2>
        <p>
          We use third-party analytics providers (such as Google Analytics) to
          understand Platform usage. These providers may use cookies and collect
          information about your interactions. For more details, see their
          privacy policies:
        </p>
        <ul className="mt-2 ml-6 list-disc">
          <li>
            <a
              href="https://policies.google.com/privacy?hl=en"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 underline"
            >
              Google Privacy Policy
            </a>
          </li>
        </ul>
        <p className="mt-2">
          Our Platform may contain links to external sites. We are not
          responsible for their privacy practices; please review their policies
          before providing information.
        </p>
      </section>
      <section className="mb-8">
        <h2 className="mb-2 text-xl font-semibold">
          4. How We Use Your Information
        </h2>
        <ul className="mt-2 ml-6 list-disc">
          <li>To provide and improve our services</li>
          <li>To personalize your experience</li>
          <li>For account management and support</li>
          <li>For marketing and promotions (with your consent)</li>
          <li>To maintain security and integrity</li>
          <li>To comply with legal obligations</li>
        </ul>
        <p className="mt-2">
          We do not sell your personal information. We may share data with
          trusted partners for business purposes, always under strict
          confidentiality.
        </p>
      </section>
      <section className="mb-8">
        <h2 className="mb-2 text-xl font-semibold">5. Your Rights & Choices</h2>
        <ul className="mt-2 ml-6 list-disc">
          <li>Access, update, or delete your personal information</li>
          <li>Opt out of marketing communications</li>
          <li>Manage cookie preferences</li>
          <li>Request data portability (where applicable)</li>
        </ul>
        <p className="mt-2">
          To exercise your rights, email{" "}
          <a
            href="mailto:support@yougnosis.com"
            className="text-blue-600 underline"
          >
            support@yougnosis.com
          </a>
          .
        </p>
      </section>
      <section className="mb-8">
        <h2 className="mb-2 text-xl font-semibold">6. Data Security</h2>
        <p>
          We use industry-standard security measures to protect your data. While
          we strive to safeguard your information, no method of transmission
          over the internet is 100% secure.
        </p>
      </section>
      <section className="mb-8">
        <h2 className="mb-2 text-xl font-semibold">7. International Users</h2>
        <p>
          YouGnosis is operated from the EU. If you access our Platform from
          outside the EU, your information may be transferred and processed in
          the EU.
        </p>
      </section>
      <section className="mb-8">
        <h2 className="mb-2 text-xl font-semibold">
          8. Changes to This Policy
        </h2>
        <p>
          We may update this Privacy Policy from time to time. Changes will be
          posted on this page, and your continued use of YouGnosis constitutes
          acceptance of the updated policy.
        </p>
      </section>
      <section className="mb-8">
        <h2 className="mb-2 text-xl font-semibold">Lawful Basis for Processing</h2>
        <p>
          We process your personal data based on your consent, our contractual obligations to provide services, and our legitimate interests in improving YouGnosis.
        </p>
      </section>
      <section className="mb-8">
        <h2 className="mb-2 text-xl font-semibold">Your Rights Under GDPR</h2>
        <ul className="mt-2 ml-6 list-disc">
          <li>Access, update, or delete your personal information</li>
          <li>Request restriction or object to processing</li>
          <li>Request data portability</li>
          <li>Lodge a complaint with a supervisory authority</li>
        </ul>
      </section>
      <section className="mb-8">
        <h2 className="mb-2 text-xl font-semibold">Data Retention</h2>
        <p>
          We retain your data as long as your account is active or as required to provide services and comply with legal obligations.
        </p>
      </section>
      <section className="mb-8">
        <h2 className="mb-2 text-xl font-semibold">International Transfers</h2>
        <p>
          Your data may be processed outside the EU. We ensure appropriate safeguards for such transfers, including standard contractual clauses.
        </p>
      </section>
      <section className="mb-8">
        <h2 className="mb-2 text-xl font-semibold">Data Breach Notification</h2>
        <p>
          In the event of a data breach affecting your personal data, we will notify you and relevant authorities as required by law.
        </p>
      </section>
      <section>
        <h2 className="mb-2 text-xl font-semibold">9. Contact</h2>
        <p>
          For questions or requests regarding this Privacy Policy, contact us at{" "}
          <a
            href="mailto:yougnosis@gmail.com"
            className="text-blue-600 underline"
          >
            yougnosis@gmail.com
          </a>
          .
        </p>
      </section>
    </div>
  );
}
