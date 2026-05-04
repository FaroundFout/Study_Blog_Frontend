import type { HomeMusic } from "@/types";

const mockMusicNow = "2026-04-14T09:00:00";

export const mockHomeMusic: HomeMusic = {
  id: 1,
  title: "Garden Breeze",
  artist: "Study Garden Radio",
  coverUrl:
    "https://myblogbucket.oss-cn-hongkong.aliyuncs.com/blog/site/home/IMG_20260217_151245.jpg",
  ossObjectKey: "blog/site/home/music/2026/04/soundhelix-demo.mp3",
  fileUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
  fileName: "soundhelix-song-1.mp3",
  contentType: "audio/mpeg",
  fileSize: 8945229,
  durationSeconds: 372,
  playCount: 16003,
  likeCount: 1203,
  status: "published",
  createdAt: mockMusicNow,
  updatedAt: mockMusicNow
};
