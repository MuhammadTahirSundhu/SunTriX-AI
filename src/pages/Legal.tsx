import Layout from "@/components/Layout";

const LegalPage = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <Layout>
    <section className="pt-32 pb-20">
      <div className="container mx-auto px-4 lg:px-8 pt-16 max-w-3xl">
        <h1 className="text-3xl font-extrabold mb-8">{title}</h1>
        <div className="prose prose-invert prose-sm max-w-none space-y-6 text-muted-foreground">
          {children}
        </div>
      </div>
    </section>
  </Layout>
);

export const PrivacyPolicy = () => (
  <LegalPage title="Privacy Policy">
    <p>Last updated: February 2026</p>
    <h2 className="text-xl font-bold text-foreground mt-8">1. Information We Collect</h2>
    <p>We collect information you provide directly, including name, email, company, and project details when you submit forms or contact us.</p>
    <h2 className="text-xl font-bold text-foreground mt-8">2. How We Use Your Information</h2>
    <p>We use your information to respond to inquiries, provide services, send project proposals, and improve our website experience.</p>
    <h2 className="text-xl font-bold text-foreground mt-8">3. Data Protection</h2>
    <p>We implement industry-standard security measures to protect your data. All communications are encrypted and we follow GDPR-compliant practices.</p>
    <h2 className="text-xl font-bold text-foreground mt-8">4. Contact</h2>
    <p>For privacy inquiries, contact us at privacy@suntrix.com.</p>
  </LegalPage>
);

export const TermsOfService = () => (
  <LegalPage title="Terms of Service">
    <p>Last updated: February 2026</p>
    <h2 className="text-xl font-bold text-foreground mt-8">1. Acceptance of Terms</h2>
    <p>By accessing this website, you agree to be bound by these terms and conditions.</p>
    <h2 className="text-xl font-bold text-foreground mt-8">2. Services</h2>
    <p>SunTriX provides AI engineering, machine learning, computer vision, and SaaS development services as described on this website.</p>
    <h2 className="text-xl font-bold text-foreground mt-8">3. Intellectual Property</h2>
    <p>All content on this website is the property of SunTriX unless otherwise stated.</p>
    <h2 className="text-xl font-bold text-foreground mt-8">4. Limitation of Liability</h2>
    <p>SunTriX shall not be liable for any indirect or consequential damages arising from the use of our services.</p>
  </LegalPage>
);

export const CookiePolicy = () => (
  <LegalPage title="Cookie Policy">
    <p>Last updated: February 2026</p>
    <h2 className="text-xl font-bold text-foreground mt-8">1. What Are Cookies</h2>
    <p>Cookies are small text files stored on your device when you visit our website.</p>
    <h2 className="text-xl font-bold text-foreground mt-8">2. How We Use Cookies</h2>
    <p>We use essential cookies for website functionality and analytics cookies to understand how visitors interact with our site.</p>
    <h2 className="text-xl font-bold text-foreground mt-8">3. Managing Cookies</h2>
    <p>You can control cookies through your browser settings. Disabling cookies may affect website functionality.</p>
  </LegalPage>
);
