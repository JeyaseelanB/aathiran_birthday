"use client";

import { useEffect, useRef, useState } from "react";
import Modal from "@/components/ui/Modal";
import type { MonthVideo } from "@/data/media";

type VideoModalProps = {
  video: MonthVideo | null;
  onClose: () => void;
};

export default function VideoModal({ video, onClose }: VideoModalProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [failed, setFailed] = useState(false);

  // Pause and rewind whenever the modal closes or switches videos.
  useEffect(() => {
    setFailed(false);
    const element = videoRef.current;
    return () => {
      element?.pause();
    };
  }, [video]);

  return (
    <Modal
      open={video !== null}
      onClose={onClose}
      label={video ? `Video: ${video.title}` : "Video player"}
      panelClassName="max-w-3xl bg-ink p-3 shadow-2xl sm:p-4"
    >
      {video && (
        <div>
          <div className="relative aspect-video w-full overflow-hidden rounded-[1.5rem] bg-black">
            {failed ? (
              <div className="flex h-full flex-col items-center justify-center gap-2 px-6 text-center text-white/80">
                <span className="text-3xl" aria-hidden="true">
                  🎬
                </span>
                <p className="text-sm font-semibold">
                  Drop your clip at{" "}
                  <code className="rounded bg-white/15 px-1.5 py-0.5">{video.src}</code>{" "}
                  to play it here.
                </p>
              </div>
            ) : (
              <video
                ref={videoRef}
                src={video.src}
                poster={video.poster ?? undefined}
                controls
                autoPlay
                playsInline
                preload="none"
                onError={() => setFailed(true)}
                className="h-full w-full"
              >
                Your browser does not support embedded video.
              </video>
            )}
          </div>

          <div className="px-2 py-3 text-white">
            <h3 className="font-display text-lg font-extrabold sm:text-xl">{video.title}</h3>
            <p className="mt-1 text-sm text-white/70">{video.description}</p>
          </div>
        </div>
      )}
    </Modal>
  );
}
