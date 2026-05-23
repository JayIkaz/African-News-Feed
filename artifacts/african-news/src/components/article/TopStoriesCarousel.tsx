import { useState, useRef } from "react";
import { Link } from "wouter";
import { formatDistanceToNow } from "date-fns";
import { Article } from "@workspace/api-client-react";
import { getArticleImage } from "@/lib/unsplash";
import { COUNTRY_FLAGS } from "@/lib/countries";
import { CAT_COLORS } from "./ArticleCard";

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
              background: i === current ? "#fff" : "rgba(255,255,255,0.4)",
              transform: i === current ? "scale(1.2)" : "scale(1)",
            }}
            aria-label={`Go to slide ${i + 1}`}
          />
        ))}
      </div>
    </div>
  );
}

function CarouselSlide({ article, active }: { article: Article; active: boolean }) {
  const imageUrl = getArticleImage(article, "featured");
  const flag = COUNTRY_FLAGS[article.country ?? ""] ?? "🌍";
  const catColor = CAT_COLORS[article.category ?? "General"] ?? "#5a5750";
  const dateStr = article.publishedDate
    ? formatDistanceToNow(new Date(article.publishedDate), { addSuffix: true })
    : "";

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
        <span
          className="an-carousel-cat"
          style={{ background: catColor }}
        >
          {article.category}
        </span>
        <h2 className="an-carousel-title">{article.title}</h2>
        <div className="an-carousel-meta">
          <span>{flag} {article.country}</span>
          <span>·</span>
          <span>{dateStr}</span>
        </div>
      </div>
    </Link>
  );
}
