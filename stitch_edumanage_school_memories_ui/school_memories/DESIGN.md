---
name: School Memories
colors:
  surface: '#fdf7ff'
  surface-dim: '#ded8e0'
  surface-bright: '#fdf7ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f8f2fa'
  surface-container: '#f2ecf4'
  surface-container-high: '#ece6ee'
  surface-container-highest: '#e6e0e9'
  on-surface: '#1d1b20'
  on-surface-variant: '#494551'
  inverse-surface: '#322f35'
  inverse-on-surface: '#f5eff7'
  outline: '#7a7582'
  outline-variant: '#cbc4d2'
  surface-tint: '#6750a4'
  primary: '#4f378a'
  on-primary: '#ffffff'
  primary-container: '#6750a4'
  on-primary-container: '#e0d2ff'
  inverse-primary: '#cfbcff'
  secondary: '#63597c'
  on-secondary: '#ffffff'
  secondary-container: '#e1d4fd'
  on-secondary-container: '#645a7d'
  tertiary: '#765b00'
  on-tertiary: '#ffffff'
  tertiary-container: '#c9a74d'
  on-tertiary-container: '#503d00'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#e9ddff'
  primary-fixed-dim: '#cfbcff'
  on-primary-fixed: '#22005d'
  on-primary-fixed-variant: '#4f378a'
  secondary-fixed: '#e9ddff'
  secondary-fixed-dim: '#cdc0e9'
  on-secondary-fixed: '#1f1635'
  on-secondary-fixed-variant: '#4b4263'
  tertiary-fixed: '#ffdf93'
  tertiary-fixed-dim: '#e7c365'
  on-tertiary-fixed: '#241a00'
  on-tertiary-fixed-variant: '#594400'
  background: '#fdf7ff'
  on-background: '#1d1b20'
  surface-variant: '#e6e0e9'
typography:
  h1:
    fontFamily: Fredoka One
    fontSize: 40px
    fontWeight: '400'
    lineHeight: '1.2'
  h2:
    fontFamily: Fredoka One
    fontSize: 32px
    fontWeight: '400'
    lineHeight: '1.2'
  h3:
    fontFamily: Fredoka One
    fontSize: 24px
    fontWeight: '400'
    lineHeight: '1.3'
  body-lg:
    fontFamily: Lexend
    fontSize: 18px
    fontWeight: '400'
    lineHeight: '1.6'
  body-md:
    fontFamily: Lexend
    fontSize: 16px
    fontWeight: '400'
    lineHeight: '1.5'
  body-sm:
    fontFamily: Lexend
    fontSize: 14px
    fontWeight: '400'
    lineHeight: '1.4'
  label-caps:
    fontFamily: Lexend
    fontSize: 12px
    fontWeight: '600'
    lineHeight: '1.0'
    letterSpacing: 0.05em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  unit: 8px
  container-padding: 32px
  gutter: 24px
  card-gap: 24px
---

## Brand & Style
The design system is built upon a "School Memories" narrative, transforming a functional management utility into a digital scrapbook of educational life. It blends tactile skeuomorphism with modern usability to create an environment that feels like a cheerful, sun-drenched classroom. 

The aesthetic avoids the sterile corporate nature of typical SaaS platforms, opting instead for a friendly, approachable atmosphere. It utilizes "imperfect" organic lines, paper-like textures, and crayon-inspired color pops to evoke nostalgia for primary school while maintaining the structure required for complex administrative tasks. The target audience—teachers, students, and parents—should feel a sense of comfort and reduced stress when navigating the interface.

## Colors
The palette is rooted in the "Warm Cream" of vintage notebook paper and the "Deep Green" of traditional slate chalkboards. 

- **Primary Canvas:** Use the warm cream for main content areas to reduce eye strain and provide a "paper" feel.
- **The Chalkboard:** The sidebar and navigation headers utilize the deep green tones, providing high contrast against the cream content.
- **Ink Tones:** Use the dark brown for all primary text to mimic pen ink, avoiding pure blacks which feel too harsh for this aesthetic.
- **Crayon Accents:** These are used functionally for status indicators, category tags, and action-oriented buttons. Each color maintains a high saturation to mimic wax crayons.

## Typography
The typography strategy prioritizes friendliness and extreme legibility. 

**Fredoka One** is the primary display face. Its ultra-rounded corners and heavy weight mimic bold markers or classroom signage. It should be used sparingly for page titles and major section headers.

**Lexend** (substituting for Quicksand/Nunito) is utilized for all body text, UI labels, and data tables. It was specifically designed to reduce visual stress and improve reading proficiency, aligning perfectly with the educational theme. 

- **Hierarchy:** Maintain generous line heights to preserve the "spacious" notebook feel.
- **Alignment:** While the system is structured, titles can occasionally have a 1-2 degree rotation to enhance the "hand-placed" scrapbook feel.

## Layout & Spacing
This design system utilizes a **Fixed Grid** philosophy within a fluid container. Content is organized into "sheets" or "cards" that sit on the primary parchment background.

- **The Notebook Rhythm:** Spacing follows an 8px base unit. 
- **Margins:** Large 32px outer margins ensure the UI never feels cramped, mimicking the wide margins of a composition notebook.
- **Sidebar:** The green chalkboard sidebar is fixed to the left, acting as the structural "binding" of the application.

## Elevation & Depth
Depth in this system is achieved through **Tactile Layering** rather than realistic lighting. 

- **Surface Tiers:** The "Chalkboard" (sidebar) is the lowest layer. The "Notebook" (main background) sits above it. "Cards" and "Papers" sit on top of the notebook.
- **Shadows:** Use a "Crayon Stroke" shadow—a 2px or 4px offset with 100% opacity in a slightly darker shade of the element's color (or a soft brown tint), rather than a blurred grey shadow. This creates a 2D-stacked effect.
- **Textures:** The primary background must feature a subtle diagonal line pattern (opacity 0.03) to suggest paper grain. The sidebar includes a "chalk dust" noise texture to break up the flat green.

## Shapes
The shape language is soft and organic. Every corner is significantly rounded to maintain the friendly, safe-for-school persona.

- **Cards:** Use a 16px radius.
- **Interactive Elements:** Buttons and form inputs use a 12px radius. 
- **Stroke:** Use a 2px "hand-drawn" border style on cards using the Parchment Border color. Avoid perfectly sharp 1px lines; a slightly thicker, softer stroke feels more like a physical object.

## Components
- **Buttons:** Designed as "Crayon Strokes." They feature a solid fill (Crayon Red, Blue, etc.) and a 2px bottom-right offset shadow. On hover, the shadow disappears and the button shifts 2px down and right to simulate being "pressed" into the paper.
- **Cards:** Must look like sheets of paper or cardstock. They use the Secondary Background (#fff9f0) with a 2px parchment border.
- **Input Fields:** Soft 12px rounded boxes with a 2px inset border. The focus state uses a "Pencil Yellow" highlight.
- **Icons:** Use rounded versions of Lucide or Heroicons. Icons should be colored using the "Ink Muted" palette or a specific "Crayon" color if they are meant to be playful.
- **Doodles:** Small, low-opacity (10-15%) SVG illustrations (apples, rulers, paperclips) are placed in the empty corners of large containers or at the end of long lists to act as delightful easter eggs.
- **Status Chips:** Designed to look like small strips of colored "Washi Tape" with slightly jagged edges or rounded ends.