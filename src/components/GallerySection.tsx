import { useRef } from "react";
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
import workshop17 from "@/assets/workshop-17.jpg";
import workshop18 from "@/assets/workshop-18.jpg";
import workshop19 from "@/assets/workshop-19.jpg";
import workshop20 from "@/assets/workshop-20.jpg";
import workshop21 from "@/assets/workshop-21.jpg";

const row1 = [
  { src: workshop1, alt: "Workshop participant shaping clay" },
  { src: workshop4, alt: "Creating pottery together" },
  { src: workshop9, alt: "Hands shaping clay pieces" },
  { src: workshop17, alt: "Participant showing off clay sculpture" },
  { src: workshop13, alt: "Clay sculpture on pottery wheel" },
  { src: workshop14, alt: "Group workshop in the studio" },
];

const row2 = [
  { src: workshop3, alt: "Group pottery session" },
  { src: workshop18, alt: "Artist presenting handmade mug" },
  { src: workshop5, alt: "Handbuilding clay pieces" },
  { src: workshop10, alt: "Artist rolling clay" },
  { src: workshop19, alt: "Community workshop gathering" },
  { src: workshop12, alt: "Friends enjoying the workshop" },
  { src: workshop15, alt: "Friends showing off their creations" },
];

const row3 = [
  { src: workshop6, alt: "Coil building technique" },
  { src: workshop20, alt: "Friends with their clay creations" },
  { src: workshop8, alt: "Happy workshop participants" },
  { src: workshop11, alt: "Pottery tools on canvas" },
  { src: workshop21, alt: "Handmade clay pieces closeup" },
  { src: workshop16, alt: "Group photo at the workshop" },
];

const GallerySection = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Duplicate images for seamless infinite loop
  const row1Doubled = [...row1, ...row1];
  const row2Doubled = [...row2, ...row2];
  const row3Doubled = [...row3, ...row3];

  return (
    <section 
      id="gallery"
      ref={containerRef}
      className="py-12 md:py-16 bg-background overflow-hidden select-none"
    >
      <div className="container-narrow mb-6">
        <h2 className="text-xl md:text-2xl font-medium text-center">
          Moments
        </h2>
      </div>
      
      {/* Brick-style infinite scrolling rows */}
      <div className="space-y-3 md:space-y-4">
        {/* Row 1 - scrolls left */}
        <div className="overflow-hidden">
          <div className="flex gap-3 md:gap-4 animate-scroll-left">
            {row1Doubled.map((image, index) => (
              <div 
                key={index}
                className="flex-shrink-0 w-48 md:w-72 aspect-[4/3] overflow-hidden rounded-xl bg-secondary/20"
              >
                <img 
                  src={image.src} 
                  alt={image.alt}
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-500 pointer-events-none"
                  loading="lazy"
                  draggable={false}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Row 2 - scrolls right (opposite direction) */}
        <div className="overflow-hidden">
          <div className="flex gap-3 md:gap-4 animate-scroll-right">
            {row2Doubled.map((image, index) => (
              <div 
                key={index}
                className="flex-shrink-0 w-56 md:w-80 aspect-[4/3] overflow-hidden rounded-xl bg-secondary/20"
              >
                <img 
                  src={image.src} 
                  alt={image.alt}
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-500 pointer-events-none"
                  loading="lazy"
                  draggable={false}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Row 3 - scrolls left (slower) */}
        <div className="overflow-hidden">
          <div className="flex gap-3 md:gap-4 animate-scroll-left-slow">
            {row3Doubled.map((image, index) => (
              <div 
                key={index}
                className="flex-shrink-0 w-44 md:w-64 aspect-[4/3] overflow-hidden rounded-xl bg-secondary/20"
              >
                <img 
                  src={image.src} 
                  alt={image.alt}
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-500 pointer-events-none"
                  loading="lazy"
                  draggable={false}
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default GallerySection;
