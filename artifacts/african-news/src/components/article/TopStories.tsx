import { useCallback, useState } from "react";
import { Link } from "wouter";
import { formatDistanceToNow, isValid } from "date-fns";
import { useListArticles, type Article } from "@workspace/api-client-react";
import { getArticleImage } from "@/lib/articleImage";
import { truncateToWord } from "@/lib/truncate";

// How many stories the card shows, how many newest stories it looks through to
// find that many with a picture, and the fewest it will show. Below the
// minimum the card is left out: a lead with one or two rows looks broken.
const SHOWN = 7;
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

interface TileProps {
  article: Article;
  onImageError: (id: number) => void;
}

function Lead({ article, onImageError }: TileProps) {
  const src = getArticleImage(article);
  return (
    <Link href={`/article/${article.id}`} className="an-top-lead">
      {src && (
        <img
          src={src}
          alt=""
          className="an-top-lead-img"
          referrerPolicy="no-referrer"
          onError={() => onImageError(article.id)}
        />
      )}
      <span className="an-top-lead-scrim" aria-hidden="true" />
      <span className="an-top-chip">{article.category}</span>
      <span className="an-top-lead-text">
        <span className="an-top-lead-headline" lang={article.language} dir="auto">
          {truncateToWord(article.title, 110)}
        </span>
        <span className="an-top-lead-facts">
          <Facts article={article} />
        </span>
      </span>
    </Link>
  );
}

function Row({ article, onImageError }: TileProps) {
  const src = getArticleImage(article);
  return (
    <li>
      <Link href={`/article/${article.id}`} className="an-top-row">
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

// The newest stories that have a picture, as a lead with six rows beside it.
//
// The API has no ranking signal (its top-stories list is the same newest-first
// query as the feed), so this does not claim to be "top": it says "latest".
// It looks through the newest 30 and keeps the first seven with an image. An
// image that then fails to load is dropped and the next story takes its place.
// These stories also appear in the feed below; that repeat is deliberate.
export function TopStories() {
  const { data, isLoading, isError } = useListArticles({ limit: LOOK_AT });
  const [failed, setFailed] = useState<ReadonlySet<number>>(new Set());
  const retire = useCallback((id: number) => {
    setFailed((prev) => (prev.has(id) ? prev : new Set(prev).add(id)));
  }, []);

  if (isLoading) {
    return <div className="an-top an-top--loading an-skeleton" aria-hidden="true" />;
  }
  if (isError) return null;

  const stories = (data?.articles ?? [])
    .filter((a) => getArticleImage(a) && !failed.has(a.id))
    .slice(0, SHOWN);
  if (stories.length < MINIMUM) return null;

  const [lead, ...rest] = stories;

  return (
    <section className="an-top" aria-labelledby="an-top-title">
      <header className="an-top-header">
        <h2 id="an-top-title" className="an-top-title">Latest stories</h2>
        <span className="an-top-caption">The newest {stories.length} with pictures</span>
      </header>
      <div className="an-top-body">
        <Lead article={lead} onImageError={retire} />
        <ul className="an-top-list">
          {rest.map((article) => (
            <Row key={article.id} article={article} onImageError={retire} />
          ))}
        </ul>
      </div>
    </section>
  );
}
