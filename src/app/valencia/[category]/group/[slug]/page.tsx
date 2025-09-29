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

type ProfilePreview = {
  id: string;
  username: string | null;
  bio: string | null;
  avatar_url: string | null;
  city_id: string | null;
  interests?: string[];
  favorite_emoji?: string | null;
  quote?: string | null;
  gallery?: string[]; // URLs
};

/** ✅ Typed DB row for profiles to avoid `any` */
type ProfileRowDB = {
  id: string;
  username: string | null;
  bio: string | null;
  avatar_url: string | null;
  city_id: string | null;
  favorite_emoji: string | null;
  quote: string | null;
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
  // expanded replies state
  const [openReplies, setOpenReplies] = useState<Record<string, boolean>>({});

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
  const [pollsOpen, setPollsOpen] = useState(false); // toggle for archive

  // events (create modal)
  const [openEvent, setOpenEvent] = useState(false);
  const [evTitle, setEvTitle] = useState("");
  const [evDesc, setEvDesc] = useState("");
  const [evLoc, setEvLoc] = useState("");
  const [evWhen, setEvWhen] = useState<string>("");
  const [evMsg, setEvMsg] = useState("");

  // list scroll & “new messages” toast
  const listRef = useRef<HTMLUListElement | null>(null);
  const firstLoadRef = useRef(true);

  const [atBottom, setAtBottom] = useState(true);
  const [showNewToast, setShowNewToast] = useState(false);

  // First time messages arrive, snap to bottom once (robust: double rAF after paint)
useEffect(() => {
  if (!firstLoadRef.current) return;
  if (!messages.length) return;

  const el = listRef.current;
  if (!el) return;

  requestAnimationFrame(() => {
    // 1st rAF: after initial paint
    el.scrollTop = el.scrollHeight;
    requestAnimationFrame(() => {
      // 2nd rAF: after layout settles (images/fonts, etc.)
      el.scrollTop = el.scrollHeight;
      firstLoadRef.current = false; // flip only after we’ve snapped
    });
  });
}, [messages.length]);

  // UNREAD marker
  const [lastReadAt, setLastReadAt] = useState<string | null>(null);
  const [unreadFirstId, setUnreadFirstId] = useState<string | null>(null);

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

        // following? (existence only)
        const { data: mem } = await supabase
          .from("group_members")
          .select("group_id")
          .eq("group_id", g.id)
          .eq("profile_id", user.id)
          .maybeSingle();
        setFollowing(!!mem);

        // subgroups
        const { data: sgs } = await supabase
          .from("subgroups")
          .select("id, name, type")
          .eq("group_id", g.id)
          .order("name");
        const locs = (sgs ?? []).filter((s) => s.type === "location") as SubgroupRow[];
        const ags = (sgs ?? []).filter((s) => s.type === "age") as SubgroupRow[];
        setLocations(locs);
        setAges(ags);

        // unread last_read_at (usar user_id)
        try {
          const { data: readRow } = await supabase
            .from("group_reads")
            .select("last_read_at")
            .eq("group_id", g.id)
            .eq("user_id", user.id)
            .maybeSingle();
          if (readRow?.last_read_at) setLastReadAt(readRow.last_read_at);
        } catch {
          // si no existe la tabla, seguimos sin romper
        }

        await Promise.all([loadMessages(g.id, "all", "all"), loadPolls(g.id)]);
      } catch (err: unknown) {
        console.error(err);
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

  useEffect(() => {
  if (firstLoadRef.current) return; // don't run during first-load snap

  const el = listRef.current;
  if (!el) return;

  if (atBottom) {
    el.scrollTop = el.scrollHeight;
  }
}, [messages.length, atBottom]);

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
    const profiles: Record<string, { username: string | null; avatar_url: string | null }> = {};
    if (ids.length) {
      const { data: profs } = await supabase
        .from("profiles")
        .select("id, username, avatar_url")
        .in("id", ids);

      (profs ?? []).forEach(
        (p: { id: string; username: string | null; avatar_url: string | null }) => {
          profiles[p.id] = { username: p.username, avatar_url: p.avatar_url };
        }
      );
    }

    const full = (rows ?? []).map((m) => ({ ...m, sender_profile: profiles[m.sender_id] ?? null }));
    setMessages(full);

    // Ensure first-render lands at the newest message (bottom of the list)
    if (firstLoadRef.current) {
        requestAnimationFrame(() => {
          const el = listRef.current;
          if (el) el.scrollTop = el.scrollHeight;
        });
      }

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

    // compute unread marker (first message strictly newer than lastReadAt)
    if (lastReadAt) {
      const firstNew = full.find((m) => new Date(m.created_at) > new Date(lastReadAt));
      setUnreadFirstId(firstNew?.id ?? null);
    } else {
      setUnreadFirstId(null);
    }

    // new messages toast logic
{
  const el = listRef.current;
  if (el) {
    if (firstLoadRef.current) {
      // first-load snap is handled by the first-load effect; no toast here
      setShowNewToast(false);
    } else if (isNearBottom(el)) {
      setShowNewToast(false);
    } else {
      setShowNewToast(true);
    }
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

  // day helpers for separators
  function yyyyMmDd(iso: string) {
    const d = new Date(iso);
    return d.toISOString().slice(0, 10);
  }
  function formatDay(iso: string) {
    return new Date(iso).toLocaleDateString("es-ES", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  }

  // clickable @mentions → profile sheet
  const [openProfile, setOpenProfile] =
    useState<null | { username: string; data?: ProfilePreview }>(null);

  async function openUserSheet(username: string) {
    setOpenProfile({ username });
    const { data: prof } = await supabase
      .from("profiles")
      .select("id,username,bio,avatar_url,city_id,favorite_emoji,quote")
      .ilike("username", username)
      .maybeSingle<ProfileRowDB>(); // ✅ typed result

    const preview: ProfilePreview | undefined = prof
      ? {
          id: prof.id,
          username: prof.username,
          bio: prof.bio,
          avatar_url: prof.avatar_url,
          city_id: prof.city_id,
          favorite_emoji: prof.favorite_emoji ?? null,
          quote: prof.quote ?? null,
        }
      : undefined;

    // fetch interests
    const interests: string[] = [];
    if (prof?.id) {
      const { data: pcats } = await supabase
        .from("profile_categories")
        .select("category_id")
        .eq("profile_id", prof.id);
      const catIds = (pcats ?? []).map((c: { category_id: string }) => c.category_id);
      if (catIds.length) {
        const { data: cats } = await supabase
          .from("categories")
          .select("id,name")
          .in("id", catIds);
        interests.push(...((cats ?? []).map((c: { name: string }) => c.name)));
      }
      const { data: custom } = await supabase
        .from("profile_custom_interests")
        .select("interest")
        .eq("profile_id", prof.id)
        .maybeSingle();
      if (custom?.interest) interests.push(custom.interest);

      // GALLERY: try two possible tables
      let gallery: string[] = [];
      try {
        const { data: gal1 } = await supabase
          .from("profile_gallery")
          .select("url, position, created_at")
          .eq("profile_id", prof.id)
          .order("position", { ascending: true })
          .order("created_at", { ascending: false });
        gallery = (gal1 ?? []).map((g: { url: string }) => g.url).filter(Boolean);
      } catch {}
      if (!gallery.length) {
        try {
          const { data: gal2 } = await supabase
            .from("profile_photos")
            .select("url, position, created_at")
            .eq("profile_id", prof.id)
            .order("position", { ascending: true })
            .order("created_at", { ascending: false });
          gallery = (gal2 ?? []).map((g: { url: string }) => g.url).filter(Boolean);
        } catch {}
      }

      setOpenProfile({
        username,
        data: { ...(preview as ProfilePreview), interests, gallery },
      });
      return;
    }

    setOpenProfile(preview ? { username, data: { ...preview, interests } } : { username });
  }

  function renderText(body: string) {
    const parts = body.split(/(@[A-Za-z0-9_]+)/g);
    return parts.map((part, i) =>
      part.startsWith("@") ? (
        <button
          key={i}
          className="text-[#50415b] font-medium underline underline-offset-2"
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

  // helper → when replying to a reply, keep thread under the top-level message and @mention the user
  function replyToMessage(msg: MessageRow) {
    setReplyTo(msg);
    if (msg.parent_message_id && msg.sender_profile?.username) {
      const handle = `@${msg.sender_profile.username}`;
      setMsgText((cur) => (cur.startsWith(handle) ? cur : `${handle} ${cur}`));
    }
  }

  // NOTE: accepts submit or Enter key
  async function sendMessage(e?: React.FormEvent | React.KeyboardEvent) {
    e?.preventDefault?.();
    if (!user || !group || !following) return;
    if (!msgText.trim()) return;
    setSending(true);
    try {
      // If replying to a reply → parent is the root (keep single-level thread)
      const parentId = replyTo ? (replyTo.parent_message_id ?? replyTo.id) : null;

      const payload = {
        group_id: group.id,
        sender_id: user.id,
        content: msgText.trim(),
        location_subgroup_id: selLoc === "all" ? null : selLoc,
        age_subgroup_id: selAge === "all" ? null : selAge,
        parent_message_id: parentId,
      };
      const { error } = await supabase.from("messages").insert(payload);
      if (error) throw error;
      setMsgText("");
      setReplyTo(null);
      await loadMessages(group.id, selLoc, selAge);
      requestAnimationFrame(scrollToBottom);
      void markGroupRead();
    } catch (err: unknown) {
      console.error(err);
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
    } catch (err: unknown) {
      console.error(err);
    }
  }

  function startEdit(mid: string, current: string) {
  setEditingId(mid);
  setEditText(current);
  // lleva el mensaje al centro de la vista
  requestAnimationFrame(() => {
    document.getElementById(`msg-${mid}`)?.scrollIntoView({ behavior: "smooth", block: "center" });
  });
}

  // ✅ robust save with feedback + sender guard
  async function saveEdit(mid: string) {
    const newText = editText.trim();
    if (!newText) return;
    if (!user) return;

    try {
      const { error, data } = await supabase
        .from("messages")
        .update({ content: newText })
        .match({ id: mid, sender_id: user.id })
        .select("id");

      if (error) {
        console.error(error);
        alert("No se pudo guardar el cambio (¿permisos de edición?).");
        return;
      }
      if (!data || data.length === 0) {
        alert("No se actualizó ningún mensaje (puede ser por permisos).");
        return;
      }

      setEditingId(null);
      if (group) await loadMessages(group.id, selLoc, selAge);
    } catch (err: unknown) {
      console.error(err);
      alert("Error al guardar el mensaje.");
    }
  }

  async function deleteOwn(mid: string) {
    if (!confirm("¿Eliminar tu mensaje?")) return;
    const { error } = await supabase.from("messages").delete().eq("id", mid);
    if (!error && group) await loadMessages(group.id, selLoc, selAge);
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
            { onConflict: "group_id,profile_id" }
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
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error("toggleFollow error:", msg);
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
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "No se pudo crear el subgrupo.";
      setSgMsg(msg);
    }
  }

  // ===== Polls =====
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
    for (const p of pollsData ?? []) {
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
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "No se pudo crear la encuesta.";
      setPollMsg(msg);
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
    } catch (err: unknown) {
      console.error(err);
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
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "No se pudo crear el evento.";
      setEvMsg(msg);
    }
  }

  // marcar leído cuando estamos al fondo
  useEffect(() => {
    if (atBottom) void markGroupRead();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [atBottom]);

  async function markGroupRead() {
    if (!user || !group) return;
    const now = new Date().toISOString();
    try {
      await supabase
        .from("group_reads")
        .upsert(
          { group_id: group.id, user_id: user.id, last_read_at: now },
          { onConflict: "group_id,user_id" }
        );
      setLastReadAt(now);
    } catch {
      // silencioso
    }
  }

  if (loading || !user || loadingData) {
    return <main className="min-h-screen grid place-items-center bg-gcBackground text-gcText">Cargando…</main>;
  }
  if (!group) {
    return <main className="min-h-screen grid place-items-center bg-gcBackground text-gcText">Grupo no encontrado</main>;
  }

  // Build thread structure (1-level)
  const byId: Record<string, MessageRow> = {};
  messages.forEach((m) => (byId[m.id] = m));
  const childrenMap: Record<string, MessageRow[]> = {};
  messages.forEach((m) => {
    if (m.parent_message_id) {
      (childrenMap[m.parent_message_id] ??= []).push(m);
    }
  });
  const topLevel = messages.filter((m) => !m.parent_message_id);
  const pinned = messages.filter((m) => m.is_pinned);

  // helper to show date separators
  let prevDay = "";

  return (
    <main className="min-h-screen bg-gcBackground text-gcText font-montserrat">
      <div className="max-w-6xl mx-auto px-6 py-10">
        {/* Header with follow toggle */}
        <header className="mb-6 flex items-start justify-between gap-3">
          <div>
            <h1 className="font-dmserif text-2xl md:text-4xl">{group.name}</h1>
            {group.description && <p className="mt-2 max-w-3xl">{group.description}</p>}
            <div className="mt-2">
              <Link href={`/${"valencia"}/${category}`} className="underline text-sm">
                ← Volver a la categoría
              </Link>
            </div>
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

        {/* Filters → 3 columnas iguales en desktop */}
        <div className="mb-6 grid gap-3 md:grid-cols-3">
          <div>
            <label className="block text-sm mb-1 opacity-70">Zona</label>
            <select
              className="w-full rounded-xl border p-3 bg-white"
              value={selLoc}
              onChange={(e) => changeLoc(e.target.value)}
            >
              <option value="all">Todos</option>
              {locations.map((l) => (
                <option key={l.id} value={l.id}>{l.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm mb-1 opacity-70">Edad</label>
            <select
              className="w-full rounded-xl border p-3 bg-white"
              value={selAge}
              onChange={(e) => changeAge(e.target.value)}
            >
              <option value="all">Todas</option>
              {ages.map((a) => (
                <option key={a.id} value={a.id}>{a.name}</option>
              ))}
            </select>
          </div>
          <div className="flex items-end">
            <button
              className="w-full p-0 text-sm underline text-left bg-transparent"
              onClick={() => setOpenSG(true)}
            >
              Crear subgrupo
            </button>
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
                    {(m.sender_profile?.username ?? "Usuaria")}: {m.content.slice(0, 60)}
                    {m.content.length > 60 ? "…" : ""}
                  </button>
                ))}
              </div>
            </div>
          )}

          {topLevel.length === 0 && <div className="opacity-70 py-6">Sé la primera en escribir ✨</div>}

          <ul ref={listRef} className="space-y-6 h-[60vh] overflow-y-auto pr-1 no-scrollbar">
            {topLevel.map((m) => {
              // DATE SEPARATOR
              const curDay = yyyyMmDd(m.created_at);
              const showDateSep = curDay !== prevDay;
              if (showDateSep) prevDay = curDay;

              const mine = m.sender_id === user!.id;
              const t = timeAgo(m.created_at);
              const pollId = matchPollId(m.content);
              const pollForMsg = pollId ? polls.find(pp => pp.id === pollId) : null;
              const replies = childrenMap[m.id] ?? [];
              const isOpen = openReplies[m.id] ?? false;

              return (
                <li id={`msg-${m.id}`} key={m.id}>
                  {/* DATE SEPARATOR */}
                  {showDateSep && (
                    <div className="my-3 flex items-center gap-3">
                      <div className="flex-1 h-px bg-black/10" />
                      <div className="text-xs uppercase tracking-wide opacity-70">
                        {formatDay(m.created_at)}
                      </div>
                      <div className="flex-1 h-px bg-black/10" />
                    </div>
                  )}

                  {/* UNREAD DIVIDER */}
                  {unreadFirstId && unreadFirstId === m.id && (
                    <div className="my-2 flex items-center gap-3">
                      <div className="flex-1 h-px bg-[#50415b]" />
                      <div className="text-xs px-2 py-0.5 rounded-full border">No leído</div>
                      <div className="flex-1 h-px bg-[#50415b]" />
                    </div>
                  )}

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
                      {pollForMsg ? (
                        <InlinePoll poll={pollForMsg} onVote={(optId) => vote(pollForMsg, optId)} />
                      ) : (
                        <div className="whitespace-pre-wrap">{renderText(m.content)}</div>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  {!pollForMsg && (
                    <div
                      className={`mt-1 flex items-center gap-4 text-sm opacity-90 ${
                        mine ? "justify-end" : "justify-start"
                      }`}
                    >
                      <button onClick={() => toggleLike(m.id)} className="inline-flex items-center gap-1 hover:opacity-80" title="Me gusta" aria-label="Me gusta">
                        <Heart className={`w-4 h-4 ${likes[m.id]?.mine ? "fill-[#50415b] text-[#50415b]" : ""}`} />
                        <span>{likes[m.id]?.count ?? 0}</span>
                      </button>

                      <button onClick={() => setReplyTo(m)} className="inline-flex items-center gap-1 hover:opacity-80" title="Responder" aria-label="Responder">
                        <CornerUpRight className="w-4 h-4" />
                        <span className="sr-only">Responder</span>
                      </button>

                      {!mine && m.sender_profile?.username && (
                        <Link
                          href={`/dm/${encodeURIComponent(m.sender_profile.username)}`}
                          className="underline hover:opacity-80"
                          title="Enviar mensaje directo"
                        >
                          Mensaje privado
                        </Link>
                      )}

                      {mine && (
                        <>
                          {/* ✅ solo icono */}
                          <button
                            onClick={() => startEdit(m.id, m.content)}
                            className="inline-flex items-center gap-1 hover:opacity-80"
                            title="Editar"
                            aria-label="Editar"
                          >
                            <Pencil className="w-4 h-4" />
                            <span className="sr-only">Editar</span>
                          </button>
                          <button
                            onClick={() => deleteOwn(m.id)}
                            className="inline-flex items-center gap-1 hover:opacity-80"
                            title="Eliminar"
                            aria-label="Eliminar"
                          >
                            <Trash2 className="w-4 h-4" />
                            <span className="sr-only">Eliminar</span>
                          </button>
                        </>
                      )}

                      {!mine && isAdmin && (
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

                  {/* Replies toggle */}
                  {replies.length > 0 && (
                    <div className={`mt-2 ${mine ? "text-right" : "text-left"}`}>
                      <button
                      onClick={() => {
                        setOpenReplies((s) => {
                          const next = { ...s, [m.id]: !isOpen };
                          requestAnimationFrame(() => {
                            document.getElementById(`msg-${m.id}`)?.scrollIntoView({ behavior: "smooth", block: "start" });
                          });
                          return next;
                        });
                      }}
                      className="text-sm underline underline-offset-2 hover:opacity-80"
                      >
                        {isOpen ? "Ocultar" : "Respuestas"} ({replies.length})
                        </button>
                    </div>
                  )}

                  {/* Replies list */}
                  {isOpen && replies.length > 0 && (
                    <ul className="mt-2 space-y-4 ml-6 md:ml-10">
                      {replies.map((r) => {
                        const rMine = r.sender_id === user!.id;
                        const rt = timeAgo(r.created_at);
                        const rPollId = matchPollId(r.content);
                        const rPoll = rPollId ? polls.find(pp => pp.id === rPollId) : null;
                        return (
                          <li id={`msg-${r.id}`} key={r.id}>
                            <div className={`flex ${rMine ? "justify-end" : "justify-start"} mb-1`}>
                              <div className="text-xs opacity-70" title={rt.title}>
                                <button
                                  type="button"
                                  className="underline underline-offset-2 hover:opacity-80"
                                  onClick={() => openUserSheet((r.sender_profile?.username ?? "Usuaria"))}
                                >
                                  {r.sender_profile?.username ?? "Usuaria"}
                                </button>
                                {" • "}{rt.label}
                              </div>
                            </div>
                            <div className={`flex ${rMine ? "justify-end" : "justify-start"}`}>
                              <div
                                className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                                  rMine ? "bg-gcBackgroundAlt2" : "bg-gcBackgroundAlt/30"
                                }`}
                              >
                                {rPoll ? (
                                  <InlinePoll poll={rPoll} onVote={(optId) => vote(rPoll, optId)} />
                                ) : (
                                  <div className="whitespace-pre-wrap">{renderText(r.content)}</div>
                                )}
                              </div>
                            </div>
                            {!rPoll && (
                              <div
                                className={`mt-1 flex items-center gap-4 text-sm opacity-90 ${
                                  rMine ? "justify-end" : "justify-start"
                                }`}
                              >
                                <button onClick={() => toggleLike(r.id)} className="inline-flex items-center gap-1 hover:opacity-80" title="Me gusta" aria-label="Me gusta">
                                  <Heart className={`w-4 h-4 ${likes[r.id]?.mine ? "fill-[#50415b] text-[#50415b]" : ""}`} />
                                  <span>{likes[r.id]?.count ?? 0}</span>
                                </button>

                                <button onClick={() => replyToMessage(r)} className="inline-flex items-center gap-1 hover:opacity-80" title="Responder" aria-label="Responder">
                                  <CornerUpRight className="w-4 h-4" />
                                  <span className="sr-only">Responder</span>
                                </button>

                                {!rMine && r.sender_profile?.username && (
                                  <Link
                                    href={`/dm/${encodeURIComponent(r.sender_profile.username)}`}
                                    className="underline hover:opacity-80"
                                    title="Enviar mensaje directo"
                                  >
                                    Mensaje
                                  </Link>
                                )}

                                {rMine && (
                                  <>
                                    {/* ✅ solo icono */}
                                    <button
                                      onClick={() => startEdit(r.id, r.content)}
                                      className="inline-flex items-center gap-1 hover:opacity-80"
                                      title="Editar"
                                      aria-label="Editar"
                                    >
                                      <Pencil className="w-4 h-4" />
                                      <span className="sr-only">Editar</span>
                                    </button>
                                    <button
                                      onClick={() => deleteOwn(r.id)}
                                      className="inline-flex items-center gap-1 hover:opacity-80"
                                      title="Eliminar"
                                      aria-label="Eliminar"
                                    >
                                      <Trash2 className="w-4 h-4" />
                                      <span className="sr-only">Eliminar</span>
                                    </button>
                                  </>
                                )}

                                {!rMine && isAdmin && (
                                  <button onClick={() => adminDelete(r.id)} className="inline-flex items-center gap-1 hover:opacity-80" title="Eliminar">
                                    <Trash2 className="w-4 h-4" />
                                    Eliminar
                                  </button>
                                )}
                              </div>
                            )}
                                  {editingId === r.id && (
                                    <div className={`mt-2 flex ${rMine ? "justify-end" : "justify-start"}`}>
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
                                        onClick={() => saveEdit(r.id)}
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
            {!following && (
              <div className="rounded-xl bg-[#EBDCF5]/70 backdrop-blur p-2 text-sm text-center">
                Únete al grupo para ver y publicar todos los mensajes.{" "}
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
                  if (!sending && msgText.trim() && following) sendMessage(e);
                }
              }}
              maxLength={1000}
            />
            <div className="flex items-center justify-between">
              {/* Desktop controls (inline) */}
              <div className="hidden md:flex items-center gap-4">
                <button
                  type="button"
                  onClick={() => setOpenPoll(true)}
                  className="underline inline-flex items-center gap-1"
                >
                  <PlusCircle className="w-4 h-4" />
                  Crear encuesta
                </button>
                <button
                  type="button"
                  onClick={() => setOpenEvent(true)}
                  className="underline inline-flex items-center gap-1"
                >
                  <PlusCircle className="w-4 h-4" />
                  Crear evento
                </button>
                <Link
                  href={`/${"valencia"}/${category}/group/${slug}/events`}
                  className="underline"
                >
                  Ver todos los eventos
                </Link>
              </div>

              {/* Mobile controls (stacked vertically) */}
              <div className="flex md:hidden flex-col items-start gap-2">
                <button
                  type="button"
                  onClick={() => setOpenPoll(true)}
                  className="underline inline-flex items-center gap-1"
                >
                  <PlusCircle className="w-4 h-4" />
                  Crear encuesta
                </button>
                <button
                  type="button"
                  onClick={() => setOpenEvent(true)}
                  className="underline inline-flex items-center gap-1"
                >
                  <PlusCircle className="w-4 h-4" />
                  Crear evento
                </button>
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

        {/* Mobile-only: Ver todos los eventos (outside bubble, left) */}
        <div className="md:hidden mt-3">
          <Link
            href={`/${"valencia"}/${category}/group/${slug}/events`}
            className="underline"
          >
            Ver todos los eventos
          </Link>
        </div>

        {/* Polls archive (toggle) */}
        <section className="mt-8">
          <button
            type="button"
            onClick={() => setPollsOpen((v) => !v)}
            className="w-full text-left flex items-center justify-between bg-white rounded-2xl px-4 py-3 shadow-md"
          >
            <span className="font-dmserif text-2xl">Encuestas</span>
            <span className="text-sm opacity-70">{polls.length} {polls.length === 1 ? "encuesta" : "encuestas"} {pollsOpen ? "▲" : "▼"}</span>
          </button>

          {pollsOpen && (
            <div className="mt-4">
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
            </div>
          )}
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
                className="w-full rounded-xl border p-3 bg.white"
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
              Eventos creados por la comunidad.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={createEvent} className="space-y-3">
            <div>
              <label className="block text.sm mb-1">Descripción</label>
              <textarea
                className="w-full rounded-xl border p-3"
                rows={3}
                value={evDesc}
                onChange={(e) => setEvDesc(e.target.value)}
                placeholder="Trae algo para compartir 💜"
              />
            </div>
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
            <div>
              <div className="flex items-start gap-3">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={openProfile.data.avatar_url ?? "/placeholder-avatar.png"}
                  alt=""
                  className="w-12 h-12 rounded-full object-cover"
                />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <div className="font-semibold">@{openProfile.data.username}</div>
                    {openProfile.data.favorite_emoji ? (
                      <span className="text-xl leading-none">{openProfile.data.favorite_emoji}</span>
                    ) : null}
                  </div>

                  <div className="text-sm opacity-80">{openProfile.data.bio ?? "—"}</div>

                  {openProfile.data.quote ? (
                    <div className="mt-2 text-sm italic opacity-90">“{openProfile.data.quote}”</div>
                  ) : null}

                  {openProfile.data.interests && openProfile.data.interests.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-2">
                      {openProfile.data.interests.map((name, i) => (
                        <span key={i} className="text-xs border rounded-full px-2 py-0.5">{name}</span>
                      ))}
                    </div>
                  )}

                  {openProfile.data.gallery && openProfile.data.gallery.length > 0 && (
                    <div className="mt-3 grid grid-cols-3 gap-2">
                      {openProfile.data.gallery.slice(0, 6).map((url, i) => (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img key={i} src={url} alt="" className="w-full aspect-square object-cover rounded-xl border" />
                      ))}
                    </div>
                  )}

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

/** Small pill button (kept for compatibility elsewhere) */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
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

