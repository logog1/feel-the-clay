import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import workshop15 from "@/assets/workshop-15.jpg";
import workshop16 from "@/assets/workshop-16.jpg";
import workshop18 from "@/assets/workshop-18.jpg";
import workshop19 from "@/assets/workshop-19.jpg";
import workshop20 from "@/assets/workshop-20.jpg";
import workshop21 from "@/assets/workshop-21.jpg";

interface Product {
  id: string;
  name: string;
  price: string;
  image: string;
  category: "artisan" | "traveler" | "student";
}

const products: Product[] = [
  { id: "1", name: "Handmade Bowl", price: "80 DH", image: workshop15, category: "artisan" },
  { id: "2", name: "Glazed Mug", price: "60 DH", image: workshop16, category: "artisan" },
  { id: "3", name: "Decorative Plate", price: "120 DH", image: workshop18, category: "artisan" },
  { id: "4", name: "Traveler's Cup", price: "50 DH", image: workshop19, category: "traveler" },
  { id: "5", name: "Memory Bowl", price: "50 DH", image: workshop20, category: "traveler" },
  { id: "6", name: "Student Vase", price: "70 DH", image: workshop21, category: "student" },
];

const categories = [
  {
    key: "artisan" as const,
    title: "Artisan Collection",
    description: "Handcrafted by our master potters using traditional wheel-throwing techniques.",
  },
  {
    key: "traveler" as const,
    title: "Traveler Creations",
    description: "Made by workshop participants who couldn't wait for firing. Every purchase is a donation to local NGOs.",
    donation: true,
  },
  {
    key: "student" as const,
    title: "Student Works",
    description: "Created by university students as an additional source of income — especially supporting out-of-town students.",
  },
];

const Store = () => {
  return (
    <main className="min-h-screen bg-background">
      {/* Nav */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border/30">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center">
          <Link to="/" className="flex items-center gap-2 text-foreground/70 hover:text-foreground transition-colors text-sm">
            <ArrowLeft size={16} />
            Back to Home
          </Link>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 pt-20 pb-12">
        <div className="text-center mb-12">
          <h1 className="text-2xl md:text-3xl font-medium">🏺 Our Store</h1>
          <p className="text-foreground/60 mt-2 max-w-lg mx-auto text-sm">
            Every piece tells a story. From master potters to traveling souls to ambitious students — your purchase supports real people and real dreams.
          </p>
        </div>

        {categories.map((cat) => {
          const catProducts = products.filter((p) => p.category === cat.key);
          if (catProducts.length === 0) return null;

          return (
            <section key={cat.key} className="mb-14">
              <div className="mb-4">
                <h2 className="text-lg font-medium">
                  {cat.title}
                  {cat.donation && (
                    <span className="ml-2 text-xs bg-cta/20 text-cta px-2 py-0.5 rounded-full font-normal">
                      Donation
                    </span>
                  )}
                </h2>
                <p className="text-foreground/60 text-sm mt-1">{cat.description}</p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 md:gap-4">
                {catProducts.map((product) => (
                  <div
                    key={product.id}
                    className="group rounded-xl overflow-hidden bg-card/50 hover:bg-card transition-colors"
                  >
                    <div className="aspect-square overflow-hidden">
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        loading="lazy"
                      />
                    </div>
                    <div className="p-3">
                      <h3 className="text-sm font-medium">{product.name}</h3>
                      <p className="text-foreground/60 text-xs mt-1">{product.price}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          );
        })}

        <div className="text-center text-foreground/50 text-xs mt-8">
          <p>Full e-commerce with payments coming soon.</p>
          <p className="mt-1">
            Interested?{" "}
            <a href="https://wa.me/message/SBUBJACPVCNGM1" target="_blank" rel="noopener noreferrer" className="underline hover:text-foreground">
              Message us on WhatsApp
            </a>
          </p>
        </div>
      </div>
    </main>
  );
};

export default Store;
