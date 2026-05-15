import type { Language } from "./translations";

type Dict = Record<Language, string>;

export const SOFITEL_STRINGS = {
  // Meta
  meta_title: {
    en: "Terraria x Sofitel Tamuda Bay | Curated Creative Experiences",
    fr: "Terraria x Sofitel Tamuda Bay | Expériences Créatives Sélectionnées",
    es: "Terraria x Sofitel Tamuda Bay | Experiencias Creativas Curadas",
    ar: "تيراريا × سوفيتيل تامودا باي | تجارب إبداعية مختارة",
  },
  meta_desc: {
    en: "Discover authentic creative Morocco at Sofitel Tamuda Bay. Pottery, zellige, sunset art, and artisan visits curated by Terraria Workshop.",
    fr: "Découvrez le Maroc créatif et authentique au Sofitel Tamuda Bay. Poterie, zellige, art au coucher du soleil et visites d'artisans organisés par Terraria Workshop.",
    es: "Descubre el Marruecos creativo y auténtico en Sofitel Tamuda Bay. Cerámica, zellige, arte al atardecer y visitas a artesanos curados por Terraria Workshop.",
    ar: "اكتشف المغرب الإبداعي الأصيل في سوفيتيل تامودا باي. فخار، زليج، فن عند الغروب وزيارات للحرفيين من تنسيق ورشة تيراريا.",
  },

  // Hero
  brand_topline: {
    en: "Terraria · Tamuda Bay",
    fr: "Terraria · Tamuda Bay",
    es: "Terraria · Tamuda Bay",
    ar: "تيراريا · تامودا باي",
  },
  luxury_resort: {
    en: "Luxury Resort",
    fr: "Resort de Luxe",
    es: "Resort de Lujo",
    ar: "منتجع فاخر",
  },
  hero_title_1: {
    en: "Curated creative",
    fr: "Expériences créatives",
    es: "Experiencias creativas",
    ar: "تجارب إبداعية",
  },
  hero_title_2: {
    en: "experiences",
    fr: "soigneusement",
    es: "cuidadosamente",
    ar: "مختارة بعناية",
  },
  hero_title_3: {
    en: "by the sea.",
    fr: "au bord de la mer.",
    es: "junto al mar.",
    ar: "على ضفاف البحر.",
  },
  hero_subtitle: {
    en: "A weekly program of artisan workshops and cultural escapes, crafted for the guests of Sofitel Tamuda Bay.",
    fr: "Un programme hebdomadaire d'ateliers artisanaux et d'escapades culturelles, conçu pour les hôtes du Sofitel Tamuda Bay.",
    es: "Un programa semanal de talleres artesanales y escapadas culturales, creado para los huéspedes del Sofitel Tamuda Bay.",
    ar: "برنامج أسبوعي من ورش الحرف اليدوية والاستراحات الثقافية، صُمّم خصيصاً لضيوف سوفيتيل تامودا باي.",
  },
  this_week: {
    en: "This week's program",
    fr: "Programme de la semaine",
    es: "Programa de la semana",
    ar: "برنامج هذا الأسبوع",
  },
  scroll: { en: "Scroll", fr: "Défiler", es: "Desliza", ar: "مرّر" },
  week_ahead: {
    en: "The week ahead",
    fr: "La semaine à venir",
    es: "La semana por venir",
    ar: "الأسبوع القادم",
  },

  // Marquee themes
  m_pottery: { en: "Pottery", fr: "Poterie", es: "Cerámica", ar: "فخار" },
  m_zellige: { en: "Zellige", fr: "Zellige", es: "Zellige", ar: "زليج" },
  m_cooking: { en: "Cooking", fr: "Cuisine", es: "Cocina", ar: "طبخ" },
  m_weaving: { en: "Weaving", fr: "Tissage", es: "Tejido", ar: "نسيج" },
  m_painting: { en: "Painting", fr: "Peinture", es: "Pintura", ar: "رسم" },
  m_garden: { en: "Garden", fr: "Jardin", es: "Jardín", ar: "حديقة" },
  m_cooperative: { en: "Cooperative", fr: "Coopérative", es: "Cooperativa", ar: "تعاونية" },
  m_sunset: { en: "Sunset rituals", fr: "Rituels au coucher", es: "Rituales del atardecer", ar: "طقوس الغروب" },

  // Days
  all_days: { en: "All days", fr: "Tous les jours", es: "Todos los días", ar: "كل الأيام" },

  // Filters
  f_all: { en: "All", fr: "Tout", es: "Todo", ar: "الكل" },
  f_in_hotel: { en: "In-hotel", fr: "À l'hôtel", es: "En el hotel", ar: "داخل الفندق" },
  f_outdoor: { en: "Outdoor", fr: "Extérieur", es: "Al aire libre", ar: "في الهواء الطلق" },
  f_cultural: { en: "Cultural", fr: "Culturel", es: "Cultural", ar: "ثقافي" },
  f_couples: { en: "Couples", fr: "Couples", es: "Parejas", ar: "للأزواج" },
  f_family: { en: "Family", fr: "Famille", es: "Familia", ar: "عائلي" },
  f_adults: { en: "Adults", fr: "Adultes", es: "Adultos", ar: "للكبار" },

  // Grid
  empty: {
    en: "No experiences match these filters.",
    fr: "Aucune expérience ne correspond à ces filtres.",
    es: "Ninguna experiencia coincide con estos filtros.",
    ar: "لا توجد تجارب تطابق هذه الفلاتر.",
  },
  swipe_explore: {
    en: "Swipe to explore →",
    fr: "Glissez pour explorer →",
    es: "Desliza para explorar →",
    ar: "اسحب للاستكشاف ←",
  },

  // Card
  from: { en: "From", fr: "À partir de", es: "Desde", ar: "ابتداءً من" },
  per_guest: { en: "/ guest", fr: "/ pers.", es: "/ pers.", ar: "/ شخص" },
  on_request: { en: "On request", fr: "Sur demande", es: "Bajo petición", ar: "عند الطلب" },
  reserve: { en: "Reserve", fr: "Réserver", es: "Reservar", ar: "احجز" },
  booked: { en: "Booked", fr: "Complet", es: "Reservado", ar: "محجوز" },
  fully_booked: { en: "Fully booked", fr: "Complet", es: "Agotado", ar: "ممتلئ" },
  spots_one: { en: "spot", fr: "place", es: "plaza", ar: "مكان" },
  spots_other: { en: "spots", fr: "places", es: "plazas", ar: "أماكن" },
  only_n_left: {
    en: "Only {n} left",
    fr: "Plus que {n}",
    es: "Solo {n} quedan",
    ar: "تبقى {n} فقط",
  },
  n_spots: { en: "{n} spots", fr: "{n} places", es: "{n} plazas", ar: "{n} أماكن" },
  n_spots_available: {
    en: "{n} spots available",
    fr: "{n} places disponibles",
    es: "{n} plazas disponibles",
    ar: "{n} أماكن متاحة",
  },
  remaining_of: {
    en: "{n} of {c}",
    fr: "{n} sur {c}",
    es: "{n} de {c}",
    ar: "{n} من {c}",
  },

  // Booking sheet
  step_details: { en: "Details", fr: "Détails", es: "Detalles", ar: "التفاصيل" },
  step_confirm: { en: "Confirm", fr: "Confirmer", es: "Confirmar", ar: "تأكيد" },
  full_name: { en: "Full name", fr: "Nom complet", es: "Nombre completo", ar: "الاسم الكامل" },
  room_number: { en: "Room number", fr: "Numéro de chambre", es: "Número de habitación", ar: "رقم الغرفة" },
  phone_optional: { en: "Phone (optional)", fr: "Téléphone (optionnel)", es: "Teléfono (opcional)", ar: "الهاتف (اختياري)" },
  num_guests: { en: "Number of guests", fr: "Nombre d'invités", es: "Número de personas", ar: "عدد الأشخاص" },
  charges_note: {
    en: "Charges will appear on your Sofitel folio. Free cancellation up to 12h before.",
    fr: "Les frais seront ajoutés à votre note Sofitel. Annulation gratuite jusqu'à 12h avant.",
    es: "Los cargos aparecerán en su factura Sofitel. Cancelación gratuita hasta 12h antes.",
    ar: "ستضاف الرسوم إلى فاتورتك في سوفيتيل. الإلغاء مجاني حتى 12 ساعة قبل الموعد.",
  },
  review_title: {
    en: "Review your reservation",
    fr: "Vérifiez votre réservation",
    es: "Revisa tu reserva",
    ar: "راجع حجزك",
  },
  r_guest: { en: "Guest", fr: "Invité", es: "Huésped", ar: "الضيف" },
  r_room: { en: "Room", fr: "Chambre", es: "Habitación", ar: "الغرفة" },
  r_phone: { en: "Phone", fr: "Téléphone", es: "Teléfono", ar: "الهاتف" },
  r_guests: { en: "Guests", fr: "Invités", es: "Personas", ar: "الأشخاص" },
  r_when: { en: "When", fr: "Quand", es: "Cuándo", ar: "متى" },
  r_where: { en: "Where", fr: "Où", es: "Dónde", ar: "أين" },
  printed_note: {
    en: "A printed confirmation will be delivered to your room.",
    fr: "Une confirmation imprimée sera livrée à votre chambre.",
    es: "Se entregará una confirmación impresa en su habitación.",
    ar: "سيتم تسليم تأكيد مطبوع إلى غرفتك.",
  },
  total: { en: "Total", fr: "Total", es: "Total", ar: "المجموع" },
  edit: { en: "Edit", fr: "Modifier", es: "Editar", ar: "تعديل" },
  continue: { en: "Continue", fr: "Continuer", es: "Continuar", ar: "متابعة" },
  confirm: { en: "Confirm", fr: "Confirmer", es: "Confirmar", ar: "تأكيد" },
  close: { en: "Close", fr: "Fermer", es: "Cerrar", ar: "إغلاق" },

  // Confirmation
  reservation_received: {
    en: "Reservation received",
    fr: "Réservation reçue",
    es: "Reserva recibida",
    ar: "تم استلام الحجز",
  },
  merci: { en: "Thank you, {name}.", fr: "Merci, {name}.", es: "Gracias, {name}.", ar: "شكراً، {name}." },
  confirm_body: {
    en: "Your seat at {exp} is being prepared. Our concierge will deliver a printed confirmation to your room shortly.",
    fr: "Votre place pour {exp} est en préparation. Notre concierge vous livrera une confirmation imprimée dans votre chambre sous peu.",
    es: "Tu lugar para {exp} se está preparando. Nuestro conserje entregará una confirmación impresa en tu habitación en breve.",
    ar: "يتم تجهيز مكانك في {exp}. سيقوم الكونسيرج بتسليم تأكيد مطبوع إلى غرفتك قريباً.",
  },
  continue_browsing: {
    en: "Continue browsing",
    fr: "Continuer à explorer",
    es: "Seguir explorando",
    ar: "متابعة التصفح",
  },

  // Footer
  footer_curated: {
    en: "Curated by Terraria Workshop · Tetouan, Morocco",
    fr: "Sélection Terraria Workshop · Tétouan, Maroc",
    es: "Curado por Terraria Workshop · Tetuán, Marruecos",
    ar: "من تنسيق ورشة تيراريا · تطوان، المغرب",
  },
  footer_quote: {
    en: "Discover authentic creative Morocco.",
    fr: "Découvrez le Maroc créatif et authentique.",
    es: "Descubre el Marruecos creativo y auténtico.",
    ar: "اكتشف المغرب الإبداعي الأصيل.",
  },

  // Toasts
  err_load: {
    en: "Could not load the program",
    fr: "Impossible de charger le programme",
    es: "No se pudo cargar el programa",
    ar: "تعذّر تحميل البرنامج",
  },
  err_required: {
    en: "Name and room number are required",
    fr: "Le nom et le numéro de chambre sont requis",
    es: "El nombre y el número de habitación son obligatorios",
    ar: "الاسم ورقم الغرفة مطلوبان",
  },
  err_submit: {
    en: "Could not submit your reservation",
    fr: "Impossible d'envoyer votre réservation",
    es: "No se pudo enviar tu reserva",
    ar: "تعذّر إرسال حجزك",
  },
  err_only_n: {
    en: "Only {n} {label} left",
    fr: "Plus que {n} {label}",
    es: "Solo quedan {n} {label}",
    ar: "تبقى {n} {label} فقط",
  },
} satisfies Record<string, Dict>;

export type SofitelKey = keyof typeof SOFITEL_STRINGS;
