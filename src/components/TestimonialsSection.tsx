import { useEffect, useState } from "react";
import { Quote, Star } from "lucide-react";
import { useLanguage } from "@/i18n/LanguageContext";
import { useScrollAnimation } from "@/hooks/use-scroll-animation";
import { cn } from "@/lib/utils";
import { Carousel, CarouselContent, CarouselItem } from "@/components/ui/carousel";
import { supabase } from "@/integrations/supabase/client";

interface Review {
  quote: string;
  name: string;
  rating?: number;
  photo?: string;
  timeAgo?: string;
  isGoogle?: boolean;
}

const TestimonialsSection = () => {
  const { t } = useLanguage();
  const { ref, isVisible } = useScrollAnimation(0.15);
  const [reviews, setReviews] = useState<Review[]>([]);

  // Static fallback testimonials
  const staticTestimonials: Review[] = [
    { quote: t("testimonials.1"), name: "Sarah" },
    { quote: t("testimonials.2"), name: "Lina" },
    { quote: t("testimonials.3"), name: "Ahmed" },
    { quote: t("testimonials.4"), name: "Fatima" },
    { quote: t("testimonials.5"), name: "Youssef" },
  ];

  useEffect(() => {
    const fetchGoogleReviews = async () => {
      const { data } = await supabase
        .from("google_reviews")
        .select("*")
        .order("fetched_at", { ascending: false })
        .limit(10);

      if (data && data.length > 0) {
        const googleReviews: Review[] = data
          .filter((r: any) => r.rating >= 4 && r.text) // Only show 4-5 star reviews with text
          .map((r: any) => ({
            quote: r.text,
            name: r.author_name,
            rating: r.rating,
            photo: r.profile_photo_url,
            timeAgo: r.relative_time_description,
            isGoogle: true,
          }));

        if (googleReviews.length > 0) {
          setReviews(googleReviews);
          return;
        }
      }
      // Fallback to static
      setReviews(staticTestimonials);
    };
    fetchGoogleReviews();
  }, [t]);

  const StarRating = ({ rating }: { rating: number }) => (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          size={12}
          className={cn(
            star <= rating ? "text-amber-400 fill-amber-400" : "text-muted-foreground/20"
          )}
        />
      ))}
    </div>
  );

  const TestimonialCard = ({ review, index }: { review: Review; index: number }) => (
    <div
      className={cn(
        "glass-card p-5 md:p-6 space-y-3 h-full hover:shadow-lg hover:shadow-cta/5 hover:-translate-y-1 transition-all duration-500",
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
      )}
      style={{ transitionDelay: `${index * 100}ms` }}
    >
      <div className="flex items-center justify-between">
        <div className="w-8 h-8 rounded-full bg-cta/10 flex items-center justify-center">
          <Quote className="w-4 h-4 text-cta" />
        </div>
        {review.isGoogle && (
          <div className="flex items-center gap-1.5">
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            {review.rating && <StarRating rating={review.rating} />}
          </div>
        )}
      </div>

      <p className="text-foreground/70 italic text-sm leading-relaxed line-clamp-4">
        "{review.quote}"
      </p>

      <div className="flex items-center gap-2">
        {review.photo ? (
          <img
            src={review.photo}
            alt={review.name}
            className="w-6 h-6 rounded-full object-cover"
            referrerPolicy="no-referrer"
            loading="lazy"
          />
        ) : (
          <div className="w-6 h-6 rounded-full bg-terracotta/20 flex items-center justify-center">
            <span className="text-xs font-bold text-terracotta">{review.name[0]}</span>
          </div>
        )}
        <div>
          <p className="text-sm font-medium text-foreground/80">{review.name}</p>
          {review.timeAgo && (
            <p className="text-[10px] text-muted-foreground">{review.timeAgo}</p>
          )}
        </div>
      </div>
    </div>
  );

  const displayReviews = reviews.length > 0 ? reviews : staticTestimonials;

  return (
    <section ref={ref} className="py-14 md:py-20 bg-sand-light">
      <div className="container-narrow">
        <div className="space-y-8">
          <div className={cn("text-center transition-all duration-700", isVisible ? "opacity-100" : "opacity-0")}>
            <span className="text-xs uppercase tracking-[0.3em] text-cta font-medium">{t("testimonials.title")}</span>
            {reviews.length > 0 && reviews[0]?.isGoogle && (
              <p className="text-[10px] text-muted-foreground mt-1 flex items-center justify-center gap-1">
                <svg className="w-3 h-3" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Verified Google Reviews
              </p>
            )}
          </div>

          {/* Mobile carousel */}
          <div className="md:hidden">
            <Carousel opts={{ align: "start", loop: true }} className="w-full">
              <CarouselContent className="-ml-3">
                {displayReviews.map((review, index) => (
                  <CarouselItem key={index} className="pl-3 basis-[82%]">
                    <TestimonialCard review={review} index={index} />
                  </CarouselItem>
                ))}
              </CarouselContent>
            </Carousel>
            <p className="text-center text-xs text-foreground/40 mt-4">{t("testimonials.swipe")}</p>
          </div>

          {/* Desktop grid */}
          <div className="hidden md:grid gap-5 md:grid-cols-3">
            {displayReviews.slice(0, 3).map((review, index) => (
              <TestimonialCard key={index} review={review} index={index} />
            ))}
          </div>
          {displayReviews.length > 3 && (
            <div className="hidden md:grid gap-5 md:grid-cols-2 max-w-2xl mx-auto">
              {displayReviews.slice(3, 5).map((review, index) => (
                <TestimonialCard key={index + 3} review={review} index={index + 3} />
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
