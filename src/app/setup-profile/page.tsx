"use client";

import { useEffect, useMemo, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { useAuth } from "@/lib/auth";

type City = { id: string; name: string; slug: string };
type Category = { id: string; name: string };

export default function OnboardingPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  const [username, setUsername] = useState("");
  const [bio, setBio] = useState("");
  const [birthYear, setBirthYear] = useState("");
  const [cities, setCities] = useState<City[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [cityId, setCityId] = useState<string>("");
  const [selectedCats, setSelectedCats] = useState<string[]>([]);
  const [customInterest, setCustomInterest] = useState("");
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string>("");
  const [consent, setConsent] = useState(false);
  const [usernameError, setUsernameError] = useState("");

  const usernameRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!loading && !user) {
      router.push("/auth");
    }
  }, [loading, user, router]);

  useEffect(() => {
    usernameRef.current?.focus();
  }, []);

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

  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data } = await supabase
        .from("profiles")
        .select("username,bio,city_id,birth_year")
        .eq("id", user.id)
        .single();
      if (data) {
        setUsername(data.username ?? "");
        setBio(data.bio ?? "");
        setCityId(data.city_id ?? "");
        setBirthYear(data.birth_year ? String(data.birth_year) : "");
      }

      const { data: cats } = await supabase
        .from("profile_categories")
        .select("category_id")
        .eq("profile_id", user.id);
      if (cats) {
        setSelectedCats(cats.map((c) => c.category_id));
      }

      const { data: custom } = await supabase
        .from("profile_custom_interests")
        .select("interest")
        .eq("profile_id", user.id)
        .maybeSingle();
      if (custom) setCustomInterest(custom.interest);
    })();
  }, [user]);

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
      let avatar_url: string | null = null;
      if (avatarFile) {
        const path = `${user.id}/${Date.now()}_${avatarFile.name}`;
        const { error: upErr } = await supabase.storage.from("Avatars").upload(path, avatarFile, { upsert: true });
        if (upErr) throw upErr;

        const { data: pub } = supabase.storage.from("Avatars").getPublicUrl(path);
        avatar_url = pub?.publicUrl ?? null;
      }

      const { error: profErr } = await supabase.from("profiles").upsert({
        id: user.id,
        username: username.trim(),
        bio: bio.trim() || null,
        city_id: cityId,
        birth_year: birthYear ? parseInt(birthYear) : null,
        avatar_url,
      });

      if (profErr) {
        const code = (profErr as { code?: unknown }).code;
        if (typeof code === "string" && code === "23505") {
          setUsernameError("Este nombre de usuario ya está en uso.");
          setSaving(false);
          return;
        }
        throw profErr;
      }

      await supabase.from("profile_categories").delete().eq("profile_id", user.id);
      if (selectedCats.length) {
        const rows = selectedCats.map((cid) => ({ profile_id: user.id, category_id: cid }));
        const { error: catErr } = await supabase.from("profile_categories").insert(rows);
        if (catErr) throw catErr;
      }

      await supabase.from("profile_custom_interests").delete().eq("profile_id", user.id);
      if (customInterest.trim()) {
        await supabase.from("profile_custom_interests").insert({
          profile_id: user.id,
          interest: customInterest.trim(),
        });
      }

      router.push("/find-your-city");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Algo salió mal. Inténtalo de nuevo.";
      setError(msg);
    } finally {
      setSaving(false);
    }
  }

  if (loading || !user) {
    return <div className="min-h-screen grid place-items-center">Cargando…</div>;
  }

  return (
    <main className="min-h-screen bg-gcBackground text-gcText font-montserrat">
      <div className="max-w-2xl mx-auto p-6">
        <h1 className="text-3xl font-dmserif mb-2">Completa tu perfil</h1>
        <p className="mb-6">Esto ayuda a que la comunidad sea más auténtica 💜</p>

        <form onSubmit={handleSave} className="bg-white rounded-2xl p-6 shadow-md flex flex-col gap-5">
          {/* Username */}
          <div>
            <label className="block text-sm mb-1">Nombre de usuario *</label>
            <input
              ref={usernameRef}
              className="w-full rounded border p-2"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Ej: tu nombre o apodo"
              required
            />
            {usernameError && <p className="text-sm text-red-600">{usernameError}</p>}
          </div>

          {/* City */}
          <div>
            <label className="block text-sm mb-1">Ciudad *</label>
            <select
              className="w-full rounded border p-2 bg-white"
              value={cityId}
              onChange={(e) => setCityId(e.target.value)}
              required
            >
              <option value="">Selecciona tu ciudad</option>
              {cities.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* Birth Year */}
          <div>
            <label className="block text-sm mb-1">Año de nacimiento (opcional)</label>
            <input
              type="number"
              className="w-full rounded border p-2"
              value={birthYear}
              onChange={(e) => setBirthYear(e.target.value)}
              placeholder="Ej: 1995"
              min="1900"
              max={new Date().getFullYear()}
            />
          </div>

          {/* Bio */}
          <div>
            <label className="block text-sm mb-1">Bio (opcional)</label>
            <textarea
              className="w-full rounded border p-2"
              rows={3}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Cuéntanos algo sobre ti ✨"
            />
          </div>

          {/* Avatar */}
          <div>
            <label className="block text-sm mb-1">Foto de perfil (opcional)</label>
            <input
              type="file"
              accept="image/jpeg,image/png"
              onChange={(e) => {
                const f = e.target.files?.[0] || null;
                if (!f) { setAvatarFile(null); return; }
                const okType = ["image/jpeg","image/png"].includes(f.type);
                const okSize = f.size <= 2 * 1024 * 1024; // 2MB
                if (!okType) { alert("Debe ser .jpg o .png"); return; }
                if (!okSize) { alert("Tamaño máximo 2MB"); return; }
                setAvatarFile(f);
              }}
            />
            <p className="text-xs opacity-70 mt-1">Debe ser .jpg o .png · Máx 2MB</p>
          </div>

          {/* Categories */}
          <div>
            <label className="block text-sm mb-2">Tus intereses</label>
            {categories.length === 0 && <p className="text-sm text-gray-600">No hay categorías todavía.</p>}
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

          {/* Custom Interest */}
          <div>
            <label className="block text-sm mb-1">Otro interés (opcional)</label>
            <input
              type="text"
              className="w-full rounded border p-2"
              value={customInterest}
              onChange={(e) => setCustomInterest(e.target.value)}
              placeholder="Escribe tu propio interés"
            />
          </div>

          {/* Consent */}
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
              Acepto la{" "}
              <a href="/privacy-policy" className="underline text-[#50415b]" target="_blank" rel="noopener noreferrer">
                Política de Privacidad
              </a>
            </label>
          </div>

          {/* Actions */}
          <div className="flex gap-3 justify-end">
            <button
              type="submit"
              disabled={!canSave || saving}
              className="rounded-full bg-[#50415b] text-[#fef8f4] font-dmserif px-6 py-2 text-lg shadow-md hover:opacity-90 disabled:opacity-60"
            >
              {saving ? "Guardando…" : "Guardar y continuar"}
            </button>
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}
        </form>
      </div>
    </main>
  );
}

