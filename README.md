# 4910-portfolio

EE 4910 senior portfolio for **Truong Luu**: Electrical Engineering, Iowa State University.

A static site (plain HTML/CSS/JS, no build step) in a classical portfolio style (EB Garamond, hairline frames, Roman numerals) with black-and-white technical drawings animated by [anime.js](https://animejs.com/).

## Pages

| Part | File | Contents |
|---|---|---|
| Cover | `index.html` | Transmission line in elevation, insulator-string detail, rotating three-phase phasors; name in a framed panel |
| Index | `contents.html` | Table of contents |
| I | `about.html` | Welcome, name & contact, career objective, focus areas |
| II | `experience.html` | Work experience (EP2 internship), ventures, senior design + 3 projects |
| III | `resume.html` | Web résumé + PDF download, research, awards, activities |
| IV | `gen-ed.html` | General Education Reflection |
| V | `cumulative.html` | Cumulative Reflection (incl. ABET outcomes table) |
| VI | `ethics.html` | Ethics paper |

## Editing

- **Placeholders**: every spot still waiting for content is marked `class="todo"` (dashed "To add" box) or `class="todo-link"`. Search the HTML for `todo` to find them all.
- **Documents**: put PDFs in `assets/docs/` and link them, e.g. `href="assets/docs/ethics-paper.pdf"`.
- **Navigation** (top bar + previous/next footer) is generated from the `PAGES` list in `assets/js/main.js`.
- **Schematics** are defined in `assets/js/schematic.js`. Use any figure with `<svg class="sch" data-fig="NAME"></svg>`.
  Available: `tower` (lattice tower line), `phasor` (rotating three-phase phasors), `grid` (power plant → towers → substation), `oneline`, `buck`, `protection`, `inverter`, `layout`, `ecprobe`, `dac`, `rlc`, `scope`.
- **Colors**: black & white throughout. The only colour is in the animation (current pulses, phasors and their waves), set by `--g1`, `--g2`, `--g3` in `assets/css/style.css`.
- **Motion**: drawings animate even when the OS has "reduce motion" on (see the note in `schematic.js`).
- **Caching**: after editing CSS/JS, bump the `?v=` number on the `<link>`/`<script>` tags so browsers pick up the change.

## Preview locally

```
python -m http.server 8765
```

Then open http://localhost:8765.

## Publish with GitHub Pages

Push to `main`, then in the repo go to **Settings → Pages → Build and deployment**, choose **Deploy from a branch**, and select `main` / `(root)`.
The site will be live at `https://hoaian28082001.github.io/4910-portfolio/`.
