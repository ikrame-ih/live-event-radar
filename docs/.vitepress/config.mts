import { defineConfig } from "vitepress";

export default defineConfig({
  title: "LiveEvent Radar",
  description:
    "Live operations dashboard for brand activations — architecture notes and case study.",
  base: "/live-event-radar/",
  lang: "en-US",
  themeConfig: {
    nav: [
      { text: "Case study", link: "/" },
      { text: "Architecture", link: "/architecture" },
      { text: "Pipeline", link: "/pipeline" },
      { text: "Current state", link: "/current-state" },
      { text: "Visual system", link: "/visual-system" },
      { text: "Business", link: "/business" },
      {
        text: "Live demo",
        link: "https://live-event-radar.vercel.app",
      },
      {
        text: "GitHub",
        link: "https://github.com/ikrame-ih/live-event-radar",
      },
    ],
    sidebar: [
      {
        text: "Overview",
        items: [{ text: "Case study", link: "/" }],
      },
      {
        text: "Deep dive",
        items: [
          { text: "Business problem", link: "/business" },
          { text: "Architecture", link: "/architecture" },
          { text: "Data pipeline", link: "/pipeline" },
          { text: "Current state", link: "/current-state" },
          { text: "Visual system", link: "/visual-system" },
        ],
      },
    ],
    socialLinks: [
      {
        icon: "github",
        link: "https://github.com/ikrame-ih/live-event-radar",
      },
    ],
    footer: {
      message: "Ikrame Ibn Hayoun — LiveEvent Radar",
      copyright: "Copyright © 2026",
    },
  },
});
