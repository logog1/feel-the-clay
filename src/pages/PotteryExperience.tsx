import WorkshopPageLayout from "@/components/WorkshopPageLayout";
import workshop1 from "@/assets/workshop-1.jpg";
import workshop3 from "@/assets/workshop-3.jpg";
import workshop4 from "@/assets/workshop-4.jpg";
import workshop9 from "@/assets/workshop-9.jpg";

const workshop = {
  title: "Full Pottery Experience",
  tagline: "Witness the entire journey of clay — from raw earth to the kiln",
  price: "100 DH",
  duration: "3 hours",
  drink: "Cup of tea included",
  description: [
    "Immerse yourself in the world of pottery from start to finish. Join a master potter and experience the full process — from preparing raw earth, shaping it on the wheel, to understanding how pieces are fired in the traditional kiln.",
    "This is not just a workshop — it's a journey through centuries of craftsmanship. Watch, learn, and feel the magic of transforming earth into art.",
  ],
  highlights: [
    "Full pottery process from earth to kiln",
    "Work alongside a professional potter",
    "Learn wheel throwing and traditional techniques",
    "A warm cup of Moroccan tea included",
    "3 hours of immersive experience",
    "Perfect for curious minds and art lovers",
  ],
  images: [workshop1, workshop3, workshop4, workshop9],
};

const PotteryExperience = () => (
  <WorkshopPageLayout workshop={workshop} currentPath="/workshop/pottery-experience" />
);

export default PotteryExperience;
