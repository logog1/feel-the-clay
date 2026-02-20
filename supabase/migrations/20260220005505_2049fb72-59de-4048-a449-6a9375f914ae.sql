
-- Create store_sections table for admin-editable section config
CREATE TABLE IF NOT EXISTS public.store_sections (
  id text PRIMARY KEY,
  title_en text NOT NULL,
  title_ar text NOT NULL DEFAULT '',
  title_es text NOT NULL DEFAULT '',
  title_fr text NOT NULL DEFAULT '',
  description_en text NOT NULL DEFAULT '',
  description_ar text NOT NULL DEFAULT '',
  description_es text NOT NULL DEFAULT '',
  description_fr text NOT NULL DEFAULT '',
  enabled boolean NOT NULL DEFAULT true,
  sort_order integer NOT NULL DEFAULT 0,
  donation boolean NOT NULL DEFAULT false,
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.store_sections ENABLE ROW LEVEL SECURITY;

-- Public can read
CREATE POLICY "Store sections are publicly viewable"
  ON public.store_sections FOR SELECT USING (true);

-- Only admins can modify
CREATE POLICY "Admins can insert store sections"
  ON public.store_sections FOR INSERT WITH CHECK (is_admin());

CREATE POLICY "Admins can update store sections"
  ON public.store_sections FOR UPDATE USING (is_admin());

CREATE POLICY "Admins can delete store sections"
  ON public.store_sections FOR DELETE USING (is_admin());

-- Seed default sections
INSERT INTO public.store_sections (id, title_en, title_ar, title_es, title_fr, description_en, description_ar, description_es, description_fr, enabled, sort_order, donation)
VALUES
  ('terraria', 'Terraria''s Collection', 'مجموعة تيراريا', 'Colección Terraria', 'Collection Terraria',
   'Our signature pieces — handcrafted by Terraria''s own artisans. Each piece carries our mark and story.',
   'قطعنا المميزة — مصنوعة يدوياً بواسطة حرفيي تيراريا. كل قطعة تحمل علامتنا وقصتنا.',
   'Nuestras piezas insignia — hechas a mano por los propios artesanos de Terraria. Cada pieza lleva nuestra marca e historia.',
   'Nos pièces signature — fabriquées à la main par les artisans de Terraria. Chaque pièce porte notre marque et notre histoire.',
   true, 1, false),
  ('artisan', 'Artisan Collection', 'مجموعة الحرفيين', 'Colección Artesanal', 'Collection Artisanale',
   'Handcrafted by our master potters using traditional wheel-throwing techniques.',
   'مصنوعة يدوياً بواسطة حرفيينا المحترفين باستخدام تقنيات العجلة التقليدية.',
   'Hechas a mano por nuestros alfareros maestros usando técnicas tradicionales de torneado.',
   'Fabriquées à la main par nos maîtres potiers avec des techniques traditionnelles de tournage.',
   true, 2, false),
  ('traveler', 'Traveler Creations', 'إبداعات المسافرين', 'Creaciones de Viajeros', 'Créations de Voyageurs',
   'Made by workshop participants who are travelers and can''t wait or take their pieces, so we sell them with a united price and it''s used as a donation for NGOs.',
   'صنعها المشاركون في الورشة من المسافرين الذين لا يستطيعون الانتظار أو أخذ قطعهم، فنبيعها بسعر موحد وتُستخدم كتبرع للجمعيات.',
   'Hechas por participantes del taller que son viajeros y no pueden esperar o llevarse sus piezas, las vendemos a un precio unificado y se usa como donación para ONGs.',
   'Faites par les participants voyageurs qui ne peuvent pas attendre ou emporter leurs pièces, nous les vendons à un prix unique et les recettes servent de don aux ONG.',
   true, 3, true),
  ('student', 'Student Works', 'أعمال الطلاب', 'Trabajos de Estudiantes', 'Travaux d''Étudiants',
   'Created by university students who come to us to make things and sell them as another source of income, especially out-of-town students.',
   'صنعها طلاب جامعيون يأتون إلينا لصنع أشياء وبيعها كمصدر دخل إضافي، خاصة الطلاب من خارج المدينة.',
   'Creadas por estudiantes universitarios que vienen a hacer cosas y venderlas como otra fuente de ingresos, especialmente estudiantes de fuera de la ciudad.',
   'Créées par des étudiants universitaires qui viennent chez nous pour fabriquer et vendre des objets comme source de revenus supplémentaire, surtout les étudiants venus d''ailleurs.',
   true, 4, false),
  ('amazigh', 'Amazigh Rugs — Handwoven Heritage', 'سجاد أمازيغي — إرث منسوج', 'Alfombras Amazigh — Patrimonio Tejido', 'Tapis Amazigh — Héritage Tissé',
   'Handwoven in Midelt by a master weaver using traditional Amazigh techniques. Every rug is one of a kind — a piece of living heritage from the Atlas Mountains.',
   'منسوجة يدويًا في ميدلت من قِبل حرفية بارعة باستخدام تقنيات أمازيغية تقليدية. كل سجادة فريدة من نوعها — قطعة من التراث الحي للأطلس.',
   'Tejidas a mano en Midelt por una artesana experta usando técnicas amazighs tradicionales. Cada alfombra es única — una pieza del patrimonio vivo del Atlas.',
   'Tissés à la main à Midelt par une maître tisserande utilisant des techniques amazighes traditionnelles. Chaque tapis est unique — une pièce du patrimoine vivant de l''Atlas.',
   true, 5, false)
ON CONFLICT (id) DO NOTHING;
