import BrowseClient from "@/components/BrowseClient";
import { videos, topTagValues, tagValueCount } from "@/lib/data";
import { TAG_CATEGORIES, type TagCategory } from "@/lib/types";

// Cap how many values per tag category appear as sidebar filter chips. Some
// categories have thousands of near-unique values; the long tail stays reachable
// via the search box (which matches every tag value).
const FACET_LIMIT = 50;

export default function Home() {
  // Only small facet data is computed at build time and passed to the client.
  // The video records themselves are fetched lazily by BrowseClient from a
  // static index asset, so they are never inlined into this page's HTML.
  const tagIndex = Object.fromEntries(
    TAG_CATEGORIES.map((cat) => [cat, topTagValues(cat, FACET_LIMIT)])
  ) as Record<TagCategory, string[]>;

  // True number of distinct values per category, so the sidebar can show "(N)"
  // and signal when the list is truncated to the most common values.
  const tagTotals = Object.fromEntries(
    TAG_CATEGORIES.map((cat) => [cat, tagValueCount(cat)])
  ) as Record<TagCategory, number>;

  // Distinct topics (sorted, chemistry first)
  const topicSet = new Set<string>();
  videos.forEach((v) => v.topics.forEach((t) => topicSet.add(t)));
  const topics = Array.from(topicSet).sort((a, b) =>
    a === "chemistry" ? -1 : b === "chemistry" ? 1 : a.localeCompare(b)
  );

  // Distinct channels
  const channelMap = new Map<string, string>();
  videos.forEach((v) => channelMap.set(v.channel_slug, v.channel));
  const channels = Array.from(channelMap, ([slug, name]) => ({ slug, name })).sort(
    (a, b) => a.name.localeCompare(b.name)
  );

  // Distinct languages (English first)
  const langSet = new Set<string>();
  videos.forEach((v) => v.language && langSet.add(v.language));
  const languages = Array.from(langSet).sort((a, b) =>
    a === "English" ? -1 : b === "English" ? 1 : a.localeCompare(b)
  );

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Browse the archive</h1>
        <p className="text-sm text-zinc-500 mt-1">
          {videos.length} videos across {channels.length} channels · filter by topic,
          channel, reaction, reagent, product, equipment, technique, concept &amp; difficulty
        </p>
      </div>
      <BrowseClient
        tagIndex={tagIndex}
        tagTotals={tagTotals}
        topics={topics}
        channels={channels}
        languages={languages}
      />
    </div>
  );
}
