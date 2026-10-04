import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { categoryPath, countryPath, slugify, sourcePath } from "./slugs";

describe("slugify", () => {
  it("lower-cases and joins words with hyphens", () => {
    assert.equal(slugify("South Africa"), "south-africa");
    assert.equal(slugify("DR Congo"), "dr-congo");
    assert.equal(slugify("Burkina Faso"), "burkina-faso");
  });

  it("keeps an existing hyphen as one hyphen", () => {
    assert.equal(slugify("Guinea-Bissau"), "guinea-bissau");
  });

  it("drops accents and stray punctuation", () => {
    assert.equal(slugify("Côte d'Ivoire"), "cote-d-ivoire");
    assert.equal(slugify("  São Tomé & Príncipe "), "sao-tome-principe");
  });

  it("gives the same slug for every spelling of a name", () => {
    for (const spelling of ["South Africa", "south africa", "SOUTH AFRICA", "south-africa", "south_africa", "South  Africa"]) {
      assert.equal(slugify(spelling), "south-africa");
    }
  });

  it("returns an empty string when nothing usable is left", () => {
    assert.equal(slugify("---"), "");
    assert.equal(slugify(""), "");
  });
});

describe("paths", () => {
  it("builds the section path", () => {
    assert.equal(categoryPath("Politics"), "/politics");
    assert.equal(categoryPath("International"), "/international");
  });

  it("builds the country path", () => {
    assert.equal(countryPath("South Africa"), "/country/south-africa");
    assert.equal(countryPath("Ghana"), "/country/ghana");
    assert.equal(countryPath("Ivory Coast"), "/country/ivory-coast");
  });

  it("builds the publisher path from the id", () => {
    assert.equal(sourcePath(12), "/source/12");
    assert.equal(sourcePath(1), "/source/1");
  });
});
