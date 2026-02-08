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
import workshop18 from "@/assets/workshop-18.jpg";
import workshop19 from "@/assets/workshop-19.jpg";
import workshop20 from "@/assets/workshop-20.jpg";
import workshop21 from "@/assets/workshop-21.jpg";

const row1 = [
  { src: workshop1, alt: "Workshop participant shaping clay" },
  { src: workshop4, alt: "Creating pottery together" },
  { src: workshop9, alt: "Hands shaping clay pieces" },
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

const GalleryRow = ({ 
  images, 
  animationClass, 
  imageWidth 
}: { 
  images: typeof row1; 
  animationClass: string; 
  imageWidth: string;
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const rowRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);
  const startX = useRef(0);
  const scrollLeft = useRef(0);

  const pauseAnimation = () => {
    rowRef.current?.style.setProperty('animation-play-state', 'paused');
  };

  const resumeAnimation = () => {
    setTimeout(() => {
      rowRef.current?.style.setProperty('animation-play-state', 'running');
    }, 2000); // Resume after 2 seconds of no interaction
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    isDragging.current = true;
    startX.current = e.touches[0].pageX;
    scrollLeft.current = containerRef.current?.scrollLeft || 0;
    pauseAnimation();
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging.current || !containerRef.current) return;
    const x = e.touches[0].pageX;
    const walk = (startX.current - x) * 1.5;
    containerRef.current.scrollLeft = scrollLeft.current + walk;
  };

  const handleTouchEnd = () => {
    isDragging.current = false;
    resumeAnimation();
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    isDragging.current = true;
    startX.current = e.pageX;
    scrollLeft.current = containerRef.current?.scrollLeft || 0;
    pauseAnimation();
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging.current || !containerRef.current) return;
    e.preventDefault();
    const x = e.pageX;
    const walk = (startX.current - x) * 1.5;
    containerRef.current.scrollLeft = scrollLeft.current + walk;
  };

  const handleMouseUp = () => {
    isDragging.current = false;
    resumeAnimation();
  };

  // Double the images for seamless infinite scroll
  const doubled = [...images, ...images];

  return (
    <div 
      ref={containerRef}
      className="overflow-hidden cursor-grab active:cursor-grabbing"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      <div ref={rowRef} className={`flex gap-3 md:gap-4 w-max ${animationClass}`}>
        {doubled.map((image, index) => (
          <div 
            key={index}
            className={`flex-shrink-0 ${imageWidth} aspect-[4/3] overflow-hidden rounded-xl bg-secondary/20`}
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
  );
};

const GallerySection = () => {
  return (
    <section 
      id="gallery"
      className="py-12 md:py-16 bg-background overflow-hidden select-none"
    >
      <div className="container-narrow mb-6">
        <h2 className="text-xl md:text-2xl font-medium text-center">
          Moments
        </h2>
      </div>
      
      <div className="space-y-3 md:space-y-4">
        <GalleryRow images={row1} animationClass="animate-scroll-left" imageWidth="w-48 md:w-72" />
        <GalleryRow images={row2} animationClass="animate-scroll-right" imageWidth="w-56 md:w-80" />
        <GalleryRow images={row3} animationClass="animate-scroll-left-slow" imageWidth="w-44 md:w-64" />
      </div>
    </section>
  );
};

export default GallerySection;
