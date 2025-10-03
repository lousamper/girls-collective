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
      // NEW
      misc: {
        loading: "Cargando…",
        groupNotFound: "Grupo no encontrado",
        backToCategory: "Volver a la categoría",
      },
      // NEW – for date separator helper (Hoy/Ayer/…)
      dates: {
        today: "Hoy",
        yesterday: "Ayer",
        lastWeek: "La semana pasada",
        thisMonth: "Este mes",
        lastMonth: "Mes pasado",
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

      // ⬇️ NEW: button text + aria for “find your city”
      find_city_cta: "Encuentra tu ciudad",
      find_city_cta_aria: "Encuentra tu ciudad",

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

      // NEW: FAQ content (i18n)
      faq: {
        title: "Preguntas frecuentes",
        items: [
          {
            q: "¿Qué es Girls Collective?",
            a: "Una comunidad segura para mujeres donde encontrar amigas y planes en tu ciudad.",
          },
          {
            q: "¿Cómo empiezo?",
            a: "Crea tu cuenta, completa tu perfil, entra a tu ciudad y explora los distintos grupos (o crea uno tú misma) para conocer a otras girls.",
          },
          {
            q: "¿Cuánto cuesta?",
            a: "¡Registrarse es gratis!\nAlgunas actividades pueden tener coste según la organización.",
          },
          
        ],
      },
    },

    // UPDATED: group page translations
    group: {
      follow: {
        follow: "Seguir grupo",
        following: "Siguiendo",
        joining: "Uniéndote…",
        leaving: "Saliendo…",
        followTitle: "Seguir este grupo",
        unfollowTitle: "Dejar de seguir",
      },
      filters: {
        zone: "Zona",
        age: "Edad",
        allZones: "Todos",
        allAges: "Todas",
        createSubgroup: "Crear subgrupo",
      },
      pinned: "Fijados",

      // date separator + unread
      dateLabels: {
        today: "Hoy",
        yesterday: "Ayer",
        lastWeek: "La semana pasada",
        thisMonth: "Este mes",
        lastMonth: "Mes pasado",
        unread: "No leído",
      },

      composer: {
        placeholder: "Escribe tu mensaje… (usa @nombre para mencionar)",
        createPoll: "Crear encuesta",
        createEvent: "Crear evento",
        viewAllEvents: "Ver todos los eventos",
        send: "Enviar",
        sending: "Enviando…",
        // sticky message above textarea (the lilac one)
        mustFollow: "Únete al grupo para ver y publicar todos los mensajes.",
        followNow: "Seguir grupo",
        replyingTo: "Respondiendo a",
        cancel: "Cancelar",
        seeNewArrow: "Ver mensajes nuevos ↓",
      },

      msg: {
        like: "Me gusta",
        reply: "Responder",
        dm: "Mensaje",
        edit: "Editar",
        delete: "Eliminar",
        pin: "Fijar",
        unpin: "Desfijar",
        first: "Sé la primera en escribir ✨",
      },

      polls: {
        title: "Encuestas",
        none: "No hay encuestas todavía.",
        closed: "CERRADA",
        multi: "Múltiple",
        vote: "Votar",
        // placeholders: replace("{n}", String(n))
        optionVotes_singular: "{n} voto",
        optionVotes_plural: "{n} votos",
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
        createdPending: "Eventos creados por la comunidad.",
      },

      subgroups: {
        modalTitle: "Crear subgrupo",
        modalHelp:
          "Crea una zona (p. ej. “Valencia Centro”) o una franja de edad (p. ej. “25–34”).",
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
      // NEW
      misc: {
        loading: "Loading…",
        groupNotFound: "Group not found",
        backToCategory: "Back to category",
      },
      // NEW – for date separator helper (Today/Yesterday/…)
      dates: {
        today: "Today",
        yesterday: "Yesterday",
        lastWeek: "Last week",
        thisMonth: "This month",
        lastMonth: "Last month",
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

      // ⬇️ NEW: button text + aria for “find your city”
      find_city_cta: "Find your city",
      find_city_cta_aria: "Find your city",

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

      // NEW: FAQ content (i18n)
      faq: {
        title: "Frequently asked questions",
        items: [
          {
            q: "What is Girls Collective?",
            a: "A safe community for women to find friends and plans in your city.",
          },
          {
            q: "How do I start?",
            a: "Create your account, complete your profile, go to your city and explore the different groups (or create your own) to meet other girls.",
          },
          {
            q: "How much does it cost?",
            a: "Registration is free!\nSome activities may have a cost depending on the organizer.",
          },
        ],
      },
    },

    // UPDATED: group page translations
    group: {
      follow: {
        follow: "Follow group",
        following: "Following",
        joining: "Joining…",
        leaving: "Leaving…",
        followTitle: "Follow this group",
        unfollowTitle: "Unfollow",
      },
      filters: {
        zone: "Area",
        age: "Age",
        allZones: "All",
        allAges: "All",
        createSubgroup: "Create subgroup",
      },
      pinned: "Pinned",

      dateLabels: {
        today: "Today",
        yesterday: "Yesterday",
        lastWeek: "Last week",
        thisMonth: "This month",
        lastMonth: "Last month",
        unread: "Unread",
      },

      composer: {
        placeholder: "Write your message… (use @name to mention)",
        createPoll: "Create poll",
        createEvent: "Create event",
        viewAllEvents: "View all events",
        send: "Send",
        sending: "Sending…",
        mustFollow: "Join the group to view and post all messages.",
        followNow: "Follow group",
        replyingTo: "Replying to",
        cancel: "Cancel",
        seeNewArrow: "See new messages ↓",
      },

      msg: {
        like: "Like",
        reply: "Reply",
        dm: "Message",
        edit: "Edit",
        delete: "Delete",
        pin: "Pin",
        unpin: "Unpin",
        first: "Be the first to write ✨",
      },

      polls: {
        title: "Polls",
        none: "No polls yet.",
        closed: "CLOSED",
        multi: "Multiple",
        vote: "Vote",
        optionVotes_singular: "{n} vote",
        optionVotes_plural: "{n} votes",
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
        createdPending: "Community-created events.",
      },

      subgroups: {
        modalTitle: "Create subgroup",
        modalHelp:
          "Create an area filter (e.g., “City Center”) or an age range filter (e.g., “25–34”).",
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
