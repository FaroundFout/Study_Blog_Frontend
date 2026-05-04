import type { FriendLink } from "@/types";

import { mockNow } from "@/lib/mock/site";

export const mockFriendLinks: FriendLink[] = [
  {
    id: 1,
    siteName: "晨间代码薄雾",
    siteUrl: "https://example.com/morning-mist",
    description: "记录前端细节、设计笔记和每周学习回顾的温柔小站。",
    avatar: "",
    status: "approved",
    sort: 100,
    createdAt: mockNow
  },
  {
    id: 2,
    siteName: "Stack Diary",
    siteUrl: "https://example.com/stack-diary",
    description: "偏工程化的个人博客，擅长把复杂问题拆成清单。",
    avatar: "",
    status: "approved",
    sort: 90,
    createdAt: mockNow
  },
  {
    id: 3,
    siteName: "像素茶会",
    siteUrl: "https://example.com/pixel-tea",
    description: "分享独立开发、界面审美和轻松的学习节奏。",
    avatar: "",
    status: "approved",
    sort: 80,
    createdAt: mockNow
  },
  {
    id: 4,
    siteName: "接口栈桥",
    siteUrl: "https://example.com/api-bridge",
    description: "长期写接口设计、系统拆分和联调踩坑记录。",
    avatar: "",
    status: "approved",
    sort: 70,
    createdAt: mockNow
  },
  {
    id: 5,
    siteName: "北窗实验室",
    siteUrl: "https://example.com/north-window",
    description: "偏静态站点和内容体验设计，页面总有舒服的留白。",
    avatar: "",
    status: "approved",
    sort: 60,
    createdAt: mockNow
  },
  {
    id: 6,
    siteName: "Bug 与月光",
    siteUrl: "https://example.com/bug-moon",
    description: "写调试、写生活，也写开发者如何和自己相处。",
    avatar: "",
    status: "approved",
    sort: 50,
    createdAt: mockNow
  },
  {
    id: 7,
    siteName: "低噪声开发日志",
    siteUrl: "https://example.com/low-noise-dev",
    description: "很少废话，擅长把工程经验写成高密度短文。",
    avatar: "",
    status: "approved",
    sort: 40,
    createdAt: mockNow
  },
  {
    id: 8,
    siteName: "纸灯塔",
    siteUrl: "https://example.com/paper-lighthouse",
    description: "学习地图、阅读摘录和项目实验并行更新。",
    avatar: "",
    status: "approved",
    sort: 30,
    createdAt: mockNow
  }
];
