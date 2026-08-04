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
        { text: "Decisions", link: "/decisions" },
        { text: "Pipeline", link: "/pipeline" },
        { text: "Lessons", link: "/lessons-learned" },
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
          items: [
            { text: "Case study", link: "/" },
            { text: "Lessons learned", link: "/lessons-learned" },
            { text: "Business problem", link: "/business" },
          ],
        },
        {
          text: "Technical notes",
          items: [
            { text: "Architecture", link: "/architecture" },
            { text: "Decisions & challenges", link: "/decisions" },
            { text: "Data pipeline", link: "/pipeline" },
            { text: "Benchmarks", link: "/benchmarks" },
            { text: "Visual system", link: "/visual-system" },
          ],
        },
        {
          text: "Development",
          items: [
            { text: "DeepSource setup", link: "/development/deepsource" },
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
          'Built by <a href="https://ikrame-ih.vercel.app/" target="_blank" rel="noopener noreferrer">Ikrame Ibn Hayoun</a>',
        copyright:
          '<a href="https://github.com/ikrame-ih" target="_blank" rel="noopener noreferrer">GitHub</a> · <a href="https://www.linkedin.com/in/ikrame-ih/" target="_blank" rel="noopener noreferrer">LinkedIn</a> · <a href="https://ikrame-ih.vercel.app/" target="_blank" rel="noopener noreferrer">Portfolio</a>',
      },
    },
  })
);
