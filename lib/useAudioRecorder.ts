"use client";

import { useRef, useState } from "react";

export function useAudioRecorder() {
  const [recording, setRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [error, setError] = useState<string | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  async function start() {
    setError(null);
    setAudioBlob(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      chunksRef.current = [];
      const recorder = new MediaRecorder(stream);
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };
      recorder.onstop = () => {
        setAudioBlob(new Blob(chunksRef.current, { type: recorder.mimeType || "audio/webm" }));
        stream.getTracks().forEach((t) => t.stop());
      };
      recorder.start();
      mediaRecorderRef.current = recorder;
      setRecording(true);
    } catch {
      setError("마이크 권한이 필요해요. 브라우저 설정에서 마이크 접근을 허용해주세요.");
    }
  }

  function stop() {
    mediaRecorderRef.current?.stop();
    setRecording(false);
  }

  function reset() {
    setAudioBlob(null);
    setError(null);
  }

  return { recording, audioBlob, error, start, stop, reset };
}
