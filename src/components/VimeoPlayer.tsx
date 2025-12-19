'use client';

interface VimeoPlayerProps {
  vimeoId: string;
  title?: string;
}

export default function VimeoPlayer({ vimeoId, title }: VimeoPlayerProps) {
  return (
    <div className="relative w-full aspect-video rounded-xl overflow-hidden bg-zinc-900 shadow-2xl">
      <iframe
        src={`https://player.vimeo.com/video/${vimeoId}?h=8272103f6e&title=0&byline=0&portrait=0`}
        className="absolute inset-0 w-full h-full"
        frameBorder="0"
        allow="autoplay; fullscreen; picture-in-picture"
        allowFullScreen
        title={title || 'Видео рецепта'}
      />
    </div>
  );
}

