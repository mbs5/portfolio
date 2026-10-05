# Research 03: classical x Muslim visual language (2026-10-05)

## Palettes (hex)
A Pentelic (chosen base): bg #F4F0E8, surface #FBF9F4, ink #1C1A17, muted #6B655C, rule #D9D2C5, accent bronze #8C6A3F, accent-deep verdigris #3E7D74. Dark: bg #15130F, surface #1E1B16, ink #EDE7DA, muted #9B9283, rule #2E2A23, accent gold leaf #C49A5A, deep #5FA39A.
B Iznik: bg #F7F5EF, ink #1A1F2B, accent cobalt #1F4E9E, deep turquoise #2A8C8A, alert bole red #A8302B. Dark bg #0E1320.
C Mughal: bg #F3EDE4, accent sandstone #9E4A3A, deep lapis #27347A, hairline gold #C9A961.
Rules: ink never pure black, paper never pure white, accent under 5% of pixels, gold only as a 1px hairline, 2 to 3% grain, dark mode is oiled walnut not slate. Avoid flat AI beige, purple gradients, glass cards, neon on black.

## Type
1 Cinzel 500/600 caps (tracking .08em, set at .85x the serif step) + EB Garamond + JetBrains Mono. 2 Cormorant 600 italic + Spectral + Plex Mono. 3 Fraunces + Instrument Sans + Geist Mono. 4 Spectral/Literata + Amiri for one Arabic word (lang=ar dir=rtl, line-height 1.7+, never gradient or outline, never Latin fallback).
Scale: body clamp(1.0625rem .. 1.25rem), ratio 1.2 at 360 to 1.25 at 1440, measure 60 to 70ch.

## Ornament
History: Damascus Great Mosque (715) acanthus friezes by Byzantine-trained mosaicists; Cordoba spolia; Cappella Palatina (1130s) Latin plan + Greek mosaics + Corinthian spolia + Fatimid muqarnas. A meander beside an 8-point star is historically honest.
Meander pattern: tile 6x5, path M0 .5H5.5V4.5H1.5V2.5H4, stroke 1.
8-point star: 16 vertices at k*22.5deg, radius R for even k, .7654R for odd k. Star-and-cross tiling at pitch 2R.
Girih strip: elongated hexagon side 1, vertices (+-1.309,0) (+-.5,+-.588), strap lines from edge midpoints at 54deg.
Use at 1px, 25 to 40% opacity, three places only: rule under masthead, frieze between sections, one watermark star at 4 to 6% behind the hero. Never wallpaper.

## Quotes (verified)
- "Allah has prescribed ihsan in all things." Sahih Muslim 1955, Nawawi 17. Sahih. Lead with this.
- "Allah loves that when one of you does a job, he does it with itqan." Bayhaqi, Shu'ab al-Iman 4929; hasan (Albani, Sahih al-Jami 1880); some weaken a narrator.
- "Men become builders by building and lyre-players by playing the lyre." Aristotle, NE II.1 1103a33 (Ross). ("We are what we repeatedly do" is Durant 1926.)
- "The seeker after truth is not one who studies the writings of the ancients and puts his trust in them, but rather the one who suspects his faith in them and questions what he gathers from them." Ibn al-Haytham, Doubts Concerning Ptolemy (Sabra).
- "Knowledge without action is madness, and action without knowledge is void." Al-Ghazali, Letter to a Disciple (Mayer).
- "Water in the boat is the ruin of the boat, but water underneath the boat is a support." Rumi, Masnavi I:985.
- "Waste no more time arguing about what a good man should be. Be one." Marcus Aurelius 10.16.
- "It is not that we have a short time to live, but that we waste a lot of it." Seneca, Shortness of Life 1.3.
- Ibn Khaldun, Muqaddimah ch.5: a person who has the habit of one craft rarely masters another (depth over breadth).
Do not use: Seneca "luck is preparation", Epictetus "first say what you would be", Rumi "raise your words".

## Etiquette
One small Bismillah or Alhamdulillah in Amiri, 14 to 18px, near masthead or footer. Geometry as the only ornament. No crescents, mosque silhouettes, Allah calligraphy as logo, no verses on dark or cropped backgrounds, no figurative religious imagery. Exemplars: sarasoueidan.com, ishadeed.com, kamranahmed.info, samiramian.uk, angawistudio.com, peter-gould.com, visualdhikr.com.

## kie prompts
Suffix: ", engraved intaglio emblem, pure black ink on plain white, fine copperplate hatching, single centered mark, no text, no color, no shading gradients, no background texture, symmetrical, vector-clean edges". gpt-image-2, 2K, png. 1 laurel wreath around 8-point star (1:1). 2 Ionic column with girih base (1:1). 3 meander frame around a tawriq palmette (1:1). 4 compass and straightedge over a muqarnas cell (1:1). 5 acanthus into split-palmette frieze (21:9). 6 broken Corinthian capital with an Iznik tulip (3:2).
