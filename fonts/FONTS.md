# Fonts in this folder — families, sources, licenses

Self-hosted webfonts for ringandrespond.com. All three families are licensed
under the **SIL Open Font License, Version 1.1 (OFL-1.1)**. OFL condition 2
requires the copyright notice and the license to travel with redistributed
copies of the Font Software — the per-family license files in this folder
(`OFL-Archivo.txt`, `OFL-DM-Sans.txt`, `OFL-Fraunces.txt`) are that carriage.
Keep them in this folder wherever the `.woff2` files are copied or deployed.

**Verification:** read directly from the shipped binaries with fontTools
(name tables) on 2026-11-15. Every file below declares the OFL in its own
name table (nameID 14, License URL → scripts.sil.org/OFL) and carries its
project copyright notice (nameID 0), quoted verbatim per family. No family
declares a Reserved Font Name in its shipped name table. Status for all
three families: **VERIFIED from the files**.

## Archivo

- **Files:** `archivo-var.woff2` (variable font; embedded family name
  "Archivo SemiBold")
- **Copyright (nameID 0, verbatim):** Copyright 2020 The Archivo Project
  Authors (https://github.com/Omnibus-Type/Archivo)
- **Source:** the Archivo project (Omnibus-Type) — upstream project URL as
  embedded in the font's copyright notice; this copy is self-hosted in this
  repo (added 2026-10-29)
- **License declared in file (nameID 14):** http://scripts.sil.org/OFL
- **License:** SIL Open Font License, Version 1.1 — full text with this
  family's copyright notice: `OFL-Archivo.txt` (this folder)

## DM Sans

- **Files:** `dm-sans-var.woff2` (variable font; embedded family name
  "DM Sans 9pt")
- **Copyright (nameID 0, verbatim):** Copyright 2014 The DM Sans Project
  Authors (https://github.com/googlefonts/dm-fonts)
- **Source:** the DM Sans project (googlefonts/dm-fonts) — upstream project
  URL as embedded in the font's copyright notice; this copy is self-hosted
  in this repo (added 2026-10-29)
- **License declared in file (nameID 14):** https://scripts.sil.org/OFL
- **License:** SIL Open Font License, Version 1.1 — full text with this
  family's copyright notice: `OFL-DM-Sans.txt` (this folder)

## Fraunces

- **Files:** `fraunces.woff2`, `fraunces-italic.woff2` (variable fonts;
  embedded family name "Fraunces")
- **Copyright (nameID 0, verbatim, both files):** Copyright 2020 The
  Fraunces Project Authors (github.com/undercasetype/Fraunces)
- **Source:** the Fraunces project (Undercase Type) — upstream project URL
  as embedded in the fonts' copyright notice; these copies are self-hosted
  in this repo (added 2026-10-29)
- **License declared in file (nameID 14):** https://scripts.sil.org/OFL
- **License:** SIL Open Font License, Version 1.1 — full text with this
  family's copyright notice: `OFL-Fraunces.txt` (this folder)

---

*Prepared 2026-11-15 from the compliance-tooling map
(`~/workspace/compliance-tooling-20261115/MAP.md` §7, Build #10). Repo files
only — these ship to the live site on the next web-upload deploy pass,
together with the rest of the deploy batch.*
