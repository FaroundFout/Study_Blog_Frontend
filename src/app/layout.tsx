import type { Metadata } from "next";
import localFont from "next/font/local";

import { Footer } from "@/components/layout/footer";
import { Navbar } from "@/components/layout/navbar";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { getSiteInfo } from "@/lib/api";

import "./globals.css";

const displayFont = localFont({
  src: [
    {
      path: "./fonts/cormorant/CormorantGaramond-Variable.ttf",
      weight: "300 700",
      style: "normal"
    }
  ],
  display: "swap",
  variable: "--font-display"
});

const uiFont = localFont({
  src: [
    {
      path: "./fonts/inter/Inter-Variable.ttf",
      weight: "100 900",
      style: "normal"
    }
  ],
  display: "swap",
  variable: "--font-ui"
});

const monoFont = localFont({
  src: [
    {
      path: "./fonts/jetbrains-mono/JetBrainsMono-Variable.ttf",
      weight: "100 800",
      style: "normal"
    }
  ],
  display: "swap",
  variable: "--font-mono"
});

const markdownBodyFont = localFont({
  src: [
    {
      path: "./fonts/roboto/Roboto-Regular.ttf",
      weight: "400",
      style: "normal"
    },
    {
      path: "./fonts/roboto/Roboto-Italic.ttf",
      weight: "400",
      style: "italic"
    },
    {
      path: "./fonts/roboto/Roboto-Medium.ttf",
      weight: "500",
      style: "normal"
    },
    {
      path: "./fonts/roboto/Roboto-MediumItalic.ttf",
      weight: "500",
      style: "italic"
    },
    {
      path: "./fonts/roboto/Roboto-SemiBold.ttf",
      weight: "600",
      style: "normal"
    },
    {
      path: "./fonts/roboto/Roboto-Bold.ttf",
      weight: "700",
      style: "normal"
    }
  ],
  display: "swap",
  variable: "--font-markdown-body"
});

const markdownCodeFont = localFont({
  src: [
    {
      path: "./fonts/fira-code/FiraCode-Regular.ttf",
      weight: "400",
      style: "normal"
    },
    {
      path: "./fonts/fira-code/FiraCode-Medium.ttf",
      weight: "500",
      style: "normal"
    },
    {
      path: "./fonts/fira-code/FiraCode-SemiBold.ttf",
      weight: "600",
      style: "normal"
    },
    {
      path: "./fonts/fira-code/FiraCode-Bold.ttf",
      weight: "700",
      style: "normal"
    }
  ],
  display: "swap",
  variable: "--font-markdown-code"
});

const markdownHeadingFont = localFont({
  src: [
    {
      path: "./fonts/zilla-slab/ZillaSlab-Regular.ttf",
      weight: "400",
      style: "normal"
    },
    {
      path: "./fonts/zilla-slab/ZillaSlab-Medium.ttf",
      weight: "500",
      style: "normal"
    },
    {
      path: "./fonts/zilla-slab/ZillaSlab-SemiBold.ttf",
      weight: "600",
      style: "normal"
    },
    {
      path: "./fonts/zilla-slab/ZillaSlab-Bold.ttf",
      weight: "700",
      style: "normal"
    }
  ],
  display: "swap",
  variable: "--font-markdown-heading"
});

const pingFangRegular = localFont({
  src: [
    {
      path: "./fonts/PingFang-Regular.ttf",
      weight: "400",
      style: "normal"
    }
  ],
  display: "swap",
  variable: "--font-sans-sc"
});

const wenkaiMonoTcFont = localFont({
  src: [
    {
      path: "./fonts/lxgw-wenkai-mono-tc/LXGWWenKaiMonoTC-Regular.ttf",
      weight: "400",
      style: "normal"
    },
    {
      path: "./fonts/lxgw-wenkai-mono-tc/LXGWWenKaiMonoTC-Bold.ttf",
      weight: "700",
      style: "normal"
    }
  ],
  display: "swap",
  variable: "--font-wenkai-mono-tc"
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"),
  title: {
    default: "Study Garden",
    template: "%s | Study Garden"
  },
  description: "一个用于记录学习日记、技术文章、项目展示与资源收藏的个人数字花园。",
  keywords: ["学习博客", "学习日记", "Next.js", "数字花园", "技术博客"],
  openGraph: {
    title: "Study Garden",
    description: "记录学习轨迹、项目实践与长期知识整理的个人花园。",
    type: "website"
  }
};

export default async function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  const siteInfo = await getSiteInfo();

  return (
    <html lang="zh-CN" suppressHydrationWarning>
      <body
        className={`${displayFont.variable} ${uiFont.variable} ${monoFont.variable} ${markdownBodyFont.variable} ${markdownCodeFont.variable} ${markdownHeadingFont.variable} ${pingFangRegular.variable} ${wenkaiMonoTcFont.variable} min-h-screen bg-background font-sans text-foreground antialiased`}
      >
        <ThemeProvider>
          <div className="relative min-h-screen">
            <Navbar siteInfo={siteInfo} />
            <main className="mx-auto w-full max-w-[1180px] space-y-10 px-5 pb-16 pt-9 md:space-y-14 md:px-7 md:pt-11">
              {children}
            </main>
            <Footer siteInfo={siteInfo} />
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
