# Reymarc Almaden — Portfolio

Personal portfolio site showcasing automation and AI workflow builds across n8n,
GoHighLevel, Make, and Zapier.

**Live site:** https://reymarc-portfolio.vercel.app/

## Stack

Plain static HTML, CSS, and JavaScript. No framework, no build step, no
dependencies — the site is served exactly as the files appear in this repo.

- `index.html` — the whole page, including the project detail modal template
- `styles.css` — full design system (violet on warm neutral, light + dark themes)
- `script.js` — theme toggle, scroll reveal, animated counters, project modal data

## Running it locally

Open `index.html` in a browser. That's the entire workflow — there is nothing to
install or compile.

## Layout

```
index.html  styles.css  script.js  favicon.svg
Reymarc_Almaden_Resume.pdf     the file the hero's Resume button serves
assets/
├── avatar.png                 hero portrait, also the social share image
├── logos/                     tech-stack marquee icons
├── projects/                  project card + modal images
│   └── full/                  full-resolution originals for the zoom lightbox
├── certifications/            certificate images
└── source/                    masters that are never served (resume .docx, etc.)
```

Every asset path is lowercase and hyphenated, with no spaces — spaces and `&`
have to be percent-encoded in a URL, and it is easy to get that wrong by hand.

## Project images

Card and modal images are downscaled derivatives capped at roughly 2 megapixels.
The full-resolution originals live in `assets/projects/full/` under **the same
filename as their thumbnail**, and load only when a visitor clicks the zoom
button. Keep that split when adding new work — a full-size workflow screenshot
in a card slot will make the page stutter badly on scroll.

## Adding a project

1. Add the card markup to the `.projects-grid` in `index.html`, with
   `onclick="openProjectDetail(N)"` matching the array index.
2. Add a matching entry to the `projectDetails` array in `script.js`.
   Optional richer fields: `stats`, `concept`, `stages`, `decisions`, `status`.
   Set `image` to the light version and `imageFull` to the original.

## Deployment

Pushed to GitHub, deployed on Vercel. Every push to `main` triggers a redeploy.
