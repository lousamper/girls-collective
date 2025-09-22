export type Locale = "es" | "en";

export const dict: Record<Locale, Record<string, string>> = {
  es: {
    "nav.home": "Inicio",
    "nav.groups": "Grupos",
    "footer.privacy": "Política de Privacidad",
    "profile.title": "Mi perfil",
    "profile.save": "Guardar cambios",
    // ...añade claves poco a poco
  },
  en: {
    "nav.home": "Home",
    "nav.groups": "Groups",
    "footer.privacy": "Privacy Policy",
    "profile.title": "My profile",
    "profile.save": "Save changes",
  },
};
