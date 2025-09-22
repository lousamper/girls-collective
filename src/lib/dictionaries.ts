// src/lib/dictionaries.ts
export type Lang = "es" | "en";

export const DICT: Record<Lang, any> = {
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
    home: {
      tagline: "where girls connect, thrive & vibe✨",
      heroTitle: "Tu espacio seguro para encontrar tu tribu en esa nueva ciudad.",
      contact: {
        title: "¿Quieres sumar tu energía a esta comunidad?",
      },
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
  },
  en: {
    nav: {
      about: "About",
      cities: "Cities",
      contact: "Contact",
      messages: "Messages",
      admin: "Admin",
      join: "Join",
      account: "My account",
      accountShort: "Account",
    },
    home: {
      tagline: "where girls connect, thrive & vibe✨",
      heroTitle: "Your safe space to find your tribe in a new city.",
      contact: {
        title: "Want to add your energy to this community?",
      },
    },
    common: {
      join: "Join",
      form: {
        nameLabel: "Your name:",
        emailLabel: "Your email:",
        messageLabel: "Your message:",
        submit: "Send",
        submitting: "Sending…",
        orWriteUs: "Or write us at",
      },
    },
  },
};

