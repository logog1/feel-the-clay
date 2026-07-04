
CREATE TABLE public.zellige_kit_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  kind text NOT NULL CHECK (kind IN ('piece','color','preset')),
  key text NOT NULL,
  label text,
  meta jsonb NOT NULL DEFAULT '{}'::jsonb,
  is_available boolean NOT NULL DEFAULT true,
  sort_order int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (kind, key)
);

GRANT SELECT ON public.zellige_kit_items TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.zellige_kit_items TO authenticated;
GRANT ALL ON public.zellige_kit_items TO service_role;

ALTER TABLE public.zellige_kit_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view available kit items"
  ON public.zellige_kit_items FOR SELECT
  USING (is_available = true OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins manage kit items"
  ON public.zellige_kit_items FOR ALL
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER zellige_kit_items_touch
  BEFORE UPDATE ON public.zellige_kit_items
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- Seed pieces (region keys from the SVG)
INSERT INTO public.zellige_kit_items (kind, key, label, sort_order) VALUES
  ('piece', '#b86a0a', '8-point star (Khatim)', 1),
  ('piece', '#fe8f00', 'Triangles', 2),
  ('piece', '#a44135', 'Kites', 3),
  ('piece', '#ff3131', 'Octagons', 4),
  ('piece', '#5170ff', 'Chamfered squares', 5),
  ('piece', '#91a597', 'Background', 6),
  ('piece', '#ffffff', 'Joints', 7);

-- Seed palette colors
INSERT INTO public.zellige_kit_items (kind, key, label, sort_order) VALUES
  ('color', '#B23A2E', 'Terracotta', 1),
  ('color', '#E2C9A0', 'Cream', 2),
  ('color', '#2F5E8A', 'Deep Blue', 3),
  ('color', '#1F6B3A', 'Green', 4),
  ('color', '#E5B23A', 'Saffron', 5),
  ('color', '#D88A8A', 'Rose', 6),
  ('color', '#A9C8E0', 'Sky', 7),
  ('color', '#1A1A1A', 'Black', 8),
  ('color', '#F4EFE6', 'Bone', 9),
  ('color', '#5170ff', 'Indigo', 10),
  ('color', '#ff3131', 'Red', 11),
  ('color', '#a44135', 'Rust', 12),
  ('color', '#fe8f00', 'Orange', 13),
  ('color', '#b86a0a', 'Bronze', 14),
  ('color', '#91a597', 'Sage', 15),
  ('color', '#ffffff', 'White', 16),
  ('color', '#0F3D2E', 'Forest', 17),
  ('color', '#C97B3F', 'Ochre', 18);

-- Seed presets (decorations / pre-made models)
INSERT INTO public.zellige_kit_items (kind, key, label, sort_order) VALUES
  ('preset', 'fes-classic', 'Fès Classic', 1),
  ('preset', 'majorelle',   'Majorelle Blue', 2),
  ('preset', 'sahara',      'Sahara Sand', 3),
  ('preset', 'midnight',    'Midnight Medina', 4);
