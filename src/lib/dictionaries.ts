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
      profile: {
  title: "Mi perfil",
  subtitle: "Gestiona tu información y tus grupos 💜",

  avatar: {
    button: "Cargar foto",
    noPhoto: "Sin foto",
    hint: "JPG o PNG · Máx 2MB",
  },

  username: {
    label: "Nombre de usuario *",
    placeholder: "Tu nombre o apodo",
    checking: "Comprobando…",
    required: "El nombre de usuario es obligatorio.",
    taken: "Este nombre ya está en uso.",
    validateFail: "No se pudo validar el nombre.",
  },

  city: {
    label: "Ciudad *",
    placeholder: "Selecciona tu ciudad",
  },

  bio: {
    label: "Bio (opcional)",
    placeholder: "Cuéntanos algo sobre ti ✨",
  },

  emoji: {
    label: "Un emoji de tus favoritos",
    placeholder: "🥰",
  },

  quote: {
    label: "Una frase de tus favoritas",
    placeholder: "Una frase cortita que te represente 💫",
  },

  actions: {
    save: "Guardar cambios",
    saving: "Guardando…",
  },

  messages: {
    updated: "Perfil actualizado ✅",
  },

  errors: {
    saveFail: "No se pudo guardar.",
    avatarType: "Debe ser .jpg o .png",
    avatarSize: "Tamaño máximo 2MB",
    galleryType: "Las fotos deben ser .jpg o .png",
    gallerySize: "Máximo 2MB por foto",
  },

  interests: {
    title: "Tus intereses",
    updateBtn: "Actualizar",
    ok: "Intereses actualizados ✅",
    err: "No se pudieron actualizar los intereses.",
  },

  gallery: {
    title: "Tu galería",
    uploadBtn: "Subir fotos",
    selectedCount: "{n} foto(s) seleccionada(s)",
    hint: "Hasta 3 fotos · JPG o PNG · Máx 2MB por foto",
    saving: "Guardando…",
    updateBtn: "Actualizar",
    ok: "Galería actualizada ✅",
    err: "No se pudo actualizar la galería.",
    noChanges: "No hay cambios en la galería.",
  },

  groups: {
    title: "Mis grupos",
    empty: "Todavía no te has unido a ningún grupo.",
    goToGroup: "Ir al grupo",
    cityFallback: "Ciudad",
    categoryFallback: "categoría",
  },

  password: {
    title: "Cambiar contraseña",
    new: "Nueva contraseña",
    confirm: "Confirmar nueva contraseña",
    updateBtn: "Actualizar",
    ok: "Contraseña actualizada ✅",
    mismatch: "Las contraseñas no coinciden.",
    err: "No se pudo actualizar la contraseña.",
  },

  security: {
    title: "Zona de seguridad",
    signOut: "Cerrar sesión",
    delete: "Eliminar cuenta",
    deleteOk: "Solicitud enviada. Te contactaremos pronto 💌",
    deleteErr: "No se pudo enviar la solicitud. Inténtalo más tarde.",
  },
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
    setup: {
  title: "Completa tu perfil",
  subtitle: "Esto ayuda a que la comunidad sea más auténtica 💜",

  avatar: {
    label: "Foto de perfil (opcional)",
    button: "Cargar foto",
    noPhoto: "Sin foto",
    hint: "JPG/PNG · Máx 2MB",
  },

  username: {
    label: "Nombre de usuario *",
    placeholder: "Ej: tu nombre o apodo",
  },

  city: {
    label: "Ciudad *",
    placeholder: "Selecciona tu ciudad",
  },

  birthYear: {
    label: "Año de nacimiento (opcional)",
    placeholder: "Ej: 1995",
  },

  bio: {
    label: "Bio (opcional)",
    placeholder: "Cuéntanos algo sobre ti ✨",
  },

  emoji: {
    label: "Un emoji de tus favoritos",
    placeholder: "🥰",
  },

  quote: {
    label: "Una frase de tus favoritas",
    placeholder: "Una frase cortita que te represente 💫",
  },

  interests: {
    label: "Tus intereses",
    none: "No hay categorías todavía.",
  },

  customInterest: {
    label: "Otro interés (opcional)",
    placeholder: "Escribe tu propio interés",
  },

  gallery: {
    label: "¿1-3 fotos que te representen?",
    uploadBtn: "Subir fotos",
    hint: "Hasta 3 fotos · JPG/PNG · 2MB máx por foto",
    selectedCount: "{n} foto(s) seleccionada(s)",
  },

  consent: {
    prefix: "Acepto la",
    privacy: "Política de Privacidad",
  },

  actions: {
    save: "Guardar y continuar",
    saving: "Guardando…",
  },

  errors: {
    generic: "Algo salió mal. Inténtalo de nuevo.",
    avatarType: "Debe ser .jpg o .png",
    avatarSize: "Tamaño máximo 2MB",
    galleryType: "Las fotos deben ser .jpg o .png",
    gallerySize: "Máximo 2MB por foto",
    usernameTaken: "Este nombre de usuario ya está en uso.",
  },
},
findCity: {
  title: "Encuentra tu ciudad",
  carousel: {
    prevAria: "Anterior",
    nextAria: "Siguiente",
    soonBadge: "PRONTO",
  },
  waitlist: {
    blurb1: "¿No encuentras tu ciudad?",
    blurb2: "No te preocupes, déjanos tu correo y te avisaremos una vez que esté disponible 💌",
    cityLabel: "Tu ciudad:",
    cityPlaceholder: "Ej: Sevilla",
    emailLabel: "Tu correo:",
    emailPlaceholder: "tucorreo@email.com",
    submit: "¡únete a la lista de espera!",
    submitting: "Enviando…",
    okExisting: "¡Genial! Ya estabas en la lista para esa ciudad 💌",
    okNew: "¡Gracias! Te avisaremos cuando tu ciudad esté disponible 💌",
    error: "Error al enviar. Inténtalo de nuevo.",
  },
},
auth: {
  title: { login: "Bienvenida de nuevo 💜", signup: "Bienvenida 💜" },
  desc: { login: "Inicia sesión para encontrar tu tribu.", signup: "Crea tu cuenta para encontrar tu tribu." },
  emailPlaceholder: "Correo electrónico",
  passwordPlaceholder: "Contraseña",
  passwordShow: "Mostrar contraseña",
  passwordHide: "Ocultar contraseña",
  forgot: "¿Olvidaste tu contraseña?",
  pwRuleHelper: "La contraseña debe tener mínimo 8 caracteres, con mayúsculas, minúsculas y números.",
  loading: "Cargando…",
  loginCta: "Entrar",
  signupCta: "Registrarse",
  switch: {
    toSignupPrompt: "¿Aún no tienes cuenta?",
    toLoginPrompt: "¿Ya tienes una cuenta?",
    signupLink: "Regístrate",
    loginLink: "Entrar",
  },
  msg: {
    checkEmail: "Revisa tu correo para confirmar el registro.",
    loginSuccess: "¡Has iniciado sesión con éxito!",
  },
  resetSent: "Te hemos enviado un correo con instrucciones 💌",
  resetError: "No se pudo enviar el correo.",
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
    setup: {
  title: "Complete your profile",
  subtitle: "This helps keep the community authentic 💜",

  avatar: {
    label: "Profile photo (optional)",
    button: "Upload photo",
    noPhoto: "No photo",
    hint: "JPG/PNG · Max 2MB",
  },

  username: {
    label: "Username *",
    placeholder: "e.g., your name or nickname",
  },

  city: {
    label: "City *",
    placeholder: "Select your city",
  },

  birthYear: {
    label: "Year of birth (optional)",
    placeholder: "e.g., 1995",
  },

  bio: {
    label: "Bio (optional)",
    placeholder: "Tell us something about you ✨",
  },

  emoji: {
    label: "One of your favourite emojis",
    placeholder: "🥰",
  },

  quote: {
    label: "A quote you love",
    placeholder: "A short line that represents you 💫",
  },

  interests: {
    label: "Your interests",
    none: "No categories yet.",
  },

  customInterest: {
    label: "Another interest (optional)",
    placeholder: "Write your own interest",
  },

  gallery: {
    label: "1–3 photos that represent you?",
    uploadBtn: "Upload photos",
    hint: "Up to 3 photos · JPG/PNG · 2MB max each",
    selectedCount: "{n} photo(s) selected",
  },

  consent: {
    prefix: "I accept the",
    privacy: "Privacy Policy",
  },

  actions: {
    save: "Save & continue",
    saving: "Saving…",
  },

  errors: {
    generic: "Something went wrong. Please try again.",
    avatarType: "Must be .jpg or .png",
    avatarSize: "Maximum size 2MB",
    galleryType: "Photos must be .jpg or .png",
    gallerySize: "Maximum 2MB per photo",
    usernameTaken: "That username is already taken.",
  },
},
profile: {
  title: "My profile",
  subtitle: "Manage your info and your groups 💜",

  avatar: {
    button: "Upload photo",
    noPhoto: "No photo",
    hint: "JPG or PNG · Max 2MB",
  },

  username: {
    label: "Username *",
    placeholder: "Your name or nickname",
    checking: "Checking…",
    required: "Username is required.",
    taken: "That username is already taken.",
    validateFail: "Couldn't validate the username.",
  },

  city: {
    label: "City *",
    placeholder: "Select your city",
  },

  bio: {
    label: "Bio (optional)",
    placeholder: "Tell us something about you ✨",
  },

  emoji: {
    label: "One of your favourite emojis",
    placeholder: "🥰",
  },

  quote: {
    label: "A quote you love",
    placeholder: "A short line that represents you 💫",
  },

  actions: {
    save: "Save changes",
    saving: "Saving…",
  },

  messages: {
    updated: "Profile updated ✅",
  },

  errors: {
    saveFail: "Couldn't save.",
    avatarType: "Must be .jpg or .png",
    avatarSize: "Maximum size 2MB",
    galleryType: "Photos must be .jpg or .png",
    gallerySize: "Max 2MB per photo",
  },

  interests: {
    title: "Your interests",
    updateBtn: "Update",
    ok: "Interests updated ✅",
    err: "Couldn't update interests.",
  },

  gallery: {
    title: "Your gallery",
    uploadBtn: "Upload photos",
    selectedCount: "{n} photo(s) selected",
    hint: "Up to 3 photos · JPG or PNG · Max 2MB each",
    saving: "Saving…",
    updateBtn: "Update",
    ok: "Gallery updated ✅",
    err: "Couldn't update the gallery.",
    noChanges: "No changes in the gallery.",
  },

  groups: {
    title: "My groups",
    empty: "You haven't joined any group yet.",
    goToGroup: "Go to group",
    cityFallback: "City",
    categoryFallback: "category",
  },

  password: {
    title: "Change password",
    new: "New password",
    confirm: "Confirm new password",
    updateBtn: "Update",
    ok: "Password updated ✅",
    mismatch: "Passwords do not match.",
    err: "Couldn't update the password.",
  },

  security: {
    title: "Security zone",
    signOut: "Sign out",
    delete: "Delete account",
    deleteOk: "Request sent. We'll contact you soon 💌",
    deleteErr: "Couldn't send the request. Please try again later.",
  },
},
findCity: {
  title: "Find your city",
  carousel: {
    prevAria: "Previous",
    nextAria: "Next",
    soonBadge: "SOON",
  },
  waitlist: {
    blurb1: "Can't find your city?",
    blurb2: "No worries! Leave your email and we'll notify you once it's available 💌",
    cityLabel: "Your city:",
    cityPlaceholder: "e.g., Seville",
    emailLabel: "Your email:",
    emailPlaceholder: "you@email.com",
    submit: "Join the waitlist!",
    submitting: "Sending…",
    okExisting: "Great! You were already on the list for that city 💌",
    okNew: "Thanks! We'll let you know when your city is available 💌",
    error: "Couldn't send. Please try again.",
  },
},
auth: {
  title: { login: "Welcome back 💜", signup: "Welcome 💜" },
  desc: { login: "Log in to find your tribe.", signup: "Create your account to find your tribe." },
  emailPlaceholder: "Email address",
  passwordPlaceholder: "Password",
  passwordShow: "Show password",
  passwordHide: "Hide password",
  forgot: "Forgot your password?",
  pwRuleHelper: "Password must be at least 8 characters and include uppercase, lowercase, and numbers.",
  loading: "Loading…",
  loginCta: "Log in",
  signupCta: "Sign up",
  switch: {
    toSignupPrompt: "Don't have an account yet?",
    toLoginPrompt: "Already have an account?",
    signupLink: "Sign up",
    loginLink: "Log in",
  },
  msg: {
    checkEmail: "Check your email to confirm your registration.",
    loginSuccess: "Logged in successfully!",
  },
  resetSent: "We’ve sent you an email with instructions 💌",
  resetError: "Couldn't send the email.",
},


  },
} as const;

export type Dict = typeof DICT;
