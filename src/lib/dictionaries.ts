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
      accountShort: "Mi cuenta",
      myGroups: "Mis grupos",
      notifications: "Notificaciones",
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

    // NEW: group page translations
    group: {
      follow: {
        follow: "Seguir grupo",
        following: "Siguiendo",
        leaving: "Saliendo…",
        joining: "Uniéndote…",
      },
      filters: {
        zone: "Zona",
        age: "Edad",
        allZones: "Todos",
        allAges: "Todas",
        createSubgroup: "Crear subgrupo",
      },
      pinned: "Fijados",
      composer: {
        placeholder: "Escribe tu mensaje… (usa @nombre para mencionar)",
        createPoll: "Crear encuesta",
        createEvent: "Crear evento",
        viewAllEvents: "Ver todos los eventos",
        send: "Enviar",
        sending: "Enviando…",
        mustFollow: "Únete al grupo para poder publicar.",
        followNow: "Seguir grupo",
        replyingTo: "Respondiendo a",
        cancel: "Cancelar",
      },
      msg: {
        like: "Me gusta",
        reply: "Responder",
        dm: "Mensaje",
        edit: "Editar",
        delete: "Eliminar",
        pin: "Fijar",
        unpin: "Desfijar",
        new: "Ver mensajes nuevos",
        first: "Sé la primera en escribir ✨",
        adminConfirmDelete: "¿Eliminar este mensaje?",
      },
      polls: {
        title: "Encuestas",
        none: "No hay encuestas todavía.",
        closed: "CERRADA",
        multi: "Múltiple",
        vote: "Votar",
        totalVotes_singular: "{n} voto total",
        totalVotes_plural: "{n} votos totales",
        needTwoOptions: "Añade una pregunta y al menos 2 opciones.",
        create: "Crear encuesta",
        question: "Pregunta",
        options: "Opciones",
        addOption: "+ Añadir opción",
        remove: "Quitar",
        allowMulti: "Permitir seleccionar varias opciones",
      },
      events: {
        create: "Crear evento",
        title: "Título",
        description: "Descripción",
        location: "Ubicación",
        when: "Fecha y hora",
        needTitleDate: "Añade título y fecha.",
        createdPending: "Eventos creados por la comunidad. (Aparecerán cuando sean aprobados.)",
      },
      subgroups: {
        modalTitle: "Crear subgrupo",
        modalHelp: "Crea una zona (p. ej. “Valencia Centro”) o una franja de edad (p. ej. “25–34”).",
        type: "Tipo",
        name: "Nombre",
        typeLocation: "Zona",
        typeAge: "Edad",
        nameHintLocation: "Ej: Valencia Centro",
        nameHintAge: "Ej: 25–34",
        create: "Crear",
      },
      profileCard: {
        title: "Perfil",
        dm: "Enviar mensaje",
        interests: "Intereses",
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
      join: "JOIN!",
      account: "My profile",
      accountShort: "My profile",
      myGroups: "My groups",
      notifications: "Notifications",
    },
    common: {
      join: "JOIN!",
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
      heroTitle: "Your safe space to find your tribe in that new city.",

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

    // NEW: group page translations
    group: {
      follow: {
        follow: "Follow group",
        following: "Following",
        leaving: "Leaving…",
        joining: "Joining…",
      },
      filters: {
        zone: "Area",
        age: "Age",
        allZones: "All",
        allAges: "All",
        createSubgroup: "Create subgroup",
      },
      pinned: "Pinned",
      composer: {
        placeholder: "Write your message… (use @name to mention)",
        createPoll: "Create poll",
        createEvent: "Create event",
        viewAllEvents: "View all events",
        send: "Send",
        sending: "Sending…",
        mustFollow: "Join the group to post.",
        followNow: "Follow group",
        replyingTo: "Replying to",
        cancel: "Cancel",
      },
      msg: {
        like: "Like",
        reply: "Reply",
        dm: "Message",
        edit: "Edit",
        delete: "Delete",
        pin: "Pin",
        unpin: "Unpin",
        new: "See new messages",
        first: "Be the first to write ✨",
        adminConfirmDelete: "Delete this message?",
      },
      polls: {
        title: "Polls",
        none: "No polls yet.",
        closed: "CLOSED",
        multi: "Multiple",
        vote: "Vote",
        totalVotes_singular: "{n} total vote",
        totalVotes_plural: "{n} total votes",
        needTwoOptions: "Add a question and at least 2 options.",
        create: "Create poll",
        question: "Question",
        options: "Options",
        addOption: "+ Add option",
        remove: "Remove",
        allowMulti: "Allow selecting multiple options",
      },
      events: {
        create: "Create event",
        title: "Title",
        description: "Description",
        location: "Location",
        when: "Date & time",
        needTitleDate: "Add a title and date.",
        createdPending: "Community-created events. (They’ll appear once approved.)",
      },
      subgroups: {
        modalTitle: "Create a filter",
        modalHelp: "Create an area filter (e.g., “City Center”) or an age range filter (e.g., “25–34”).",
        type: "Type",
        name: "Name",
        typeLocation: "Area",
        typeAge: "Age",
        nameHintLocation: "e.g., Valencia Center",
        nameHintAge: "e.g., 25–34",
        create: "Create",
      },
      profileCard: {
        title: "Profile",
        dm: "Send message",
        interests: "Interests",
      },
    },
  },
} as const;

export type Dict = typeof DICT;
