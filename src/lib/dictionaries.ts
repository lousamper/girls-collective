export type Lang = "es" | "en";

/**
 * We keep your existing keys (nav, common, home.tagline, home.heroTitle)
 * and ADD richer keys (home.hero.*, home.about.*, home.contact.*, home.vibesAlt).
 * No `any` used — the shape is inferred from `as const`.
 */
export const DICT = {
  es: {
    nav: {
      about: "Sobre nosotras",
      cities: "Ciudades",
      contact: "Contacto",
      messages: "Mensajes",
      admin: "Admin",
      join: "¡ÚNETE!",
      account: "Mi cuenta",
      accountShort: "Cuenta",
    },
    common: {
      join: "¡ÚNETE!",
      form: {
        nameLabel: "Tu nombre:",
        emailLabel: "Tu correo:",
        messageLabel: "Tu mensaje:",
        submit: "Enviar",
        submitting: "Enviando…",
        orWriteUs: "O escríbenos a",
      },
    },
    home: {
      // ✅ keep your current keys so nothing breaks
      tagline: "where girls connect, thrive & vibe✨",
      heroTitle: "Tu espacio seguro para encontrar tu tribu en esa nueva ciudad.",

      // ✅ richer structure you can start using when ready
      hero: {
        tagline: "where girls connect, thrive & vibe✨",
        title: "Tu espacio seguro para encontrar tu tribu en esa nueva ciudad.",
        cta: "¡ÚNETE!",
        ctaAria: "Únete",
      },
      about: {
        part1: [
          "Sabemos lo que es",
          "empezar de nuevo.",
          "",
          "Mudarte a otra ciudad,",
          "integrarte, adaptarte,",
          "reorganizar tu vida…",
          "",
          "y, entre todo eso, buscar",
          "con quién compartirla.",
          "",
          "Sabemos lo difícil que puede ser hacer nuevas amistades",
          "cuando todo va tan rápido.",
        ].join("\n"),
        part2: [
          "Por eso, creamos un espacio para que conectes desde lo auténtico y formes vínculos reales.",
          "",
          "De esos que se quedan.",
          "",
          "¿Y lo mejor?",
          "tú eliges",
          "cómo, cuándo y con quién.",
        ].join("\n"),
      },
      vibesAlt: "Vibes",
      contact: {
        title: "¿Quieres sumar tu energía a esta comunidad?",
        text:
          "Tanto si eres una marca con ganas de colaborar, una organizadora con planes en mente o " +
          "simplemente una girl con dudas o ideas... \nEscríbenos y te respondemos pronto 💌",
        ok: "¡Gracias! Te responderemos muy pronto 💌",
        error: "No se pudo enviar. Intenta de nuevo.",
        mailtoPrefix: "O escríbenos a",
      },
    },
  },
  en: {
    nav: {
      about: "About",
      cities: "Cities",
      contact: "Contact",
      messages: "Messages",
      admin: "Admin",
      join: "Join!",
      account: "My account",
      accountShort: "Account",
    },
    common: {
      join: "Join!",
      form: {
        nameLabel: "Your name:",
        emailLabel: "Your email:",
        messageLabel: "Your message:",
        submit: "Send",
        submitting: "Sending…",
        orWriteUs: "Or write us at",
      },
    },
    home: {
      // ✅ keep your current keys
      tagline: "where girls connect, thrive & vibe✨",
      heroTitle: "Your safe space to find your tribe in a new city.",

      // ✅ richer structure
      hero: {
        tagline: "where girls connect, thrive & vibe✨",
        title: "Your safe space to find your tribe in that new city.",
        cta: "JOIN!",
        ctaAria: "Join",
      },
      about: {
        part1: [
          "We know what it’s like",
          "to start over.",
          "",
          "Moving to a new city,",
          "fitting in, adapting,",
          "reorganizing your life…",
          "",
          "and in the middle of it all,",
          "finding who to share it with.",
          "",
          "We know how hard making new friendships can be",
          "when everything moves so fast.",
        ].join("\n"),
        part2: [
          "That’s why we created a space to connect from what’s authentic and build real bonds.",
          "",
          "The kind that stay.",
          "",
          "And the best part?",
          "you choose",
          "how, when, and with whom.",
        ].join("\n"),
      },
      vibesAlt: "Vibes",
      contact: {
        title: "Want to add your energy to this community?",
        text:
          "Whether you’re a brand ready to collaborate, an organizer with plans in mind, or " +
          "just a girl with ideas or questions… \nWrite to us and we’ll reply soon 💌",
        ok: "Thanks! We’ll get back to you soon 💌",
        error: "Couldn’t send. Please try again.",
        mailtoPrefix: "Or write to",
      },
    },
  },
} as const;

export type Dict = typeof DICT;
