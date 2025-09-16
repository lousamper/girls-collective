"use client";

import { use, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Heart, Pin, PinOff, Pencil, Trash2, CornerUpRight, PlusCircle } from "lucide-react";

import { useAuth } from "@/lib/auth";
import { supabase } from "@/lib/supabaseClient";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

type GroupRow = {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  creator_id: string | null;
};
type SubgroupRow = { id: string; name: string; type: "location" | "age" };
type MessageRow = {
  id: string;
  content: string;
  created_at: string;
  sender_id: string;
  location_subgroup_id: string | null;
  age_subgroup_id: string | null;
  is_pinned: boolean;
  parent_message_id: string | null;
  sender_profile?: { username: string | null; avatar_url: string | null } | null;
};
type LikeMap = Record<string, { count: number; mine: boolean }>;

type PollRow = {
  id: string;
  question: string;
  is_multi: boolean;
  closes_at: string | null;
  created_at: string;
};
type PollWithCounts = PollRow & {
  options: { id: string; label: string; position: number; votes: number; mine: boolean }[];
  totalVotes: number;
  isClosed: boolean;
};

export default function GroupPage({
  params,
}: {
  params: Promise<{ category: string; slug: string }>;
}) {
  const { category, slug } = use(params);
  const { user, loading } = useAuth();
  const router = useRouter();

  const [isAdmin, setIsAdmin] = useState(false);
  const [group, setGroup] = useState<GroupRow | null>(null);

  const [locations, setLocations] = useState<SubgroupRow[]>([]);
  const [ages, setAges] = useState<SubgroupRow[]>([]);
  const [selLoc, setSelLoc] = useState<string>("all");
  const [selAge, setSelAge] = useState<string>("all");

  const [messages, setMessages] = useState<MessageRow[]>([]);
  const [likes, setLikes] = useState<LikeMap>({});
  const [msgText, setMsgText] = useState("");
  const [sending, setSending] = useState(false);
  const [loadingData, setLoadingData] = useState(true);

  // follow/unfollow (existence only)
  const [following, setFollowing] = useState<boolean>(false);
  const [followBusy, setFollowBusy] = useState(false);

  // reply state
  const [replyTo, setReplyTo] = useState<MessageRow | null>(null);

  // create subgroup modal
  const [openSG, setOpenSG] = useState(false);
  const [sgName, setSgName] = useState("");
  const [sgType, setSgType] = useState<"location" | "age">("location");
  const [sgMsg, setSgMsg] = useState("");

  // edit message inline
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState("");

  // polls
  const [polls, setPolls] = useState<PollWithCounts[]>([]);
  const [openPoll, setOpenPoll] = useState(false);
  const [pollQ, setPollQ] = useState("");
  const [pollMulti, setPollMulti] = useState(false);
  const [pollOptions, setPollOptions] = useState<string[]>(["", ""]);
  const [pollMsg, setPollMsg] = useState("");

  // events (create modal)
  const [openEvent, setOpenEvent] = useState(false);
  const [evTitle, setEvTitle] = useState("");
  const [evDesc, setEvDesc] = useState("");
  const [evLoc, setEvLoc] = useState("");
  const [evWhen, setEvWhen] = useState<string>("");
  const [evMsg, setEvMsg] = useState("");

  // list scroll & “new messages” toast
  const listRef = useRef<HTMLUListElement | null>(null);
  const [atBottom, setAtBottom] = useState(true);
  const [showNewToast, setShowNewToast] = useState(false);

  function isNearBottom(el: HTMLElement) {
    return el.scrollHeight - el.scrollTop - el.clientHeight < 30;
  }
  function scrollToBottom() {
    const el = listRef.current;
    if (el) el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
    setShowNewToast(false);
  }

  useEffect(() => {
    if (!loading && !user) router.push("/auth");
  }, [loading, user, router]);

  useEffect(() => {
    (async () => {
      if (!user) return;
      setLoadingData(true);
      try {
        const { data: me } = await supabase
          .from("profiles")
          .select("is_admin")
          .eq("id", user.id)
          .maybeSingle();
        setIsAdmin(Boolean(me?.is_admin));

        const { data: city } = await supabase
          .from("cities")
          .select("id")
          .eq("slug", "valencia")
          .maybeSingle();
        const { data: cat } = await supabase
          .from("categories")
          .select("id")
          .eq("slug", category)
          .maybeSingle();

        if (!city?.id || !cat?.id) throw new Error("Ciudad o categoría no encontrada");

        const { data: g } = await supabase
          .from("groups")
          .select("id, slug, name, description, creator_id")
          .eq("city_id", city.id)
          .eq("category_id", cat.id)
          .eq("slug", slug)
          .eq("is_approved", true)
          .maybeSingle();
        if (!g?.id) throw new Error("Grupo no encontrado");
        setGroup(g);

        // following? (existence only, select minimal)
        const { data: mem } = await supabase
          .from("group_members")
          .select("group_id")
          .eq("group_id", g.id)
          .eq("profile_id", user.id)
          .maybeSingle();
        setFollowing(!!mem);

        const { data: sgs } = await supabase
          .from("subgroups")
          .select("id, name, type")
          .eq("group_id", g.id)
          .order("name");
        const locs = (sgs ?? []).filter((s) => s.type === "location") as SubgroupRow[];
        const ags = (sgs ?? []).filter((s) => s.type === "age") as SubgroupRow[];
        setLocations(locs);
        setAges(ags);

        await Promise.all([loadMessages(g.id, "all", "all"), loadPolls(g.id)]);
      } catch (e) {
        console.error(e);
      } finally {
        setLoadingData(false);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, category, slug]);

  // attach/detach scroll listener
  useEffect(() => {
    const el = listRef.current;
    if (!el) return;
    const onScroll = () => {
      const near = isNearBottom(el);
      setAtBottom(near);
      if (near) setShowNewToast(false);
    };
    el.addEventListener("scroll", onScroll);
    return () => el.removeEventListener("scroll", onScroll);
  }, []);

  async function loadMessages(groupId: string, loc: string, age: string) {
    let q = supabase
      .from("messages")
      .select(
        "id, content, created_at, sender_id, location_subgroup_id, age_subgroup_id, is_pinned, parent_message_id"
      )
      .eq("group_id", groupId)
      .order("is_pinned", { ascending: false })
      .order("created_at", { ascending: true });

    if (loc !== "all") q = q.eq("location_subgroup_id", loc);
    if (age !== "all") q = q.eq("age_subgroup_id", age);

    const { data: rows, error } = await q;
    if (error) {
      console.error(error);
      setMessages([]);
      setLikes({});
      return;
    }

    // attach profiles
    const ids = Array.from(new Set((rows ?? []).map((r) => r.sender_id)));
    let profiles: Record<string, { username: string | null; avatar_url: string | null }> = {};
    if (ids.length) {
      const { data: profs } = await supabase
        .from("profiles")
        .select("id, username, avatar_url")
        .in("id", ids);
      (profs ?? []).forEach((p: any) => {
        profiles[p.id] = { username: p.username, avatar_url: p.avatar_url };
      });
    }

    setMessages((rows ?? []).map((m) => ({ ...m, sender_profile: profiles[m.sender_id] ?? null })));

    // likes
    if (rows?.length) {
      const mids = rows.map((m) => m.id);
      const { data: likeRows } = await supabase
        .from("message_likes")
        .select("message_id, user_id")
        .in("message_id", mids);
      const map: LikeMap = {};
      for (const mid of mids) {
        const mine = likeRows?.some((l) => l.message_id === mid && l.user_id === user?.id) ?? false;
        const count = likeRows?.filter((l) => l.message_id === mid).length ?? 0;
        map[mid] = { count, mine };
      }
      setLikes(map);
    } else {
      setLikes({});
    }

    // new messages toast logic
    const el = listRef.current;
    if (el) {
      if (isNearBottom(el)) {
        requestAnimationFrame(scrollToBottom);
      } else {
        setShowNewToast(true);
      }
    }
  }

  function changeLoc(id: string) {
    setSelLoc(id);
    if (group) loadMessages(group.id, id, selAge);
  }
  function changeAge(id: string) {
    setSelAge(id);
    if (group) loadMessages(group.id, selLoc, id);
  }

  // relative time helper
  function timeAgo(iso: string) {
    const d = new Date(iso);
    const diffSec = Math.floor((Date.now() - d.getTime()) / 1000);
    const rtf = new Intl.RelativeTimeFormat("es", { numeric: "auto" });
    const units: [Intl.RelativeTimeFormatUnit, number][] = [
      ["year", 60 * 60 * 24 * 365],
      ["month", 60 * 60 * 24 * 30],
      ["week", 60 * 60 * 24 * 7],
      ["day", 60 * 60 * 24],
      ["hour", 60 * 60],
      ["minute", 60],
      ["second", 1],
    ];
    for (const [unit, secPer] of units) {
      const value = Math.round(-diffSec / secPer);
      if (Math.abs(diffSec) >= secPer || unit === "second") {
        return { label: rtf.format(value, unit), title: d.toLocaleString() };
      }
    }
    return { label: "", title: d.toLocaleString() };
  }

  // clickable @mentions → profile sheet
  const [openProfile, setOpenProfile] = useState<null | { username: string; data?: any }>(null);

  async function openUserSheet(username: string) {
    setOpenProfile({ username });
    const { data } = await supabase
      .from("profiles")
      .select("id,username,bio,avatar_url,city_id") // ⬅️ include id for the DM button logic
      .ilike("username", username)
      .maybeSingle();
    setOpenProfile({ username, data });
  }

  function renderText(body: string) {
    const parts = body.split(/(@[A-Za-z0-9_]+)/g);
    return parts.map((part, i) =>
      part.startsWith("@") ? (
        <button
          key={i}
          className="text-gcCTA font-semibold underline underline-offset-2"
          onClick={() => openUserSheet(part.slice(1))}
          type="button"
        >
          {part}
        </button>
      ) : (
        <span key={i}>{part}</span>
      )
    );
  }

  // inline poll detection
  function matchPollId(text: string) {
    const m = /^POLL:([0-9a-f-]+)$/i.exec(text.trim());
    return m ? m[1] : null;
  }

  async function sendMessage(e: React.FormEvent) {
    e.preventDefault();
    if (!user || !group || !following) return; // <-- block when not following
    if (!msgText.trim()) return;
    setSending(true);
    try {
      const payload = {
        group_id: group.id,
        sender_id: user.id,
        content: msgText.trim(),
        location_subgroup_id: selLoc === "all" ? null : selLoc,
        age_subgroup_id: selAge === "all" ? null : selAge,
        parent_message_id: replyTo ? replyTo.id : null,
      };
      const { error } = await supabase.from("messages").insert(payload);
      if (error) throw error;
      setMsgText("");
      setReplyTo(null);
      await loadMessages(group.id, selLoc, selAge);
      requestAnimationFrame(scrollToBottom);
    } catch (e) {
      console.error(e);
    } finally {
      setSending(false);
    }
  }

  async function toggleLike(mid: string) {
    if (!user) return;
    const mine = likes[mid]?.mine;
    try {
      if (mine) {
        await supabase.from("message_likes").delete().match({ message_id: mid, user_id: user.id });
      } else {
        await supabase.from("message_likes").insert({ message_id: mid, user_id: user.id });
      }
      const entry = likes[mid] ?? { count: 0, mine: false };
      setLikes({ ...likes, [mid]: { count: entry.count + (mine ? -1 : 1), mine: !mine } });
    } catch (e) {
      console.error(e);
    }
  }

  function startEdit(mid: string, current: string) {
    setEditingId(mid);
    setEditText(current);
  }
  async function saveEdit(mid: string) {
    try {
      const { error } = await supabase.from("messages").update({ content: editText }).eq("id", mid);
      if (error) throw error;
      setEditingId(null);
      if (group) await loadMessages(group.id, selLoc, selAge);
    } catch (e) {
      console.error(e);
    }
  }

  async function adminDelete(mid: string) {
    if (!isAdmin) return;
    if (!confirm("¿Eliminar este mensaje?")) return;
    const { error } = await supabase.from("messages").delete().eq("id", mid);
    if (!error && group) await loadMessages(group.id, selLoc, selAge);
  }

  async function adminTogglePin(mid: string, next: boolean) {
    if (!isAdmin) return;
    const update = next
      ? { is_pinned: true, pinned_at: new Date().toISOString(), pinned_by: user!.id }
      : { is_pinned: false, pinned_at: null, pinned_by: null };
    const { error } = await supabase.from("messages").update(update).eq("id", mid);
    if (!error && group) await loadMessages(group.id, selLoc, selAge);
  }

  // follow toggle (existence only; no role column)
  async function toggleFollow() {
    if (!user || !group) return;
    setFollowBusy(true);
    try {
      if (following) {
        const { error } = await supabase
          .from("group_members")
          .delete()
          .match({ group_id: group.id, profile_id: user.id });
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("group_members")
          .upsert(
            { group_id: group.id, profile_id: user.id },
            { onConflict: "group_id,profile_id" } as any
          );
        if (error) throw error;
      }
      // Re-check from DB for persistence
      const { data: mem, error: mErr } = await supabase
        .from("group_members")
        .select("group_id")
        .eq("group_id", group.id)
        .eq("profile_id", user.id)
        .maybeSingle();
      if (mErr) throw mErr;
      setFollowing(!!mem);
    } catch (e: any) {
      console.error("toggleFollow error:", e?.message ?? e);
      alert("No se pudo actualizar el seguimiento del grupo.");
    } finally {
      setFollowBusy(false);
    }
  }

  // create subgroup
  async function createSubgroup(e: React.FormEvent) {
    e.preventDefault();
    if (!user || !group) return;
    try {
      if (!sgName.trim()) return;
      const { error } = await supabase.from("subgroups").insert({
        group_id: group.id,
        name: sgName.trim(),
        type: sgType,
      });
      if (error) throw error;

      setOpenSG(false);
      setSgName("");
      setSgType("location");

      const { data: sgs } = await supabase
        .from("subgroups")
        .select("id, name, type")
        .eq("group_id", group.id)
        .order("name");
      const locs = (sgs ?? []).filter((s) => s.type === "location") as SubgroupRow[];
      const ags = (sgs ?? []).filter((s) => s.type === "age") as SubgroupRow[];
      setLocations(locs);
      setAges(ags);
    } catch (err: any) {
      setSgMsg(err.message ?? "No se pudo crear el subgrupo.");
    }
  }

  // ===== Polls =====
  const canCreatePoll = !!user;

  async function loadPolls(groupId: string) {
    const { data: pollsData, error: pErr } = await supabase
      .from("polls")
      .select("id, question, is_multi, closes_at, created_at")
      .eq("group_id", groupId)
      .order("created_at", { ascending: false });
    if (pErr) {
      console.error(pErr);
      setPolls([]);
      return;
    }

    const pollIds = (pollsData ?? []).map((p) => p.id);
    if (!pollIds.length) {
      setPolls([]);
      return;
    }

    const { data: opts } = await supabase
      .from("poll_options")
      .select("id, poll_id, label, position")
      .in("poll_id", pollIds)
      .order("position", { ascending: true });

    const { data: votes } = await supabase
      .from("poll_votes")
      .select("poll_id, option_id, voter_id")
      .in("poll_id", pollIds);

    const byPoll: Record<string, PollWithCounts> = {};
    for (const p of pollsData!) {
      const options = (opts ?? [])
        .filter((o) => o.poll_id === p.id)
        .map((o) => {
          const v = (votes ?? []).filter((vv) => vv.option_id === o.id);
          const mine = !!(votes ?? []).find((vv) => vv.option_id === o.id && vv.voter_id === user?.id);
          return { id: o.id, label: o.label, position: o.position, votes: v.length, mine };
        });
      const totalVotes = options.reduce((acc, o) => acc + o.votes, 0);
      const isClosed = p.closes_at ? new Date(p.closes_at) < new Date() : false;
      byPoll[p.id] = { ...p, options, totalVotes, isClosed };
    }
    setPolls(Object.values(byPoll));
  }

  function changePollOptionText(idx: number, text: string) {
    const copy = [...pollOptions];
    copy[idx] = text;
    setPollOptions(copy);
  }
  function addPollOption() {
    setPollOptions((prev) => [...prev, ""]);
  }
  function removePollOption(i: number) {
    setPollOptions((prev) => prev.filter((_, idx) => idx !== i));
  }

  async function createPoll(e: React.FormEvent) {
    e.preventDefault();
    if (!user || !group) return;
    setPollMsg("");
    try {
      const cleanOptions = pollOptions.map((s) => s.trim()).filter(Boolean);
      if (!pollQ.trim() || cleanOptions.length < 2) {
        setPollMsg("Añade una pregunta y al menos 2 opciones.");
        return;
      }

      const { data: inserted, error: insErr } = await supabase
        .from("polls")
        .insert({
          group_id: group.id,
          creator_id: user.id,
          question: pollQ.trim(),
          is_multi: pollMulti,
          closes_at: null,
        })
        .select("id")
        .single();
      if (insErr) throw insErr;

      const rows = cleanOptions.map((label, position) => ({
        poll_id: inserted.id,
        label,
        position,
      }));
      const { error: optErr } = await supabase.from("poll_options").insert(rows);
      if (optErr) throw optErr;

      // inline marker message so the poll appears in chat
      await supabase.from("messages").insert({
        group_id: group.id,
        sender_id: user.id,
        content: `POLL:${inserted.id}`,
        location_subgroup_id: selLoc === "all" ? null : selLoc,
        age_subgroup_id: selAge === "all" ? null : selAge,
        parent_message_id: null,
      });

      setOpenPoll(false);
      setPollQ("");
      setPollMulti(false);
      setPollOptions(["", ""]);
      await Promise.all([loadPolls(group.id), loadMessages(group.id, selLoc, selAge)]);
      requestAnimationFrame(scrollToBottom);
    } catch (e: any) {
      setPollMsg(e.message ?? "No se pudo crear la encuesta.");
    }
  }

  // NEW: vote function (used by InlinePoll & archive)
  async function vote(p: PollWithCounts, optionId: string) {
    if (!user || !group || p.isClosed) return;
    try {
      if (!p.is_multi) {
        await supabase.from("poll_votes").delete().match({ poll_id: p.id, voter_id: user.id });
      }
      const isMine = !!p.options.find((o) => o.id === optionId && o.mine);
      if (isMine) {
        await supabase
          .from("poll_votes")
          .delete()
          .match({ poll_id: p.id, voter_id: user.id, option_id: optionId });
      } else {
        await supabase.from("poll_votes").insert({ poll_id: p.id, option_id: optionId, voter_id: user.id });
      }
      await loadPolls(group.id);
    } catch (e) {
      console.error(e);
    }
  }

  // ===== Events (Create modal) =====
  async function createEvent(e: React.FormEvent) {
    e.preventDefault();
    if (!user || !group) return;
    setEvMsg("");
    try {
      if (!evTitle.trim() || !evWhen) {
        setEvMsg("Añade título y fecha.");
        return;
      }
      const starts_at = new Date(evWhen).toISOString();

      const { error } = await supabase.from("community_events").insert({
        group_id: group.id,
        creator_id: user.id,
        title: evTitle.trim(),
        description: evDesc.trim() || null,
        location: evLoc.trim() || null,
        starts_at,
        is_approved: false,
      });
      if (error) throw error;

      setOpenEvent(false);
      setEvTitle("");
      setEvDesc("");
      setEvLoc("");
      setEvWhen("");
    } catch (err: any) {
      setEvMsg(err.message ?? "No se pudo crear el evento.");
    }
  }

  if (loading || !user || loadingData) {
    return <main className="min-h-screen grid place-items-center bg-gcBackground text-gcText">Cargando…</main>;
  }
  if (!group) {
    return <main className="min-h-screen grid place-items-center bg-gcBackground text-gcText">Grupo no encontrado</main>;
  }

  const byId: Record<string, MessageRow> = {};
  messages.forEach((m) => (byId[m.id] = m));
  const pinned = messages.filter((m) => m.is_pinned);

  return (
    <main className="min-h-screen bg-gcBackground text-gcText font-montserrat">
      <div className="max-w-6xl mx-auto px-6 py-10">
        {/* Header with follow toggle */}
        <header className="mb-6 flex items-start justify-between gap-3">
          <div>
            <h1 className="font-dmserif text-3xl md:text-4xl">{group.name}</h1>
            {group.description && <p className="mt-2 max-w-3xl">{group.description}</p>}
          </div>
          <button
            onClick={toggleFollow}
            disabled={followBusy}
            className={`rounded-full px-4 py-1.5 text-sm border shadow-sm hover:opacity-90 ${
              following ? "bg-gcBackgroundAlt2" : "bg-white"
            }`}
            title={following ? "Dejar de seguir" : "Seguir este grupo"}
          >
            {followBusy ? "…" : following ? "Siguiendo" : "Seguir grupo"}
          </button>
        </header>

        {/* Filters */}
        <div className="mb-6 space-y-3">
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-sm opacity-70">Zona:</span>
            <Pill selected={selLoc === "all"} onClick={() => changeLoc("all")}>Todos</Pill>
            {locations.map((l) => (
              <Pill key={l.id} selected={selLoc === l.id} onClick={() => changeLoc(l.id)}>{l.name}</Pill>
            ))}
            <button className="underline ml-2" onClick={() => setOpenSG(true)}>Crear subgrupo</button>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <span className="text-sm opacity-70">Edad:</span>
            <Pill selected={selAge === "all"} onClick={() => changeAge("all")}>Todas</Pill>
            {ages.map((a) => (
              <Pill key={a.id} selected={selAge === a.id} onClick={() => changeAge(a.id)}>{a.name}</Pill>
            ))}
          </div>
        </div>

        {/* Messages (bubbles) */}
        <section className="bg-white rounded-2xl p-4 shadow-md">
          {/* Pinned scroller */}
          {pinned.length > 0 && (
            <div className="mb-3">
              <div className="text-xs uppercase tracking-wide opacity-70 mb-1">Fijados</div>
              <div className="flex gap-3 overflow-x-auto no-scrollbar pb-2">
                {pinned.map((m) => (
                  <button
                    key={m.id}
                    onClick={() => {
                      const el = document.getElementById(`msg-${m.id}`);
                      el?.scrollIntoView({ behavior: "smooth", block: "center" });
                    }}
                    className="rounded-xl border bg-white/80 px-3 py-2 text-sm hover:opacity-90"
                    title={new Date(m.created_at).toLocaleString()}
                  >
                    {(m.sender_profile?.username ?? "Usuaria")}: {m.content.slice(0, 60)}{m.content.length > 60 ? "…" : ""}
                  </button>
                ))}
              </div>
            </div>
          )}

          {messages.length === 0 && <div className="opacity-70 py-6">Sé la primera en escribir ✨</div>}

          <ul ref={listRef} className="space-y-6 max-h-[60vh] overflow-y-auto pr-1 no-scrollbar">
            {messages.map((m) => {
              const mine = m.sender_id === user!.id;
              const parent = m.parent_message_id ? byId[m.parent_message_id] : null;
              const t = timeAgo(m.created_at);
              const pollId = matchPollId(m.content);
              const pollForMsg = pollId ? polls.find(pp => pp.id === pollId) : null;

              return (
                <li id={`msg-${m.id}`} key={m.id}>
                  {/* Meta line with clickable author */}
                  <div className={`flex ${mine ? "justify-end" : "justify-start"} mb-1`}>
                    <div className="text-xs opacity-70" title={t.title}>
                      <button
                        type="button"
                        className="underline underline-offset-2 hover:opacity-80"
                        onClick={() => openUserSheet((m.sender_profile?.username ?? "Usuaria"))}
                      >
                        {m.sender_profile?.username ?? "Usuaria"}
                      </button>
                      {" • "}{t.label}
                      {m.is_pinned && (
                        <span className="ml-2 text-[10px] bg-gcCTA text-gcText px-2 py-0.5 rounded-full">PIN</span>
                      )}
                    </div>
                  </div>

                  {/* Bubble */}
                  <div className={`flex ${mine ? "justify-end" : "justify-start"}`}>
                    <div
                      className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                        mine ? "bg-gcBackgroundAlt2" : "bg-gcBackgroundAlt/30"
                      }`}
                    >
                      {/* Parent preview */}
                      {parent && (
                        <div className="mb-2 pl-3 border-l-2 border-gcBackgroundAlt/60 text-xs opacity-80">
                          Respondiendo a <strong>{parent.sender_profile?.username ?? "Usuaria"}</strong>:{" "}
                          <span className="italic">
                            {parent.content.slice(0, 80)}{parent.content.length > 80 ? "…" : ""}
                          </span>
                        </div>
                      )}

                      {/* Inline poll OR normal text */}
                      {pollForMsg ? (
                        <InlinePoll poll={pollForMsg} onVote={(optId) => vote(pollForMsg, optId)} />
                      ) : (
                        <div className="whitespace-pre-wrap">{renderText(m.content)}</div>
                      )}
                    </div>
                  </div>

                  {/* Actions row — Likes → Responder → Editar → Mensaje */}
                  {!pollForMsg && (
                    <div
                      className={`mt-1 flex items-center gap-4 text-sm opacity-90 ${
                        mine ? "justify-end" : "justify-start"
                      }`}
                    >
                      <button onClick={() => toggleLike(m.id)} className="inline-flex items-center gap-1 hover:opacity-80" title="Me gusta">
                        <Heart className={`w-4 h-4 ${likes[m.id]?.mine ? "fill-[#50415b] text-[#50415b]" : ""}`} />
                        <span>{likes[m.id]?.count ?? 0}</span>
                      </button>

                      <button onClick={() => setReplyTo(m)} className="inline-flex items-center gap-1 hover:opacity-80" title="Responder">
                        <CornerUpRight className="w-4 h-4" />
                        Responder
                      </button>

                      {/* show DM link for other users' messages */}
                      {!mine && m.sender_profile?.username && (
                        <Link
                          href={`/dm/${encodeURIComponent(m.sender_profile.username)}`}
                          className="underline hover:opacity-80"
                          title="Enviar mensaje directo"
                        >
                          Mensaje
                        </Link>
                      )}

                      {mine && (
                        <button onClick={() => startEdit(m.id, m.content)} className="inline-flex items-center gap-1 hover:opacity-80" title="Editar">
                          <Pencil className="w-4 h-4" />
                          Editar
                        </button>
                      )}

                      {isAdmin && (
                        <>
                          <button
                            onClick={() => adminTogglePin(m.id, !m.is_pinned)}
                            className="inline-flex items-center gap-1 hover:opacity-80"
                            title={m.is_pinned ? "Desfijar" : "Fijar"}
                          >
                            {m.is_pinned ? <PinOff className="w-4 h-4" /> : <Pin className="w-4 h-4" />}
                            {m.is_pinned ? "Desfijar" : "Fijar"}
                          </button>
                          <button onClick={() => adminDelete(m.id)} className="inline-flex items-center gap-1 hover:opacity-80" title="Eliminar">
                            <Trash2 className="w-4 h-4" />
                            Eliminar
                          </button>
                        </>
                      )}
                    </div>
                  )}

                  {/* Inline edit */}
                  {editingId === m.id && (
                    <div className={`mt-2 flex ${mine ? "justify-end" : "justify-start"}`}>
                      <div className="w-full max-w-[80%]">
                        <textarea
                          className="w-full rounded-xl border p-3"
                          rows={3}
                          value={editText}
                          onChange={(e) => setEditText(e.target.value)}
                        />
                        <div className="flex gap-2 justify-end mt-2">
                          <button
                            className="rounded-full bg-[#50415b] text-[#fef8f4] px-4 py-1.5 font-dmserif"
                            onClick={() => saveEdit(m.id)}
                          >
                            Guardar
                          </button>
                          <button className="underline" onClick={() => setEditingId(null)}>
                            Cancelar
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </li>
              );
            })}
          </ul>

          {/* New messages toast */}
          {showNewToast && !atBottom && (
            <button
              onClick={scrollToBottom}
              className="mt-3 rounded-full bg-[#50415b] text-[#fef8f4] px-4 py-2 shadow-md"
            >
              Ver mensajes nuevos ↓
            </button>
          )}

          {/* Reply banner */}
          {replyTo && (
            <div className="mt-6 mb-2 p-2 rounded-xl bg-gcBackgroundAlt/30 text-sm flex items-center justify-between">
              <div className="truncate">
                Respondiendo a <strong>{replyTo.sender_profile?.username ?? "Usuaria"}</strong>:{" "}
                <span className="italic">
                  {replyTo.content.slice(0, 80)}{replyTo.content.length > 80 ? "…" : ""}
                </span>
              </div>
              <button className="underline ml-3 shrink-0" onClick={() => setReplyTo(null)}>Cancelar</button>
            </div>
          )}

          {/* Composer */}
          <form onSubmit={sendMessage} className="mt-2 flex flex-col gap-3">
            {/* HINT when not following */}
            {!following && (
              <div className="text-sm opacity-80">
                Únete al grupo para poder publicar.{" "}
                <button type="button" onClick={toggleFollow} className="underline">
                  Seguir grupo
                </button>
              </div>
            )}

            <textarea
              className="w-full rounded-xl border p-3"
              rows={3}
              placeholder="Escribe tu mensaje… (usa @nombre para mencionar)"
              value={msgText}
              onChange={(e) => setMsgText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  if (!sending && msgText.trim() && following) sendMessage(e as any); // <-- gate on following
                }
              }}
              maxLength={1000}
            />
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <button
                  type="button"
                  onClick={() => setOpenPoll(true)}
                  className="underline inline-flex items-center gap-1"
                >
                  <PlusCircle className="w-4 h-4" />
                  Crear encuesta
                </button>

                {/* Create event opens modal */}
                <button
                  type="button"
                  onClick={() => setOpenEvent(true)}
                  className="underline inline-flex items-center gap-1"
                >
                  <PlusCircle className="w-4 h-4" />
                  Crear evento
                </button>

                {/* Link to events list page */}
                <Link
                  href={`/${"valencia"}/${category}/group/${slug}/events`}
                  className="underline"
                >
                  Ver todos los eventos
                </Link>
              </div>

              <button
                type="submit"
                disabled={sending || !msgText.trim() || !following}
                className="rounded-full bg-[#50415b] text-[#fef8f4] font-dmserif px-6 py-2 text-lg shadow-md hover:opacity-90 disabled:opacity-60"
              >
                {sending ? "Enviando…" : "Enviar"}
              </button>
            </div>
          </form>
        </section>

        {/* Polls archive */}
        <section className="mt-10">
          <div className="mb-3">
            <h2 className="font-dmserif text-2xl">Encuestas</h2>
          </div>

          {polls.length === 0 && <div className="opacity-70">No hay encuestas todavía.</div>}

          <ul className="space-y-4">
            {polls.map((p) => {
              return (
                <li key={p.id} className="bg-white rounded-2xl p-4 shadow-md">
                  <div className="flex items-center gap-2">
                    <p className="font-semibold">{p.question}</p>
                    {p.isClosed && <span className="text-xs bg-gcCTA text-gcText px-2 py-0.5 rounded-full">CERRADA</span>}
                    {p.is_multi && <span className="text-xs border px-2 py-0.5 rounded-full">Múltiple</span>}
                  </div>

                  <div className="mt-3 space-y-2">
                    {p.options.map((o) => {
                      const pct = p.totalVotes ? Math.round((o.votes / p.totalVotes) * 100) : 0;
                      const voted = o.mine;
                      return (
                        <button
                          key={o.id}
                          disabled={p.isClosed}
                          onClick={() => vote(p, o.id)}
                          className={`w-full text-left rounded-xl border p-3 relative overflow-hidden ${
                            voted ? "bg-gcBackgroundAlt2" : "bg-white"
                          } ${p.isClosed ? "opacity-70 cursor-not-allowed" : "hover:opacity-90"}`}
                          title={p.isClosed ? "Encuesta cerrada" : "Votar"}
                        >
                          <div className="flex items-center justify-between">
                            <span>{o.label}</span>
                            <span className="text-sm opacity-70">{o.votes} {o.votes === 1 ? "voto" : "votos"}</span>
                          </div>
                          <div className="mt-2 h-1.5 rounded bg-black/10">
                            <div className="h-full rounded" style={{ width: `${pct}%`, background: "#50415b" }} />
                          </div>
                        </button>
                      );
                    })}
                  </div>

                  <div className="mt-2 text-sm opacity-70">{p.totalVotes} {p.totalVotes === 1 ? "voto" : "votos"} totales</div>
                </li>
              );
            })}
          </ul>
        </section>
      </div>

      {/* Crear Subgrupo Modal */}
      <Dialog open={openSG} onOpenChange={setOpenSG}>
        <DialogContent className="max-w-md rounded-2xl bg-white p-6 shadow-xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-dmserif text-gcText">Crear subgrupo</DialogTitle>
            <DialogDescription className="text-sm text-gray-600">
              Crea una zona (p. ej. “Valencia Centro”) o una franja de edad (p. ej. “25–34”).
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={createSubgroup} className="space-y-3">
            <div>
              <label className="block text-sm mb-1">Tipo *</label>
              <select
                className="w-full rounded-xl border p-3 bg-white"
                value={sgType}
                onChange={(e) => setSgType(e.target.value as "location" | "age")}
              >
                <option value="location">Zona</option>
                <option value="age">Edad</option>
              </select>
            </div>

            <div>
              <label className="block text-sm mb-1">Nombre *</label>
              <input
                className="w-full rounded-xl border p-3"
                value={sgName}
                onChange={(e) => setSgName(e.target.value)}
                placeholder={sgType === "location" ? "Ej: Valencia Centro" : "Ej: 25–34"}
                required
              />
            </div>

            <button
              type="submit"
              className="w-full rounded-full bg-[#50415b] text-[#fef8f4] font-dmserif px-6 py-2 text-lg shadow-md hover:opacity-90"
            >
              Crear
            </button>

            {sgMsg && <p className="text-sm mt-2">{sgMsg}</p>}
          </form>
        </DialogContent>
      </Dialog>

      {/* Crear Encuesta Modal */}
      <Dialog open={openPoll} onOpenChange={setOpenPoll}>
        <DialogContent className="max-w-md rounded-2xl bg-white p-6 shadow-xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-dmserif text-gcText">Crear encuesta</DialogTitle>
            <DialogDescription className="text-sm text-gray-600">
              Añade una pregunta y al menos dos opciones. (Por ahora sin fecha de cierre.)
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={createPoll} className="space-y-3">
            <div>
              <label className="block text-sm mb-1">Pregunta *</label>
              <input
                className="w-full rounded-xl border p-3"
                value={pollQ}
                onChange={(e) => setPollQ(e.target.value)}
                placeholder="¿Cuándo os viene bien el plan?"
                required
              />
            </div>

            <div className="flex items-center gap-2">
              <input id="multi" type="checkbox" checked={pollMulti} onChange={(e) => setPollMulti(e.target.checked)} />
              <label htmlFor="multi" className="text-sm">Permitir seleccionar varias opciones</label>
            </div>

            <div className="space-y-2">
              <label className="block text-sm">Opciones *</label>
              {pollOptions.map((opt, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <input
                    className="flex-1 rounded-xl border p-3"
                    value={opt}
                    onChange={(e) => changePollOptionText(idx, e.target.value)}
                    placeholder={`Opción ${idx + 1}`}
                    required
                  />
                  {pollOptions.length > 2 && (
                    <button type="button" className="underline text-sm" onClick={() => removePollOption(idx)}>Quitar</button>
                  )}
                </div>
              ))}
              <button type="button" className="underline text-sm" onClick={addPollOption}>+ Añadir opción</button>
            </div>

            <button
              type="submit"
              className="w-full rounded-full bg-[#50415b] text-[#fef8f4] font-dmserif px-6 py-2 text-lg shadow-md hover:opacity-90"
            >
              Crear encuesta
            </button>

            {pollMsg && <p className="text-sm mt-2">{pollMsg}</p>}
          </form>
        </DialogContent>
      </Dialog>

      {/* Crear Evento Modal */}
      <Dialog open={openEvent} onOpenChange={setOpenEvent}>
        <DialogContent className="max-w-md rounded-2xl bg-white p-6 shadow-xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-dmserif text-gcText">Crear evento</DialogTitle>
            <DialogDescription className="text-sm text-gray-600">
              Eventos creados por la comunidad. (Aparecerán cuando sean aprobados.)
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={createEvent} className="space-y-3">
            <div>
              <label className="block text-sm mb-1">Título *</label>
              <input
                className="w-full rounded-xl border p-3"
                value={evTitle}
                onChange={(e) => setEvTitle(e.target.value)}
                placeholder="Picnic en el Turia"
                required
              />
            </div>
            <div>
              <label className="block text-sm mb-1">Descripción</label>
              <textarea
                className="w-full rounded-xl border p-3"
                rows={3}
                value={evDesc}
                onChange={(e) => setEvDesc(e.target.value)}
                placeholder="Trae algo para compartir 💜"
              />
            </div>
            <div>
              <label className="block text-sm mb-1">Ubicación</label>
              <input
                className="w-full rounded-xl border p-3"
                value={evLoc}
                onChange={(e) => setEvLoc(e.target.value)}
                placeholder="Parque del Turia, Puente de las Flores"
              />
            </div>
            <div>
              <label className="block text-sm mb-1">Fecha y hora *</label>
              <input
                type="datetime-local"
                className="w-full rounded-xl border p-3"
                value={evWhen}
                onChange={(e) => setEvWhen(e.target.value)}
                required
              />
            </div>

            <button
              type="submit"
              className="w-full rounded-full bg-[#50415b] text-[#fef8f4] font-dmserif px-6 py-2 text-lg shadow-md hover:opacity-90"
            >
              Crear evento
            </button>

            {evMsg && <p className="text-sm mt-2">{evMsg}</p>}
          </form>
        </DialogContent>
      </Dialog>

      {/* Profile quick-view */}
      <Dialog open={!!openProfile} onOpenChange={() => setOpenProfile(null)}>
        <DialogContent className="max-w-sm bg-white rounded-2xl p-5">
          <DialogHeader>
            <DialogTitle className="font-dmserif text-2xl">Perfil</DialogTitle>
          </DialogHeader>
          {!openProfile?.data ? (
            <p>Cargando…</p>
          ) : (
            <div className="flex items-center gap-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={openProfile.data.avatar_url ?? "/placeholder-avatar.png"}
                alt=""
                className="w-12 h-12 rounded-full object-cover"
              />
              <div>
                <div className="font-semibold">@{openProfile.data.username}</div>
                <div className="text-sm opacity-80">{openProfile.data.bio ?? "—"}</div>

                {/* DM button only for other users */}
                {openProfile.data.id && openProfile.data.username && openProfile.data.id !== user?.id && (
                  <Link
                    href={`/dm/${encodeURIComponent(openProfile.data.username)}`}
                    className="inline-block mt-3 rounded-full bg-[#50415b] text-[#fef8f4] px-4 py-1.5 text-sm shadow-md hover:opacity-90"
                  >
                    Enviar mensaje
                  </Link>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </main>
  );
}

/** Tiny inline poll card */
function InlinePoll({
  poll,
  onVote,
}: {
  poll: PollWithCounts;
  onVote: (optionId: string) => void;
}) {
  return (
    <div>
      <div className="flex items-center gap-2">
        <p className="font-semibold">{poll.question}</p>
        {poll.isClosed && <span className="text-xs bg-gcCTA text-gcText px-2 py-0.5 rounded-full">CERRADA</span>}
        {poll.is_multi && <span className="text-xs border px-2 py-0.5 rounded-full">Múltiple</span>}
      </div>
      <div className="mt-3 space-y-2">
        {poll.options.map((o) => {
          const pct = poll.totalVotes ? Math.round((o.votes / poll.totalVotes) * 100) : 0;
          const voted = o.mine;
          return (
            <button
              key={o.id}
              disabled={poll.isClosed}
              onClick={() => onVote(o.id)}
              className={`w-full text-left rounded-xl border p-3 relative overflow-hidden ${
                voted ? "bg-gcBackgroundAlt2" : "bg-white"
              } ${poll.isClosed ? "opacity-70 cursor-not-allowed" : "hover:opacity-90"}`}
              title={poll.isClosed ? "Encuesta cerrada" : "Votar"}
            >
              <div className="flex items-center justify-between">
                <span>{o.label}</span>
                <span className="text-sm opacity-70">
                  {o.votes} {o.votes === 1 ? "voto" : "votos"}
                </span>
              </div>
              <div className="mt-2 h-1.5 rounded bg-black/10">
                <div className="h-full rounded" style={{ width: `${pct}%`, background: "#50415b" }} />
              </div>
            </button>
          );
        })}
      </div>
      <div className="mt-2 text-sm opacity-70">
        {poll.totalVotes} {poll.totalVotes === 1 ? "voto" : "votos"} totales
      </div>
    </div>
  );
}

/** Small pill button */
function Pill({
  children,
  selected,
  onClick,
}: {
  children: React.ReactNode;
  selected?: boolean;
  onClick?: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-1.5 rounded-full border ${selected ? "bg-white" : "bg-transparent"}`}
    >
      {children}
    </button>
  );
}
