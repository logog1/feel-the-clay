import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SEOHead from "@/components/SEOHead";

const PrivacyPolicy = () => {
  return (
    <main className="min-h-screen bg-background">
      <SEOHead
        title="Privacy Policy"
        description="Privacy policy explaining what personal data we collect and how it's used."
        path="/privacy"
      />
      <Header />

      <section className="pt-28 pb-20 px-5">
        <div className="max-w-3xl mx-auto prose prose-neutral">
          <h1 className="text-3xl md:text-4xl font-light text-foreground mb-8">Privacy Policy — Politique de Confidentialité</h1>
          <p className="text-sm text-muted-foreground mb-10">Last updated: February 21, 2026</p>

          <h2 className="text-xl font-medium text-foreground mt-10 mb-4">1. Who We Are</h2>
          <p className="text-muted-foreground leading-relaxed">
            Terraria Workshops operates pottery, handbuilding, and embroidery workshops in Tétouan, Morocco.
            This policy explains how we handle personal data collected through our website{" "}
            <a href="https://www.terrariaworkshops.com" className="text-cta hover:underline">www.terrariaworkshops.com</a>.
          </p>

          <h2 className="text-xl font-medium text-foreground mt-10 mb-4">2. Data We Collect</h2>
          <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
            <li><strong>Contact form / booking:</strong> name, email, phone number, message content.</li>
            <li><strong>Order information:</strong> name, phone, delivery address, and items purchased.</li>
          </ul>
          <p className="text-muted-foreground leading-relaxed mt-3">
            We do <strong>not</strong> use Google Analytics, Meta Pixel, Hotjar, or any tracking/advertising cookies.
          </p>

          <h2 className="text-xl font-medium text-foreground mt-10 mb-4">3. Purpose of Data Collection</h2>
          <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
            <li>To respond to your inquiries and questions</li>
            <li>To manage and confirm workshop reservations</li>
            <li>To fulfill store orders and arrange delivery</li>
          </ul>

          <h2 className="text-xl font-medium text-foreground mt-10 mb-4">4. Legal Basis</h2>
          <p className="text-muted-foreground leading-relaxed">
            We process your data based on your <strong>consent</strong> (when you submit a form) and our
            <strong> legitimate interest</strong> in managing our business and responding to customers.
          </p>

          <h2 className="text-xl font-medium text-foreground mt-10 mb-4">5. Data Retention</h2>
          <p className="text-muted-foreground leading-relaxed">
            Personal data from inquiries is retained for a maximum of <strong>12 months</strong>, unless a longer
            retention period is required by law. You may request earlier deletion at any time.
          </p>

          <h2 className="text-xl font-medium text-foreground mt-10 mb-4">6. Data Sharing</h2>
          <p className="text-muted-foreground leading-relaxed">
            Your personal data is accessible only to the business owner. We do <strong>not</strong> sell, rent,
            or share your data with third parties for marketing purposes. Data may be shared with hosting or
            delivery service providers under strict confidentiality.
          </p>

          <h2 className="text-xl font-medium text-foreground mt-10 mb-4">7. Cookies</h2>
          <p className="text-muted-foreground leading-relaxed">
            This website does <strong>not</strong> use analytics or marketing cookies. We do not use any tracking
            pixels. Only strictly necessary technical storage (e.g., session management for hosting/security)
            may be used.
          </p>

          <h2 className="text-xl font-medium text-foreground mt-10 mb-4">8. Your Rights</h2>
          <p className="text-muted-foreground leading-relaxed">You have the right to:</p>
          <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
            <li>Access the personal data we hold about you</li>
            <li>Request correction (rectification) of inaccurate data</li>
            <li>Request deletion of your data</li>
            <li>Withdraw your consent at any time</li>
          </ul>

          <h2 className="text-xl font-medium text-foreground mt-10 mb-4">9. Contact</h2>
          <p className="text-muted-foreground leading-relaxed">
            For any privacy-related questions, contact us at{" "}
            <a href="mailto:hello@terrariaworkshops.com" className="text-cta hover:underline">
              hello@terrariaworkshops.com
            </a>{" "}
            or via{" "}
            <a href="https://www.instagram.com/terraria.workshops" target="_blank" rel="noopener noreferrer" className="text-cta hover:underline">
              Instagram @terraria.workshops
            </a>.
          </p>
        </div>
      </section>

      <Footer />
    </main>
  );
};

export default PrivacyPolicy;
