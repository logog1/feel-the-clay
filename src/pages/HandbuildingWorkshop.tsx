import WorkshopPageLayout from "@/components/WorkshopPageLayout";
import workshop5 from "@/assets/workshop-5.jpg";
import workshop6 from "@/assets/workshop-6.jpg";
import workshop8 from "@/assets/workshop-8.jpg";
import workshop10 from "@/assets/workshop-10.jpg";

const workshop = {
  title: "Handbuilding Workshop",
  tagline: "Shape unlimited pieces and take them home as memories",
  price: "100 DH",
  duration: "3 hours",
  drink: "Drink of your choice included",
  location: "Riad in the heart of old Medina, Tetouan",
  popular: true,
  description: [
    "Our most popular experience! Step into a beautifully restored riad in the heart of Tetouan's old medina and let your hands do the talking. With handbuilding techniques, you'll shape clay into bowls, cups, sculptures — whatever your imagination desires.",
    "Make unlimited pieces during your session. After firing, your creations will be ready for you to take home as unique souvenirs. All this while soaking in the authentic Moroccan vibes of the medina — the sounds, the scents, the warmth.",
  ],
  highlights: [
    "Unlimited pieces — make as many as you want",
    "Take your fired creations home as memories",
    "Set in a charming riad with Moroccan vibes",
    "Drink of your choice included",
    "3 hours of creative freedom",
    "No experience needed — all levels welcome",
    "Located in the heart of Tetouan's old medina",
  ],
  images: [workshop5, workshop6, workshop8, workshop10],
};

const HandbuildingWorkshop = () => (
  <WorkshopPageLayout workshop={workshop} currentPath="/workshop/handbuilding" />
);

export default HandbuildingWorkshop;
