"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { useAuth } from "@/lib/auth";

type City = { id: string; name: string; slug: string };
type Profile = {
  id: string;
  username: string | null;
  bio: string | null;
  city_id: string | null;
  avatar_url: string | null;
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
  const ext = parts.length > 1 ? parts.pop()!.toLowerCase().replace(/[^a-z0-9]/g, "") : "jpg";
  const stem = parts.join(".").toLowerCase().replace(/[^a-z0-9._-]/g, "-");
  const cleanStem = stem.replace(/[-_.]{2,}/g, "-").replace(/^[-_.]+|[-_.]+$/g, "");
  return `${cleanStem || "avatar"}.${ext || "jpg"}`;
}
function safeStoragePath(userId: string, file: File) {
  const clean = sanitizeFileName(file.name || "avatar.jpg");
  return `${userId}/${Date.now()}_${clean}`;
}

export default function ProfilePage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  // perfil básico
  const [profile, setProfile] = useState<Profile | null>(null);
  const [username, setUsername] = useState("");
  const [bio, setBio] = useState("");
  const [cityId, setCityId] = useState<string>("");

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

  // carga inicial: ciudades, categorías, perfil, intereses, grupos
  useEffect(() => {
    (async () => {
      if (!user) return;

      // ciudades
      const { data: cityRows } = await supabase.from("cities").select("id,name,slug").order("name");
      setCities(cityRows ?? []);

      // categorías (para intereses y para mapear grupos)
      const { data: allCats } = await supabase.from("categories").select("id,slug,name").order("name");
      setAllCategories(allCats ?? []);

      // perfil
      const { data: prof } = await supabase
        .from("profiles")
        .select("id, username, bio, city_id, avatar_url")
        .eq("id", user.id)
        .maybeSingle();

      if (prof) {
        setProfile(prof as Profile);
        setUsername(prof.username ?? "");
        setBio(prof.bio ?? "");
        setCityId(prof.city_id ?? "");
        setAvatarPreview(prof.avatar_url ?? null);
      }

      // intereses del usuario
      const { data: myCats } = await supabase
        .from(PROFILE_CATS_TABLE)
        .select("category_id")
        .eq("profile_id", user.id);
      setSelectedCatIds((myCats ?? []).map((r: { category_id: string }) => r.category_id));

      // memberships → grupos (by profile_id)
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

        // maps para info de grupo
        const catIds = Array.from(new Set((groups ?? []).map((g) => g.category_id)));
        if (catIds.length) {
          const m: Record<string, Category> = {};
          (allCats ?? []).forEach((c) => {
            if (catIds.includes(c.id)) m[c.id] = c;
          });
          setCatMap(m);
        }
        const cIds = Array.from(new Set((groups ?? []).map((g) => g.city_id)));
        if (cIds.length) {
          const { data: cts } = await supabase.from("cities").select("id, slug, name").in("id", cIds);
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

  // unique username
  useEffect(() => {
    if (!user) return;
    if (!username.trim()) {
      setNameError("El nombre de usuario es obligatorio.");
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
        if (error) setNameError("No se pudo validar el nombre.");
        else if ((data ?? []).length > 0) setNameError("Este nombre ya está en uso.");
        else setNameError("");
      }
      setNameChecking(false);
    })();
    return () => {
      active = false;
    };
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
      alert("Debe ser .jpg o .png");
      return;
    }
    if (!okSize) {
      alert("Tamaño máximo 2MB");
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
          .from("Avatars") // bucket con A mayúscula
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
        })
        .eq("id", user.id);
      if (profErr) throw profErr;

      setMsg("Perfil actualizado ✅");
    } catch (e) {
      const m = e instanceof Error ? e.message : "No se pudo guardar.";
      setErr(m);
    } finally {
      setSaving(false);
    }
  }

  // intereses
  function toggleCat(id: string) {
    setSelectedCatIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  }
  async function saveInterests() {
    if (!user) return;
    setInterestMsg("");
    setInterestErr("");
    try {
      await supabase.from(PROFILE_CATS_TABLE).delete().eq("profile_id", user.id);
      if (selectedCatIds.length) {
        await supabase.from(PROFILE_CATS_TABLE).insert(
          selectedCatIds.map((category_id) => ({ profile_id: user.id, category_id }))
        );
      }
      setInterestMsg("Intereses actualizados ✅");
    } catch (e) {
      const m = e instanceof Error ? e.message : "No se pudieron actualizar los intereses.";
      setInterestErr(m);
    }
  }

  // contraseña
  async function handleChangePassword(e: React.FormEvent) {
    e.preventDefault();
    setPwdMsg("");
    setPwdErr("");

    if (!pwd1 || pwd1 !== pwd2) {
      setPwdErr("Las contraseñas no coinciden.");
      return;
    }
    try {
      const { error } = await supabase.auth.updateUser({ password: pwd1 });
      if (error) throw error;
      setPwd1("");
      setPwd2("");
      setPwdMsg("Contraseña actualizada ✅");
    } catch (e) {
      const m = e instanceof Error ? e.message : "No se pudo actualizar la contraseña.";
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
      alert("Solicitud enviada. Te contactaremos pronto 💌");
    } else {
      alert("No se pudo enviar la solicitud. Inténtalo más tarde.");
    }
  }

  if (loading || !user) {
    return <main className="min-h-screen grid place-items-center">Cargando…</main>;
  }

  return (
    <main className="min-h-screen bg-gcBackground text-gcText font-montserrat">
      <div className="max-w-5xl mx-auto p-6">
        <h1 className="text-3xl font-dmserif mb-2">Mi perfil</h1>
        <p className="mb-6">Gestiona tu información y tus grupos 💜</p>

        {/* ===== Perfil (bio, ciudad, avatar) ===== */}
        <form onSubmit={handleSaveProfile} className="bg-white rounded-2xl p-6 shadow-md flex flex-col gap-5">
          <div className="flex flex-col md:flex-row gap-6">
            {/* Avatar */}
            <div className="shrink-0">
              <div className="w-28 h-28 rounded-full overflow-hidden bg-gcBackgroundAlt/30 grid place-items-center">
                {avatarPreview ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={avatarPreview} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-sm opacity-60">Sin foto</span>
                )}
              </div>

              {/* Botón custom "Cargar foto" */}
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
                  Cargar foto
                </label>
                <div className="text-xs opacity-70 mt-1">
                  {avatarFileName ? avatarFileName : "JPG o PNG · Máx 2MB"}
                </div>
              </div>
            </div>

            {/* Campos */}
            <div className="flex-1 grid gap-4">
              <div>
                <label className="block text-sm mb-1">Nombre de usuario *</label>
                <input
                  className="w-full rounded-xl border p-3"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Tu nombre o apodo"
                  required
                />
                {nameChecking && <p className="text-sm opacity-70 mt-1">Comprobando…</p>}
                {nameError && <p className="text-sm text-red-600 mt-1">{nameError}</p>}
              </div>

              <div>
                <label className="block text-sm mb-1">Ciudad *</label>
                <select
                  className="w-full rounded-xl border p-3 bg-white"
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

              <div>
                <label className="block text-sm mb-1">Bio (opcional)</label>
                <textarea
                  className="w-full rounded-xl border p-3"
                  rows={3}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Cuéntanos algo sobre ti ✨"
                />
              </div>
            </div>
          </div>

          {/* Botón: izquierda en móvil, derecha en desktop */}
          <div className="flex gap-3 justify-start md:justify-end">
            <button
              type="submit"
              disabled={!canSave || saving}
              className="rounded-full bg-[#50415b] text-[#fef8f4] font-dmserif px-6 py-2 text-lg shadow-md hover:opacity-90 disabled:opacity-60"
            >
              {saving ? "Guardando…" : "Guardar cambios"}
            </button>
          </div>

          {msg && <p className="text-sm text-green-700">{msg}</p>}
          {err && <p className="text-sm text-red-600">{err}</p>}
        </form>

        {/* ===== Tus intereses (debajo de bio) ===== */}
        <section className="bg-white rounded-2xl p-6 shadow-md mt-6 text-center">
          <h2 className="font-dmserif text-2xl mb-4">Tus intereses</h2>

          <div className="flex flex-wrap gap-2 justify-center">
            {allCategories.map((c) => {
              const active = selectedCatIds.includes(c.id);
              return (
                <label
                  key={c.id}
                  className={`cursor-pointer select-none px-3 py-1.5 rounded-full border text-sm
                    ${active ? "bg-gcBackgroundAlt2 border-gcText" : "bg-white hover:bg-black/5"}`}
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

          <div className="mt-4 flex justify-center">
            <button
              onClick={saveInterests}
              className="rounded-full bg-[#50415b] text-[#fef8f4] font-dmserif px-6 py-2 text-lg shadow-md hover:opacity-90"
            >
              Actualizar intereses
            </button>
          </div>

          {interestMsg && <p className="text-sm text-green-700 mt-2">{interestMsg}</p>}
          {interestErr && <p className="text-sm text-red-600 mt-2">{interestErr}</p>}
        </section>

        {/* ===== Mis grupos ===== */}
        <section className="bg-white rounded-2xl p-6 shadow-md mt-6">
          <h2 className="font-dmserif text-2xl mb-4">Mis grupos</h2>

          {myGroups.length === 0 && <p className="opacity-70">Todavía no te has unido a ningún grupo.</p>}

          <ul className="grid md:grid-cols-2 gap-3">
            {myGroups.map((g) => {
              const cat = catMap[g.category_id];
              const city = cityMap[g.city_id];
              const href = cat && city ? `/${city.slug}/${cat.slug}/group/${g.slug}` : "#";
              return (
                <li key={g.id} className="border rounded-xl p-3 flex items-center justify-between">
                  <div>
                    <div className="font-semibold">{g.name}</div>
                    <div className="text-sm opacity-70">
                      {city?.name ?? "Ciudad"} • {cat?.slug ?? "categoría"}
                    </div>
                  </div>
                  {cat && city ? (
                    <Link href={href} className="underline">
                      Ir al grupo
                    </Link>
                  ) : (
                    <span className="text-sm opacity-60">—</span>
                  )}
                </li>
              );
            })}
          </ul>
        </section>

        {/* ===== Cambiar contraseña (centrado) ===== */}
        <section className="bg-white rounded-2xl p-6 shadow-md mt-6 md:max-w-xl md:mx-auto text-center">
          <h2 className="font-dmserif text-2xl mb-4">Cambiar contraseña</h2>
          <form onSubmit={handleChangePassword} className="grid gap-3 max-w-md mx-auto">
            <input
              type="password"
              className="w-full rounded-xl border p-3"
              placeholder="Nueva contraseña"
              value={pwd1}
              onChange={(e) => setPwd1(e.target.value)}
              required
            />
            <input
              type="password"
              className="w-full rounded-xl border p-3"
              placeholder="Confirmar nueva contraseña"
              value={pwd2}
              onChange={(e) => setPwd2(e.target.value)}
              required
            />
            <div className="flex justify-center">
              <button
                type="submit"
                className="rounded-full bg-[#50415b] text-[#fef8f4] font-dmserif px-6 py-2 text-lg shadow-md hover:opacity-90"
              >
                Actualizar
              </button>
            </div>
          </form>
          {pwdMsg && <p className="text-sm text-green-700 mt-2">{pwdMsg}</p>}
          {pwdErr && <p className="text-sm text-red-600 mt-2">{pwdErr}</p>}
        </section>

        {/* ===== Zona de seguridad (mismo formato centrado) ===== */}
        <section className="bg-white rounded-2xl p-6 shadow-md mt-6 md:max-w-xl md:mx-auto text-center">
          <h2 className="font-dmserif text-2xl mb-3">Zona de seguridad</h2>
          <div className="flex flex-wrap gap-3 justify-center">
            <button
              onClick={handleSignOut}
              className="rounded-full bg-[#50415b] text-[#fef8f4] font-dmserif px-6 py-2 shadow-md hover:opacity-90"
            >
              Cerrar sesión
            </button>
            <button
              onClick={requestDeleteAccount}
              className="rounded-full bg-red-600 text-white font-montserrat px-6 py-2 shadow-md hover:opacity-90"
            >
              Eliminar cuenta
            </button>
          </div>
        </section>
      </div>
    </main>
  );
}
