import type { ReactNode } from "react";

/**
 * TermsOfUsePage - Displays the application's terms of use for YouGnosis.
 * Adapted for MVP/development stage. No limitation of liability or warranty clauses.
 */
export default function TermsOfUsePage(): ReactNode {
  return (
    <div className="container mx-auto max-w-3xl px-4 py-12 text-gray-900 dark:text-gray-100">
      <h1 className="mb-6 text-3xl font-bold">Terms of Use</h1>
      <section className="mb-8">
        <h2 className="mb-2 text-xl font-semibold">1. Acceptance of Terms</h2>
        <p>
          By accessing or using YouGnosis, you agree to these Terms of Use. If
          you do not agree, please do not use the service.
        </p>
      </section>
      <section className="mb-8">
        <h2 className="mb-2 text-xl font-semibold">2. Use of Service</h2>
        <p>
          You may use YouGnosis for lawful purposes only. You agree not to
          misuse the platform or attempt to access data you are not authorized
          to view.
        </p>
      </section>
      <section className="mb-8">
        <h2 className="mb-2 text-xl font-semibold">3. Privacy Statement</h2>
        <p>
          We are committed to protecting your privacy. Please read our{" "}
          <a href="/privacy-policy" className="text-blue-600 underline">
            Privacy Policy
          </a>{" "}
          for full details.
        </p>
      </section>
      <section className="mb-8">
        <h2 className="mb-2 text-xl font-semibold">4. Bug Bounty</h2>
        <p>
          YouGnosis does not offer bug bounties, payments, or other rewards for
          unsolicited security disclosures. Unauthorized vulnerability scans or
          penetration testing is strictly prohibited.
        </p>
      </section>
      <section className="mb-8">
        <h2 className="mb-2 text-xl font-semibold">5. Use of YouTube API</h2>
        <p>
          By using YouGnosis, you agree to be bound by the{" "}
          <a
            href="https://www.youtube.com/t/terms"
            className="text-blue-600 underline"
            target="_blank"
            rel="noopener noreferrer"
          >
            YouTube Terms of Service
          </a>
          .
        </p>
      </section>
      <section className="mb-8">
        <h2 className="mb-2 text-xl font-semibold">6. Confidentiality</h2>
        <p>
          Client records are regarded as confidential and will not be divulged
          to any third party unless legally required. You may request copies of
          your records with reasonable notice.
        </p>
      </section>
      <section className="mb-8">
        <h2 className="mb-2 text-xl font-semibold">
          7. Development Disclaimer
        </h2>
        <p>
          YouGnosis is currently in its initial development stage (MVP).
          Features, data, and functionality may change, and bugs may occur.
          Please use the platform at your own risk. No legal liability is
          assumed for data loss, service interruptions, or any damages during
          development.
        </p>
      </section>
      <section className="mb-8">
        <h2 className="mb-2 text-xl font-semibold">8. Copyright Notice</h2>
        <p>
          Copyright and other relevant intellectual property rights exist on all
          text and content relating to YouGnosis. The brand name and services
          are trademarked.
        </p>
      </section>
      <section className="mb-8">
        <h2 className="mb-2 text-xl font-semibold">9. Force Majeure</h2>
        <p>
          Neither party shall be liable for any failure to perform obligations
          due to events beyond their control, including but not limited to
          natural disasters, war, or other unforeseen circumstances.
        </p>
      </section>
      <section className="mb-8">
        <h2 className="mb-2 text-xl font-semibold">10. General</h2>
        <p>
          Use of YouGnosis is subject to existing laws and legal process.
          Nothing in these Terms limits our right to comply with governmental,
          court, or law-enforcement requests.
        </p>
      </section>
      <section className="mb-8">
        <h2 className="mb-2 text-xl font-semibold">
          11. Notification of Changes
        </h2>
        <p>
          We reserve the right to change these Terms at any time. Continued use
          of YouGnosis signifies acceptance of any adjustments.
        </p>
      </section>
      <section>
        <h2 className="mb-2 text-xl font-semibold">12. Contact</h2>
        <p>
          For questions regarding these Terms of Use, please contact{" "}
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
