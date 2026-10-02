export const site = {
  name: "ragforge",
  tagline: "Production-grade RAG, end to end",
  description:
    "An end-to-end RAG platform focused on reliable retrieval, high-quality generation, evaluation, observability, and production scalability.",
  github: "https://github.com/arunk7033/ragforge",
  docs: "https://github.com/arunk7033/ragforge#readme",
  email: "arunk7033@gmail.com",
  contact: "mailto:arunk7033@gmail.com",
  // Sign-in lives in the Next.js app (web/). Set PUBLIC_APP_URL at build time for production.
  login: `${import.meta.env.PUBLIC_APP_URL ?? "http://localhost:3000"}/login`,
};
