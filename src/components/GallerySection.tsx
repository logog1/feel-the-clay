import { useRef, useEffect } from "react";
import workshop1 from "@/assets/workshop-1.jpg";
import workshop3 from "@/assets/workshop-3.jpg";
import workshop4 from "@/assets/workshop-4.jpg";
import workshop5 from "@/assets/workshop-5.jpg";
import workshop6 from "@/assets/workshop-6.jpg";
import workshop8 from "@/assets/workshop-8.jpg";
import workshop9 from "@/assets/workshop-9.jpg";
import workshop10 from "@/assets/workshop-10.jpg";
import workshop11 from "@/assets/workshop-11.jpg";
import workshop12 from "@/assets/workshop-12.jpg";
import workshop13 from "@/assets/workshop-13.jpg";
import workshop14 from "@/assets/workshop-14.jpg";
import workshop15 from "@/assets/workshop-15.jpg";
import workshop16 from "@/assets/workshop-16.jpg";

const row1 = [
  { src: workshop1, alt: "Workshop participant shaping clay" },
  { src: workshop4, alt: "Creating pottery together" },
  { src: workshop9, alt: "Hands shaping clay pieces" },
  { src: workshop13, alt: "Clay sculpture on pottery wheel" },
  { src: workshop14, alt: "Group workshop in the studio" },
];

const row2 = [
  { src: workshop3, alt: "Group pottery session" },
  { src: workshop5, alt: "Handbuilding clay pieces" },
  { src: workshop10, alt: "Artist rolling clay" },
  { src: workshop12, alt: "Friends enjoying the workshop" },
  { src: workshop15, alt: "Friends showing off their creations" },
];

const row3 = [
  { src: workshop6, alt: "Coil building technique" },
  { src: workshop8, alt: "Happy workshop participants" },
  { src: workshop11, alt: "Pottery tools on canvas" },
  { src: workshop16, alt: "Group photo at the workshop" },
];

const GallerySection = () => {
  const row1Ref = useRef<HTMLDivElement>(null);
  const row2Ref = useRef<HTMLDivElement>(null);
  const row3Ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      const section = document.getElementById('gallery-section');
      if (!section) return;
      
      const sectionTop = section.offsetTop;
      const sectionHeight = section.offsetHeight;
      const windowHeight = window.innerHeight;
      
      // Check if section is in view
      if (scrollY + windowHeight > sectionTop && scrollY < sectionTop + sectionHeight) {
        const progress = (scrollY + windowHeight - sectionTop) / (sectionHeight + windowHeight);
        
        if (row1Ref.current) {
          row1Ref.current.style.transform = `translateX(${-progress * 50}px)`;
        }
        if (row2Ref.current) {
          row2Ref.current.style.transform = `translateX(${progress * 80}px)`;
        }
        if (row3Ref.current) {
          row3Ref.current.style.transform = `translateX(${-progress * 30}px)`;
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <section id="gallery-section" className="py-12 md:py-16 bg-background overflow-hidden">
      <div className="container-narrow mb-6">
        <h2 className="text-xl md:text-2xl font-medium text-center">
          Moments
        </h2>
      </div>
      
      {/* Brick-style horizontal scrolling rows */}
      <div className="space-y-3 md:space-y-4">
        {/* Row 1 - offset left */}
        <div className="overflow-hidden">
          <div 
            ref={row1Ref}
            className="flex gap-3 md:gap-4 pl-4 md:pl-8 transition-transform duration-100"
          >
            {row1.map((image, index) => (
              <div 
                key={index}
                className="flex-shrink-0 w-48 md:w-72 aspect-[4/3] overflow-hidden rounded-xl bg-sand-dark/20"
              >
                <img 
                  src={image.src} 
                  alt={image.alt}
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                  loading="lazy"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Row 2 - offset right, different speed */}
        <div className="overflow-hidden">
          <div 
            ref={row2Ref}
            className="flex gap-3 md:gap-4 pl-12 md:pl-24 transition-transform duration-100"
          >
            {row2.map((image, index) => (
              <div 
                key={index}
                className="flex-shrink-0 w-56 md:w-80 aspect-[4/3] overflow-hidden rounded-xl bg-sand-dark/20"
              >
                <img 
                  src={image.src} 
                  alt={image.alt}
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                  loading="lazy"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Row 3 - offset less, slowest */}
        <div className="overflow-hidden">
          <div 
            ref={row3Ref}
            className="flex gap-3 md:gap-4 pl-8 md:pl-16 transition-transform duration-100"
          >
            {row3.map((image, index) => (
              <div 
                key={index}
                className="flex-shrink-0 w-44 md:w-64 aspect-[4/3] overflow-hidden rounded-xl bg-sand-dark/20"
              >
                <img 
                  src={image.src} 
                  alt={image.alt}
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                  loading="lazy"
                />
              </div>
            ))}
          </div>
        </div>
      </div>
      
      {/* Mobile swipe hint */}
      <div className="md:hidden mt-4 text-center">
        <p className="text-xs text-muted-foreground">Scroll to explore</p>
      </div>
    </section>
  );
};

export default GallerySection;
