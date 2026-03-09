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
      account: "Mi Perfil",
      accountShort: "Mi Perfil",
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
        prev: "Anterior",
        next: "Siguiente",
        lastUpdated: "Última actualización",

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
      heroTitle: "Tu espacio seguro para hacer amigas, planes y conectar con la ciudad en la qué estás.",

      // optional richer hero block
      hero: {
        tagline: "where girls connect, thrive & vibe✨",
        title: "Tu espacio seguro para encontrar tu tribu en esa nueva ciudad.",
        cta: "¡ÚNETE!",
        ctaAria: "Únete",
        hostsInline: "¿Eres anfitriona?",
      },

      hosts: {
    secondaryCta: "Hazte anfitriona",
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

      cityPhilosophy: {
  title: "Curada ciudad por ciudad, con intención 🌻",
  p1: "Creemos que la comunidad funciona mejor cuando es local, cercana y humana.",
  p2: "Por eso Girls Collective crece ciudad a ciudad, cuidando cada espacio para que las conexiones se sientan reales.",
  closing: "Encuentra tu tribu. Vive tu ciudad.",
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
            a: "Crea tu cuenta, completa tu perfil, entra a tu ciudad y explora los distintos grupos (o crea uno tú misma) para conocer a otras girls. Encuentra planes o publica los que quieras.",
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

  host: {
    cardTitle: "Perfil como anfitriona",
    cardSubtitle: "Estos datos podrán mostrarse en tus eventos y en tu perfil público.",
    titleLabel: "Título corto como anfitriona",
    titlePlaceholder: "Ej: Anfitriona de planes de senderismo",
    bioLabel: "Descripción como host",
    bioPlaceholder: "Cuenta qué tipo de planes organizas y tu estilo",
    websiteLabel: "Web principal",
    websitePlaceholder: "https://tusitio.com",
    shopLabel: "Tienda o red social principal",
    shopPlaceholder: "@tuusuario o enlace directo",
    contactLabel: "Contacto (email o teléfono)",
    contactPlaceholder: "Email o formulario de contacto",
    requestPrefix: "¿Eres anfitriona?",
    requestLink: "Avísanos.",
    requestOk: "¡Gracias! Revisaremos tu perfil para activarte como anfitriona 💫",
    requestErr: "No se pudo enviar la solicitud. Inténtalo más tarde.",
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

  host: {
    label: "¿Eres anfitriona? *",
    yes: "Sí",
    no: "No",
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
valencia: {
  alt: "Valencia",
  intro: {
    title1: "¿Recién llegada a Valencia?",
    title2: "¿O con ganas de reconectar con la ciudad?",
    p1: "Este es tu espacio para encontrar nuevas amigas, compartir intereses y crear planes que de verdad te llenen.",
p4: "Elige la categoría que más resuene contigo y empieza a construir comunidad.",
p5: "A tu ritmo, a tu manera💫",
  },
  categories: { title: "Encuentra tu tribu" },
},
// …dentro de es
category: {
  meta: {
    defaultTitle: "Explora esta categoría",
  },
  back: "← Volver",
  intro: {
    l1: "Encuentra los grupos que resuenan contigo… o crea uno tú misma.",
    l4: "Filtra por ",
    l5u1: "ubicación o edad",
    l6: ", sigue tus favoritos y descubre qué está pasando cerca de ti.",
  },
  groups: {
    loading: "Cargando grupos…",
    none: "Aún no hay grupos aprobados en esta categoría.",
  },
  create: {
    cta: "Solicitar un nuevo grupo",
    title: "Crear grupo",
    description:
      "Propón un nuevo grupo para esta categoría. Lo revisaremos antes de publicarlo.",
    nameLabel: "Nombre del grupo *",
    namePh: "Ej: Art in the park",
    descLabel: "Descripción (opcional)",
    descPh: "Cuéntanos de qué va el grupo",
    sending: "Enviando…",
    submit: "Enviar propuesta",
    thanks: "¡Gracias! Revisaremos tu grupo y lo publicaremos si todo está OK.",
    fail: "No se pudo crear el grupo.",
  },
  errors: {
    cityOrCatMissing: "Ciudad o categoría no encontrada.",
  },
  events: {
    title: "Planes relacionados",
    followedTitle: "Eventos de tus grupos seguidos",
    followedAlt: "Eventos de tus grupos seguidos",
    cardTitle: "Evento",
    cardAlt: "Evento",
    promote: "Me gustaría promocionar un evento",
  },
  places: {
    title: "Lugares que van con la vibra",
    cardTitle: "Lugar",
    cardAlt: "Lugar",
    promote: "Me gustaría promocionar un lugar",
  },
},
myGroupsPage: {
  title: "Mis grupos",
  exploreCities: "Explorar ciudades",
  loading: "Cargando tus grupos…",
  emptyLead: "Aún no sigues ningún grupo.",
  findYourCity: "Encuentra tu ciudad",
  joinSuffix: "y únete.",
  enterGroup: "Entrar al grupo",
  goToGroup: "Ir al grupo",
  missing: "—",
},
notificationsPage: {
  title: "Notificaciones",
  loading: "Cargando notificaciones…",
  markAllLine1: "Marcar todo",
  markAllLine2: "como leído",
  emptyLead: "No tienes notificaciones todavía.",
  exploreCommunity: "Explora la comunidad",
  defaultTitle: "Notificación",
},
dmInbox: {
  loading: "Cargando…",
  signIn: "Inicia sesión",
  title: "Mensajes",
  empty:
    "No hay conversaciones todavía. ¡Escribe a alguien desde su perfil o un mensaje del grupo!",
  userFallback: "usuario",
  open: "Abrir",
  openChatTitle: "Abrir chat con @{username}",
},
cookies: {
  title: "Política de Cookies",
  intro:
    "Usamos cookies esenciales para el funcionamiento del sitio y cookies analíticas (Google Analytics) para medir visitas y mejorar la experiencia. Las analíticas están desactivadas por defecto hasta que das tu consentimiento.",
  typesTitle: "Tipos de cookies",
  types: {
    essentialTitle: "Esenciales",
    essentialDesc:
      "necesarias para funciones básicas (seguridad, carga de páginas). No requieren consentimiento.",
    analyticsTitle: "Analíticas",
    analyticsDesc:
      "nos ayudan a entender cómo se usa el sitio. Solo se activan si aceptas.",
  },
  consentTitle: "Gestión del consentimiento",
  consentText:
    "Puedes aceptar o rechazar cookies en el banner que aparece al visitar la web. Tu decisión se guardará y puedes cambiarla borrando el almacenamiento local del navegador.",
},
footer: {
  privacy: "Política de Privacidad",
  cookiePrefs: "Preferencias de cookies",
  cookiePrefsAria: "Abrir preferencias de cookies",
  copyright: "© 2025 GirlsCollective. Todos los derechos reservados.",
},
guidelines: {
    title: "Normas de la comunidad",
    intro:
      "Queremos un espacio seguro, amable y divertido. Al usar Girls Collective aceptas seguir estas reglas.",
    rule1: {
      title: "1) Respeto primero",
      body:
        "No se permiten insultos, acoso, lenguaje de odio, amenazas, ni doxxing. Trátate y trata a las demás con empatía.",
    },
    rule2: {
      title: "2) Contenido sensible",
      body:
        "Prohibido contenido sexual explícito, violento o que promueva drogas/armas. Evita compartir materiales que puedan herir a otras personas.",
    },
    rule3: {
      title: "3) Seguridad",
      body:
        "No compartas datos personales (teléfono, dirección, documentos). Si organizas un plan, hazlo con sentido común y en lugares públicos.",
    },
    rule4: {
      title: "4) Spam y estafas",
      body:
        "Nada de spam, cuentas falsas o promociones sin permiso. Reporta enlaces sospechosos o comportamientos raros.",
    },
    rule5: {
      title: "5) Edad mínima",
      body:
        "El uso de Girls Collective es para mayores de 16 años (ajústalo si tu política es diferente).",
    },
    rule6: {
      title: "6) Consecuencias",
      body:
        "Podemos aplicar avisos, suspensión temporal o ban permanente ante incumplimientos. Los contenidos reportados o marcados como sensibles pueden ocultarse hasta revisión.",
    },
    help: {
      title: "¿Necesitas ayuda?",
      body:
        "Si ves algo que incumple estas normas, usa el botón Reportar o escríbenos desde",
      linkText: "Política de Privacidad",
      tail: "para ver cómo contactarnos.",
    },
  },
privacy: {
      title: "Política de Privacidad",
      section1: {
        title: "1. Información que recopilamos",
        p1: "Cuando utilizas nuestra aplicación, podemos recopilar:",
        items: {
          register: {
            bold: "Datos de registro:",
            text: "correo electrónico y contraseña (a través de Supabase).",
          },
          profile: {
            bold: "Datos de perfil:",
            text: "nombre de usuario, ciudad, año de nacimiento, biografía, intereses, foto de perfil e intereses personalizados.",
          },
          tech: {
            bold: "Datos técnicos:",
            text: "uso de la app, cookies y registros del servidor.",
          },
        },
      },
      section2: {
        title: "2. Uso de los datos",
        items: {
          improve: "Mejorar la experiencia de la comunidad.",
          personalize: "Personalizar tu perfil y recomendaciones.",
          contact: "Contactarte sobre novedades de tu ciudad.",
        },
      },
      section3: {
        title: "3. Compartición de datos",
        p: "Nunca venderemos tus datos. Solo se comparten con servicios necesarios para el funcionamiento de la app (como Supabase para autenticación y base de datos).",
      },
      section4: {
        title: "4. Tus derechos",
        p1: "Puedes solicitar la eliminación o modificación de tus datos en cualquier momento escribiéndonos a",
      },
      section5: {
        title: "5. Cambios",
        p: "Esta política puede actualizarse. Si hay cambios importantes, te lo notificaremos dentro de la app.",
      },
      section6: {
        title: "6. Edad mínima de uso",
        p: "Girls Collective está dirigida exclusivamente a personas mayores de 16 años. Si descubrimos que una persona menor de esa edad ha creado una cuenta, podremos eliminar o suspender su acceso para proteger su privacidad y cumplir con la normativa vigente.",
      },
      footer: {
        lastUpdated: "Última actualización",
      },
    },

    hosts: {
  title: "Organiza esos planes que amas",
  intro: "¿Ya creas experiencias… o llevas tiempo pensando en hacerlo?",
  brand: "Girls Collective",
  brandPrefix: "En",
  p1: "damos espacio a planes con alma: visibilidad, apoyo y una comunidad de mujeres que valora el cuidado, la intención y los detalles.",
  p2: "Aquí no se trata de cantidad, sino de crear momentos que realmente importan.",
  cta1: "Conviértete en anfitriona",
  cta1_aria: "Conviértete en anfitriona",
  how: {
    title: "Cómo funciona💫",
    1: {
      title: "Crea tu perfil",
      text: "Cuéntanos quién eres, qué te gusta crear y qué tipo de experiencias te representan.",
    },
    2: {
      title: "Diseña planes alineados con tu vibra",
      text1: "Propón planes dentro de los grupos que mejor encajen contigo.",
      text2:
        "Cada semana destacamos los planes de la semana, rotando entre anfitrionas para dar visibilidad a todas.",
    },
    3: {
      title: "Conecta con las asistentes",
      text:
        "El día del plan se abre un chat privado para compartir detalles, resolver dudas y facilitar la experiencia.",
    },
    4: {
      title: "Recibe valoraciones",
      text:
        "Las opiniones de las asistentes nos ayudan a cuidar la calidad de los planes y a construir una comunidad segura y de confianza.",
    },
  },
  cta2: "Empieza a crear planes",
  cta2_aria: "Empieza a crear planes",
  backHome: "Volver a la home",
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
        prev: "Previous",
        next: "Next",
        lastUpdated: "Last updated",
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
      heroTitle: "Your safe space to make friends, share plans and connect with the city you call home.",

      // optional richer hero block
      hero: {
        tagline: "where girls connect, thrive & vibe✨",
        title: "Your safe space to find your tribe in that new city.",
        cta: "JOIN!",
        ctaAria: "Join",
        hostsInline: "Are you a host?",
      },

      hosts: {
    secondaryCta: "Become a host",
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

      cityPhilosophy: {
  title: "Built city by city. Grown with care.",
  p1: "We believe community works best when it’s local, familiar and human.",
  p2: "That’s why Girls Collective grows one city at a time, creating spaces where faces become familiar and connections last.",
  closing: "Find your people. Feel at home in your city.",
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
            a: "Create your account, complete your profile, go to your city and explore the different groups (or create your own) to meet other girls. You can also join existing plans or host your own.",
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

  host: {
    label: "Are you a host? *",
    yes: "Yes",
    no: "No",
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

  host: {
    cardTitle: "Host profile",
    cardSubtitle: "These details can be shown on your events and public profile.",
    titleLabel: "Short host title",
    titlePlaceholder: "e.g. Hiking & outdoor plans host",
    bioLabel: "Bio",
    bioPlaceholder: "Share what kind of plans you organize and your style",
    websiteLabel: "Main website",
    websitePlaceholder: "https://yourwebsite.com",
    shopLabel: "Main social page",
    shopPlaceholder: "@youruser or direct link",
    contactLabel: "Contact (email or phone number)",
    contactPlaceholder: "Email or contact form",
    requestPrefix: "Are you a host?",
    requestLink: "Let us know.",
    requestOk: "Thank you! We’ll review your profile to activate your host status 💫",
    requestErr: "We couldn’t send the request. Please try again later.",
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
valencia: {
  alt: "Valencia",
  intro: {
    title1: "New in Valencia?",
    title2: "Or want to reconnect with the city?",
    p1: "This is your space to find new friends, share interests and create plans that truly fulfill you.",
p4: "Choose the category that resonates with you the most and start building community.",
p5: "At your pace, in your own way💫",
  },
  categories: { title: "Find your tribe" },
},
category: {
  meta: {
    defaultTitle: "Explore this category",
  },
  back: "← Back",
  intro: {
    l1: "Find the groups that resonate with you… or create one yourself.",
  l4: "Filter by ",
  l5u1: "location or age",
  l6: ", follow your favorites and discover what's happening near you.",
  },
  groups: {
    loading: "Loading groups…",
    none: "No approved groups in this category yet.",
  },
  create: {
    cta: "Request a new group",
    title: "Create group",
    description:
      "Propose a new group for this category. We'll review it before publishing.",
    nameLabel: "Group name *",
    namePh: "e.g., Art in the park",
    descLabel: "Description (optional)",
    descPh: "Tell us what the group is about",
    sending: "Sending…",
    submit: "Send proposal",
    thanks: "Thanks! We'll review your group and publish it if everything looks good.",
    fail: "Couldn't create the group.",
  },
  errors: {
    cityOrCatMissing: "City or category not found.",
  },
  events: {
    title: "Related events",
    followedTitle: "Events from your followed groups",
    followedAlt: "Events from your followed groups",
    cardTitle: "Event",
    cardAlt: "Event",
    promote: "I'd like to promote an event",
  },
  places: {
    title: "Places that match the vibe",
    cardTitle: "Place",
    cardAlt: "Place",
    promote: "I'd like to promote a place",
  },
},
myGroupsPage: {
  title: "My groups",
  exploreCities: "Explore cities",
  loading: "Loading your groups…",
  emptyLead: "You don't follow any groups yet.",
  findYourCity: "Find your city",
  joinSuffix: "and join.",
  enterGroup: "Enter group",
  goToGroup: "Go to group",
  missing: "—",
},
notificationsPage: {
  title: "Notifications",
  loading: "Loading notifications…",
  markAllLine1: "Mark all",
  markAllLine2: "as read",
  emptyLead: "You don't have any notifications yet.",
  exploreCommunity: "Explore the community",
  defaultTitle: "Notification",
},
dmInbox: {
  loading: "Loading…",
  signIn: "Sign in",
  title: "Messages",
  empty:
    "No conversations yet. Start one from someone’s profile or from a group message!",
  userFallback: "user",
  open: "Open",
  openChatTitle: "Open chat with @{username}",
},
cookies: {
  title: "Cookie Policy",
  intro:
    "We use essential cookies for site functionality and analytics cookies (Google Analytics) to measure visits and improve the experience. Analytics are disabled by default until you give consent.",
  typesTitle: "Types of cookies",
  types: {
    essentialTitle: "Essential",
    essentialDesc:
      "required for basic functions (security, page loading). No consent required.",
    analyticsTitle: "Analytics",
    analyticsDesc:
      "help us understand how the site is used. They only activate if you accept.",
  },
  consentTitle: "Consent management",
  consentText:
    "You can accept or reject cookies in the banner shown when visiting the site. Your choice is saved and you can change it by clearing your browser’s local storage.",
},
footer: {
  privacy: "Privacy Policy",
  cookiePrefs: "Cookie preferences",
  cookiePrefsAria: "Open cookie preferences",
  copyright: "© 2025 GirlsCollective. All rights reserved.",
},
  guidelines: {
    title: "Community Guidelines",
    intro:
      "We want a safe, kind and fun space. By using Girls Collective you agree to follow these rules.",
    rule1: {
      title: "1) Lead with respect",
      body:
        "No insults, harassment, hate speech, threats, or doxxing. Treat others (and yourself) with empathy.",
    },
    rule2: {
      title: "2) Sensitive content",
      body:
        "No explicit sexual or violent content, or content promoting drugs/weapons. Avoid sharing materials that could harm others.",
    },
    rule3: {
      title: "3) Safety",
      body:
        "Don’t share personal data (phone, address, documents). If you organize a plan, use common sense and meet in public places.",
    },
    rule4: {
      title: "4) Spam & scams",
      body:
        "No spam, fake accounts, or promotions without permission. Report suspicious links or behavior.",
    },
    rule5: {
      title: "5) Minimum age",
      body:
        "Girls Collective is for people aged 16+ (adjust if your policy differs).",
    },
    rule6: {
      title: "6) Consequences",
      body:
        "We may issue warnings, temporary suspensions or a permanent ban for violations. Reported or sensitive content may be hidden pending review.",
    },
    help: {
      title: "Need help?",
      body:
        "If you see something that breaks these rules, use the Report button or contact us via",
      linkText: "Privacy Policy",
      tail: "to see how to reach us.",
    },
  },
    privacy: {
      title: "Privacy Policy",
      section1: {
        title: "1. Information we collect",
        p1: "When you use our app, we may collect:",
        items: {
          register: {
            bold: "Registration data:",
            text: "email and password (via Supabase).",
          },
          profile: {
            bold: "Profile data:",
            text: "username, city, year of birth, bio, interests, profile photo, and custom interests.",
          },
          tech: {
            bold: "Technical data:",
            text: "app usage, cookies, and server logs.",
          },
        },
      },
      section2: {
        title: "2. How we use data",
        items: {
          improve: "Improve the community experience.",
          personalize: "Personalize your profile and recommendations.",
          contact: "Contact you about news in your city.",
        },
      },
      section3: {
        title: "3. Data sharing",
        p: "We will never sell your data. We only share it with services required to run the app (such as Supabase for authentication and database).",
      },
      section4: {
        title: "4. Your rights",
        p1: "You can request deletion or modification of your data at any time by writing to",
      },
      section5: {
        title: "5. Changes",
        p: "This policy may be updated. If there are significant changes, we will notify you in the app.",
      },
      section6: {
        title: "6. Minimum age of use",
        p: "Girls Collective is intended only for people aged 16 or older. If we discover that someone under that age has created an account, we may remove or suspend access to protect their privacy and comply with applicable regulations.",
      },
      footer: {
        lastUpdated: "Last updated",
      },
    },

    hosts: {
  title: "Host the plans you love",
  intro: "Are you already creating experiences… or have you been thinking about it for a while?",
  brand: "Girls Collective",
  brandPrefix: "At",
  p1: "gives you visibility, support, and a community that values intention, care and well-thought-out experiences over chaos.",
  p2: "It’s not about quantity — it’s about creating moments that truly matter.",
  cta1: "Become a host",
  cta1_aria: "Become a host",
  how: {
    title: "How hosting works💫",
    1: {
      title: "Create your profile",
      text: "Tell us who you are, what you love to create, and what kind of experiences represent you.",
    },
    2: {
      title: "Design plans aligned with your vibe",
      text1: "Propose plans inside the groups that match you best.",
      text2:
        "Each week we highlight the *Plans of the week*, rotating between hosts to give visibility to everyone.",
    },
    3: {
      title: "Connect with attendees",
      text:
        "On the day of the plan, a private chat opens to share details, answer questions, and make the experience smoother.",
    },
    4: {
      title: "Receive reviews",
      text:
        "Attendees’ feedback helps us maintain quality and build a safe, trusted community.",
    },
  },
  cta2: "Start hosting plans",
  cta2_aria: "Start hosting plans",
  backHome: "Back to home",
},

    
  },
} as const;

export type Dict = typeof DICT;
