import Link from "next/link";
import Image from "next/image";
import { getAllPlaylists, getVideoById } from "@/lib/data";
import type { Playlist } from "@/lib/types";

const TYPE_LABELS: Record<Playlist["type"], string> = {
  reaction: "By Reaction Type",
  difficulty: "By Difficulty",
  channel: "By Channel",
  curated: "Curated",
};

const TYPE_ORDER: Playlist["type"][] = ["channel", "difficulty", "reaction", "curated"];

export const metadata = {
  title: "Playlists · Chemistry Archive",
};

export default function PlaylistsPage() {
  const playlists = getAllPlaylists();

  const grouped = TYPE_ORDER.map((type) => ({
    type,
    items: playlists.filter((p) => p.type === type),
  })).filter((g) => g.items.length > 0);

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Playlists</h1>
        <p className="text-sm text-zinc-500 mt-1">
          Auto-generated collections grouped by channel, difficulty, and reaction type
        </p>
      </div>

      {grouped.map(({ type, items }) => (
        <section key={type} className="flex flex-col gap-3">
          <h2 className="text-sm font-semibold uppercase tracking-widest text-zinc-500">
            {TYPE_LABELS[type]}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {items.map((pl) => (
              <PlaylistCard key={pl.slug} playlist={pl} />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}

function PlaylistCard({ playlist }: { playlist: Playlist }) {
  const thumbs = playlist.videoIds
    .slice(0, 4)
    .map((id) => getVideoById(id))
    .filter(Boolean);

  return (
    <Link
      href={`/playlist/${playlist.slug}/`}
      className="group rounded-xl border border-zinc-800 bg-zinc-900 overflow-hidden hover:border-emerald-500/60 transition-all"
    >
      <div className="grid grid-cols-2 aspect-video bg-zinc-800">
        {thumbs.map((v) => (
          <div key={v!.id} className="relative overflow-hidden">
            <Image
              src={v!.thumbnail}
              alt=""
              fill
              sizes="200px"
              className="object-cover"
              unoptimized
            />
          </div>
        ))}
      </div>
      <div className="p-3">
        <h3 className="font-semibold text-sm text-zinc-100 group-hover:text-emerald-300 transition-colors">
          {playlist.title}
        </h3>
        <p className="text-xs text-zinc-500 mt-0.5">{playlist.videoIds.length} videos</p>
      </div>
    </Link>
  );
}
