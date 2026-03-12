import { Article } from "@workspace/api-client-react";

const IMAGE_COLLECTIONS: Record<string, string[]> = {
  Politics: [
    "https://images.unsplash.com/photo-1541872516-6814c46f17ed?w=800&q=80&fit=crop",
    "https://images.unsplash.com/photo-1529107386315-e1a2ed48a620?w=800&q=80&fit=crop",
    "https://images.unsplash.com/photo-1572949645841-094f3a9c4c94?w=800&q=80&fit=crop"
  ],
  Business: [
    "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&q=80&fit=crop",
    "https://images.unsplash.com/photo-1556761175-4b46a572b786?w=800&q=80&fit=crop",
    "https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=800&q=80&fit=crop"
  ],
  Technology: [
    "https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&q=80&fit=crop",
    "https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?w=800&q=80&fit=crop",
    "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=800&q=80&fit=crop"
  ],
  Economy: [
    "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800&q=80&fit=crop",
    "https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?w=800&q=80&fit=crop",
    "https://images.unsplash.com/photo-1535320903710-d9938e7aebb3?w=800&q=80&fit=crop"
  ],
  Society: [
    "https://images.unsplash.com/photo-1511632765486-a01980e01a18?w=800&q=80&fit=crop",
    "https://images.unsplash.com/photo-1517486808906-6ca8b3f04846?w=800&q=80&fit=crop",
    "https://images.unsplash.com/photo-1529156069898-49953eb1f5bc?w=800&q=80&fit=crop"
  ],
  Environment: [
    "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800&q=80&fit=crop",
    "https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800&q=80&fit=crop",
    "https://images.unsplash.com/photo-1472214103451-9374bd1c798e?w=800&q=80&fit=crop"
  ],
  International: [
    "https://images.unsplash.com/photo-1521295121783-8a321d551ad2?w=800&q=80&fit=crop",
    "https://images.unsplash.com/photo-1494522855154-9297ac14b55f?w=800&q=80&fit=crop",
    "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&q=80&fit=crop"
  ],
  Generic: [
    "https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=800&q=80&fit=crop",
    "https://images.unsplash.com/photo-1495020689067-958852a7765e?w=800&q=80&fit=crop",
    "https://images.unsplash.com/photo-1585829365295-ab7cd400c167?w=800&q=80&fit=crop"
  ]
};

/**
 * Provides a deterministic placeholder image based on the article category and ID
 */
export function getArticleImage(article: Article): string {
  const cat = article.category || 'Generic';
  const collection = IMAGE_COLLECTIONS[cat] || IMAGE_COLLECTIONS['Generic'];
  const index = article.id % collection.length;
  return collection[index];
}
