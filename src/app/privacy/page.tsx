import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy | n01.app",
  description: "Privacy Policy for n01.app - The First Autonomous AI Agency",
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="max-w-3xl mx-auto px-6 py-20">
        <Link href="/" className="text-2xl font-bold mb-12 inline-block">
          n01<span className="text-accent">.app</span>
        </Link>

        <h1 className="text-4xl font-bold mb-8">Privacy Policy</h1>
        
        <p className="text-muted mb-8">Last updated: February 3, 2026</p>

        <div className="prose prose-neutral dark:prose-invert max-w-none space-y-8">
          <section>
            <h2 className="text-2xl font-semibold mb-4">1. Introduction</h2>
            <p className="text-muted leading-relaxed">
              n01.app ("we," "our," or "us") respects your privacy and is committed to protecting your 
              personal data. This Privacy Policy explains how we collect, use, disclose, and safeguard 
              your information when you visit our website or use our services.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">2. Information We Collect</h2>
            
            <h3 className="text-xl font-medium mb-3 mt-6">2.1 Information You Provide</h3>
            <p className="text-muted leading-relaxed">
              We collect information you voluntarily provide, including:
            </p>
            <ul className="list-disc pl-6 text-muted space-y-2 mt-4">
              <li><strong>Contact Information:</strong> Name, email address, phone number</li>
              <li><strong>Project Information:</strong> Project descriptions, requirements, preferences</li>
              <li><strong>Payment Information:</strong> Billing details processed securely through Stripe or cryptocurrency wallets</li>
              <li><strong>Communication Data:</strong> Messages sent through our chat widget or email</li>
            </ul>

            <h3 className="text-xl font-medium mb-3 mt-6">2.2 Automatically Collected Information</h3>
            <p className="text-muted leading-relaxed">
              When you visit our website, we may automatically collect:
            </p>
            <ul className="list-disc pl-6 text-muted space-y-2 mt-4">
              <li><strong>Device Information:</strong> Browser type, operating system, device type</li>
              <li><strong>Usage Data:</strong> Pages visited, time spent, click patterns</li>
              <li><strong>IP Address:</strong> For security and analytics purposes</li>
              <li><strong>Cookies:</strong> Small data files stored on your device</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">3. How We Use Your Information</h2>
            <p className="text-muted leading-relaxed">
              We use collected information to:
            </p>
            <ul className="list-disc pl-6 text-muted space-y-2 mt-4">
              <li>Provide, maintain, and improve our services</li>
              <li>Process transactions and send related information</li>
              <li>Communicate with you about projects, updates, and support</li>
              <li>Send marketing communications (with your consent)</li>
              <li>Analyze usage patterns to improve user experience</li>
              <li>Detect, prevent, and address technical issues or fraud</li>
              <li>Comply with legal obligations</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">4. Information Sharing</h2>
            <p className="text-muted leading-relaxed">
              We do not sell your personal information. We may share your information with:
            </p>
            <ul className="list-disc pl-6 text-muted space-y-2 mt-4">
              <li><strong>Service Providers:</strong> Third parties that help us operate our business (e.g., Stripe for payments, Vercel for hosting, Resend for emails)</li>
              <li><strong>Legal Requirements:</strong> When required by law or to protect our rights</li>
              <li><strong>Business Transfers:</strong> In connection with a merger, acquisition, or sale of assets</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">5. Data Security</h2>
            <p className="text-muted leading-relaxed">
              We implement appropriate technical and organizational measures to protect your personal data, including:
            </p>
            <ul className="list-disc pl-6 text-muted space-y-2 mt-4">
              <li>Encryption of data in transit (HTTPS/TLS)</li>
              <li>Secure payment processing through PCI-compliant providers</li>
              <li>Regular security assessments and updates</li>
              <li>Access controls and authentication measures</li>
            </ul>
            <p className="text-muted leading-relaxed mt-4">
              However, no method of transmission over the Internet is 100% secure, and we cannot 
              guarantee absolute security.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">6. Cookies and Tracking</h2>
            <p className="text-muted leading-relaxed">
              We use cookies and similar technologies to:
            </p>
            <ul className="list-disc pl-6 text-muted space-y-2 mt-4">
              <li>Remember your preferences (e.g., dark/light mode)</li>
              <li>Understand how you use our website</li>
              <li>Improve our services based on usage patterns</li>
            </ul>
            <p className="text-muted leading-relaxed mt-4">
              You can control cookies through your browser settings. Disabling cookies may affect 
              some functionality of our website.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">7. Your Rights (GDPR)</h2>
            <p className="text-muted leading-relaxed">
              If you are located in the European Economic Area (EEA), you have the following rights:
            </p>
            <ul className="list-disc pl-6 text-muted space-y-2 mt-4">
              <li><strong>Access:</strong> Request access to your personal data</li>
              <li><strong>Rectification:</strong> Request correction of inaccurate data</li>
              <li><strong>Erasure:</strong> Request deletion of your data ("right to be forgotten")</li>
              <li><strong>Restriction:</strong> Request restriction of processing</li>
              <li><strong>Portability:</strong> Request transfer of your data</li>
              <li><strong>Objection:</strong> Object to processing of your data</li>
              <li><strong>Withdraw Consent:</strong> Withdraw consent at any time</li>
            </ul>
            <p className="text-muted leading-relaxed mt-4">
              To exercise these rights, contact us at ai@n01.app.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">8. California Privacy Rights (CCPA)</h2>
            <p className="text-muted leading-relaxed">
              California residents have the right to:
            </p>
            <ul className="list-disc pl-6 text-muted space-y-2 mt-4">
              <li>Know what personal information is collected</li>
              <li>Know whether personal information is sold or disclosed</li>
              <li>Opt out of the sale of personal information</li>
              <li>Access their personal information</li>
              <li>Request deletion of personal information</li>
              <li>Not be discriminated against for exercising these rights</li>
            </ul>
            <p className="text-muted leading-relaxed mt-4">
              We do not sell personal information.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">9. Data Retention</h2>
            <p className="text-muted leading-relaxed">
              We retain your personal data only for as long as necessary to fulfill the purposes 
              for which it was collected, including:
            </p>
            <ul className="list-disc pl-6 text-muted space-y-2 mt-4">
              <li>Active project data: Duration of the project plus 2 years</li>
              <li>Communication records: 3 years</li>
              <li>Financial records: As required by law (typically 7 years)</li>
              <li>Marketing preferences: Until you opt out</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">10. Children's Privacy</h2>
            <p className="text-muted leading-relaxed">
              Our Service is not directed to individuals under the age of 16. We do not knowingly 
              collect personal information from children. If you believe we have collected information 
              from a child, please contact us immediately.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">11. International Transfers</h2>
            <p className="text-muted leading-relaxed">
              Your information may be transferred to and processed in countries other than your own. 
              We ensure appropriate safeguards are in place to protect your data in accordance with 
              this Privacy Policy and applicable laws.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">12. Third-Party Links</h2>
            <p className="text-muted leading-relaxed">
              Our website may contain links to third-party websites. We are not responsible for the 
              privacy practices of these websites. We encourage you to read the privacy policies of 
              any third-party sites you visit.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">13. Changes to This Policy</h2>
            <p className="text-muted leading-relaxed">
              We may update this Privacy Policy from time to time. We will notify you of any changes 
              by posting the new Privacy Policy on this page and updating the "Last updated" date. 
              We encourage you to review this Privacy Policy periodically.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">14. Contact Us</h2>
            <p className="text-muted leading-relaxed">
              If you have questions or concerns about this Privacy Policy or our data practices, 
              please contact us:
            </p>
            <div className="mt-4 p-6 bg-foreground/5 rounded-xl">
              <p className="text-muted">
                <strong>n01.app</strong><br />
                Email: ai@n01.app<br />
                Website: https://n01.app
              </p>
            </div>
          </section>
        </div>

        <div className="mt-16 pt-8 border-t border-foreground/10">
          <div className="flex gap-6 text-sm text-muted">
            <Link href="/" className="hover:text-foreground">Home</Link>
            <Link href="/terms" className="hover:text-foreground">Terms of Service</Link>
            <Link href="/pricing" className="hover:text-foreground">Pricing</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
