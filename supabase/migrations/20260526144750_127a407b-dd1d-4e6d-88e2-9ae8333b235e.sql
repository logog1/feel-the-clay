
ALTER TABLE public.blog_posts
  ADD COLUMN IF NOT EXISTS seo_title_en text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS seo_title_ar text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS seo_title_es text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS seo_title_fr text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS seo_description_en text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS seo_description_ar text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS seo_description_es text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS seo_description_fr text NOT NULL DEFAULT '';

UPDATE public.blog_posts SET
  seo_title_en = 'Tangier to Tetouan & Chefchaouen Day Trip (2026)',
  seo_description_en = 'Plan the perfect day trip from Tangier to Tetouan and Chefchaouen. Route, timing, what to see and a hands-on artisan workshop stop.',
  seo_title_ar = 'رحلة يوم من طنجة إلى تطوان وشفشاون 2026',
  seo_description_ar = 'خطط ليومك المثالي من طنجة إلى تطوان وشفشاون: الطريق، التوقيت، أبرز المعالم وورشة حرفية لا تُنسى.'
WHERE slug = 'day-trip-tangier-tetouan-chefchaouen';

UPDATE public.blog_posts SET
  seo_title_en = 'One Day in Tetouan: Perfect Itinerary (2026)',
  seo_description_en = 'A practical 24-hour Tetouan itinerary: pottery workshop, UNESCO medina walk, mint tea on a rooftop and sunset at Cabo Negro.',
  seo_title_ar = 'يوم واحد في تطوان: برنامج مثالي 2026',
  seo_description_ar = 'برنامج عملي ليوم كامل في تطوان: ورشة فخار، جولة في المدينة العتيقة، شاي بالنعناع وغروب في كابو نيغرو.'
WHERE slug = 'one-day-in-tetouan-itinerary';

UPDATE public.blog_posts SET
  seo_title_en = 'Tetouan Medina Guide: UNESCO Old Town (2026)',
  seo_description_en = 'Discover Tetouan''s UNESCO medina: 7 gates, Andalusian souks, hidden riads and authentic artisan workshops you can join.',
  seo_title_ar = 'دليل مدينة تطوان العتيقة (تراث اليونسكو) 2026',
  seo_description_ar = 'اكتشف مدينة تطوان العتيقة المُدرجة في اليونسكو: الأبواب السبعة، الأسواق الأندلسية، الرياضات وورش الحرفيين.'
WHERE slug = 'tetouan-medina-guide-unesco';

UPDATE public.blog_posts SET
  seo_title_en = '15 Best Things to Do in Tetouan, Morocco (2026)',
  seo_description_en = 'From pottery workshops to the UNESCO medina and Cabo Negro beaches: the 15 best experiences in Tetouan, Morocco for 2026.',
  seo_title_ar = 'أفضل 15 نشاطاً في تطوان، المغرب 2026',
  seo_description_ar = 'من ورش الفخار إلى المدينة العتيقة وشواطئ كابو نيغرو: أفضل 15 تجربة يمكنك عيشها في تطوان لعام 2026.'
WHERE slug = 'things-to-do-in-tetouan-morocco';

UPDATE public.blog_posts SET
  seo_title_en = '9 Unique Experiences in Tetouan Beyond Tourism',
  seo_description_en = 'Skip the tourist trail: Andalusian music, Amazigh weaving, Jbel Dersa hikes, sunset at Cabo Negro and 5 more authentic Tetouan finds.',
  seo_title_ar = '9 تجارب فريدة في تطوان بعيداً عن السياحة',
  seo_description_ar = 'ابتعد عن المسار السياحي: موسيقى أندلسية، نسج أمازيغي، مسارات جبل درسة، غروب كابو نيغرو وتجارب أصيلة أخرى.'
WHERE slug = 'unique-experiences-tetouan-beyond-tourist-trail';
