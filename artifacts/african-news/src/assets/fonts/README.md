Bitter and Libre Franklin, copied from the @fontsource-variable packages at
version 5.3.0. Both are licensed under the SIL Open Font License 1.1 (see the
LICENSE files here).

- Bitter is the headline face (`--font-display`). Libre Franklin is the body
  and interface face (`--font-body`), and also sets the small uppercase labels
  (`--font-label`).
- Both are variable fonts with a weight axis from 100 to 900, so every weight
  the CSS asks for is a real weight and none is faked by the browser.
- Each family has two files, a `latin` file and a `latin-ext` file, with the
  same unicode ranges Google Fonts uses. The browser downloads the latin-ext file
  only for a page that needs a character in it, such as the naira (U+20A6) or
  cedi (U+20B5) sign. Plain English, French and Portuguese pages need only the
  latin files.
- They are bundled so a reader's browser makes no request to Google Fonts.

Not covered: Vietnamese-range letters (which includes the Yoruba and Igbo dotted
letters), Hausa hooked letters, Akan letters, Arabic and Ethiopic. Those fall
back to the reader's system font. In the last 30 days of articles, Arabic was
about 2% of titles and the others were close to none.

To add a subset: copy `files/<family>-<subset>-wght-normal.woff2` from the
matching @fontsource-variable package and add an @font-face rule in
`src/index.css` with that subset's unicode-range from the package's `wght.css`.
