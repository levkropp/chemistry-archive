import BrowseClient from "@/components/BrowseClient";
import { videos, browseVideos, allTagValues } from "@/lib/data";
import { TAG_CATEGORIES, type TagCategory } from "@/lib/types";

export default function Home() {
  const sorted = [...browseVideos].sort((a, b) =>
    b.upload_date.localeCompare(a.upload_date)
  );

  const tagIndex = Object.fromEntries(
    TAG_CATEGORIES.map((cat) => [cat, allTagValues(cat)])
  ) as Record<TagCategory, string[]>;

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
        videos={sorted}
        tagIndex={tagIndex}
        topics={topics}
        channels={channels}
        languages={languages}
      />
    </div>
  );
}
