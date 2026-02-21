import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SEOHead from "@/components/SEOHead";

const LegalNotice = () => {
  return (
    <main className="min-h-screen bg-background">
      <SEOHead
        title="Legal Notice"
        description="Legal notice (mentions légales) for Terraria Workshops."
        path="/legal"
      />
      <Header />

      <section className="pt-28 pb-20 px-5">
        <div className="max-w-3xl mx-auto prose prose-neutral">
          <h1 className="text-3xl md:text-4xl font-light text-foreground mb-8">Legal Notice — Mentions Légales</h1>
          <p className="text-sm text-muted-foreground mb-10">Last updated: February 21, 2026</p>

          <h2 className="text-xl font-medium text-foreground mt-10 mb-4">1. Business Information</h2>
          <ul className="list-none pl-0 space-y-2 text-muted-foreground">
            <li><strong>Business name:</strong> Terraria Workshops</li>
            <li><strong>Owner:</strong> [YOUR FULL NAME]</li>
            <li><strong>Status:</strong> Auto-entrepreneur / Micro-entrepreneur</li>
            <li><strong>SIRET:</strong> [SIRET NUMBER IF APPLICABLE]</li>
            <li><strong>Address:</strong> [BUSINESS ADDRESS], Tétouan, Morocco</li>
            <li><strong>Email:</strong> hello@terrariaworkshops.com</li>
            <li><strong>Phone / WhatsApp:</strong> [PHONE NUMBER]</li>
          </ul>

          <h2 className="text-xl font-medium text-foreground mt-10 mb-4">2. Publication Director</h2>
          <p className="text-muted-foreground leading-relaxed">
            Publication director: <strong>[YOUR FULL NAME]</strong>
          </p>

          <h2 className="text-xl font-medium text-foreground mt-10 mb-4">3. Hosting Provider</h2>
          <ul className="list-none pl-0 space-y-2 text-muted-foreground">
            <li><strong>Host:</strong> [HOSTING PROVIDER NAME]</li>
            <li><strong>Address:</strong> [HOSTING PROVIDER ADDRESS]</li>
          </ul>

          <h2 className="text-xl font-medium text-foreground mt-10 mb-4">4. Intellectual Property</h2>
          <p className="text-muted-foreground leading-relaxed">
            All content on this website — including text, images, graphics, logos, and design — is the exclusive
            property of Terraria Workshops or its content creators and is protected by applicable intellectual
            property laws. Any reproduction, distribution, or use without prior written consent is prohibited.
          </p>

          <h2 className="text-xl font-medium text-foreground mt-10 mb-4">5. Limitation of Liability</h2>
          <p className="text-muted-foreground leading-relaxed">
            Terraria Workshops strives to ensure the accuracy of information on this website but cannot guarantee
            that all content is complete, accurate, or up to date. We are not liable for any direct or indirect
            damages resulting from the use of this website, including but not limited to data loss, service
            interruptions, or errors in content.
          </p>

          <h2 className="text-xl font-medium text-foreground mt-10 mb-4">6. Contact</h2>
          <p className="text-muted-foreground leading-relaxed">
            For any questions regarding this legal notice, please contact us at{" "}
            <a href="mailto:hello@terrariaworkshops.com" className="text-cta hover:underline">
              hello@terrariaworkshops.com
            </a>.
          </p>
        </div>
      </section>

      <Footer />
    </main>
  );
};

export default LegalNotice;
