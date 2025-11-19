"use client";

import { useEffect, useMemo, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { useAuth } from "@/lib/auth";
// 🟣 ANALYTICS: Vercel Analytics custom events
import { track } from "@vercel/analytics";

// i18n helpers
import { getLang, getDict, t as tt } from "@/lib/i18n";
import type { Lang } from "@/lib/dictionaries";

// 🟣 ANALYTICS: GA4 typing (optional but avoids TS 'any')
declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
  }
}

type City = { id: string; name: string; slug: string };
type Category = { id: string; name: string };

// ---- helpers: sanitize & storage paths ----
function sanitizeFileName(name: string) {
  const base = (name || "foto.jpg")
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[\u200B-\u200D\uFEFF]/g, "");
  const parts = base.split(".");
  const ext = parts.length > 1 ? parts.pop()!.toLowerCase().replace(/[^a-z0-9]/g, "") : "jpg";
  const stem = parts.join(".").toLowerCase().replace(/[^a-z0-9._-]/g, "-");
  const cleanStem = stem.replace(/[-_.]{2,}/g, "-").replace(/^[-_.]+|[-_.]+$/g, "");
  return `${cleanStem || "foto"}.${ext || "jpg"}`;
}
function safeStoragePath(userId: string, file: File, folder = "") {
  const clean = sanitizeFileName(file.name || "foto.jpg");
  const prefix = folder ? `${folder.replace(/\/+$/,"")}/` : "";
  return `${userId}/${prefix}${Date.now()}_${clean}`;
}

export default function OnboardingPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  // i18n
  const [lang, setLang] = useState<Lang>("es");
  useEffect(() => { setLang(getLang()); }, []);
  const dict = useMemo(() => getDict(lang), [lang]);
  const t = (k: string, fallback?: string) => tt(dict, k, fallback);

  const [username, setUsername] = useState("");
  const [bio, setBio] = useState("");
  const [birthYear, setBirthYear] = useState("");
  const [cities, setCities] = useState<City[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [cityId, setCityId] = useState<string>("");
  const [selectedCats, setSelectedCats] = useState<string[]>([]);
  const [customInterest, setCustomInterest] = useState("");

  // NEW
  const [favoriteEmoji, setFavoriteEmoji] = useState("");
  const [inspiringQuote, setInspiringQuote] = useState("");

  // NEW host
  const [isHost, setIsHost] = useState<boolean>(false);

  // Avatar + Gallery
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null); // preview or existing
  const [galleryFiles, setGalleryFiles] = useState<File[]>([]);
  const [galleryPreviews, setGalleryPreviews] = useState<string[]>([]);
  const [galleryMsg, setGalleryMsg] = useState("");

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string>("");
  const [consent, setConsent] = useState(false);
  const [usernameError, setUsernameError] = useState("");

  const usernameRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!loading && !user) router.push("/auth");
  }, [loading, user, router]);

  useEffect(() => {
    usernameRef.current?.focus();
  }, []);

  // catálogos
  useEffect(() => {
    (async () => {
      const { data } = await supabase.from("cities").select("id,name,slug").order("name");
      if (data) setCities(data);
    })();
  }, []);
  useEffect(() => {
    (async () => {
      const { data } = await supabase.from("categories").select("id,name").order("name");
      if (data) setCategories(data);
    })();
  }, []);

  // precarga por si re-abre onboarding
  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data } = await supabase
        .from("profiles")
        .select("username,bio,city_id,birth_year,favorite_emoji,quote,avatar_url,is_host")
        .eq("id", user.id)
        .maybeSingle();

      if (data) {
        setUsername(data.username ?? "");
        setBio(data.bio ?? "");
        setCityId(data.city_id ?? "");
        setBirthYear(data.birth_year ? String(data.birth_year) : "");
        setFavoriteEmoji(data.favorite_emoji ?? "");
        setInspiringQuote(data.quote ?? "");
        setAvatarPreview(data.avatar_url ?? null); // show current avatar
        setIsHost(Boolean(data.is_host)); // nuevo campo
      }

      const { data: cats } = await supabase
        .from("profile_categories")
        .select("category_id")
        .eq("profile_id", user.id);
      if (cats) setSelectedCats(cats.map((c) => c.category_id));

      const { data: custom } = await supabase
        .from("profile_custom_interests")
        .select("interest")
        .eq("profile_id", user.id)
        .maybeSingle();
      if (custom) setCustomInterest(custom.interest);
    })();
  }, [user]);

  // live preview for avatar selection
  useEffect(() => {
    if (!avatarFile) return;
    const url = URL.createObjectURL(avatarFile);
    setAvatarPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [avatarFile]);

  // live previews for gallery files
  useEffect(() => {
    // cleanup old urls
    return () => {
      galleryPreviews.forEach((u) => URL.revokeObjectURL(u));
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [galleryPreviews]);

  function handleGalleryChange(files: File[]) {
    // cleanup previous previews
    galleryPreviews.forEach((u) => URL.revokeObjectURL(u));
    const chosen = files.slice(0, 3);
    setGalleryFiles(chosen);
    setGalleryMsg(
      chosen.length
        ? t("setup.gallery.selectedCount", "{n} foto(s) seleccionada(s)").replace("{n}", String(chosen.length))
        : ""
    );
    const urls = chosen.map((f) => URL.createObjectURL(f));
    setGalleryPreviews(urls);
  }

  const canSave = useMemo(
    () =>
      !!user &&
      username.trim().length >= 2 &&
      !!cityId &&
      !!consent &&
      (!birthYear || (/^\d{4}$/.test(birthYear) && +birthYear >= 1900 && +birthYear <= new Date().getFullYear())),
    [user, username, cityId, consent, birthYear]
  );

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;
    setSaving(true);
    setError("");
    setUsernameError("");

    try {
      // 1) Avatar (opcional)
      let avatar_url: string | null = null;
      if (avatarFile) {
        const path = safeStoragePath(user.id, avatarFile);
        const { error: upErr } = await supabase.storage
          .from("Avatars")
          .upload(path, avatarFile, { upsert: true });
        if (upErr) throw upErr;
        const pub = supabase.storage.from("Avatars").getPublicUrl(path);
        avatar_url = pub?.data?.publicUrl ?? null;
      }

      // 2) Upsert perfil
      const { error: profErr } = await supabase.from("profiles").upsert({
        id: user.id,
        username: username.trim(),
        bio: bio.trim() || null,
        city_id: cityId,
        birth_year: birthYear ? parseInt(birthYear) : null,
        avatar_url, // may be null if no new file; ok for fresh setup
        favorite_emoji: favoriteEmoji.trim() || null,
        quote: inspiringQuote.trim() || null,
        is_host: isHost, // NUEVO
      });
      if (profErr) {
        const code = (profErr as { code?: unknown }).code;
        if (typeof code === "string" && code === "23505") {
          setUsernameError(t("setup.errors.usernameTaken", "Este nombre de usuario ya está en uso."));
          setSaving(false);
          return;
        }
        throw profErr;
      }

      // 3) Intereses
      await supabase.from("profile_categories").delete().eq("profile_id", user.id);
      if (selectedCats.length) {
        const rows = selectedCats.map((cid) => ({ profile_id: user.id, category_id: cid }));
        const { error: catErr } = await supabase.from("profile_categories").insert(rows);
        if (catErr) throw catErr;
      }

      // 4) Interés personalizado
      await supabase.from("profile_custom_interests").delete().eq("profile_id", user.id);
      if (customInterest.trim()) {
        await supabase.from("profile_custom_interests").insert({
          profile_id: user.id,
          interest: customInterest.trim(),
        });
      }

      // 5) Galería (opcional) — 2MB por foto
      if (galleryFiles.length) {
        const urls: string[] = [];
        for (const f of galleryFiles.slice(0, 3)) {
          const okType = ["image/jpeg", "image/png"].includes(f.type);
          const okSize = f.size <= 2 * 1024 * 1024; // 2MB
          if (!okType) throw new Error(t("setup.errors.galleryType", "Las fotos deben ser .jpg o .png"));
          if (!okSize) throw new Error(t("setup.errors.gallerySize", "Máximo 2MB por foto"));

          const gpath = safeStoragePath(user.id, f, "gallery");
          const { error: gErr } = await supabase.storage.from("Avatars").upload(gpath, f, {
            upsert: true,
          });
          if (gErr) throw gErr;

          const pub = supabase.storage.from("Avatars").getPublicUrl(gpath);
          const url = pub?.data?.publicUrl ?? null;
          if (url) urls.push(url);
        }
        // reset galería para este perfil
        await supabase.from("profile_photos").delete().eq("profile_id", user.id);
        if (urls.length) {
          await supabase.from("profile_photos").insert(
            urls.map((u, idx) => ({ profile_id: user.id, url: u, position: idx }))
          );
        }
      }

      // 🟣 ANALYTICS: success event before redirect
      try {
        const payload = {
          cityId,
          selectedCatsCount: selectedCats.length,
          hasAvatar: !!avatarFile || !!avatarPreview,
          galleryCount: galleryFiles.length,
          birthYearProvided: !!birthYear,
          isHost,
        };
        // Vercel Analytics
        track("onboarding_complete", payload);
        // GA4 (fires only if GA is present & consent granted)
        if (typeof window !== "undefined" && typeof window.gtag === "function") {
          window.gtag("event", "onboarding_complete", {
            ...payload,
            value: 1,
            method: "setup_profile",
          });
        }
      } catch {
        // do nothing; analytics must not break the flow
      }

      router.push("/find-your-city");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : t("setup.errors.generic", "Algo salió mal. Inténtalo de nuevo.");
      setError(msg);
    } finally {
      setSaving(false);
    }
  }

  if (loading || !user) {
    return <div className="min-h-screen grid place-items-center">{t("common.misc.loading", "Cargando…")}</div>;
  }

  return (
    <main className="min-h-screen bg-gcBackground text-gcText font-montserrat">
      <div className="max-w-2xl mx-auto p-6">
        <h1 className="text-3xl font-dmserif mb-2">{t("setup.title", "Completa tu perfil")}</h1>
        <p className="mb-6">{t("setup.subtitle", "Esto ayuda a que la comunidad sea más auténtica 💜")}</p>

        <form onSubmit={handleSave} className="bg-white rounded-2xl p-6 shadow-md flex flex-col gap-5">
          {/* === 1) AVATAR PRIMERO === */}
          <div>
            <label className="block text-sm mb-2">{t("setup.avatar.label", "Foto de perfil (opcional)")}</label>

            <div className="flex items-center gap-4">
              <div className="w-28 h-28 rounded-full overflow-hidden bg-gcBackgroundAlt/30 grid place-items-center">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                {avatarPreview ? (
                  <img src={avatarPreview} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-sm opacity-60">{t("setup.avatar.noPhoto", "Sin foto")}</span>
                )}
              </div>

              <div>
                <input
                  id="avatar-input"
                  type="file"
                  accept="image/jpeg,image/png"
                  className="sr-only"
                  onChange={(e) => {
                    const f = e.target.files?.[0] || null;
                    if (!f) { setAvatarFile(null); setAvatarPreview(null); return; }
                    const okType = ["image/jpeg","image/png"].includes(f.type);
                    const okSize = f.size <= 2 * 1024 * 1024; // 2MB
                    if (!okType) { alert(t("setup.errors.avatarType", "Debe ser .jpg o .png")); return; }
                    if (!okSize) { alert(t("setup.errors.avatarSize", "Tamaño máximo 2MB")); return; }
                    setAvatarFile(f); // preview updates via effect
                  }}
                />
                <label
                  htmlFor="avatar-input"
                  className="inline-block rounded-full bg-[#50415b] text-[#fef8f4] font-montserrat px-4 py-1.5 text-sm shadow-md hover:opacity-90 cursor-pointer"
                >
                  {t("setup.avatar.button", "Cargar foto")}
                </label>
                <p className="text-xs opacity-70 mt-1">{t("setup.avatar.hint", "JPG/PNG · Máx 2MB")}</p>
              </div>
            </div>
          </div>

          {/* 2) Nombre de usuario */}
          <div>
            <label className="block text-sm mb-1">{t("setup.username.label", "Nombre de usuario *")}</label>
            <input
              ref={usernameRef}
              className="w-full rounded border p-2"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder={t("setup.username.placeholder", "Ej: tu nombre o apodo")}
              required
            />
            {usernameError && <p className="text-sm text-red-600">{usernameError}</p>}
          </div>

          {/* 2b) ¿Eres anfitriona? */}
          <div>
            <label className="block text-sm mb-1">
              {t("setup.host.label", "¿Eres anfitriona? *")}
            </label>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setIsHost(true)}
                className={`px-3 py-1.5 rounded-full border text-sm ${
                  isHost ? "bg-gcBackgroundAlt/40 border-gcText" : "bg-white"
                }`}
              >
                {t("setup.host.yes", "Sí")}
              </button>
              <button
                type="button"
                onClick={() => setIsHost(false)}
                className={`px-3 py-1.5 rounded-full border text-sm ${
                  !isHost ? "bg-gcBackgroundAlt/40 border-gcText" : "bg-white"
                }`}
              >
                {t("setup.host.no", "No")}
              </button>
            </div>
          </div>

          {/* 3) Ciudad */}
          <div>
            <label className="block text-sm mb-1">{t("setup.city.label", "Ciudad *")}</label>
            <select
              className="w-full rounded border p-2 bg-white"
              value={cityId}
              onChange={(e) => setCityId(e.target.value)}
              required
            >
              <option value="">{t("setup.city.placeholder", "Selecciona tu ciudad")}</option>
              {cities.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* 4) Año de nacimiento */}
          <div>
            <label className="block text-sm mb-1">{t("setup.birthYear.label", "Año de nacimiento (opcional)")}</label>
            <input
              type="number"
              className="w-full rounded border p-2"
              value={birthYear}
              onChange={(e) => setBirthYear(e.target.value)}
              placeholder={t("setup.birthYear.placeholder", "Ej: 1995")}
              min="1900"
              max={new Date().getFullYear()}
            />
          </div>

          {/* 5) Bio */}
          <div>
            <label className="block text-sm mb-1">{t("setup.bio.label", "Bio (opcional)")}</label>
            <textarea
              className="w-full rounded border p-2"
              rows={3}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder={t("setup.bio.placeholder", "Cuéntanos algo sobre ti ✨")}
            />
          </div>

          {/* 6) Emoji favorito */}
          <div className="grid grid-cols-1 md:grid-cols-[220px_1fr] gap-3 items-center">
            <label className="text-sm">{t("setup.emoji.label", "Un emoji de tus favoritos")}</label>
            <input
              className="w-32 rounded border p-2 text-center text-xl"
              value={favoriteEmoji}
              onChange={(e) => setFavoriteEmoji(e.target.value.slice(0, 2))}
              placeholder={t("setup.emoji.placeholder", "🥰")}
            />
          </div>

          {/* 7) Frase que inspira (se guarda en 'quote') */}
          <div>
            <label className="block text-sm mb-1">{t("setup.quote.label", "Una frase de tus favoritas")}</label>
            <textarea
              className="w-full rounded border p-2"
              rows={2}
              value={inspiringQuote}
              onChange={(e) => setInspiringQuote(e.target.value)}
              placeholder={t("setup.quote.placeholder", "Una frase cortita que te represente 💫")}
            />
          </div>

          {/* 8) Intereses */}
          <div>
            <label className="block text-sm mb-2">{t("setup.interests.label", "Tus intereses")}</label>
            {categories.length === 0 && (
              <p className="text-sm text-gray-600">{t("setup.interests.none", "No hay categorías todavía.")}</p>
            )}
            <div className="grid grid-cols-2 gap-2">
              {categories.map((cat) => {
                const checked = selectedCats.includes(cat.id);
                return (
                  <label
                    key={cat.id}
                    className={`border rounded-xl p-2 cursor-pointer ${checked ? "bg-gcBackgroundAlt/30" : ""}`}
                  >
                    <input
                      type="checkbox"
                      className="mr-2"
                      checked={checked}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedCats((s) => [...s, cat.id]);
                        } else {
                          setSelectedCats((s) => s.filter((id) => id !== cat.id));
                        }
                      }}
                    />
                    {cat.name}
                  </label>
                );
              })}
            </div>
          </div>

          {/* 9) Interés personalizado */}
          <div>
            <label className="block text-sm mb-1">{t("setup.customInterest.label", "Otro interés (opcional)")}</label>
            <input
              type="text"
              className="w-full rounded border p-2"
              value={customInterest}
              onChange={(e) => setCustomInterest(e.target.value)}
              placeholder={t("setup.customInterest.placeholder", "Escribe tu propio interés")}
            />
          </div>

          {/* 10) Galería (1–3 fotos) + PREVIEWS */}
          <div>
            <label className="block text-sm mb-1">{t("setup.gallery.label", "¿1-3 fotos que te representen?")}</label>
            <div className="flex items-center gap-3">
              <input
                id="gallery-input"
                type="file"
                accept="image/jpeg,image/png"
                multiple
                className="sr-only"
                onChange={(e) => {
                  const files = Array.from(e.target.files ?? []);
                  handleGalleryChange(files);
                }}
              />
              <label
                htmlFor="gallery-input"
                className="inline-block rounded-full bg-[#50415b] text-[#fef8f4] font-montserrat px-5 py-2 text-sm shadow-md hover:opacity-90 cursor-pointer"
              >
                {t("setup.gallery.uploadBtn", "Subir fotos")}
              </label>
              {galleryMsg && <span className="text-xs opacity-80">{galleryMsg}</span>}
            </div>

            {/* Square previews */}
            {galleryPreviews.length > 0 && (
              <div className="mt-3 grid grid-cols-3 gap-3">
                {galleryPreviews.map((src, i) => (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    key={i}
                    src={src}
                    alt={`Preview ${i + 1}`}
                    className="w-24 h-24 rounded-xl object-cover border"
                  />
                ))}
              </div>
            )}

            <p className="text-xs opacity-70 mt-1">
              {t("setup.gallery.hint", "Hasta 3 fotos · JPG/PNG · 2MB máx por foto")}
            </p>
          </div>

          {/* 11) Consentimiento */}
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="consent"
              checked={consent}
              onChange={(e) => setConsent(e.target.checked)}
              className="rounded"
              required
            />
            <label htmlFor="consent" className="text-sm">
              {t("setup.consent.prefix", "Acepto la")}{" "}
              <a href="/privacy-policy" className="underline text-[#50415b]" target="_blank" rel="noopener noreferrer">
                {t("setup.consent.privacy", "Política de Privacidad")}
              </a>
            </label>
          </div>

          {/* 12) Actions */}
          <div className="flex gap-3 justify-end">
            <button
              type="submit"
              disabled={!canSave || saving}
              className="rounded-full bg-[#50415b] text-[#fef8f4] font-dmserif px-6 py-2 text-lg shadow-md hover:opacity-90 disabled:opacity-60"
            >
              {saving ? t("setup.actions.saving", "Guardando…") : t("setup.actions.save", "Guardar y continuar")}
            </button>
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}
        </form>
      </div>
    </main>
  );
}


