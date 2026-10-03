Latin subsets of Fraunces (500, 600, 700), Inter (400, 500) and IBM Plex Mono
(400, 500), copied from the @fontsource packages at version 5.3.0. All three
are licensed under the SIL Open Font License 1.1 (see the LICENSE files here).

They are bundled with the site so a reader's browser makes no request to
Google Fonts. The Latin subset covers English, French and Portuguese; Arabic
text falls back to the system font, as it did before.

To add a weight: copy `files/<family>-latin-<weight>-normal.woff2` from the
matching @fontsource package and add an @font-face rule in `src/index.css`.
