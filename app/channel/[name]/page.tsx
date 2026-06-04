import Link from "next/link";
import { notFound } from "next/navigation";
import { videos, browseVideos } from "@/lib/data";
import VideoGrid from "@/components/VideoGrid";

export function generateStaticParams() {
  const slugs = Array.from(new Set(videos.map((v) => v.channel_slug)));
  return slugs.map((name) => ({ name }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ name: string }>;
}) {
  const { name } = await params;
  const channel = videos.find((v) => v.channel_slug === name)?.channel ?? name;
  return { title: `${channel} · Chemistry Archive` };
}

export default async function ChannelPage({
  params,
}: {
  params: Promise<{ name: string }>;
}) {
  const { name } = await params;
  const channelVideos = browseVideos
    .filter((v) => v.channel_slug === name)
    .sort((a, b) => b.upload_date.localeCompare(a.upload_date));

  if (channelVideos.length === 0) notFound();

  const channel = channelVideos[0];

  return (
    <div className="flex flex-col gap-6">
      <Link href="/" className="text-sm text-zinc-500 hover:text-emerald-400 transition-colors w-fit">
        ← Back to browse
      </Link>

      <div>
        <h1 className="text-2xl font-bold tracking-tight">{channel.channel}</h1>
        <div className="flex items-center gap-3 text-sm text-zinc-500 mt-1">
          <span>{channelVideos.length} videos archived</span>
          {channel.channel_url && (
            <a
              href={channel.channel_url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-red-400 hover:text-red-300 transition-colors"
            >
              ↗ YouTube channel
            </a>
          )}
        </div>
      </div>

      <VideoGrid videos={channelVideos} />
    </div>
  );
}
