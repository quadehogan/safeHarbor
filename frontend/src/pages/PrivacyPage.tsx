import { Navbar } from '@/components/Navbar'
import { Footer } from '@/components/Footer'

const LAST_UPDATED = 'April 7, 2026'
const CONTACT_EMAIL = 'privacy@safeharbor.org'

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="border-t border-border pt-8 mt-8">
      <h2 className="text-lg font-semibold text-foreground mb-3">{title}</h2>
      <div className="space-y-3 text-sm text-muted-foreground leading-relaxed">{children}</div>
    </section>
  )
}

export function PrivacyPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-1">
        {/* Hero */}
        <section className="bg-slate-950">
          <div className="mx-auto max-w-3xl px-6 lg:px-8 py-14 sm:py-16">
            <div className="h-1 w-12 rounded-full bg-primary mb-6" />
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-white">
              Privacy Policy
            </h1>
            <p className="mt-3 text-sm text-slate-400">
              Last updated: {LAST_UPDATED}
            </p>
            <p className="mt-4 text-sm text-slate-300 leading-relaxed max-w-xl">
              SafeHarbor is committed to protecting your personal data and
              respecting your privacy. This policy explains what information we
              collect, how we use it, and what rights you have — in compliance
              with the General Data Protection Regulation (GDPR) and applicable
              Philippine data protection law (Republic Act No. 10173).
            </p>
          </div>
        </section>

        {/* Content */}
        <div className="mx-auto max-w-3xl px-6 lg:px-8 py-12 pb-20">

          {/* 1. Who We Are */}
          <Section title="1. Who We Are">
            <p>
              SafeHarbor is a nonprofit organization operating safe homes for
              survivors of trafficking, abuse, and neglect across the
              Philippines. We are the data controller responsible for your
              personal information collected through this website.
            </p>
            <p>
              <strong className="text-foreground">Organization name:</strong> SafeHarbor Foundation, Inc.<br />
              <strong className="text-foreground">Primary operating country:</strong> Philippines<br />
              <strong className="text-foreground">Privacy contact:</strong>{' '}
              <a href={`mailto:${CONTACT_EMAIL}`} className="text-primary hover:underline">
                {CONTACT_EMAIL}
              </a>
            </p>
            <p>
              For any questions about this policy or your personal data, please
              contact us at the email above.
            </p>
          </Section>

          {/* 2. Data We Collect */}
          <Section title="2. What Data We Collect">
            <p>We collect personal data in the following contexts:</p>

            <div className="space-y-4 mt-2">
              <div>
                <p className="font-medium text-foreground">Site Visitors</p>
                <p>
                  When you browse this website, we may automatically collect
                  technical data such as your anonymized IP address, browser
                  type, operating system, pages visited, and time spent on pages.
                  This data is collected via cookies and similar technologies
                  and does not identify you personally.
                </p>
              </div>

              <div>
                <p className="font-medium text-foreground">Donors & Supporters</p>
                <p>
                  When you make a donation or register as a supporter, we collect
                  your name, email address, country of residence, donation amount,
                  donation date, and payment method type (we do not store full
                  payment card details — those are handled by our payment
                  processor). We may also collect your organization name if you
                  donate on behalf of an organization.
                </p>
              </div>

              <div>
                <p className="font-medium text-foreground">Staff & Admin Account Holders</p>
                <p>
                  For staff, social workers, and administrators granted access to
                  our internal platform, we collect your name, email address, job
                  role, and account credentials (passwords are stored in hashed
                  form and never in plain text).
                </p>
              </div>

              <div>
                <p className="font-medium text-foreground">Contact Form Submissions</p>
                <p>
                  If you contact us through our website, we collect your name,
                  email address, and the content of your message.
                </p>
              </div>
            </div>
          </Section>

          {/* 3. Legal Basis */}
          <Section title="3. Legal Basis for Processing (GDPR Article 6)">
            <p>
              We only process your personal data where we have a valid legal
              basis to do so:
            </p>
            <ul className="list-disc list-inside space-y-2 mt-2 pl-2">
              <li>
                <strong className="text-foreground">Consent</strong> — for
                analytics cookies, marketing communications, and the cookie
                consent banner on this site. You may withdraw consent at any
                time.
              </li>
              <li>
                <strong className="text-foreground">Contract performance</strong> — for
                processing donations, issuing receipts, and managing donor
                accounts.
              </li>
              <li>
                <strong className="text-foreground">Legal obligation</strong> — for
                retaining financial records as required by Philippine and
                applicable tax law (typically 7 years).
              </li>
              <li>
                <strong className="text-foreground">Legitimate interests</strong> — for
                site security, fraud prevention, improving website performance,
                and internal reporting — where these interests are not overridden
                by your rights.
              </li>
            </ul>
          </Section>

          {/* 4. How We Use Data */}
          <Section title="4. How We Use Your Data">
            <p>We use personal data to:</p>
            <ul className="list-disc list-inside space-y-1.5 mt-2 pl-2">
              <li>Process and acknowledge donations and issue donation receipts</li>
              <li>Communicate program updates, impact reports, and newsletters (with your consent)</li>
              <li>Manage staff and admin access to our case management platform</li>
              <li>Respond to contact and support inquiries</li>
              <li>Monitor and improve website performance and user experience</li>
              <li>Comply with legal and financial reporting obligations</li>
              <li>Detect and prevent fraudulent or unauthorized activity</li>
            </ul>
            <p>
              We do not use your data to make automated decisions or profiling
              that produce significant legal or personal effects.
            </p>
          </Section>

          {/* 5. Data Sharing */}
          <Section title="5. Data Sharing & Third Parties">
            <p>
              We do not sell, rent, or trade your personal data. We may share
              limited data with trusted third parties only where necessary:
            </p>
            <ul className="list-disc list-inside space-y-1.5 mt-2 pl-2">
              <li>
                <strong className="text-foreground">Payment processors</strong> — to
                securely handle donation transactions. They receive only the data
                required to process payment and are bound by their own privacy
                and security obligations.
              </li>
              <li>
                <strong className="text-foreground">Hosting & infrastructure providers</strong> — our
                web servers and database providers may process data as part of
                their service. All providers are contractually bound to handle
                data securely.
              </li>
              <li>
                <strong className="text-foreground">Email service providers</strong> — used to
                send transactional emails (donation receipts, account creation)
                and newsletters. We only share the data necessary to deliver
                the communication.
              </li>
            </ul>
            <p>
              All third-party processors are required to implement appropriate
              technical and organizational security measures under a data
              processing agreement (DPA).
            </p>
          </Section>

          {/* 6. Retention */}
          <Section title="6. Data Retention">
            <p>
              We retain personal data only for as long as necessary for the
              purposes described in this policy:
            </p>
            <ul className="list-disc list-inside space-y-1.5 mt-2 pl-2">
              <li>
                <strong className="text-foreground">Donor & financial records:</strong> 7 years
                from the date of donation, in accordance with legal and tax
                obligations
              </li>
              <li>
                <strong className="text-foreground">Staff & admin accounts:</strong> Duration
                of employment or engagement, plus 1 year after account closure
              </li>
              <li>
                <strong className="text-foreground">Contact form inquiries:</strong> Up to 2
                years from the date of submission
              </li>
              <li>
                <strong className="text-foreground">Cookie & analytics data:</strong> Session
                cookies expire when you close your browser; persistent cookies
                expire within 12 months
              </li>
            </ul>
            <p>
              When data is no longer needed, we securely delete or anonymize it.
            </p>
          </Section>

          {/* 7. Your Rights */}
          <Section title="7. Your Rights Under GDPR">
            <p>
              If you are located in the European Economic Area (EEA) or the
              United Kingdom, you have the following rights regarding your
              personal data:
            </p>
            <ul className="list-disc list-inside space-y-1.5 mt-2 pl-2">
              <li>
                <strong className="text-foreground">Right of access</strong> — request a copy
                of the personal data we hold about you
              </li>
              <li>
                <strong className="text-foreground">Right to rectification</strong> — request
                correction of inaccurate or incomplete data
              </li>
              <li>
                <strong className="text-foreground">Right to erasure</strong> — request
                deletion of your data where there is no legitimate reason to
                continue processing it
              </li>
              <li>
                <strong className="text-foreground">Right to restrict processing</strong> — request
                that we limit how we use your data in certain circumstances
              </li>
              <li>
                <strong className="text-foreground">Right to data portability</strong> — receive
                your data in a structured, machine-readable format
              </li>
              <li>
                <strong className="text-foreground">Right to object</strong> — object to
                processing based on legitimate interests or direct marketing
              </li>
              <li>
                <strong className="text-foreground">Right to withdraw consent</strong> — withdraw
                consent at any time where processing is based on consent, without
                affecting the lawfulness of prior processing
              </li>
            </ul>
            <p>
              To exercise any of these rights, please email{' '}
              <a href={`mailto:${CONTACT_EMAIL}`} className="text-primary hover:underline">
                {CONTACT_EMAIL}
              </a>
              . We will respond within 30 days. You also have the right to lodge
              a complaint with your local data protection authority.
            </p>
          </Section>

          {/* 8. Cookies */}
          <Section title="8. Cookies">
            <p>
              This website uses cookies — small text files stored on your device
              — to enable core functionality and improve your experience. When
              you first visit the site, you will see a cookie consent banner
              allowing you to accept or decline non-essential cookies.
            </p>
            <p>The types of cookies we use:</p>
            <ul className="list-disc list-inside space-y-1.5 mt-2 pl-2">
              <li>
                <strong className="text-foreground">Strictly necessary cookies</strong> — required
                for the website to function (e.g., authentication session tokens,
                cookie consent preference). These cannot be disabled.
              </li>
              <li>
                <strong className="text-foreground">Analytics cookies</strong> — help us
                understand how visitors interact with the site (pages viewed,
                time on site, referral source). Collected only with your consent.
                IP addresses are anonymized.
              </li>
              <li>
                <strong className="text-foreground">Preference cookies</strong> — remember
                your settings such as display theme (light/dark mode).
              </li>
            </ul>
            <p>
              You can manage or withdraw cookie consent at any time via the
              cookie settings banner, or by adjusting your browser settings.
              Note that disabling certain cookies may affect site functionality.
            </p>
          </Section>

          {/* 9. International Transfers */}
          <Section title="9. International Data Transfers">
            <p>
              SafeHarbor's primary operations and data storage are based in the
              Philippines. If you are located in the EEA or UK, your data may be
              transferred to and processed in a country that does not have the
              same data protection laws as your jurisdiction.
            </p>
            <p>
              Where such transfers occur, we ensure appropriate safeguards are in
              place — including Standard Contractual Clauses (SCCs) approved by
              the European Commission — to protect your data in accordance with
              GDPR requirements.
            </p>
          </Section>

          {/* 10. Children's Privacy */}
          <Section title="10. Children's Privacy">
            <p>
              This website is not directed at children under the age of 13, and
              we do not knowingly collect personal data from children through
              this site. If you believe a child has provided us personal
              information, please contact us at{' '}
              <a href={`mailto:${CONTACT_EMAIL}`} className="text-primary hover:underline">
                {CONTACT_EMAIL}
              </a>{' '}
              so we can promptly delete it.
            </p>
            <p>
              Data relating to the residents in our care (minors) is handled
              under strict internal confidentiality protocols. Such data is
              never published or made accessible through this public website.
              All resident-level data is anonymized in any public-facing
              communications.
            </p>
          </Section>

          {/* 11. Changes */}
          <Section title="11. Changes to This Policy">
            <p>
              We may update this Privacy Policy from time to time to reflect
              changes in our practices, technology, legal requirements, or other
              factors. When we make changes, we will update the "Last updated"
              date at the top of this page.
            </p>
            <p>
              We encourage you to review this policy periodically. For
              significant changes, we may also notify registered account holders
              by email.
            </p>
          </Section>

          {/* 12. Contact */}
          <Section title="12. Contact Us">
            <p>
              If you have questions, concerns, or requests relating to this
              Privacy Policy or your personal data, please contact our privacy
              team:
            </p>
            <p>
              <strong className="text-foreground">Email:</strong>{' '}
              <a href={`mailto:${CONTACT_EMAIL}`} className="text-primary hover:underline">
                {CONTACT_EMAIL}
              </a>
              <br />
              <strong className="text-foreground">Organization:</strong> SafeHarbor Foundation, Inc.<br />
              <strong className="text-foreground">Country:</strong> Philippines
            </p>
            <p>
              We aim to respond to all privacy-related inquiries within 30
              calendar days.
            </p>
          </Section>

        </div>
      </main>

      <Footer />
    </div>
  )
}
