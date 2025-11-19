"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { useAuth } from "@/lib/auth";
import { ArrowRight, PlusCircle } from "lucide-react";

// i18n
import { getLang, getDict, t as tt } from "@/lib/i18n";
import type { Lang } from "@/lib/dictionaries";

type City = { id: string; name: string; slug: string };
type Profile = {
  id: string;
  username: string | null;
  bio: string | null;
  city_id: string | null;
  avatar_url: string | null;
  favorite_emoji?: string | null;
  quote?: string | null;
  is_host?: boolean | null;
  host_title?: string | null;
  host_bio?: string | null;
  host_website?: string | null;
  host_shop_url?: string | null;
  host_contact?: string | null;
};
type Group = {
  id: string;
  slug: string;
  name: string;
  category_id: string;
  city_id: string;
};
type Category = { id: string; slug: string; name: string };
type CityRow = { id: string; slug: string; name: string };

// Cambia esto si tu tabla join se llama distinto
const PROFILE_CATS_TABLE = "profile_categories";

// ---- helpers: sanitize avatar path ----
function sanitizeFileName(name: string) {
  const base = name
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[\u200B-\u200D\uFEFF]/g, "");
  const parts = base.split(".");
  const ext =
    parts.length > 1 ? parts.pop()!.toLowerCase().replace(/[^a-z0-9]/g, "") : "jpg";
  const stem = parts.join(".").toLowerCase().replace(/[^a-z0-9._-]/g, "-");
  const cleanStem = stem
    .replace(/[-_.]{2,}/g, "-")
    .replace(/^[-_.]+|[-_.]+$/g, "");
  return `${cleanStem || "avatar"}.${ext || "jpg"}`;
}
function safeStoragePath(userId: string, file: File) {
  const clean = sanitizeFileName(file.name || "avatar.jpg");
  return `${userId}/${Date.now()}_${clean}`;
}

export default function ProfilePage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  // i18n
  const [lang, setLang] = useState<Lang>("es");
  useEffect(() => setLang(getLang()), []);
  const dict = useMemo(() => getDict(lang), [lang]);
  const t = (k: string, fallback?: string) => tt(dict, k, fallback);

  // perfil básico
  const [profile, setProfile] = useState<Profile | null>(null);
  const [username, setUsername] = useState("");
  const [bio, setBio] = useState("");
  const [cityId, setCityId] = useState<string>("");

  // extra fields
  const [favoriteEmoji, setFavoriteEmoji] = useState("");
  const [inspiringQuote, setInspiringQuote] = useState("");

  // HOST fields (solo editable si ya es host)
  const [isHost, setIsHost] = useState(false);
  const [hostTitle, setHostTitle] = useState("");
  const [hostBio, setHostBio] = useState("");
  const [hostWebsite, setHostWebsite] = useState("");
  const [hostShopUrl, setHostShopUrl] = useState("");
  const [hostContact, setHostContact] = useState("");

  // avatar
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [avatarFileName, setAvatarFileName] = useState<string>(""); // para mostrar nombre

  // catálogos
  const [cities, setCities] = useState<City[]>([]);
  const [allCategories, setAllCategories] = useState<Category[]>([]);

  // intereses del perfil
  const [selectedCatIds, setSelectedCatIds] = useState<string[]>([]);
  const [interestMsg, setInterestMsg] = useState("");
  const [interestErr, setInterestErr] = useState("");

  // galería
  const [galleryFiles, setGalleryFiles] = useState<File[]>([]);
  const [galleryPreviews, setGalleryPreviews] = useState<string[]>([]);
  const [galleryMsg, setGalleryMsg] = useState("");
  const [galleryOk, setGalleryOk] = useState("");
  const [galleryErr, setGalleryErr] = useState("");
  const [gallerySaving, setGallerySaving] = useState(false);

  // grupos del perfil
  const [myGroups, setMyGroups] = useState<Group[]>([]);
  const [catMap, setCatMap] = useState<Record<string, Category>>({});
  const [cityMap, setCityMap] = useState<Record<string, CityRow>>({});

  // guardado perfil
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");

  // validación username
  const [nameChecking, setNameChecking] = useState(false);
  const [nameError, setNameError] = useState<string>("");

  // password
  const [pwd1, setPwd1] = useState("");
  const [pwd2, setPwd2] = useState("");
  const [pwdMsg, setPwdMsg] = useState("");
  const [pwdErr, setPwdErr] = useState("");

  // redirect si no hay user
  useEffect(() => {
    if (!loading && !user) router.push("/auth");
  }, [loading, user, router]);

  // carga inicial
  useEffect(() => {
    (async () => {
      if (!user) return;

      // ciudades
      const { data: cityRows } = await supabase
        .from("cities")
        .select("id,name,slug")
        .order("name");
      setCities(cityRows ?? []);

      // categorías
      const { data: allCats } = await supabase
        .from("categories")
        .select("id,slug,name")
        .order("name");
      setAllCategories(allCats ?? []);

      // perfil (incluye campos host)
      const { data: prof } = await supabase
        .from("profiles")
        .select(
          "id, username, bio, city_id, avatar_url, favorite_emoji, quote, is_host, host_title, host_bio, host_website, host_shop_url, host_contact"
        )
        .eq("id", user.id)
        .maybeSingle<Profile>();

      if (prof) {
        setProfile(prof);
        setUsername(prof.username ?? "");
        setBio(prof.bio ?? "");
        setCityId(prof.city_id ?? "");
        setAvatarPreview(prof.avatar_url ?? null);
        setFavoriteEmoji(prof.favorite_emoji ?? "");
        setInspiringQuote(prof.quote ?? "");
        setIsHost(Boolean(prof.is_host));
        setHostTitle(prof.host_title ?? "");
        setHostBio(prof.host_bio ?? "");
        setHostWebsite(prof.host_website ?? "");
        setHostShopUrl(prof.host_shop_url ?? "");
        setHostContact(prof.host_contact ?? "");
      }

      // intereses del usuario
      const { data: myCats } = await supabase
        .from(PROFILE_CATS_TABLE)
        .select("category_id")
        .eq("profile_id", user.id);
      setSelectedCatIds(
        (myCats ?? []).map((r: { category_id: string }) => r.category_id)
      );

      // galería existente
      const { data: photos } = await supabase
        .from("profile_photos")
        .select("url, position")
        .eq("profile_id", user.id)
        .order("position");
      if (photos?.length) {
        setGalleryPreviews(photos.map((p) => p.url));
      } else {
        setGalleryPreviews([]);
      }

      // memberships → grupos
      const { data: mems } = await supabase
        .from("group_members")
        .select("group_id")
        .eq("profile_id", user.id);

      const groupIds = (mems ?? []).map((m: { group_id: string }) => m.group_id);
      if (groupIds.length) {
        const { data: groups } = await supabase
          .from("groups")
          .select("id, slug, name, category_id, city_id")
          .in("id", groupIds);
        setMyGroups(groups ?? []);

        const catIds = Array.from(
          new Set((groups ?? []).map((g) => g.category_id))
        );
        if (catIds.length) {
          const m: Record<string, Category> = {};
          (allCats ?? []).forEach((c) => {
            if (catIds.includes(c.id)) m[c.id] = c;
          });
          setCatMap(m);
        }
        const cIds = Array.from(
          new Set((groups ?? []).map((g) => g.city_id))
        );
        if (cIds.length) {
          const { data: cts } = await supabase
            .from("cities")
            .select("id, slug, name")
            .in("id", cIds);
          const m2: Record<string, CityRow> = {};
          (cts ?? []).forEach((c: CityRow) => (m2[c.id] = c));
          setCityMap(m2);
        }
      } else {
        setMyGroups([]);
      }
    })();
  }, [user]);

  // preview avatar
  useEffect(() => {
    if (!avatarFile) return;
    const url = URL.createObjectURL(avatarFile);
    setAvatarPreview(url);
    setAvatarFileName(avatarFile.name || "");
    return () => URL.revokeObjectURL(url);
  }, [avatarFile]);

  // previews galería
  useEffect(() => {
    if (galleryFiles.length === 0) return;
    galleryPreviews.forEach((u) => {
      if (u.startsWith("blob:")) URL.revokeObjectURL(u);
    });
    const blobs = galleryFiles.slice(0, 3).map((f) => URL.createObjectURL(f));
    setGalleryPreviews(blobs);
    return () => blobs.forEach((u) => URL.revokeObjectURL(u));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [galleryFiles]);

  // unique username
  useEffect(() => {
    if (!user) return;
    if (!username.trim()) {
      setNameError(
        t(
          "profile.username.required",
          "El nombre de usuario es obligatorio."
        )
      );
      return;
    }
    let active = true;
    (async () => {
      setNameChecking(true);
      setNameError("");
      const { data, error } = await supabase
        .from("profiles")
        .select("id")
        .ilike("username", username.trim())
        .neq("id", user.id);
      if (active) {
        if (error)
          setNameError(
            t(
              "profile.username.validateFail",
              "No se pudo validar el nombre."
            )
          );
        else if ((data ?? []).length > 0)
          setNameError(
            t("profile.username.taken", "Este nombre ya está en uso.")
          );
        else setNameError("");
      }
      setNameChecking(false);
    })();
    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [username, user]);

  const canSave = useMemo(
    () => !!user && username.trim().length >= 2 && !nameError && !!cityId,
    [user, username, nameError, cityId]
  );

  function onAvatarChange(f: File | null) {
    if (!f) {
      setAvatarFile(null);
      setAvatarFileName("");
      return;
    }
    const okType = ["image/jpeg", "image/png"].includes(f.type);
    const okSize = f.size <= 2 * 1024 * 1024; // 2MB
    if (!okType) {
      alert(t("profile.errors.avatarType", "Debe ser .jpg o .png"));
      return;
    }
    if (!okSize) {
      alert(t("profile.errors.avatarSize", "Tamaño máximo 2MB"));
      return;
    }
    setAvatarFile(f);
  }

  async function handleSaveProfile(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;
    setSaving(true);
    setMsg("");
    setErr("");

    try {
      let avatar_url = profile?.avatar_url ?? null;
      if (avatarFile) {
        const path = safeStoragePath(user.id, avatarFile);
        const { error: upErr } = await supabase.storage
          .from("Avatars")
          .upload(path, avatarFile, {
            upsert: true,
            cacheControl: "3600",
            contentType: avatarFile.type || "image/jpeg",
          });
        if (upErr) throw upErr;

        const pub = supabase.storage.from("Avatars").getPublicUrl(path);
        avatar_url = pub?.data?.publicUrl ?? null;
      }

      const { error: profErr } = await supabase
        .from("profiles")
        .update({
          username: username.trim(),
          bio: bio.trim() || null,
          city_id: cityId,
          avatar_url,
          favorite_emoji: favoriteEmoji.trim() || null,
          quote: inspiringQuote.trim() || null,
          // solo guardamos datos host; is_host se gestiona aparte (manual)
          host_title: isHost ? hostTitle.trim() || null : null,
          host_bio: isHost ? hostBio.trim() || null : null,
          host_website: isHost ? hostWebsite.trim() || null : null,
          host_shop_url: isHost ? hostShopUrl.trim() || null : null,
          host_contact: isHost ? hostContact.trim() || null : null,
        })
        .eq("id", user.id);
      if (profErr) throw profErr;

      setMsg(t("profile.messages.updated", "Perfil actualizado ✅"));
    } catch (e) {
      const m =
        e instanceof Error
          ? e.message
          : t("profile.errors.saveFail", "No se pudo guardar.");
      setErr(m);
    } finally {
      setSaving(false);
    }
  }

  // intereses
  function toggleCat(id: string) {
    setSelectedCatIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  }
  async function saveInterests() {
    if (!user) return;
    setInterestMsg("");
    setInterestErr("");
    try {
      await supabase.from(PROFILE_CATS_TABLE).delete().eq("profile_id", user.id);
      if (selectedCatIds.length) {
        await supabase
          .from(PROFILE_CATS_TABLE)
          .insert(
            selectedCatIds.map((category_id) => ({
              profile_id: user.id,
              category_id,
            }))
          );
      }
      setInterestMsg(t("profile.interests.ok", "Intereses actualizados ✅"));
    } catch (e) {
      const m =
        e instanceof Error
          ? e.message
          : t(
              "profile.interests.err",
              "No se pudieron actualizar los intereses."
            );
      setInterestErr(m);
    }
  }

  // galería
  async function saveGallery() {
    if (!user) return;
    setGalleryOk("");
    setGalleryErr("");
    setGallerySaving(true);
    try {
      if (galleryFiles.length === 0) {
        setGalleryOk(
          t("profile.gallery.noChanges", "No hay cambios en la galería.")
        );
        setGallerySaving(false);
        return;
      }
      const urls: string[] = [];
      for (const f of galleryFiles.slice(0, 3)) {
        const okType = ["image/jpeg", "image/png"].includes(f.type);
        const okSize = f.size <= 2 * 1024 * 1024;
        if (!okType)
          throw new Error(
            t(
              "profile.errors.galleryType",
              "Las fotos deben ser .jpg o .png"
            )
          );
        if (!okSize)
          throw new Error(
            t(
              "profile.errors.gallerySize",
              "Máximo 2MB por foto"
            )
          );

        const path = `${user.id}/gallery/${Date.now()}_${sanitizeFileName(
          f.name
        )}`;
        const { error: upErr } = await supabase.storage
          .from("Avatars")
          .upload(path, f, {
            upsert: true,
            cacheControl: "3600",
            contentType: f.type || "image/jpeg",
          });
        if (upErr) throw upErr;

        const pub = supabase.storage.from("Avatars").getPublicUrl(path);
        const url = pub?.data?.publicUrl ?? null;
        if (url) urls.push(url);
      }

      await supabase.from("profile_photos").delete().eq("profile_id", user.id);
      if (urls.length) {
        const rows = urls.map((u, idx) => ({
          profile_id: user.id,
          url: u,
          position: idx,
        }));
        const { error: insErr } = await supabase
          .from("profile_photos")
          .insert(rows);
        if (insErr) throw insErr;
      }

      setGalleryOk(t("profile.gallery.ok", "Galería actualizada ✅"));
    } catch (e) {
      const m =
        e instanceof Error
          ? e.message
          : t(
              "profile.gallery.err",
              "No se pudo actualizar la galería."
            );
      setGalleryErr(m);
    } finally {
      setGallerySaving(false);
    }
  }

  // password
  async function handleChangePassword(e: React.FormEvent) {
    e.preventDefault();
    setPwdMsg("");
    setPwdErr("");

    if (!pwd1 || pwd1 !== pwd2) {
      setPwdErr(
        t(
          "profile.password.mismatch",
          "Las contraseñas no coinciden."
        )
      );
      return;
    }
    try {
      const { error } = await supabase.auth.updateUser({ password: pwd1 });
      if (error) throw error;
      setPwd1("");
      setPwd2("");
      setPwdMsg(
        t("profile.password.ok", "Contraseña actualizada ✅")
      );
    } catch (e) {
      const m =
        e instanceof Error
          ? e.message
          : t(
              "profile.password.err",
              "No se pudo actualizar la contraseña."
            );
      setPwdErr(m);
    }
  }

  // sesiones / seguridad
  async function handleSignOut() {
    await supabase.auth.signOut();
    router.push("/auth");
  }
  async function requestDeleteAccount() {
    const {
      data: { user: current },
    } = await supabase.auth.getUser();
    const email = current?.email ?? null;

    const { error } = await supabase.from("contact_messages").insert({
      name: "Delete Account Request",
      email,
      message: "User requests full account deletion.",
    });
    if (!error) {
      alert(
        t(
          "profile.security.deleteOk",
          "Solicitud enviada. Te contactaremos pronto 💌"
        )
      );
    } else {
      alert(
        t(
          "profile.security.deleteErr",
          "No se pudo enviar la solicitud. Inténtalo más tarde."
        )
      );
    }
  }

  // 🚀 Solicitud para activar anfitriona
  async function handleHostNotify() {
    const {
      data: { user: current },
    } = await supabase.auth.getUser();
    const email = current?.email ?? null;

    const { error } = await supabase.from("contact_messages").insert({
      name: "Host Activation Request",
      email,
      message:
        "User requests to be marked as host (is_host = true) in profiles.",
    });

    if (!error) {
      alert(
        t(
          "profile.host.requestOk",
          "¡Gracias! Revisaremos tu perfil para activarte como anfitriona 💫"
        )
      );
    } else {
      alert(
        t(
          "profile.host.requestErr",
          "No se pudo enviar la solicitud. Inténtalo más tarde."
        )
      );
    }
  }

  if (loading || !user) {
    return (
      <main className="min-h-screen grid place-items-center">
        {t("common.misc.loading", "Cargando…")}
      </main>
    );
  }

  // filtramos interés "otro"
  const visibleCategories = allCategories.filter((c) => {
    const name = c.name.toLowerCase();
    const slug = (c.slug || "").toLowerCase();
    return (
      name !== "otro" &&
      name !== "other" &&
      slug !== "otro" &&
      slug !== "other"
    );
  });

  return (
    <main className="min-h-screen bg-gcBackground text-gcText font-montserrat">
      <div className="max-w-5xl mx-auto p-6">
        <h1 className="text-3xl font-dmserif mb-2">
          {t("profile.title", "Mi perfil")}
        </h1>
        <p className="mb-6">
          {t("profile.subtitle", "Gestiona tu información y tus grupos 💜")}
        </p>

        {/* ===== Perfil + Host box como dos bloques blancos ===== */}
        <form onSubmit={handleSaveProfile} className="flex flex-col gap-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Bloque 1: datos personales */}
<div className="bg-white rounded-2xl p-6 shadow-md w-full">
  <div className="grid gap-6 md:grid-cols-[auto,minmax(0,1fr)] items-start">
    {/* Avatar */}
    <div className="shrink-0">
      <div className="w-28 h-28 rounded-full overflow-hidden bg-gcBackgroundAlt/30 grid place-items-center">
        {avatarPreview ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={avatarPreview}
            alt="Avatar"
            className="w-full h-full object-cover"
          />
        ) : (
          <span className="text-sm opacity-60">
            {t("profile.avatar.noPhoto", "Sin foto")}
          </span>
        )}
      </div>

      <div className="mt-3">
        <input
          id="avatar-input"
          type="file"
          accept="image/jpeg,image/png"
          className="sr-only"
          onChange={(e) => onAvatarChange(e.target.files?.[0] || null)}
        />
        <label
          htmlFor="avatar-input"
          className="inline-block rounded-full bg-[#50415b] text-[#fef8f4] font-montserrat px-4 py-1.5 text-sm shadow-md hover:opacity-90 cursor-pointer"
        >
          {t("profile.avatar.button", "Cargar foto")}
        </label>
        <div className="text-xs opacity-70 mt-1">
          {avatarFileName
            ? avatarFileName
            : t("profile.avatar.hint", "JPG o PNG · Máx 2MB")}
        </div>
      </div>
    </div>

    {/* Campos básicos */}
    <div className="grid gap-4 min-w-0 md:pr-4">
      <div>
        <label className="block text-xs mb-1">
          {t("profile.username.label", "Nombre de usuario *")}
        </label>
        <input
          className="w-full rounded-xl border p-2 text-sm md:text-base"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder={t(
            "profile.username.placeholder",
            "Tu nombre o apodo"
          )}
          required
        />
        {nameChecking && (
          <p className="text-xs opacity-70 mt-1">
            {t("profile.username.checking", "Comprobando…")}
          </p>
        )}
        {nameError && (
          <p className="text-xs text-red-600 mt-1">{nameError}</p>
        )}

        {/* CTA para no-hosts */}
        {!isHost && (
          <p className="text-xs mt-1">
            {t("profile.host.requestPrefix", "¿Eres anfitriona?") + " "}
            <button
              type="button"
              onClick={handleHostNotify}
              className="underline"
            >
              {t("profile.host.requestLink", "Avísanos.")}
            </button>
          </p>
        )}
      </div>

      <div>
        <label className="block text-xs mb-1">
          {t("profile.city.label", "Ciudad *")}
        </label>
        <select
          className="w-full rounded-xl border p-2 bg-white text-sm md:text-base"
          value={cityId}
          onChange={(e) => setCityId(e.target.value)}
          required
        >
          <option value="">
            {t("profile.city.placeholder", "Selecciona tu ciudad")}
          </option>
          {cities.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-xs mb-1">
          {t("profile.bio.label", "Bio (opcional)")}
        </label>
        <textarea
          className="w-full rounded-xl border p-2 text-sm md:text-base"
          rows={3}
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          placeholder={t(
            "profile.bio.placeholder",
            "Cuéntanos algo sobre ti ✨"
          )}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-[220px_1fr] gap-3 items-center">
        <label className="text-xs">
          {t("profile.emoji.label", "Un emoji de tus favoritos")}
        </label>
        <input
          className="w-32 rounded-xl border p-2 text-center text-xl"
          value={favoriteEmoji}
          onChange={(e) => setFavoriteEmoji(e.target.value.slice(0, 2))}
          placeholder={t("profile.emoji.placeholder", "💌")}
        />
      </div>

      <div>
        <label className="block text-xs mb-1">
          {t("profile.quote.label", "Una frase de tus favoritas")}
        </label>
        <textarea
          className="w-full rounded-xl border p-2 text-sm md:text-base"
          rows={2}
          value={inspiringQuote}
          onChange={(e) => setInspiringQuote(e.target.value)}
          placeholder={t(
            "profile.quote.placeholder",
            "Una frase cortita que te represente 💫"
          )}
        />
      </div>
    </div>
  </div>
</div>

            {/* Bloque 2: datos como anfitriona */}
            {isHost && (
              <aside className="bg-white rounded-2xl p-6 shadow-md self-stretch">
                <h2 className="font-dmserif text-2xl mb-1">
                  {t(
                    "profile.host.cardTitle",
                    "Perfil como anfitriona"
                  )}
                </h2>
                <p className="text-xs opacity-80 mb-5">
                  {t(
                    "profile.host.cardSubtitle",
                    "Estos datos se mostrarán en tus eventos y en tu perfil público."
                  )}
                </p>

                <div className="space-y-3 text-sm">
                  <div>
                    <label className="block text-xs mb-1">
                      {t(
                        "profile.host.titleLabel",
                        "Título corto como anfitriona"
                      )}
                    </label>
                    <input
                      className="w-full rounded-xl border p-2 text-sm md:text-base"
                      value={hostTitle}
                      onChange={(e) =>
                        setHostTitle(e.target.value)
                      }
                      placeholder={t(
                        "profile.host.titlePlaceholder",
                        "Ej: Tu nombre | Planes de senderismo"
                      )}
                    />
                  </div>

                  <div>
                    <label className="block text-xs mb-1">
                      {t(
                        "profile.host.bioLabel",
                        "Descripción como host"
                      )}
                    </label>
                    <textarea
                      className="w-full rounded-xl border p-2 text-sm md:text-base"
                      rows={3}
                      value={hostBio}
                      onChange={(e) =>
                        setHostBio(e.target.value)
                      }
                      placeholder={t(
                        "profile.host.bioPlaceholder",
                        "Cuenta qué tipo de planes organizas."
                      )}
                    />
                  </div>

                  <div>
                    <label className="block text-xs mb-1">
                      {t(
                        "profile.host.websiteLabel",
                        "Web principal"
                      )}
                    </label>
                    <input
                      className="w-full rounded-xl border p-2 text-sm md:text-base"
                      value={hostWebsite}
                      onChange={(e) =>
                        setHostWebsite(e.target.value)
                      }
                      placeholder={t(
                        "profile.host.websitePlaceholder",
                        "https://tusitio.com"
                      )}
                    />
                  </div>

                  <div>
                    <label className="block text-xs mb-1">
                      {t(
                        "profile.host.shopLabel",
                        "Red social principal"
                      )}
                    </label>
                    <input
                      className="w-full rounded-xl border p-2 text-sm md:text-base"
                      value={hostShopUrl}
                      onChange={(e) =>
                        setHostShopUrl(e.target.value)
                      }
                      placeholder={t(
                        "profile.host.shopPlaceholder",
                        "@tuusuario o enlace directo"
                      )}
                    />
                  </div>

                  <div>
                    <label className="block text-xs mb-1">
                      {t(
                        "profile.host.contactLabel",
                        "Contacto (email o télefono)"
                      )}
                    </label>
                    <input
                      className="w-full rounded-xl border p-2 text-sm md:text-base"
                      value={hostContact}
                      onChange={(e) =>
                        setHostContact(e.target.value)
                      }
                      placeholder={t(
                        "profile.host.contactPlaceholder",
                        "tu@gmail.com"
                      )}
                    />
                  </div>
                </div>
              </aside>
            )}
          </div>

          {/* Botón guardar */}
          <div className="flex gap-3 justify-start md:justify-end">
            <button
              type="submit"
              disabled={!canSave || saving}
              className="rounded-full bg-[#50415b] text-[#fef8f4] font-dmserif px-6 py-2 text-base md:text-lg shadow-md hover:opacity-90 disabled:opacity-60"
            >
              {saving
                ? t("profile.actions.saving", "Guardando…")
                : t("profile.actions.save", "Guardar cambios")}
            </button>
          </div>

          {msg && <p className="text-sm text-green-700">{msg}</p>}
          {err && <p className="text-sm text-red-600">{err}</p>}
        </form>

        {/* ===== Tus intereses ===== */}
        <section className="bg-white rounded-2xl p-6 shadow-md mt-6">
          <h2 className="font-dmserif text-2xl mb-4">
            {t("profile.interests.title", "Tus intereses")}
          </h2>

          <div className="flex flex-wrap gap-2 justify-start md:justify-center">
            {visibleCategories.map((c) => {
              const active = selectedCatIds.includes(c.id);
              return (
                <label
                  key={c.id}
                  className={`cursor-pointer select-none px-3 py-1.5 rounded-full border text-sm
                    ${
                      active
                        ? "bg-gcBackgroundAlt2 border-gcText"
                        : "bg-white hover:bg-black/5"
                    }`}
                >
                  <input
                    type="checkbox"
                    className="sr-only"
                    checked={active}
                    onChange={() => toggleCat(c.id)}
                  />
                  {c.name}
                </label>
              );
            })}
          </div>

          <div className="mt-4 flex justify-start md:justify-center">
            <button
              onClick={saveInterests}
              className="rounded-full bg-[#50415b] text-[#fef8f4] font-dmserif px-6 py-2 text-base md:text-lg shadow-md hover:opacity-90"
            >
              {t("profile.interests.updateBtn", "Actualizar")}
            </button>
          </div>

          {interestMsg && (
            <p className="text-sm text-green-700 mt-2">{interestMsg}</p>
          )}
          {interestErr && (
            <p className="text-sm text-red-600 mt-2">{interestErr}</p>
          )}
        </section>

        {/* ===== Tu galería ===== */}
        <section className="bg-white rounded-2xl p-6 shadow-md mt-6">
          <h2 className="font-dmserif text-2xl mb-3">
            {t("profile.gallery.title", "Tu galería")}
          </h2>

          <div className="flex items-center justify-start gap-3">
  <input
    id="gallery-input"
    type="file"
    accept="image/jpeg,image/png"
    multiple
    className="sr-only"
    onChange={(e) => {
      const files = Array.from(e.target.files ?? []);
      const chosen = files.slice(0, 3);
      setGalleryFiles(chosen);
      setGalleryMsg(
        chosen.length
          ? t(
              "profile.gallery.selectedCount",
              "{n} foto(s) seleccionada(s)"
            ).replace("{n}", String(chosen.length))
          : ""
      );
      setGalleryOk("");
      setGalleryErr("");
    }}
  />

  {/* Botón + en círculo como el otro */}
  <button
    type="button"
    onClick={() => document.getElementById("gallery-input")?.click()}
    className="w-9 h-9 rounded-full border border-gray-300 flex items-center justify-center shadow-sm hover:opacity-90"
  >
    <PlusCircle className="w-4 h-4" />
  </button>

  {galleryMsg && (
    <span className="text-xs opacity-80">{galleryMsg}</span>
  )}
</div>

          {galleryPreviews.length > 0 && (
            <div className="mt-3 grid grid-cols-3 gap-3 max-w-lg mx-auto">
              {galleryPreviews.map((src, i) => (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  key={i}
                  src={src}
                  alt={`Foto ${i + 1}`}
                  className="w-24 h-24 object-cover rounded-xl border"
                />
              ))}
            </div>
          )}

          <p className="text-xs opacity-70 mt-2">
            {t(
              "profile.gallery.hint",
              "Hasta 3 fotos · JPG o PNG · Máx 2MB por foto"
            )}
          </p>

          <div className="mt-4 flex justify-start md:justify-center">
            <button
              onClick={saveGallery}
              disabled={gallerySaving}
              className="rounded-full bg-[#50415b] text-[#fef8f4] font-dmserif px-6 py-2 text-base md:text-lg shadow-md hover:opacity-90 disabled:opacity-60"
            >
              {gallerySaving
                ? t("profile.gallery.saving", "Guardando…")
                : t("profile.gallery.updateBtn", "Actualizar")}
            </button>
          </div>

          {galleryOk && (
            <p className="text-sm text-green-700 mt-2">{galleryOk}</p>
          )}
          {galleryErr && (
            <p className="text-sm text-red-600 mt-2">{galleryErr}</p>
          )}
        </section>

        {/* ===== Mis grupos ===== */}
        <section className="bg-white rounded-2xl p-6 shadow-md mt-6">
          <h2 className="font-dmserif text-2xl mb-4">
            {t("profile.groups.title", "Mis grupos")}
          </h2>

          {myGroups.length === 0 && (
            <p className="opacity-70">
              {t(
                "profile.groups.empty",
                "Todavía no te has unido a ningún grupo."
              )}
            </p>
          )}

          <ul className="grid md:grid-cols-2 gap-3">
            {myGroups.map((g) => {
              const cat = catMap[g.category_id];
              const city = cityMap[g.city_id];
              const href =
                cat && city ? `/${city.slug}/${cat.slug}/group/${g.slug}` : "#";
              return (
                <li
                  key={g.id}
                  className="border rounded-xl p-3 flex items-center justify-between"
                >
                  <div>
                    <div className="font-semibold text-sm md:text-base">
                      {g.name}
                    </div>
                    <div className="text-xs opacity-70">
                      {city?.name ??
                        t("profile.groups.cityFallback", "Ciudad")}{" "}
                      •{" "}
                      {cat?.slug ??
                        t(
                          "profile.groups.categoryFallback",
                          "categoría"
                        )}
                    </div>
                  </div>
                  {cat && city ? (
                    <Link
                      href={href}
                      aria-label={t(
                        "profile.groups.goToGroup",
                        "Ir al grupo"
                      )}
                      className="rounded-full bg-[#50415b] text-[#fef8f4] p-2.5 shadow-md hover:opacity-90"
                      title={t(
                        "profile.groups.goToGroup",
                        "Ir al grupo"
                      )}
                    >
                      <ArrowRight className="w-5 h-5" />
                    </Link>
                  ) : (
                    <span className="text-sm opacity-60">—</span>
                  )}
                </li>
              );
            })}
          </ul>
        </section>

        {/* ===== Cambiar contraseña ===== */}
        <section className="bg-white rounded-2xl p-6 shadow-md mt-6 md:max-w-xl md:mx-auto">
          <h2 className="font-dmserif text-2xl mb-4">
            {t("profile.password.title", "Cambiar contraseña")}
          </h2>
          <form
            onSubmit={handleChangePassword}
            className="grid gap-3 max-w-md mx-auto"
          >
            <input
              type="password"
              className="w-full rounded-xl border p-2 text-sm md:text-base"
              placeholder={t(
                "profile.password.new",
                "Nueva contraseña"
              )}
              value={pwd1}
              onChange={(e) => setPwd1(e.target.value)}
              required
            />
            <input
              type="password"
              className="w-full rounded-xl border p-2 text-sm md:text-base"
              placeholder={t(
                "profile.password.confirm",
                "Confirmar nueva contraseña"
              )}
              value={pwd2}
              onChange={(e) => setPwd2(e.target.value)}
              required
            />
            <div className="flex justify-start md:justify-center">
              <button
                type="submit"
                className="rounded-full bg-[#50415b] text-[#fef8f4] font-dmserif px-6 py-2 text-base md:text-lg shadow-md hover:opacity-90"
              >
                {t("profile.password.updateBtn", "Actualizar")}
              </button>
            </div>
          </form>
          {pwdMsg && (
            <p className="text-sm text-green-700 mt-2">{pwdMsg}</p>
          )}
          {pwdErr && (
            <p className="text-sm text-red-600 mt-2">{pwdErr}</p>
          )}
        </section>

        {/* ===== Zona de seguridad ===== */}
        <section className="bg-white rounded-2xl p-6 shadow-md mt-6 md:max-w-xl md:mx-auto">
          <h2 className="font-dmserif text-2xl mb-3">
            {t("profile.security.title", "Zona de seguridad")}
          </h2>
          <div className="flex flex-wrap gap-3 justify-start md:justify-center">
            <button
              onClick={handleSignOut}
              className="rounded-full bg-[#50415b] text-[#fef8f4] font-dmserif px-6 py-2 text-base md:text-lg shadow-md hover:opacity-90"
            >
              {t("profile.security.signOut", "Cerrar sesión")}
            </button>
            <button
              onClick={requestDeleteAccount}
              className="rounded-full bg-red-600 text-white font-montserrat px-6 py-2 text-base md:text-lg shadow-md hover:opacity-90"
            >
              {t("profile.security.delete", "Eliminar cuenta")}
            </button>
          </div>
        </section>
      </div>
    </main>
  );
}
