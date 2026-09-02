import { useState, useRef } from "react";
import { Link } from "wouter";
import { formatDistanceToNow } from "date-fns";
import { Article } from "@workspace/api-client-react";
import { getArticleImage } from "@/lib/unsplash";
import { COUNTRY_FLAGS } from "@/lib/countries";
import { truncateToWord } from "@/lib/truncate";
import { isBreakingStory } from "@/lib/breaking";

interface TopStoriesCarouselProps {
  articles: Article[];
}

export function TopStoriesCarousel({ articles }: TopStoriesCarouselProps) {
  const [current, setCurrent] = useState(0);
  const touchStartX = useRef<number | null>(null);
  const touchStartY = useRef<number | null>(null);
  const isDragging = useRef(false);

  const goTo = (index: number) => {
    setCurrent(Math.max(0, Math.min(index, articles.length - 1)));
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
    isDragging.current = false;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (touchStartX.current === null || touchStartY.current === null) return;
    const dx = e.touches[0].clientX - touchStartX.current;
    const dy = e.touches[0].clientY - touchStartY.current;
    if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 8) {
      isDragging.current = true;
    }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const dx = e.changedTouches[0].clientX - touchStartX.current;
    if (isDragging.current && Math.abs(dx) > 40) {
      if (dx < 0) goTo(current + 1);
      else goTo(current - 1);
    }
    touchStartX.current = null;
    touchStartY.current = null;
    isDragging.current = false;
  };

  if (!articles.length) return null;

  return (
    <div className="an-carousel-root">
      <div
        className="an-carousel-track-wrapper"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <div
          className="an-carousel-track"
          style={{ transform: `translateX(-${current * 100}%)` }}
        >
          {articles.map((article, i) => (
            <CarouselSlide key={article.id} article={article} active={i === current} />
          ))}
        </div>
      </div>

      {/* Dot indicators */}
      <div className="an-carousel-dots">
        {articles.map((_, i) => (
          <button
            key={i}
            onClick={() => goTo(i)}
            className="an-carousel-dot"
            style={{
              background: i === current ? "var(--accent)" : "var(--line-strong)",
              transform: i === current ? "scale(1.2)" : "scale(1)",
            }}
            aria-label={`Go to slide ${i + 1}`}
          />
        ))}
      </div>
    </div>
  );
}

// This is the ENTIRE top-story experience below 640px — Home swaps the §4
// card out for this carousel — so it carries the same composition: eyebrow,
// display headline, dek, mono meta line, over the spec's scrim. The only
// deliberate divergence is that the headline and dek are clamped, because
// the slide is a fixed 300px (spec §7) and has to leave room for the dots.
function CarouselSlide({ article, active }: { article: Article; active: boolean }) {
  const imageUrl = getArticleImage(article, "featured");
  const flag = COUNTRY_FLAGS[article.country ?? ""] ?? "🌍";
  const dateStr = article.publishedDate
    ? formatDistanceToNow(new Date(article.publishedDate), { addSuffix: true })
    : "";
  const isBreaking = isBreakingStory(article);

  return (
    <Link
      href={`/article/${article.id}`}
      className="an-carousel-slide"
      style={{ pointerEvents: active ? "auto" : "none" }}
    >
      <img
        src={imageUrl}
        alt=""
        className="an-carousel-img"
        loading="eager"
        onError={e => {
          e.currentTarget.style.display = "none";
        }}
      />
      <div className="an-carousel-overlay" />
      <div className="an-carousel-content">
        {/* Spec §4: --live when breaking, --accent for a standard category */}
        <span
          className="an-carousel-eyebrow"
          style={{ color: isBreaking ? "var(--live)" : "var(--accent)" }}
        >
          {isBreaking ? "Breaking" : article.category}
        </span>
        {/* No dek here, unlike the §4 desktop card. The spec's scrim only
            reaches full strength at the very bottom, which is fine over
            380px but leaves a dek sitting on bright image detail at 300px —
            it tested unreadable over busy photos. Dropping the least
            essential element beat weakening a scrim value the spec fixes. */}
        <h2 className="an-carousel-title line-clamp-3">
          {truncateToWord(article.title, 110)}
        </h2>
        <div className="an-carousel-meta">
          <span>{flag} {article.country}</span>
          <span>·</span>
          <span>{dateStr}</span>
        </div>
      </div>
    </Link>
  );
}
