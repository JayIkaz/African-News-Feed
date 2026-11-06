import { useCallback, useEffect, useState } from "react";
import { Link } from "wouter";
import { formatDistanceToNow, isValid } from "date-fns";
import { ChevronLeft, ChevronRight, Pause, Play } from "lucide-react";
import { getListArticlesQueryKey, useListArticles, type Article } from "@workspace/api-client-react";
import { LIVE_LIST } from "@/lib/liveQuery";
import { getArticleImage } from "@/lib/articleImage";
import { truncateToWord } from "@/lib/truncate";
import { resolveActive, stepIndex } from "@/lib/rotation";
import { useMediaQuery } from "@/lib/useMediaQuery";

// How many stories the card rotates through, how many newest stories it looks
// through to find that many with a picture, and the fewest it will show. Six
// rows fill the same height as the lead tile, so the card is the size it was
// when it showed a lead and six rows. Below the minimum the card is left out:
// a lead with one or two rows looks broken.
const SHOWN = 6;
const LOOK_AT = 30;
const MINIMUM = 3;

function whenText(article: Article): string | null {
  const published = article.publishedDate ? new Date(article.publishedDate) : null;
  return published && isValid(published) ? formatDistanceToNow(published, { addSuffix: true }) : null;
}

// "Source · Country · 2 days ago", the facts line under each headline.
function Facts({ article }: { article: Article }) {
  const parts = [article.sourceName, article.country, whenText(article)].filter(Boolean);
  return <>{parts.join(" · ")}</>;
}

interface RowProps {
  article: Article;
  active: boolean;
  onImageError: (id: number) => void;
}

// The lead tile for the story on show. Every story's picture is stacked inside
// it and only the active one is visible, so the next picture is already loaded
// when its turn comes and the change is a cross-fade, not a blank tile. The
// pictures are decoration: the link's name is the headline.
//
// The rotation is driven by the progress bar along the tile's bottom edge. The
// bar is a CSS animation that lasts one interval (see --an-top-interval in
// index.css) and when it ends the card moves to the next story. Pausing the
// animation, which hovering or keyboard focus does in CSS, therefore pauses the
// rotation with it, and resuming carries on from where it stopped. When the bar
// is not drawn (paused by the reader, or the visitor asked for reduced motion)
// nothing rotates.
function Lead({
  stories,
  index,
  moved,
  autoplay,
  onAdvance,
  onImageError,
}: {
  stories: Article[];
  index: number;
  moved: boolean;
  autoplay: boolean;
  onAdvance: () => void;
  onImageError: (id: number) => void;
}) {
  const article = stories[index];
  return (
    <div
      className={`an-top-stage${moved ? " is-moved" : ""}`}
      role="group"
      aria-roledescription="slide"
      aria-label={`${index + 1} of ${stories.length}`}
      aria-live={autoplay ? "off" : "polite"}
    >
      <Link href={`/article/${article.id}`} className="an-top-lead">
        {stories.map((story, i) => (
          <img
            key={story.id}
            src={getArticleImage(story) ?? undefined}
            alt=""
            className={`an-top-lead-img${i === index ? " is-active" : ""}`}
            loading={i === 0 ? undefined : "lazy"}
            referrerPolicy="no-referrer"
            onError={() => onImageError(story.id)}
          />
        ))}
        <span className="an-top-lead-scrim" aria-hidden="true" />
        <span key={`chip-${article.id}`} className="an-top-chip">{article.category}</span>
        <span key={`text-${article.id}`} className="an-top-lead-text">
          <span className="an-top-lead-headline" lang={article.language} dir="auto">
            {truncateToWord(article.title, 110)}
          </span>
          <span className="an-top-lead-facts">
            <Facts article={article} />
          </span>
        </span>
        {autoplay && (
          <span className="an-top-progress" aria-hidden="true">
            <span key={article.id} className="an-top-progress-fill" onAnimationEnd={onAdvance} />
          </span>
        )}
      </Link>
    </div>
  );
}

function Row({ article, active, onImageError }: RowProps) {
  const src = getArticleImage(article);
  return (
    <li>
      <Link
        href={`/article/${article.id}`}
        className={`an-top-row${active ? " is-active" : ""}`}
        aria-current={active ? "true" : undefined}
      >
        <span className="an-top-thumb">
          {src && (
            <img
              src={src}
              alt=""
              loading="lazy"
              referrerPolicy="no-referrer"
              onError={() => onImageError(article.id)}
            />
          )}
        </span>
        <span className="an-top-row-text">
          <span className="an-top-row-headline" lang={article.language} dir="auto">
            {truncateToWord(article.title, 100)}
          </span>
          <span className="an-top-row-facts">
            <Facts article={article} />
          </span>
        </span>
      </Link>
    </li>
  );
}

// The newest stories that have a picture. One is shown large and the card moves
// through them, every few seconds, with the others listed beside it.
//
// The API has no ranking signal (its top-stories list is the same newest-first
// query as the feed), so this does not claim to be "top": it says "latest".
// It looks through the newest 30 and keeps the first six with an image. An
// image that then fails to load is dropped and the next story takes its place.
// These stories also appear in the feed below; that repeat is deliberate.
//
// The list keeps its order while the lead rotates, and the row for the story on
// show is marked, so nothing in the list jumps about. The story on show is
// tracked by id: the list is fetched again every five minutes, and a story that
// arrives at the front must not change what the reader is looking at.
//
// The rotation stops for a reader who has pressed pause, while the pointer is
// over the card or keyboard focus is inside it (both in CSS), and for visitors
// who have asked for reduced motion, who can still use the previous and next
// buttons.
export function TopStories() {
  const { data, isLoading, isError } = useListArticles(
    { limit: LOOK_AT },
    { query: { queryKey: getListArticlesQueryKey({ limit: LOOK_AT }), ...LIVE_LIST } },
  );
  const [failed, setFailed] = useState<ReadonlySet<number>>(new Set());
  const retire = useCallback((id: number) => {
    setFailed((prev) => (prev.has(id) ? prev : new Set(prev).add(id)));
  }, []);

  const reducedMotion = useMediaQuery("(prefers-reduced-motion: reduce)");
  const [userPaused, setUserPaused] = useState(false);
  const [moved, setMoved] = useState(false);
  const [cursor, setCursor] = useState<{ id: number | null; index: number }>({ id: null, index: 0 });

  const stories = (data?.articles ?? [])
    .filter((a) => getArticleImage(a) && !failed.has(a.id))
    .slice(0, SHOWN);
  const index = resolveActive(
    stories.map((a) => a.id),
    cursor.id,
    cursor.index,
  );
  const currentId = stories[index]?.id ?? null;

  // Keep the cursor on what is shown, so that if the story on show later drops
  // out of the list the reader keeps their place.
  useEffect(() => {
    if (currentId !== null && (cursor.id !== currentId || cursor.index !== index)) {
      setCursor({ id: currentId, index });
    }
  }, [currentId, index, cursor.id, cursor.index]);

  const go = useCallback(
    (delta: 1 | -1) => {
      const next = stepIndex(index, stories.length, delta);
      setMoved(true);
      setCursor({ id: stories[next]?.id ?? null, index: next });
    },
    [index, stories],
  );

  if (isLoading) {
    return <div className="an-top an-top--loading an-skeleton" aria-hidden="true" />;
  }
  if (isError) return null;
  if (stories.length < MINIMUM) return null;

  const autoplay = !reducedMotion && !userPaused;

  return (
    <section
      className="an-top"
      aria-labelledby="an-top-title"
      aria-roledescription="carousel"
    >
      <header className="an-top-header">
        <h2 id="an-top-title" className="an-top-title">Latest stories</h2>
        <div className="an-top-controls">
          <span className="an-top-count" aria-hidden="true">
            {index + 1} / {stories.length}
          </span>
          <button type="button" className="an-top-btn" aria-label="Previous story" onClick={() => go(-1)}>
            <ChevronLeft size={18} aria-hidden="true" />
          </button>
          <button type="button" className="an-top-btn" aria-label="Next story" onClick={() => go(1)}>
            <ChevronRight size={18} aria-hidden="true" />
          </button>
          {!reducedMotion && (
            <button
              type="button"
              className="an-top-btn"
              aria-label={userPaused ? "Start rotating stories" : "Pause rotating stories"}
              onClick={() => setUserPaused((paused) => !paused)}
            >
              {userPaused ? <Play size={16} aria-hidden="true" /> : <Pause size={16} aria-hidden="true" />}
            </button>
          )}
        </div>
      </header>
      <div className="an-top-body">
        <Lead
          stories={stories}
          index={index}
          moved={moved}
          autoplay={autoplay}
          onAdvance={() => go(1)}
          onImageError={retire}
        />
        <ul className="an-top-list">
          {stories.map((article, i) => (
            <Row key={article.id} article={article} active={i === index} onImageError={retire} />
          ))}
        </ul>
      </div>
    </section>
  );
}
