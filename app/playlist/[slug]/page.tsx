import Link from "next/link";
import { notFound } from "next/navigation";
import { getAllPlaylists, browseVideos } from "@/lib/data";
import VideoGrid from "@/components/VideoGrid";

export function generateStaticParams() {
  return getAllPlaylists().map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const pl = getAllPlaylists().find((p) => p.slug === slug);
  return { title: pl ? `${pl.title} · Chemistry Archive` : "Playlist" };
}

export default async function PlaylistPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const playlist = getAllPlaylists().find((p) => p.slug === slug);
  if (!playlist) notFound();

  const byId = new Map(browseVideos.map((v) => [v.id, v]));
  const playlistVideos = playlist.videoIds
    .map((id) => byId.get(id))
    .filter((v): v is NonNullable<typeof v> => Boolean(v));

  const totalSecs = playlistVideos.reduce((sum, v) => sum + (v.duration || 0), 0);
  const totalMins = Math.round(totalSecs / 60);

  return (
    <div className="flex flex-col gap-6">
      <Link href="/playlists/" className="text-sm text-zinc-500 hover:text-emerald-400 transition-colors w-fit">
        ← All playlists
      </Link>

      <div>
        <h1 className="text-2xl font-bold tracking-tight">{playlist.title}</h1>
        <p className="text-sm text-zinc-500 mt-1">
          {playlist.description} · {playlistVideos.length} videos
          {totalMins > 0 && <> · ~{totalMins} min total</>}
        </p>
      </div>

      <VideoGrid videos={playlistVideos} />
    </div>
  );
}
