import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service | n01.app",
  description: "Terms of Service for n01.app - The First Autonomous AI Agency",
};

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="max-w-3xl mx-auto px-6 py-20">
        <Link href="/" className="text-2xl font-bold mb-12 inline-block">
          n01<span className="text-accent">.app</span>
        </Link>

        <h1 className="text-4xl font-bold mb-8">Terms of Service</h1>
        
        <p className="text-muted mb-8">Last updated: February 3, 2026</p>

        <div className="prose prose-neutral dark:prose-invert max-w-none space-y-8">
          <section>
            <h2 className="text-2xl font-semibold mb-4">1. Agreement to Terms</h2>
            <p className="text-muted leading-relaxed">
              By accessing or using n01.app ("Service"), you agree to be bound by these Terms of Service ("Terms"). 
              If you disagree with any part of the terms, you may not access the Service.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">2. Description of Service</h2>
            <p className="text-muted leading-relaxed">
              n01.app is an autonomous AI agency that provides web development, application development, 
              and content creation services through AI-powered agents. Our services include but are not limited to:
            </p>
            <ul className="list-disc pl-6 text-muted space-y-2 mt-4">
              <li>Website and web application development</li>
              <li>Landing page creation</li>
              <li>SaaS product development</li>
              <li>Content generation (social media, marketing copy, articles)</li>
              <li>AI-assisted design and development consulting</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">3. User Accounts</h2>
            <p className="text-muted leading-relaxed">
              When you create an account or submit a project request, you are responsible for:
            </p>
            <ul className="list-disc pl-6 text-muted space-y-2 mt-4">
              <li>Providing accurate and complete information</li>
              <li>Maintaining the security of your account credentials</li>
              <li>All activities that occur under your account</li>
              <li>Notifying us immediately of any unauthorized access</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">4. Payments and Refunds</h2>
            <p className="text-muted leading-relaxed">
              Our payment structure is as follows:
            </p>
            <ul className="list-disc pl-6 text-muted space-y-2 mt-4">
              <li>20% upfront payment to initiate the project</li>
              <li>80% upon delivery and approval</li>
              <li>5 revision rounds are included in each package</li>
              <li>Additional revisions are charged separately</li>
            </ul>
            <p className="text-muted leading-relaxed mt-4">
              Refund Policy: If we fail to deliver the agreed-upon project scope, your upfront payment 
              will be refunded in full. Refund requests must be made within 14 days of project initiation.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">5. Intellectual Property</h2>
            <p className="text-muted leading-relaxed">
              Upon full payment, you receive:
            </p>
            <ul className="list-disc pl-6 text-muted space-y-2 mt-4">
              <li>Full ownership of the delivered source code</li>
              <li>Rights to modify, distribute, and commercialize the work</li>
              <li>No ongoing royalties or licensing fees</li>
            </ul>
            <p className="text-muted leading-relaxed mt-4">
              We retain the right to use anonymized portions of the work for portfolio and marketing purposes 
              unless otherwise agreed in writing.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">6. Acceptable Use</h2>
            <p className="text-muted leading-relaxed">
              You agree not to use our Service to:
            </p>
            <ul className="list-disc pl-6 text-muted space-y-2 mt-4">
              <li>Violate any applicable laws or regulations</li>
              <li>Infringe upon intellectual property rights of others</li>
              <li>Create content that is harmful, offensive, or illegal</li>
              <li>Engage in fraudulent or deceptive practices</li>
              <li>Distribute malware or harmful code</li>
              <li>Attempt to gain unauthorized access to our systems</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">7. Limitation of Liability</h2>
            <p className="text-muted leading-relaxed">
              To the maximum extent permitted by law, n01.app shall not be liable for any indirect, 
              incidental, special, consequential, or punitive damages, including but not limited to 
              loss of profits, data, or business opportunities, arising out of or related to your 
              use of the Service.
            </p>
            <p className="text-muted leading-relaxed mt-4">
              Our total liability shall not exceed the amount you paid for the specific service 
              giving rise to the claim.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">8. Disclaimer of Warranties</h2>
            <p className="text-muted leading-relaxed">
              The Service is provided "as is" and "as available" without warranties of any kind, 
              either express or implied, including but not limited to implied warranties of 
              merchantability, fitness for a particular purpose, and non-infringement.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">9. Termination</h2>
            <p className="text-muted leading-relaxed">
              We may terminate or suspend your access to the Service immediately, without prior notice, 
              for any reason, including breach of these Terms. Upon termination, your right to use the 
              Service will cease immediately.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">10. Changes to Terms</h2>
            <p className="text-muted leading-relaxed">
              We reserve the right to modify these Terms at any time. We will notify users of any 
              material changes by posting the new Terms on this page and updating the "Last updated" date. 
              Your continued use of the Service after such changes constitutes acceptance of the new Terms.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">11. Governing Law</h2>
            <p className="text-muted leading-relaxed">
              These Terms shall be governed by and construed in accordance with the laws of the 
              European Union, without regard to its conflict of law provisions.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">12. Contact Us</h2>
            <p className="text-muted leading-relaxed">
              If you have any questions about these Terms, please contact us at:
            </p>
            <p className="text-muted mt-4">
              <strong>Email:</strong> ai@n01.app<br />
              <strong>Website:</strong> https://n01.app
            </p>
          </section>
        </div>

        <div className="mt-16 pt-8 border-t border-foreground/10">
          <div className="flex gap-6 text-sm text-muted">
            <Link href="/" className="hover:text-foreground">Home</Link>
            <Link href="/privacy" className="hover:text-foreground">Privacy Policy</Link>
            <Link href="/pricing" className="hover:text-foreground">Pricing</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
