"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { Heart, Music4, Pause, Play } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { incrementHomeMusicLikeCount, incrementHomeMusicPlayCount } from "@/lib/api";
import type { HomeMusic } from "@/types";

interface HomeMusicPlayerProps {
  music?: HomeMusic | null;
}

type MusicPayload = HomeMusic & {
  cover_url?: string;
  file_url?: string;
  duration_seconds?: number;
  play_count?: number;
  like_count?: number;
};

function formatTime(totalSeconds: number) {
  if (!Number.isFinite(totalSeconds) || totalSeconds <= 0) {
    return "00:00";
  }

  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = Math.floor(totalSeconds % 60);

  if (hours > 0) {
    return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
  }

  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

function formatCount(value: number) {
  if (!Number.isFinite(value) || value <= 0) {
    return "0";
  }
  return new Intl.NumberFormat("zh-CN").format(value);
}

export function HomeMusicPlayer({ music }: HomeMusicPlayerProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const hasReportedPlayRef = useRef(false);
  const musicPayload = music as MusicPayload | null | undefined;
  const coverSrc = musicPayload?.coverUrl || musicPayload?.cover_url || "";
  const audioSrc = musicPayload?.fileUrl || musicPayload?.file_url || "";
  const initialDuration = musicPayload?.durationSeconds ?? musicPayload?.duration_seconds ?? 0;
  const initialPlayCount = musicPayload?.playCount ?? musicPayload?.play_count ?? 0;
  const initialLikeCount = musicPayload?.likeCount ?? musicPayload?.like_count ?? 0;

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(initialDuration);
  const [playCount, setPlayCount] = useState(initialPlayCount);
  const [likeCount, setLikeCount] = useState(initialLikeCount);
  const [likePending, setLikePending] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [coverLoadFailed, setCoverLoadFailed] = useState(false);

  useEffect(() => {
    const audio = audioRef.current;
    if (audio) {
      audio.pause();
      audio.currentTime = 0;
    }

    setIsPlaying(false);
    setCurrentTime(0);
    setDuration(initialDuration);
    setPlayCount(initialPlayCount);
    setLikeCount(initialLikeCount);
    setLikePending(false);
    setErrorMessage("");
    setCoverLoadFailed(false);
    hasReportedPlayRef.current = false;
  }, [initialDuration, initialLikeCount, initialPlayCount, music?.id, coverSrc]);

  const progressMax = Math.max(duration, 1);
  const progressValue = Math.min(currentTime, progressMax);
  const progressPercent = duration > 0 ? Math.min((progressValue / duration) * 100, 100) : 0;

  const progressBackground = `linear-gradient(to right, rgba(96, 216, 206, 0.96) 0%, rgba(96, 216, 206, 0.96) ${progressPercent}%, rgba(255, 255, 255, 0.5) ${progressPercent}%, rgba(255, 255, 255, 0.5) 100%)`;
  const darkProgressBackground = `linear-gradient(to right, rgba(118, 221, 211, 0.96) 0%, rgba(118, 221, 211, 0.96) ${progressPercent}%, rgba(51, 65, 85, 0.92) ${progressPercent}%, rgba(51, 65, 85, 0.92) 100%)`;

  const handleTogglePlay = async () => {
    const audio = audioRef.current;
    if (!audio || !audioSrc) {
      return;
    }

    setErrorMessage("");

    if (audio.paused) {
      try {
        await audio.play();
      } catch {
        setErrorMessage("Audio playback failed. Check the OSS URL or browser playback policy.");
      }
      return;
    }

    audio.pause();
  };

  const handleLoadedMetadata = () => {
    const audio = audioRef.current;
    if (!audio || !Number.isFinite(audio.duration)) {
      return;
    }
    setDuration(Math.floor(audio.duration));
  };

  const handleTimeUpdate = () => {
    const audio = audioRef.current;
    if (!audio) {
      return;
    }
    setCurrentTime(audio.currentTime);
  };

  const handleSeekChange = (value: number) => {
    const audio = audioRef.current;
    if (!audio) {
      return;
    }
    audio.currentTime = value;
    setCurrentTime(value);
  };

  const handleAudioPlay = () => {
    setIsPlaying(true);

    if (!music?.id || hasReportedPlayRef.current) {
      return;
    }

    hasReportedPlayRef.current = true;
    void incrementHomeMusicPlayCount(music.id)
      .then((payload) => {
        const nextPayload = payload as MusicPayload;
        setPlayCount(nextPayload.playCount ?? nextPayload.play_count ?? initialPlayCount);
      })
      .catch(() => {
        hasReportedPlayRef.current = false;
      });
  };

  const handleLike = () => {
    if (!music?.id || likePending) {
      return;
    }

    const previousCount = likeCount;
    setLikePending(true);
    setLikeCount(previousCount + 1);

    void incrementHomeMusicLikeCount(music.id)
      .then((payload) => {
        const nextPayload = payload as MusicPayload;
        setLikeCount(nextPayload.likeCount ?? nextPayload.like_count ?? previousCount + 1);
      })
      .catch(() => {
        setLikeCount(previousCount);
      })
      .finally(() => {
        setLikePending(false);
      });
  };

  return (
    <div className="flex items-center gap-4">
      <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-full border border-white/75 bg-[#c7f1eb] shadow-[0_16px_28px_-22px_rgba(91,180,177,0.4)] transition-transform duration-300 group-hover:scale-[0.96] dark:border-white/10 dark:bg-[#123841]">
        {coverSrc && !coverLoadFailed ? (
          <Image
            src={coverSrc}
            alt={`${music?.title ?? "Home Player"} cover`}
            fill
            sizes="48px"
            className="object-cover"
            unoptimized
            onError={() => setCoverLoadFailed(true)}
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-[#4cc8c2] dark:text-[#76ddd3]">
            <Music4 className="h-5 w-5" />
          </div>
        )}
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="home-card-title truncate text-[1rem] md:text-[1.06rem]">
              {music?.title ?? "Home Player"}
            </p>
            <p className="home-card-meta truncate text-[0.78rem] md:text-[0.8rem]">
              {music?.artist ?? "Upload and publish a track to enable the live player here."}
            </p>
          </div>

          {music ? (
            <motion.button
              type="button"
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              onClick={handleLike}
              disabled={likePending}
              className="home-button-text inline-flex h-9 shrink-0 items-center gap-1.5 rounded-full border border-white/75 bg-white/72 px-3 text-[0.78rem] text-[#d78aa8] shadow-[0_14px_26px_-24px_rgba(180,113,145,0.55)] transition-all duration-300 hover:border-[#f4b4c6]/70 hover:bg-[#fff2f6] hover:text-[#cb6f96] disabled:cursor-wait disabled:opacity-80 dark:border-white/10 dark:bg-[#111827]/88 dark:text-[#f3a9bf] dark:hover:border-[#fb9ab5]/40 dark:hover:bg-[#1a1220] dark:hover:text-[#ffc0d1]"
              aria-label="Like current track"
            >
              <Heart className="h-3.5 w-3.5 fill-current" />
              <span>{formatCount(likeCount)}</span>
            </motion.button>
          ) : null}
        </div>

        <div className="home-card-meta home-number-text mt-2 flex items-center justify-between gap-3 text-[0.72rem] md:text-[0.75rem]">
          <span className="truncate">{music ? `Plays ${formatCount(playCount)}` : "Waiting for music data"}</span>
          <span className="shrink-0">
            {formatTime(progressValue)} / {formatTime(duration)}
          </span>
        </div>

        <div className="mt-2">
          <input
            type="range"
            min={0}
            max={progressMax}
            step={1}
            value={progressValue}
            onChange={(event) => handleSeekChange(Number(event.target.value))}
            disabled={!audioSrc}
            className="music-progress w-full cursor-pointer disabled:cursor-not-allowed disabled:opacity-60"
            style={{
              ["--music-progress" as string]: progressBackground,
              ["--music-progress-dark" as string]: darkProgressBackground
            }}
            aria-label="Seek music progress"
          />
        </div>

        {errorMessage ? (
          <p className="home-card-meta mt-1.5 text-[0.72rem] font-medium leading-6 text-rose-500 dark:text-rose-300">{errorMessage}</p>
        ) : null}
      </div>

      <motion.button
        type="button"
        whileTap={{ scale: 0.92 }}
        onClick={handleTogglePlay}
        disabled={!audioSrc}
        className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-white/82 text-[#51cbc4] shadow-[0_16px_28px_-22px_rgba(91,180,177,0.7)] transition-all duration-300 hover:-translate-y-0.5 hover:scale-[1.04] disabled:cursor-not-allowed disabled:opacity-60 active:shadow-[0_10px_22px_-18px_rgba(91,180,177,0.52)] dark:border dark:border-white/10 dark:bg-[#0f172a] dark:text-[#76ddd3] dark:shadow-[0_18px_30px_-20px_rgba(2,6,23,0.86)] dark:hover:bg-[#162033]"
        aria-label={isPlaying ? "Pause current track" : "Play current track"}
      >
        {isPlaying ? <Pause className="h-5 w-5 fill-current" /> : <Play className="ml-0.5 h-5 w-5 fill-current" />}
      </motion.button>

      <audio
        ref={audioRef}
        src={audioSrc || undefined}
        preload="metadata"
        onLoadedMetadata={handleLoadedMetadata}
        onTimeUpdate={handleTimeUpdate}
        onPlay={handleAudioPlay}
        onPause={() => setIsPlaying(false)}
        onEnded={() => {
          const audio = audioRef.current;
          setIsPlaying(false);
          setCurrentTime(audio && Number.isFinite(audio.duration) ? audio.duration : duration);
        }}
        onError={() => {
          setIsPlaying(false);
          setErrorMessage("Audio loading failed. Check the OSS URL, bucket read access, or Content-Type.");
        }}
      />
    </div>
  );
}
