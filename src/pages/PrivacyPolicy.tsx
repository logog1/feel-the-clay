import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SEOHead from "@/components/SEOHead";

const PrivacyPolicy = () => {
  return (
    <main className="min-h-screen bg-background">
      <SEOHead
        title="Privacy Policy"
        description="Privacy policy for Terraria Workshops — how we collect, use, and protect your personal data."
        path="/privacy"
      />
      <Header />

      <section className="pt-28 pb-20 px-5">
        <div className="max-w-3xl mx-auto prose prose-neutral">
          <h1 className="text-3xl md:text-4xl font-light text-foreground mb-8">Privacy Policy</h1>
          <p className="text-sm text-muted-foreground mb-10">Last updated: February 21, 2026</p>

          <h2 className="text-xl font-medium text-foreground mt-10 mb-4">1. Who We Are</h2>
          <p className="text-muted-foreground leading-relaxed">
            Terraria Workshops operates pottery, handbuilding, and embroidery workshops in Tetouan, Morocco.
            This policy explains how we handle personal data collected through our website{" "}
            <a href="https://feel-the-clay.lovable.app" className="text-cta hover:underline">feel-the-clay.lovable.app</a>.
          </p>

          <h2 className="text-xl font-medium text-foreground mt-10 mb-4">2. Information We Collect</h2>
          <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
            <li><strong>Booking information:</strong> name, email, phone number, city, number of participants, preferred dates, and any notes you provide.</li>
            <li><strong>Order information:</strong> name, phone, delivery address, and items purchased.</li>
            <li><strong>Usage data:</strong> pages visited, browser type, and device information (collected automatically).</li>
          </ul>

          <h2 className="text-xl font-medium text-foreground mt-10 mb-4">3. How We Use Your Data</h2>
          <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
            <li>To process and confirm your workshop bookings</li>
            <li>To fulfill store orders and arrange delivery</li>
            <li>To communicate with you about your booking or order</li>
            <li>To improve our website and services</li>
          </ul>

          <h2 className="text-xl font-medium text-foreground mt-10 mb-4">4. Data Sharing</h2>
          <p className="text-muted-foreground leading-relaxed">
            We do not sell or rent your personal data. We may share information with service providers who help us operate
            our website and fulfill orders (e.g., hosting, delivery), under strict confidentiality agreements.
          </p>

          <h2 className="text-xl font-medium text-foreground mt-10 mb-4">5. Data Retention</h2>
          <p className="text-muted-foreground leading-relaxed">
            We retain your personal data only as long as necessary to provide our services and comply with legal obligations.
            You may request deletion of your data at any time.
          </p>

          <h2 className="text-xl font-medium text-foreground mt-10 mb-4">6. Cookies</h2>
          <p className="text-muted-foreground leading-relaxed">
            Our website uses essential cookies to ensure proper functionality. We do not use advertising or tracking cookies.
          </p>

          <h2 className="text-xl font-medium text-foreground mt-10 mb-4">7. Your Rights</h2>
          <p className="text-muted-foreground leading-relaxed">You have the right to:</p>
          <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
            <li>Access the personal data we hold about you</li>
            <li>Request correction or deletion of your data</li>
            <li>Withdraw consent at any time</li>
          </ul>

          <h2 className="text-xl font-medium text-foreground mt-10 mb-4">8. Contact Us</h2>
          <p className="text-muted-foreground leading-relaxed">
            For any privacy-related questions, contact us via Instagram{" "}
            <a href="https://www.instagram.com/terraria.workshops" target="_blank" rel="noopener noreferrer" className="text-cta hover:underline">
              @terraria.workshops
            </a>{" "}
            or through the contact form on our website.
          </p>
        </div>
      </section>

      <Footer />
    </main>
  );
};

export default PrivacyPolicy;
