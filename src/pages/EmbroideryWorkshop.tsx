import WorkshopPageLayout from "@/components/WorkshopPageLayout";
import workshop11 from "@/assets/workshop-11.jpg";
import workshop12 from "@/assets/workshop-12.jpg";
import workshop13 from "@/assets/workshop-13.jpg";
import workshop14 from "@/assets/workshop-14.jpg";

const workshop = {
  title: "Embroidery Workshop",
  tagline: "Learn traditional embroidery and take your creation with you",
  price: "100 DH",
  duration: "3 hours",
  drink: "Drink of your choice included",
  location: "Riad in the heart of old Medina, Tetouan",
  description: [
    "Discover the art of traditional Moroccan embroidery in a cozy riad setting. Guided by a skilled artisan, you'll learn stitching patterns passed down through generations.",
    "By the end of the session, you'll have a handmade piece to take home — a tangible memory of your time in Tetouan. Whether you're a complete beginner or have some experience, this workshop welcomes everyone.",
  ],
  highlights: [
    "Learn traditional Moroccan embroidery techniques",
    "Take your handmade creation home",
    "Drink of your choice included",
    "3 hours of guided craftsmanship",
    "Set in a riad with authentic Moroccan atmosphere",
    "All materials provided",
    "Suitable for all skill levels",
  ],
  images: [workshop11, workshop12, workshop13, workshop14],
};

const EmbroideryWorkshop = () => (
  <WorkshopPageLayout workshop={workshop} currentPath="/workshop/embroidery" />
);

export default EmbroideryWorkshop;
