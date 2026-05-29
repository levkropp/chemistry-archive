import BrowseClient from "@/components/BrowseClient";
import { videos, allTagValues } from "@/lib/data";
import { TAG_CATEGORIES, type TagCategory } from "@/lib/types";

export default function Home() {
  const sorted = [...videos].sort((a, b) =>
    b.upload_date.localeCompare(a.upload_date)
  );

  const tagIndex = Object.fromEntries(
    TAG_CATEGORIES.map((cat) => [cat, allTagValues(cat)])
  ) as Record<TagCategory, string[]>;

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Browse the archive</h1>
        <p className="text-sm text-zinc-500 mt-1">
          {videos.length} videos · filter by reaction, reagent, product, equipment, technique or concept
        </p>
      </div>
      <BrowseClient videos={sorted} tagIndex={tagIndex} />
    </div>
  );
}
