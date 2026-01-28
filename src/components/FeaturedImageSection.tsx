import workshop2 from "@/assets/workshop-2.jpg";

const FeaturedImageSection = () => {
  return (
    <section className="py-8 md:py-12">
      <div className="max-w-4xl mx-auto px-4">
        <div className="aspect-[16/9] md:aspect-[21/9] rounded-3xl overflow-hidden shadow-xl">
          <img 
            src={workshop2} 
            alt="Community pottery workshop in Tetouan" 
            className="w-full h-full object-cover"
          />
        </div>
      </div>
    </section>
  );
};

export default FeaturedImageSection;
