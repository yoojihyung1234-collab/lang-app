"use client";

import { useEffect, useMemo } from "react";
import { useAudioRecorder } from "@/lib/useAudioRecorder";

type Props = {
  onRecorded: (blob: Blob) => void;
};

export default function Recorder({ onRecorded }: Props) {
  const { recording, audioBlob, error, start, stop, reset } = useAudioRecorder();

  useEffect(() => {
    if (audioBlob) onRecorded(audioBlob);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [audioBlob]);

  const url = useMemo(() => (audioBlob ? URL.createObjectURL(audioBlob) : null), [audioBlob]);

  return (
    <div className="flex flex-col items-center gap-3">
      {error && <p className="text-xs text-bad text-center">{error}</p>}

      {!audioBlob ? (
        <button
          onClick={recording ? stop : start}
          className={`w-16 h-16 rounded-full flex items-center justify-center text-white text-xl ${
            recording ? "bg-bad" : "bg-ink"
          }`}
          aria-label={recording ? "녹음 중지" : "녹음 시작"}
        >
          {recording ? "■" : "●"}
        </button>
      ) : (
        <div className="flex flex-col items-center gap-2">
          {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
          <audio src={url ?? undefined} controls className="w-64" />
          <button onClick={reset} className="text-xs text-ink/50 hover:text-ink">
            다시 녹음
          </button>
        </div>
      )}
    </div>
  );
}
