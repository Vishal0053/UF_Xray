const Parser = require('rss-parser');
const parser = new Parser({ timeout: 10000 });

// 4 hours cache
const CACHE_TTL_MS = 4 * 60 * 60 * 1000;
let cache = { items: [], fetchedAt: 0 };

const FEEDS = [
  { name: 'KrebsOnSecurity', url: 'https://krebsonsecurity.com/feed/' },
  { name: 'The Hacker News', url: 'https://thehackernews.com/feeds/posts/default?alt=rss' },
  { name: 'BleepingComputer', url: 'https://www.bleepingcomputer.com/feed/' },
  { name: 'CISA Advisories', url: 'https://www.cisa.gov/cybersecurity-advisories/all.xml' },
];

function pickImageFromItem(item) {
  try {
    // 1) enclosure
    if (item.enclosure && item.enclosure.url) {
      const url = item.enclosure.url;
      const et = (item.enclosure.type || '').toLowerCase();
      if (et.startsWith('image')) return url;
      if (/\.(png|jpe?g|gif|webp|svg)(\?|$)/i.test(url)) return url;
    }
    // 2) media:content or media:thumbnail
    const mediaContent = item['media:content'] || item['media:thumbnail'];
    if (mediaContent) {
      if (Array.isArray(mediaContent)) {
        for (const m of mediaContent) {
          const url = (m.url || m['$']?.url);
          if (url && /\.(png|jpe?g|gif|webp|svg)(\?|$)/i.test(url)) return url;
        }
      } else {
        const url = mediaContent.url || mediaContent['$']?.url;
        if (url && /\.(png|jpe?g|gif|webp|svg)(\?|$)/i.test(url)) return url;
      }
    }
    // 3) content or content:encoded <img src="...">
    const html = item['content:encoded'] || item.content || '';
    const m = /<img[^>]+src=["']([^"'>]+)["']/i.exec(html);
    if (m && m[1]) return m[1];
  } catch (_) {}
  // fallback
  return 'https://source.unsplash.com/featured/800x450?cyber,security,hacking,news';
}

async function fetchAll() {
  const results = [];
  for (const feed of FEEDS) {
    try {
      const data = await parser.parseURL(feed.url);
      for (const item of (data.items || [])) {
        const pub = item.isoDate || item.pubDate || null;
        const imageUrl = pickImageFromItem(item);
        results.push({
          title: item.title || '(no title)',
          link: item.link,
          source: feed.name,
          publishedAt: pub ? new Date(pub).toISOString() : null,
          summary: item.contentSnippet || item.summary || '',
          imageUrl,
        });
      }
    } catch (e) {
      // skip feed errors
    }
  }
  // sort by date desc
  results.sort((a, b) => {
    const ta = a.publishedAt ? Date.parse(a.publishedAt) : 0;
    const tb = b.publishedAt ? Date.parse(b.publishedAt) : 0;
    return tb - ta;
  });
  return results;
}

async function getNews(limit = 20) {
  const now = Date.now();
  if (cache.items.length && (now - cache.fetchedAt) < CACHE_TTL_MS) {
    return cache.items.slice(0, limit);
  }
  const items = await fetchAll();
  cache = { items, fetchedAt: now };
  return items.slice(0, limit);
}

module.exports = { getNews };
