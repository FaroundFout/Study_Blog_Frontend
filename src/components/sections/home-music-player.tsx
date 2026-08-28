"use client";

import { Heart, Pause, Play } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { incrementHomeMusicLikeCount, incrementHomeMusicPlayCount } from "@/lib/api";
import type { HomeMusic } from "@/types";

import styles from "./home-music-player.module.css";

interface HomeMusicPlayerProps {
  music?: HomeMusic | null;
}

type MusicPayload = HomeMusic & {
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
    hasReportedPlayRef.current = false;
  }, [initialDuration, initialLikeCount, initialPlayCount, music?.id]);

  const progressMax = Math.max(duration, 1);
  const progressValue = Math.min(currentTime, progressMax);

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
        setErrorMessage("暂时无法播放，请检查音频地址或浏览器播放权限。");
      }
      return;
    }

    audio.pause();
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
    <div className={styles.player}>
      <button
        type="button"
        onClick={handleTogglePlay}
        disabled={!audioSrc}
        className={styles.playButton}
        aria-label={isPlaying ? "暂停当前音乐" : "播放当前音乐"}
      >
        {isPlaying ? <Pause aria-hidden="true" /> : <Play aria-hidden="true" />}
      </button>

      <div className={styles.trackMeta}>
        <p>
          <span>{music ? "正在播放" : "音乐抽屉"}</span>
          <strong>{music?.title ?? "等待一首新的背景音乐"}</strong>
        </p>
        <small>{music?.artist ?? "发布音乐后，这里会成为花园里的声音入口。"}</small>
      </div>

      <div className={styles.timeline}>
        <span>{formatTime(progressValue)}</span>
        <input
          type="range"
          min={0}
          max={progressMax}
          step={1}
          value={progressValue}
          onChange={(event) => {
            const audio = audioRef.current;
            const nextTime = Number(event.target.value);
            if (audio) {
              audio.currentTime = nextTime;
            }
            setCurrentTime(nextTime);
          }}
          disabled={!audioSrc}
          aria-label="调整音乐播放进度"
        />
        <span>{formatTime(duration)}</span>
      </div>

      <div className={styles.stats}>
        <span>{music ? `${formatCount(playCount)} 次播放` : "尚未上架"}</span>
        {music ? (
          <button
            type="button"
            onClick={handleLike}
            disabled={likePending}
            aria-label="喜欢当前音乐"
          >
            <Heart aria-hidden="true" />
            {formatCount(likeCount)}
          </button>
        ) : null}
      </div>

      {errorMessage ? <p className={styles.error}>{errorMessage}</p> : null}

      <audio
        ref={audioRef}
        src={audioSrc || undefined}
        preload="metadata"
        onLoadedMetadata={() => {
          const audio = audioRef.current;
          if (audio && Number.isFinite(audio.duration)) {
            setDuration(Math.floor(audio.duration));
          }
        }}
        onTimeUpdate={() => setCurrentTime(audioRef.current?.currentTime ?? 0)}
        onPlay={handleAudioPlay}
        onPause={() => setIsPlaying(false)}
        onEnded={() => {
          const audio = audioRef.current;
          setIsPlaying(false);
          setCurrentTime(audio && Number.isFinite(audio.duration) ? audio.duration : duration);
        }}
        onError={() => {
          setIsPlaying(false);
          setErrorMessage("音频加载失败，请检查文件地址与公开读取权限。");
        }}
      />
    </div>
  );
}
