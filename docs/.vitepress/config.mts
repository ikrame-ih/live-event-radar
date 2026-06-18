import { defineConfig } from "vitepress";
import { withMermaid } from "vitepress-plugin-mermaid";

export default withMermaid(
  defineConfig({
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
          text: "Technical notes",
          items: [
            { text: "Technical decisions", link: "/technical-decisions" },
            { text: "Business problem", link: "/business" },
            { text: "Architecture", link: "/architecture" },
            { text: "Data pipeline", link: "/pipeline" },
          ],
        },
        {
          text: "Further reading",
          items: [
            { text: "Current state", link: "/current-state" },
            { text: "Visual system", link: "/visual-system" },
          ],
        },
      ],
      socialLinks: [
        {
          icon: "linkedin",
          link: "https://www.linkedin.com/in/ikrame-ih/",
        },
        {
          icon: "github",
          link: "https://github.com/ikrame-ih",
        },
      ],
      footer: {
        message:
          'Built by <a href="https://ikrame-ih.vercel.app/" target="_blank" rel="noopener">Ikrame Ibn Hayoun</a>',
        copyright:
          '<a href="https://github.com/ikrame-ih" target="_blank" rel="noopener">GitHub</a> · <a href="https://www.linkedin.com/in/ikrame-ih/" target="_blank" rel="noopener">LinkedIn</a> · <a href="https://ikrame-ih.vercel.app/" target="_blank" rel="noopener">Portfolio</a>',
      },
    },
  }),
);
