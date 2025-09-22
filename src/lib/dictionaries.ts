export type Lang = "es" | "en";

/** Master dictionary (literal-typed with `as const`) */
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
      // keep simple keys (already used)
      tagline: "where girls connect, thrive & vibe✨",
      heroTitle: "Tu espacio seguro para encontrar tu tribu en esa nueva ciudad.",

      // optional richer hero block
      hero: {
        tagline: "where girls connect, thrive & vibe✨",
        title: "Tu espacio seguro para encontrar tu tribu en esa nueva ciudad.",
        cta: "¡ÚNETE!",
        ctaAria: "Únete",
      },

      // image alt texts used in <Image alt={...}>
      images: {
        connAlt: "Conexión",
        commAlt: "Comunidad",
        vibesAlt: "Vibes",
      },

      // granular paragraphs used in Home
      about: {
        p1: {
          l1: "Sabemos lo que es",
          h1: "empezar de nuevo.",
          l3: "Mudarte a otra ciudad,",
          l4: "integrarte, adaptarte,",
          l5: "reorganizar tu vida…",
          l6: "y, entre todo eso, buscar",
          l7: "con quién compartirla.",
          h2: "Sabemos lo difícil que puede ser hacer nuevas amistades",
          l9: "cuando todo va tan rápido.",
        },
        p2: {
          l1: "Por eso, creamos un espacio para que conectes desde lo auténtico y formes vínculos reales.",
          l2: "De esos que se quedan.",
          h1: "¿Y lo mejor?",
          h2_line1: "tú eliges",
          h2_line2: "cómo, cuándo y con quién.",
        },

        // optional concatenated versions (not currently used, but handy)
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

      contact: {
        title: "¿Quieres sumar tu energía a esta comunidad?",
        text:
          "Tanto si eres una marca con ganas de colaborar, una organizadora con planes en mente o " +
          "simplemente una girl con dudas o ideas... \nEscríbenos y te respondemos pronto 💌",
        placeholder: "Cuéntanos en qué podemos colaborar o ayudarte ✨",
        ok: "¡Gracias! Te responderemos muy pronto 💌",
        error: "No se pudo enviar. Intenta de nuevo.",
        // optional alias if you ever need it
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
      // keep simple keys
      tagline: "where girls connect, thrive & vibe✨",
      heroTitle: "Your safe space to find your tribe in a new city.",

      // optional richer hero block
      hero: {
        tagline: "where girls connect, thrive & vibe✨",
        title: "Your safe space to find your tribe in that new city.",
        cta: "JOIN!",
        ctaAria: "Join",
      },

      images: {
        connAlt: "Connection",
        commAlt: "Community",
        vibesAlt: "Vibes",
      },

      about: {
        p1: {
          l1: "We know what it's like",
          h1: "to start over.",
          l3: "To move to a new city,",
          l4: "settle in, adapt,",
          l5: "reorganize your life…",
          l6: "and in the middle of it all, try to find",
          l7: "who to share it with.",
          h2: "We know how hard it can be to make new friends",
          l9: "when everything moves so fast.",
        },
        p2: {
          l1: "That's why we created a space to connect from what's authentic and build real bonds.",
          l2: "The kind that last.",
          h1: "And the best part?",
          h2_line1: "you choose",
          h2_line2: "how, when and with whom.",
        },

        // optional concatenated versions
        part1: [
          "We know what it's like",
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
          "That's why we created a space to connect from what's authentic and build real bonds.",
          "",
          "The kind that stay.",
          "",
          "And the best part?",
          "you choose",
          "how, when, and with whom.",
        ].join("\n"),
      },

      contact: {
        title: "Want to add your energy to this community?",
        text:
          "Whether you’re a brand ready to collaborate, an organizer with plans in mind, or " +
          "just a girl with ideas or questions… \nWrite to us and we’ll reply soon 💌",
        placeholder: "Tell us how we can collaborate or help ✨",
        ok: "Thanks! We’ll get back to you soon 💌",
        error: "Couldn't send. Please try again.",
        mailtoPrefix: "Or write to",
      },
    },
  },
} as const;

export type Dict = typeof DICT;

