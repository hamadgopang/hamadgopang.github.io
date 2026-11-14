# Hamad Khan | Chemistry Educator Portfolio

A static portfolio website built with HTML5, CSS3 and vanilla JavaScript only. There is no build step, no backend and no framework, so it works on GitHub Pages as-is.

- Homepage: `index.html`
- Interactive Periodic Table Explorer: `periodic-table/`
- Organic Chemistry Learning Lab: `organic-chemistry/`

## Project structure

```
index.html
periodic-table/
  index.html
organic-chemistry/
  index.html                 Lab hub
  hydrocarbons/              Hydrocarbons Explorer
  homologous-series/         Homologous Series Explorer
  functional-groups/         Functional Groups Explorer
  reactions/                 Reaction Animation Studio
  quiz/                      Quiz Center
  flashcards/                Flashcards
assets/
  css/
    style.css                Design tokens, homepage, header/footer
    responsive.css           Mobile-first breakpoints
    periodic-table.css       Periodic table page styles
    lab.css                  Organic Chemistry Lab styles (scoped to .lab-page)
  js/
    boot.js                  Adds the "js" class to <html> before first paint
    main.js                  Header, mobile menu, active section, back-to-top, footer year, mini table
    animations.js            Scroll reveal, counters, parallax, reduced-motion handling
    interactions.js          Image fallbacks, gallery lightbox, contact form (mailto)
    periodic-table.js        Periodic table app
    periodic-table-text.js   Periodic table UI text (English + Urdu)
    lab-core.js              Shared molecule model, SVG morph engine, formulas, progress
    lab-teacher.js           Teacher Mode (fullscreen / overlay) for every tool
    lab-hub.js               Lab home canvas and progress strip
    lab-hydrocarbons.js      Hydrocarbons Explorer
    lab-homologous.js        Homologous Series Explorer
    lab-groups.js            Functional Groups Explorer
    lab-reactions.js         Reaction Animation Studio
    lab-quiz.js              Quiz Center
    lab-flashcards.js        Flashcards
  json/
    periodic-table.json      118 elements, families and facts
    organic-atoms.json       Valence and school Ar values
    molecules.json           Curated molecules used by groups, reactions and quiz
    hydrocarbons.json        Alkane / alkene / alkyne family data
    functional-groups.json   Twelve functional groups
    reactions.json           Nine curated reactions
    quiz.json                Quiz questions
    flashcards.json          Revision cards
  fonts/
    JameelNooriNastaleeq.woff2
  image/
scripts/
  validate-organic.cjs       Data validator for the Lab (development only)
  lab-pages/                 Optional page generator (fragments → full HTML shells)
```

The image folder is `assets/image/` (singular). All code references that name.

## Organic Chemistry Lab

Phase 1 tools: Hydrocarbons Explorer, Homologous Series, Functional Groups, Reaction Studio, Quiz and Flashcards. Each tool has Teacher Mode for classroom display. Phase 2/3 ideas (Molecular Builder, Nomenclature, Isomerism, Properties Lab, Dictionary) appear on the hub as "Coming soon".

Chemistry content is curated JSON. School-level explanations are the default; advanced notes are labelled. Reaction animations show the overall change, not the detailed mechanism.

### Validate Lab data

From the project root (Node required):

```
node scripts/validate-organic.cjs
```

The validator checks valence, formulas, general formulas, equation balance, reaction atom pairing, quiz structure and flashcard counts.

### Add quiz questions, cards or reactions

1. Edit the matching file under `assets/json/`.
2. Keep ids unique.
3. For reactions, supply balanced `reactants` / `products` using molecule ids from `molecules.json` (or `f` for a formula-only species in group reactions).
4. Run `node scripts/validate-organic.cjs` and fix any failures before publishing.

### Page generator (optional, not part of the live site)

Lab pages share the portfolio header and footer. Fragments live in `scripts/lab-pages/fragments/`. To regenerate the HTML shells after editing a fragment:

```
node scripts/lab-pages/gen.cjs
```

Hosting the site does not require this script; the generated HTML under `organic-chemistry/` is what visitors load.

## Rules this project follows

- No inline CSS, no inline JavaScript, no inline event handlers.
- All paths are relative, so the site works at the root of a user site or inside a project repository.
- Dates of birth and other private details are not published.
- Employment durations are shown exactly as supplied and are never added together or turned into invented dates.

## Adding photos

Photos are optional. Until a file exists, a built-in illustration is shown instead (no broken images). To add a photo, copy a JPG with the exact file name into `assets/image/`:

| File name | Used for |
| --- | --- |
| `chemistry-whiteboard.jpg` | Teaching card: Traditional Whiteboard Teaching |
| `smart-classroom.jpg` | Teaching card: Smart Board & Digital Teaching |
| `phet-simulation.jpg` | Teaching card: PhET Interactive Simulations |
| `molecular-3d.jpg` | Teaching card: 3D Scientific Visualization |
| `chemistry-lab.jpg` | Teaching card: Practical Laboratory Demonstrations |
| `educational-animation.jpg` | Teaching card: Educational Animations & Videos |
| `chemistry-book-cover.jpg` | Notes gallery (tall image) |
| `chemistry-notes-1.jpg`, `chemistry-notes-2.jpg`, `chemistry-notes-3.jpg` | Notes gallery |
| `agriculture.jpg` | Beyond the Classroom card |

Recommended size: about 1280 x 800 px for the cards (16:10) and any reasonable size for the gallery. Gallery photos open in a lightbox automatically once they exist. Please only use photos you have permission to publish (especially photos of students).

## Running locally

Open the project through a web server (for example Laragon) rather than double-clicking the HTML files. The periodic table, Organic Chemistry Lab and homepage preview load JSON with `fetch`, which browsers block on `file://` URLs.

## Deploying to GitHub Pages

1. Push this folder to a GitHub repository.
2. In the repository settings, enable Pages for the main branch (root folder).
3. The periodic table will be available at `<site>/periodic-table/`.
4. The Organic Chemistry Lab will be available at `<site>/organic-chemistry/`.

## Contact form

The site has no server, so the form builds an email and opens the visitor's email app (`mailto:`). It never claims to send a message by itself.

## Please verify before publishing

- **Website address.** The supplied address `hamad.github.github.io` looks unusual (a GitHub Pages user site is normally `<username>.github.io`). It is deliberately not shown on the site. Once the real address is confirmed, add it to the contact details and add `canonical` and absolute `og:image` tags to the `<head>`.
- **Institution durations.** The eleven durations are shown as supplied. Please double-check each one against the 15-year total.
- **Photos.** Add real classroom, laboratory and notes photographs (see above) so the site feels personal and credible.
- **CV.** A downloadable PDF CV and a "Download CV" button can be added to the hero section later.
