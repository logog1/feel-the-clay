export interface BlogPost {
  slug: string;
  title: { en: string; ar: string; es: string; fr: string };
  excerpt: { en: string; ar: string; es: string; fr: string };
  content: { en: string; ar: string; es: string; fr: string };
  coverImage: string;
  category: "pottery" | "tetouan" | "culture";
  publishedAt: string;
  readTime: number;
}

export const blogPosts: BlogPost[] = [
  {
    slug: "history-of-pottery-in-tetouan",
    title: {
      en: "The Rich History of Pottery in Tetouan",
      ar: "التاريخ العريق للفخار في تطوان",
      es: "La rica historia de la cerámica en Tetuán",
      fr: "La riche histoire de la poterie à Tétouan",
    },
    excerpt: {
      en: "Discover how centuries of Andalusian, Berber, and Arab influences shaped Tetouan's unique pottery tradition.",
      ar: "اكتشف كيف شكلت قرون من التأثيرات الأندلسية والأمازيغية والعربية تقاليد الفخار الفريدة في تطوان.",
      es: "Descubre cómo siglos de influencias andaluzas, bereberes y árabes dieron forma a la tradición única de la cerámica de Tetuán.",
      fr: "Découvrez comment des siècles d'influences andalouses, berbères et arabes ont façonné la tradition potière unique de Tétouan.",
    },
    content: {
      en: `## A Crossroads of Cultures

Tetouan sits at a remarkable crossroads. Nestled between the Rif Mountains and the Mediterranean Sea, this white-washed city has absorbed influences from Andalusia, the Berber highlands, and the broader Arab world for over five centuries.

### The Andalusian Legacy

When Moors fled Spain during the Reconquista, many settled in Tetouan, bringing with them sophisticated ceramic techniques. The geometric patterns, the particular glazes, the delicate balance of form and function – all bear the fingerprints of Andalusian craftsmanship.

### Local Clay, Local Character

The clay around Tetouan has its own personality. Rich in iron, it fires to warm terracotta tones that have become synonymous with the region. Local potters learned to work with this material, not against it, developing techniques passed down through generations.

### From Utility to Art

Traditionally, Tetouan pottery served everyday needs: tagine pots for cooking, water jugs for storage, plates for family meals. But over time, these functional objects evolved into art forms. The best pieces now balance utility with beauty in a way that feels distinctly Moroccan.

### The Potters' Quarter

In the medina, a small quarter has been home to pottery workshops for generations. Here, the rhythm of the wheel continues much as it did centuries ago. Young apprentices learn from masters, and the ancient techniques survive in working hands.

### Why It Matters Today

Understanding this history enriches the experience of working with clay in Tetouan. When you sit at the wheel, you're not just learning a craft – you're connecting with a tradition that spans continents and centuries.`,
      ar: `## ملتقى الثقافات

تقع تطوان عند ملتقى طرق استثنائي. محتضنة بين جبال الريف والبحر الأبيض المتوسط، امتصت هذه المدينة البيضاء تأثيرات من الأندلس والمرتفعات الأمازيغية والعالم العربي الأوسع لأكثر من خمسة قرون.

### الإرث الأندلسي

عندما فر المورون من إسبانيا خلال حروب الاسترداد، استقر كثيرون في تطوان، جالبين معهم تقنيات خزفية متطورة. الأنماط الهندسية، والطلاءات الخاصة، والتوازن الدقيق بين الشكل والوظيفة – كلها تحمل بصمات الحرفية الأندلسية.

### الطين المحلي، الطابع المحلي

للطين حول تطوان شخصيته الخاصة. غني بالحديد، يحترق ليعطي درجات تراكوتا دافئة أصبحت مرادفة للمنطقة. تعلم الخزافون المحليون العمل مع هذه المادة، وليس ضدها، مطورين تقنيات توارثتها الأجيال.

### من المنفعة إلى الفن

تقليدياً، خدم فخار تطوان الاحتياجات اليومية: أواني الطاجين للطهي، جرار الماء للتخزين، الأطباق لوجبات العائلة. لكن مع الوقت، تطورت هذه الأشياء الوظيفية إلى أشكال فنية.

### حي الخزافين

في المدينة القديمة، كان حي صغير موطناً لورش الفخار لأجيال. هنا، يستمر إيقاع الدولاب كما كان منذ قرون.

### لماذا يهم اليوم

فهم هذا التاريخ يثري تجربة العمل بالطين في تطوان. عندما تجلس على الدولاب، أنت لا تتعلم حرفة فقط – أنت تتصل بتقليد يمتد عبر القارات والقرون.`,
      es: `## Un cruce de culturas

Tetuán se encuentra en una encrucijada notable. Enclavada entre las montañas del Rif y el mar Mediterráneo, esta ciudad encalada ha absorbido influencias de Andalucía, las tierras altas bereberes y el mundo árabe durante más de cinco siglos.

### El legado andaluz

Cuando los moros huyeron de España durante la Reconquista, muchos se establecieron en Tetuán, trayendo consigo sofisticadas técnicas cerámicas. Los patrones geométricos, los esmaltes particulares, el delicado equilibrio entre forma y función – todo lleva las huellas de la artesanía andaluza.

### Arcilla local, carácter local

La arcilla alrededor de Tetuán tiene su propia personalidad. Rica en hierro, se cuece en tonos terracota cálidos que se han convertido en sinónimo de la región.

### De la utilidad al arte

Tradicionalmente, la cerámica de Tetuán servía para necesidades cotidianas: ollas de tajín para cocinar, jarras de agua para almacenamiento, platos para las comidas familiares. Pero con el tiempo, estos objetos funcionales evolucionaron en formas artísticas.

### El barrio de los alfareros

En la medina, un pequeño barrio ha sido hogar de talleres de cerámica durante generaciones. Aquí, el ritmo del torno continúa como lo hacía hace siglos.

### Por qué importa hoy

Comprender esta historia enriquece la experiencia de trabajar con arcilla en Tetuán. Cuando te sientas en el torno, no solo estás aprendiendo un oficio – te estás conectando con una tradición que abarca continentes y siglos.`,
      fr: `## Un carrefour de cultures

Tétouan se trouve à un carrefour remarquable. Nichée entre les montagnes du Rif et la mer Méditerranée, cette ville blanchie à la chaux a absorbé les influences d'Andalousie, des hauts plateaux berbères et du monde arabe pendant plus de cinq siècles.

### L'héritage andalou

Lorsque les Maures ont fui l'Espagne pendant la Reconquista, beaucoup se sont installés à Tétouan, apportant avec eux des techniques céramiques sophistiquées. Les motifs géométriques, les glaçures particulières, l'équilibre délicat entre forme et fonction – tout porte les empreintes de l'artisanat andalou.

### Argile locale, caractère local

L'argile autour de Tétouan a sa propre personnalité. Riche en fer, elle cuit en tons terre cuite chaleureux qui sont devenus synonymes de la région.

### De l'utilitaire à l'art

Traditionnellement, la poterie de Tétouan servait aux besoins quotidiens : pots à tajine pour la cuisine, cruches d'eau pour le stockage, assiettes pour les repas familiaux. Mais au fil du temps, ces objets fonctionnels ont évolué en formes d'art.

### Le quartier des potiers

Dans la médina, un petit quartier abrite des ateliers de poterie depuis des générations. Ici, le rythme du tour continue comme il y a des siècles.

### Pourquoi c'est important aujourd'hui

Comprendre cette histoire enrichit l'expérience du travail de l'argile à Tétouan. Lorsque vous vous asseyez au tour, vous n'apprenez pas seulement un métier – vous vous connectez à une tradition qui traverse les continents et les siècles.`,
    },
    coverImage: "/images/impact-1.jpg",
    category: "pottery",
    publishedAt: "2025-01-15",
    readTime: 6,
  },
  {
    slug: "things-to-do-in-tetouan",
    title: {
      en: "10 Unforgettable Things to Do in Tetouan",
      ar: "10 أشياء لا تُنسى للقيام بها في تطوان",
      es: "10 cosas inolvidables que hacer en Tetuán",
      fr: "10 choses inoubliables à faire à Tétouan",
    },
    excerpt: {
      en: "From the UNESCO-listed medina to hidden artisan workshops, explore the best experiences Tetouan has to offer.",
      ar: "من المدينة القديمة المدرجة في اليونسكو إلى ورش الحرفيين المخفية، اكتشف أفضل التجارب التي تقدمها تطوان.",
      es: "Desde la medina declarada Patrimonio de la Humanidad hasta talleres artesanales ocultos, explora las mejores experiencias que ofrece Tetuán.",
      fr: "De la médina classée à l'UNESCO aux ateliers d'artisans cachés, explorez les meilleures expériences que Tétouan a à offrir.",
    },
    content: {
      en: `## The White Dove Awaits

Tetouan, known as the White Dove of the Rif, offers experiences you won't find elsewhere in Morocco. Less touristic than Marrakech or Fez, it rewards curious travelers with authentic encounters.

### 1. Explore the UNESCO Medina

The medina of Tetouan is a UNESCO World Heritage site, and unlike busier Moroccan medinas, you can explore it at your own pace. The whitewashed walls and Andalusian architecture create a unique atmosphere.

### 2. Take a Pottery Workshop

Get your hands dirty at a traditional pottery workshop. Learn wheel-throwing techniques from local masters while connecting with centuries of craft tradition.

### 3. Visit the Royal Palace Area

While you can't enter the palace, the surrounding area showcases beautiful Moorish architecture and offers great photo opportunities.

### 4. Wander Through the Artisan Quarter

Discover workshops where craftspeople create leather goods, textiles, and metalwork using techniques unchanged for generations.

### 5. Sample Local Cuisine

Try pastilla (savory-sweet pie), harira soup, and fresh seafood from the nearby Mediterranean. Don't miss the local pastries at traditional tea houses.

### 6. Day Trip to Martil Beach

Just 10 kilometers away, Martil offers a relaxed beach atmosphere. Perfect for an afternoon escape during warmer months.

### 7. Explore the Archaeological Museum

Home to Roman mosaics and artifacts from the region's rich history, this small museum provides excellent context for understanding Tetouan's past.

### 8. Hike in the Rif Mountains

The mountains surrounding Tetouan offer spectacular hiking. Even a short walk rewards you with panoramic views of the city and coast.

### 9. Visit a Traditional Hammam

Experience Moroccan bathing culture at a local hammam. Ask your accommodation for recommendations to authentic, non-touristy options.

### 10. Watch the Sunset from Spanish Square

Plaza Feddan, the Spanish Square, is the heart of the modern city. Grab a coffee and watch locals gather as the sun sets over the mountains.`,
      ar: `## الحمامة البيضاء تنتظرك

تطوان، المعروفة بالحمامة البيضاء للريف، تقدم تجارب لن تجدها في أي مكان آخر في المغرب. أقل سياحية من مراكش أو فاس، تكافئ المسافرين الفضوليين بلقاءات أصيلة.

### 1. استكشف المدينة القديمة المدرجة في اليونسكو

المدينة القديمة في تطوان موقع تراث عالمي لليونسكو، وبخلاف المدن القديمة المغربية الأكثر ازدحاماً، يمكنك استكشافها بالسرعة التي تناسبك.

### 2. شارك في ورشة فخار

اتسخ يديك في ورشة فخار تقليدية. تعلم تقنيات الدولاب من الحرفيين المحليين.

### 3. زر منطقة القصر الملكي

بينما لا يمكنك دخول القصر، المنطقة المحيطة تعرض عمارة مورية جميلة.

### 4. تجول في حي الحرفيين

اكتشف الورش حيث يصنع الحرفيون المنتجات الجلدية والمنسوجات والأعمال المعدنية.

### 5. تذوق المأكولات المحلية

جرب الباستيلا وحريرة والمأكولات البحرية الطازجة من البحر المتوسط القريب.

### 6. رحلة يومية إلى شاطئ مرتيل

على بعد 10 كيلومترات فقط، تقدم مرتيل أجواء شاطئية هادئة.

### 7. استكشف المتحف الأثري

موطن للفسيفساء الرومانية والقطع الأثرية من تاريخ المنطقة الغني.

### 8. تنزه في جبال الريف

الجبال المحيطة بتطوان تقدم مشياً رائعاً مع مناظر بانورامية.

### 9. زر حماماً تقليدياً

عش ثقافة الاستحمام المغربية في حمام محلي.

### 10. شاهد غروب الشمس من الساحة الإسبانية

ساحة فدان، الساحة الإسبانية، هي قلب المدينة الحديثة.`,
      es: `## La Paloma Blanca te espera

Tetuán, conocida como la Paloma Blanca del Rif, ofrece experiencias que no encontrarás en ningún otro lugar de Marruecos. Menos turística que Marrakech o Fez, recompensa a los viajeros curiosos con encuentros auténticos.

### 1. Explora la Medina UNESCO

La medina de Tetuán es Patrimonio de la Humanidad, y a diferencia de las medinas marroquíes más concurridas, puedes explorarla a tu propio ritmo.

### 2. Haz un taller de cerámica

Ensucia tus manos en un taller de cerámica tradicional. Aprende técnicas de torno de los maestros locales.

### 3. Visita el área del Palacio Real

Aunque no puedes entrar al palacio, el área circundante muestra hermosa arquitectura morisca.

### 4. Pasea por el barrio artesano

Descubre talleres donde los artesanos crean artículos de cuero, textiles y metalurgia.

### 5. Prueba la cocina local

Prueba la pastilla, la sopa harira y mariscos frescos del cercano Mediterráneo.

### 6. Excursión a la playa de Martil

A solo 10 kilómetros, Martil ofrece un ambiente playero relajado.

### 7. Explora el Museo Arqueológico

Hogar de mosaicos romanos y artefactos de la rica historia de la región.

### 8. Senderismo en las montañas del Rif

Las montañas que rodean Tetuán ofrecen excursiones espectaculares.

### 9. Visita un hammam tradicional

Experimenta la cultura del baño marroquí en un hammam local.

### 10. Contempla la puesta de sol desde la Plaza de España

Plaza Feddan es el corazón de la ciudad moderna.`,
      fr: `## La Colombe Blanche vous attend

Tétouan, connue comme la Colombe Blanche du Rif, offre des expériences que vous ne trouverez nulle part ailleurs au Maroc. Moins touristique que Marrakech ou Fès, elle récompense les voyageurs curieux avec des rencontres authentiques.

### 1. Explorez la Médina UNESCO

La médina de Tétouan est un site du patrimoine mondial de l'UNESCO, et contrairement aux médinas marocaines plus fréquentées, vous pouvez l'explorer à votre rythme.

### 2. Faites un atelier de poterie

Mettez les mains dans l'argile lors d'un atelier de poterie traditionnel. Apprenez les techniques du tour auprès des maîtres locaux.

### 3. Visitez les environs du Palais Royal

Bien que vous ne puissiez pas entrer dans le palais, les environs présentent une belle architecture mauresque.

### 4. Flânez dans le quartier des artisans

Découvrez des ateliers où les artisans créent des articles en cuir, des textiles et de la ferronnerie.

### 5. Goûtez la cuisine locale

Essayez la pastilla, la soupe harira et les fruits de mer frais de la Méditerranée voisine.

### 6. Excursion à la plage de Martil

À seulement 10 kilomètres, Martil offre une atmosphère balnéaire détendue.

### 7. Explorez le Musée Archéologique

Abritant des mosaïques romaines et des artefacts de la riche histoire de la région.

### 8. Randonnée dans les montagnes du Rif

Les montagnes entourant Tétouan offrent des randonnées spectaculaires.

### 9. Visitez un hammam traditionnel

Vivez la culture du bain marocain dans un hammam local.

### 10. Regardez le coucher de soleil depuis la Place d'Espagne

La Plaza Feddan est le cœur de la ville moderne.`,
    },
    coverImage: "/images/impact-2.jpg",
    category: "tetouan",
    publishedAt: "2025-02-01",
    readTime: 8,
  },
  {
    slug: "moroccan-craft-traditions",
    title: {
      en: "Understanding Moroccan Craft Culture",
      ar: "فهم ثقافة الحرف المغربية",
      es: "Comprendiendo la cultura artesanal marroquí",
      fr: "Comprendre la culture artisanale marocaine",
    },
    excerpt: {
      en: "How centuries of tradition, trade routes, and cultural exchange created Morocco's unique artisan heritage.",
      ar: "كيف خلقت قرون من التقاليد وطرق التجارة والتبادل الثقافي تراث الحرفيين الفريد في المغرب.",
      es: "Cómo siglos de tradición, rutas comerciales e intercambio cultural crearon el patrimonio artesanal único de Marruecos.",
      fr: "Comment des siècles de tradition, de routes commerciales et d'échanges culturels ont créé le patrimoine artisanal unique du Maroc.",
    },
    content: {
      en: `## A Living Heritage

Moroccan craft culture isn't a museum piece. It's a living, breathing tradition that continues to evolve while honoring its roots. Understanding this heritage enriches any visit to Morocco.

### The Guild System

For centuries, Moroccan crafts have been organized through guilds. Each craft – pottery, leatherwork, metalwork, weaving – has its own guild that maintains standards, trains apprentices, and preserves techniques.

### Sacred Geometry

Islamic art prohibits representation of living things in religious contexts, leading to the development of extraordinary geometric patterns. These aren't just decorative – they carry mathematical precision and spiritual meaning.

### The Role of the Maâlem

The maâlem (master craftsman) holds a position of respect in Moroccan society. These individuals have spent decades perfecting their craft, and their knowledge represents an irreplaceable cultural resource.

### Regional Distinctions

Different regions of Morocco developed distinct craft traditions:
- **Fez**: Famous for blue-and-white ceramics and leather tanning
- **Marrakech**: Known for metalwork and woodcarving
- **Tetouan**: Celebrated for its Andalusian-influenced pottery and embroidery
- **Essaouira**: Renowned for thuya wood marquetry

### Craft as Social Fabric

In Morocco, craft workshops aren't just workplaces – they're social institutions. Apprentices learn not just techniques but values: patience, precision, respect for materials, and community responsibility.

### The Challenge of Modernity

Traditional crafts face challenges from mass production and changing consumer habits. But there's also a growing appreciation for handmade objects, both locally and internationally.

### Why Participate

When you take a workshop or buy handmade goods, you're not just acquiring skills or objects. You're participating in the continuation of traditions that define Moroccan identity.`,
      ar: `## تراث حي

ثقافة الحرف المغربية ليست قطعة متحفية. إنها تقليد حي يستمر في التطور مع احترام جذوره.

### نظام النقابات

لقرون، نُظمت الحرف المغربية من خلال النقابات. كل حرفة – الفخار، الجلود، المعادن، النسيج – لها نقابتها الخاصة.

### الهندسة المقدسة

يحظر الفن الإسلامي تصوير الكائنات الحية في السياقات الدينية، مما أدى إلى تطوير أنماط هندسية استثنائية.

### دور المعلم

المعلم (الحرفي الخبير) يحظى بمكانة محترمة في المجتمع المغربي. قضى هؤلاء الأفراد عقوداً في إتقان حرفتهم.

### التميز الإقليمي

طورت مناطق مختلفة من المغرب تقاليد حرفية مميزة:
- **فاس**: مشهورة بالخزف الأزرق والأبيض ودباغة الجلود
- **مراكش**: معروفة بالأعمال المعدنية والنحت على الخشب
- **تطوان**: تحتفل بفخارها المتأثر بالأندلس والتطريز
- **الصويرة**: مشهورة بالتطعيم على خشب الطويا

### الحرفة كنسيج اجتماعي

في المغرب، ورش الحرف ليست مجرد أماكن عمل – إنها مؤسسات اجتماعية.

### تحدي الحداثة

تواجه الحرف التقليدية تحديات من الإنتاج الضخم وتغير عادات المستهلكين. لكن هناك أيضاً تقدير متزايد للمصنوعات اليدوية.

### لماذا تشارك

عندما تأخذ ورشة أو تشتري منتجات يدوية، أنت لا تكتسب مهارات أو أشياء فقط. أنت تشارك في استمرار تقاليد تحدد الهوية المغربية.`,
      es: `## Un patrimonio vivo

La cultura artesanal marroquí no es una pieza de museo. Es una tradición viva que continúa evolucionando mientras honra sus raíces.

### El sistema gremial

Durante siglos, los oficios marroquíes se han organizado a través de gremios. Cada oficio – cerámica, cuero, metalistería, tejido – tiene su propio gremio.

### Geometría sagrada

El arte islámico prohíbe la representación de seres vivos en contextos religiosos, lo que llevó al desarrollo de patrones geométricos extraordinarios.

### El rol del Maâlem

El maâlem (maestro artesano) ocupa una posición de respeto en la sociedad marroquí. Estos individuos han pasado décadas perfeccionando su oficio.

### Distinciones regionales

Diferentes regiones de Marruecos desarrollaron tradiciones artesanales distintas:
- **Fez**: Famosa por cerámica azul y blanca y curtido de cuero
- **Marrakech**: Conocida por la metalurgia y la talla de madera
- **Tetuán**: Celebrada por su cerámica de influencia andaluza y bordado
- **Essaouira**: Renombrada por la marquetería en madera de tuya

### El oficio como tejido social

En Marruecos, los talleres artesanales no son solo lugares de trabajo – son instituciones sociales.

### El desafío de la modernidad

Los oficios tradicionales enfrentan desafíos de la producción masiva y los cambios en los hábitos de consumo. Pero también hay una creciente apreciación por los objetos hechos a mano.

### Por qué participar

Cuando tomas un taller o compras productos hechos a mano, no solo adquieres habilidades u objetos. Participas en la continuación de tradiciones que definen la identidad marroquí.`,
      fr: `## Un patrimoine vivant

La culture artisanale marocaine n'est pas une pièce de musée. C'est une tradition vivante qui continue d'évoluer tout en honorant ses racines.

### Le système des guildes

Pendant des siècles, l'artisanat marocain a été organisé à travers des guildes. Chaque métier – poterie, maroquinerie, ferronnerie, tissage – a sa propre guilde.

### Géométrie sacrée

L'art islamique interdit la représentation d'êtres vivants dans les contextes religieux, ce qui a conduit au développement de motifs géométriques extraordinaires.

### Le rôle du Maâlem

Le maâlem (maître artisan) occupe une position de respect dans la société marocaine. Ces individus ont passé des décennies à perfectionner leur métier.

### Distinctions régionales

Différentes régions du Maroc ont développé des traditions artisanales distinctes :
- **Fès** : Célèbre pour la céramique bleue et blanche et le tannage du cuir
- **Marrakech** : Connue pour la ferronnerie et la sculpture sur bois
- **Tétouan** : Célébrée pour sa poterie d'influence andalouse et sa broderie
- **Essaouira** : Renommée pour la marqueterie en bois de thuya

### L'artisanat comme tissu social

Au Maroc, les ateliers d'artisanat ne sont pas que des lieux de travail – ce sont des institutions sociales.

### Le défi de la modernité

Les métiers traditionnels font face aux défis de la production de masse et des changements dans les habitudes de consommation. Mais il y a aussi une appréciation croissante pour les objets faits main.

### Pourquoi participer

Lorsque vous prenez un atelier ou achetez des produits faits main, vous n'acquérez pas seulement des compétences ou des objets. Vous participez à la continuation de traditions qui définissent l'identité marocaine.`,
    },
    coverImage: "/images/impact-3.jpg",
    category: "culture",
    publishedAt: "2025-02-20",
    readTime: 7,
  },
  {
    slug: "wheel-throwing-beginners-guide",
    title: {
      en: "Wheel Throwing for Beginners: What to Expect",
      ar: "الدولاب للمبتدئين: ماذا تتوقع",
      es: "Torno para principiantes: qué esperar",
      fr: "Le tour pour débutants : à quoi s'attendre",
    },
    excerpt: {
      en: "Your first time at the pottery wheel can be magical or messy. Here's how to make it both, in the best way possible.",
      ar: "مرتك الأولى على دولاب الفخار يمكن أن تكون ساحرة أو فوضوية. إليك كيف تجعلها كلاهما، بأفضل طريقة ممكنة.",
      es: "Tu primera vez en el torno puede ser mágica o desordenada. Aquí te explicamos cómo hacer que sea ambas cosas, de la mejor manera posible.",
      fr: "Votre première fois au tour peut être magique ou désordonnée. Voici comment faire les deux, de la meilleure façon possible.",
    },
    content: {
      en: `## The Magic of the Wheel

There's something almost alchemical about wheel throwing. A lump of clay, spinning motion, gentle pressure – and suddenly, a vessel begins to emerge. Here's what to expect from your first session.

### Before You Begin

**Dress appropriately.** Clay gets everywhere. Wear clothes you don't mind getting dirty. Remove rings and watches. Tie back long hair.

**Come with the right mindset.** Your first pieces won't be perfect. That's not just okay – it's part of the journey. The goal is to feel the clay, not to create a masterpiece.

### The Centering Challenge

The hardest part of wheel throwing is centering the clay. Until the clay is perfectly centered on the wheel, you can't throw a symmetrical piece. This takes practice – sometimes weeks or months to master.

Don't be discouraged. Even experienced potters occasionally struggle with centering. It's a skill that improves with muscle memory.

### Opening and Pulling

Once centered, you'll learn to open the clay (creating the interior space) and pull the walls (making them higher and thinner). These movements require:
- **Consistent pressure** – not too much, not too little
- **Patience** – rushing causes wobbles
- **Wet hands** – dry hands stick to the clay

### Common First-Timer Experiences

- Feeling the clay "fight back" as you try to center it
- Having your first cylinder collapse (everyone does it)
- Being surprised by how physical the work is
- Entering a meditative state as you focus
- Getting completely covered in clay

### What You'll Take Home

Most workshops fire your pieces after they dry and apply a glaze. You'll typically receive your finished work 1-2 weeks later. Even imperfect pieces make meaningful souvenirs – they capture a moment of learning.

### Tips for Success

1. **Breathe.** Tension transfers to the clay.
2. **Keep your elbows anchored.** Steady arms mean steady hands.
3. **Use enough water.** But not too much – you'll learn the balance.
4. **Trust the process.** The clay knows what it wants to become.

### Why Try It

Wheel throwing offers something rare in our digital age: a direct connection between intention and material. There's no undo button, no filter. Just you, the clay, and the ancient rhythm of the wheel.`,
      ar: `## سحر الدولاب

هناك شيء يشبه السحر في استخدام الدولاب. كتلة من الطين، حركة دوران، ضغط لطيف – وفجأة، يبدأ وعاء بالظهور.

### قبل أن تبدأ

**ارتدِ ملابس مناسبة.** الطين يذهب إلى كل مكان. ارتدِ ملابس لا تمانع اتساخها. أزل الخواتم والساعات. اربط الشعر الطويل.

**تعال بالعقلية الصحيحة.** قطعك الأولى لن تكون مثالية. هذا ليس مقبولاً فقط – إنه جزء من الرحلة.

### تحدي التمركز

الجزء الأصعب في استخدام الدولاب هو تمركز الطين. حتى يتمركز الطين تماماً على الدولاب، لا يمكنك صنع قطعة متناظرة.

لا تثبط عزيمتك. حتى الخزافون الخبراء يواجهون أحياناً صعوبة في التمركز.

### الفتح والسحب

بمجرد التمركز، ستتعلم فتح الطين (إنشاء المساحة الداخلية) وسحب الجدران (جعلها أعلى وأرق).

### تجارب شائعة للمرة الأولى

- الشعور بأن الطين "يقاوم" أثناء محاولة تمركزه
- انهيار أول أسطوانة (الجميع يفعل ذلك)
- التفاجؤ بمدى جسدية العمل
- الدخول في حالة تأملية أثناء التركيز
- التغطي بالكامل بالطين

### ما ستأخذه معك

معظم الورش تحرق قطعك بعد جفافها وتطبق طلاء. ستتلقى عادةً عملك المنتهي بعد 1-2 أسبوع.

### نصائح للنجاح

1. **تنفس.** التوتر ينتقل إلى الطين.
2. **حافظ على ثبات مرفقيك.** الذراعين الثابتتين تعني يدين ثابتتين.
3. **استخدم ماء كافٍ.** لكن ليس كثيراً – ستتعلم التوازن.
4. **ثق بالعملية.** الطين يعرف ما يريد أن يصبح.

### لماذا تجرب

يقدم الدولاب شيئاً نادراً في عصرنا الرقمي: اتصال مباشر بين النية والمادة.`,
      es: `## La magia del torno

Hay algo casi alquímico en el torno. Un trozo de arcilla, movimiento giratorio, presión suave – y de repente, una vasija comienza a emerger.

### Antes de empezar

**Viste apropiadamente.** La arcilla llega a todas partes. Usa ropa que no te importe ensuciar. Quítate anillos y relojes. Recoge el pelo largo.

**Ven con la mentalidad correcta.** Tus primeras piezas no serán perfectas. Eso no solo está bien – es parte del viaje.

### El desafío del centrado

La parte más difícil del torno es centrar la arcilla. Hasta que la arcilla esté perfectamente centrada en el torno, no puedes hacer una pieza simétrica.

No te desanimes. Incluso los alfareros experimentados a veces luchan con el centrado.

### Abrir y estirar

Una vez centrado, aprenderás a abrir la arcilla (crear el espacio interior) y estirar las paredes (hacerlas más altas y delgadas).

### Experiencias comunes de principiantes

- Sentir que la arcilla "resiste" mientras intentas centrarla
- Que tu primer cilindro se derrumbe (todos lo hacen)
- Sorprenderte de lo físico que es el trabajo
- Entrar en un estado meditativo mientras te concentras
- Quedar completamente cubierto de arcilla

### Lo que te llevarás a casa

La mayoría de los talleres hornean tus piezas después de que se secan y aplican un esmalte. Normalmente recibirás tu trabajo terminado 1-2 semanas después.

### Consejos para el éxito

1. **Respira.** La tensión se transfiere a la arcilla.
2. **Mantén los codos anclados.** Brazos firmes significan manos firmes.
3. **Usa suficiente agua.** Pero no demasiada – aprenderás el equilibrio.
4. **Confía en el proceso.** La arcilla sabe en qué quiere convertirse.

### Por qué intentarlo

El torno ofrece algo raro en nuestra era digital: una conexión directa entre intención y material.`,
      fr: `## La magie du tour

Il y a quelque chose de presque alchimique dans le travail au tour. Une boule d'argile, un mouvement rotatif, une pression douce – et soudain, un récipient commence à émerger.

### Avant de commencer

**Habillez-vous convenablement.** L'argile va partout. Portez des vêtements que vous ne craignez pas de salir. Retirez bagues et montres. Attachez les cheveux longs.

**Venez avec le bon état d'esprit.** Vos premières pièces ne seront pas parfaites. Ce n'est pas seulement acceptable – c'est partie du voyage.

### Le défi du centrage

La partie la plus difficile du tour est le centrage de l'argile. Tant que l'argile n'est pas parfaitement centrée sur le tour, vous ne pouvez pas réaliser une pièce symétrique.

Ne vous découragez pas. Même les potiers expérimentés ont parfois du mal avec le centrage.

### Ouvrir et monter

Une fois centré, vous apprendrez à ouvrir l'argile (créer l'espace intérieur) et monter les parois (les rendre plus hautes et plus fines).

### Expériences courantes des débutants

- Sentir l'argile "résister" pendant que vous essayez de la centrer
- Voir votre premier cylindre s'effondrer (tout le monde le fait)
- Être surpris par la dimension physique du travail
- Entrer dans un état méditatif en vous concentrant
- Être complètement couvert d'argile

### Ce que vous emporterez

La plupart des ateliers cuisent vos pièces après séchage et appliquent un émail. Vous recevrez généralement votre travail fini 1-2 semaines plus tard.

### Conseils pour réussir

1. **Respirez.** La tension se transmet à l'argile.
2. **Gardez vos coudes ancrés.** Des bras stables signifient des mains stables.
3. **Utilisez assez d'eau.** Mais pas trop – vous apprendrez l'équilibre.
4. **Faites confiance au processus.** L'argile sait ce qu'elle veut devenir.

### Pourquoi essayer

Le tour offre quelque chose de rare à notre ère numérique : une connexion directe entre intention et matière.`,
    },
    coverImage: "/images/impact-4.jpg",
    category: "pottery",
    publishedAt: "2025-03-01",
    readTime: 5,
  },
];

export const getBlogPost = (slug: string): BlogPost | undefined => {
  return blogPosts.find((post) => post.slug === slug);
};

export const getBlogPostsByCategory = (category: BlogPost["category"]): BlogPost[] => {
  return blogPosts.filter((post) => post.category === category);
};
