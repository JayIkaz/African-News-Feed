import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { clockOffsetMinutes, resolvePublishedDate } from "./publishedDate";

const FETCHED = new Date("2026-11-04T18:07:52Z");

describe("resolvePublishedDate", () => {
  it("keeps a date from before the fetch as it is", () => {
    const r = resolvePublishedDate("Wed, 04 Nov 2026 17:30:00 GMT", FETCHED);
    assert.equal(r.date.toISOString(), "2026-11-04T17:30:00.000Z");
    assert.equal(r.capped, false);
  });

  it("reads a time zone offset in the date text", () => {
    const r = resolvePublishedDate("Wed, 04 Nov 2026 19:30:00 +0200", FETCHED);
    assert.equal(r.date.toISOString(), "2026-11-04T17:30:00.000Z");
    assert.equal(r.capped, false);
  });

  it("pulls a date after the fetch back to the fetch time", () => {
    const r = resolvePublishedDate("Tue, 01 Dec 2026 03:00:00 GMT", FETCHED);
    assert.equal(r.date.getTime(), FETCHED.getTime());
    assert.equal(r.capped, true);
  });

  it("pulls back a date a minute ahead as well", () => {
    const r = resolvePublishedDate("Wed, 04 Nov 2026 18:08:52 GMT", FETCHED);
    assert.equal(r.date.getTime(), FETCHED.getTime());
    assert.equal(r.capped, true);
  });

  it("keeps a date equal to the fetch time", () => {
    const r = resolvePublishedDate("Wed, 04 Nov 2026 18:07:52 GMT", FETCHED);
    assert.equal(r.date.getTime(), FETCHED.getTime());
    assert.equal(r.capped, false);
  });

  it("uses the fetch time when the feed has no date", () => {
    for (const raw of [undefined, ""]) {
      const r = resolvePublishedDate(raw, FETCHED);
      assert.equal(r.date.getTime(), FETCHED.getTime());
      assert.equal(r.capped, false);
    }
  });

  it("uses the fetch time when the date cannot be read", () => {
    const r = resolvePublishedDate("not a date", FETCHED);
    assert.equal(r.date.getTime(), FETCHED.getTime());
    assert.equal(r.capped, false);
  });

  describe("with a publisher clock offset", () => {
    it("applies the offset before comparing with the fetch time", () => {
      // Daily Maverick: labelled GMT, really two hours earlier.
      const r = resolvePublishedDate("Wed, 04 Nov 2026 19:30:00 GMT", FETCHED, -120);
      assert.equal(r.date.toISOString(), "2026-11-04T17:30:00.000Z");
      assert.equal(r.capped, false);
    });

    it("still holds a corrected date to the fetch time", () => {
      const r = resolvePublishedDate("Tue, 01 Dec 2026 03:00:00 GMT", FETCHED, -120);
      assert.equal(r.date.getTime(), FETCHED.getTime());
      assert.equal(r.capped, true);
    });

    it("does not apply the offset to a missing date", () => {
      const r = resolvePublishedDate(undefined, FETCHED, -120);
      assert.equal(r.date.getTime(), FETCHED.getTime());
    });
  });
});

describe("clockOffsetMinutes", () => {
  it("is -120 for Daily Maverick, however its site is written", () => {
    assert.equal(clockOffsetMinutes({ homepage: "https://www.dailymaverick.co.za", rssUrl: null }), -120);
    assert.equal(clockOffsetMinutes({ homepage: "https://dailymaverick.co.za/", rssUrl: null }), -120);
    assert.equal(clockOffsetMinutes({ homepage: "", rssUrl: "https://www.dailymaverick.co.za/dmrss/" }), -120);
  });

  it("is 0 for every other publisher", () => {
    assert.equal(clockOffsetMinutes({ homepage: "https://www.vanguardngr.com", rssUrl: "https://www.vanguardngr.com/feed/" }), 0);
    assert.equal(clockOffsetMinutes({ homepage: "https://notdailymaverick.co.za", rssUrl: null }), 0);
    assert.equal(clockOffsetMinutes({ homepage: "https://dailymaverick.co.za.example.com", rssUrl: null }), 0);
  });

  it("is 0 when the address is missing or not an address", () => {
    assert.equal(clockOffsetMinutes({}), 0);
    assert.equal(clockOffsetMinutes({ homepage: "not a url", rssUrl: null }), 0);
  });
});
