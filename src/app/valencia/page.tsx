"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { ChevronDown, ChevronLeft, ChevronRight } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import { useAuth } from "@/lib/auth";

// i18n
import { getLang, getDict, t as tt } from "@/lib/i18n";
import type { Lang } from "@/lib/dictionaries";

type Category = {
  id: string;
  name: string;
  slug: string;
};

type GroupRow = {
  id: string;
  name: string;
  slug: string;
  city_id: string;
  category_id: string;
  is_approved: boolean;
};

type EnrichedGroup = GroupRow & {
  category: Category | null;
};

type GroupSection = {
  categoryId: string;
  categoryName: string;
  categorySlug: string;
  groups: EnrichedGroup[];
};

const VALENCIA_CITY_ID = "8471529a-8293-44ec-a53e-80db477946cd";
const MAX_BOARD_ITEMS = 8;

function slugify(input: string) {
  return input
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/&/g, "y")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
}

export default function ValenciaPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  const [lang, setLang] = useState<Lang>("es");
  useEffect(() => {
    setLang(getLang());
  }, []);
  const dict = useMemo(() => getDict(lang), [lang]);
  const t = (k: string, fallback?: string) => tt(dict, k, fallback);

  const railRef = useRef<HTMLDivElement | null>(null);

  const [categories, setCategories] = useState<Category[]>([]);
  const [groups, setGroups] = useState<EnrichedGroup[]>([]);
  const [savedBoardGroups, setSavedBoardGroups] = useState<EnrichedGroup[]>([]);
  const [selectedGroupIds, setSelectedGroupIds] = useState<string[]>([]);
  const [isEditingBoard, setIsEditingBoard] = useState(false);
  const [boardLoading, setBoardLoading] = useState(true);
  const [boardSaving, setBoardSaving] = useState(false);
  const [boardError, setBoardError] = useState<string | null>(null);
  const [openSections, setOpenSections] = useState<string[]>([]);

  useEffect(() => {
    if (!loading && !user) {
      router.push("/auth");
    }
  }, [loading, user, router]);

  useEffect(() => {
    if (!user?.id) return;

    async function loadPageData(currentUserId: string) {
      setBoardLoading(true);
      setBoardError(null);

      try {
        const { data: categoriesData, error: categoriesError } = await supabase
          .from("categories")
          .select("id, name, slug")
          .order("name");

        if (categoriesError) throw categoriesError;

        const mappedCategories: Category[] =
          (categoriesData ?? [])
            .map((c) => ({
              id: c.id,
              name: c.name,
              slug: c.slug || slugify(c.name),
            }))
            .filter((c) => c.slug && c.slug !== "otro" && c.name.toLowerCase() !== "otro");

        setCategories(mappedCategories);

        const categoryMap = new Map<string, Category>();
        for (const cat of mappedCategories) {
          categoryMap.set(cat.id, cat);
        }

        const { data: groupsData, error: groupsError } = await supabase
          .from("groups")
          .select("id, name, slug, city_id, category_id, is_approved")
          .eq("city_id", VALENCIA_CITY_ID)
          .eq("is_approved", true)
          .order("name", { ascending: true });

        if (groupsError) throw groupsError;

        const enrichedGroups: EnrichedGroup[] = (groupsData ?? []).map((g) => ({
          id: g.id,
          name: g.name,
          slug: g.slug,
          city_id: g.city_id,
          category_id: g.category_id,
          is_approved: g.is_approved,
          category: categoryMap.get(g.category_id) ?? null,
        }));

        const validGroups = enrichedGroups.filter((g) => g.category?.slug);
        setGroups(validGroups);

        // todas cerradas por defecto
        setOpenSections([]);

        const { data: boardData, error: savedBoardError } = await supabase
          .from("user_group_board")
          .select("group_id")
          .eq("user_id", currentUserId)
          .eq("city_id", VALENCIA_CITY_ID);

        if (savedBoardError) throw savedBoardError;

        const savedIds = (boardData ?? []).map((row) => row.group_id);
        const savedGroups = validGroups.filter((g) => savedIds.includes(g.id));

        setSavedBoardGroups(savedGroups);
        setSelectedGroupIds(savedIds);
      } catch (err) {
        console.error("Error loading Valencia page:", err);
        setBoardError("No pudimos cargar tu board ahora mismo.");
      } finally {
        setBoardLoading(false);
      }
    }

    loadPageData(user.id);
  }, [user?.id]);

  const groupsByCategory = useMemo<GroupSection[]>(() => {
    const grouped = new Map<string, GroupSection>();

    for (const group of groups) {
      if (!group.category) continue;

      const key = group.category.id;

      if (!grouped.has(key)) {
        grouped.set(key, {
          categoryId: group.category.id,
          categoryName: group.category.name,
          categorySlug: group.category.slug,
          groups: [],
        });
      }

      grouped.get(key)!.groups.push(group);
    }

    return Array.from(grouped.values()).sort((a, b) =>
      a.categoryName.localeCompare(b.categoryName, "es")
    );
  }, [groups]);

  const boardColumns = useMemo(() => {
    const left: GroupSection[] = [];
    const right: GroupSection[] = [];

    groupsByCategory.forEach((section, index) => {
      if (index % 2 === 0) {
        left.push(section);
      } else {
        right.push(section);
      }
    });

    return { left, right };
  }, [groupsByCategory]);

  const hasSavedBoard = savedBoardGroups.length > 0;

  function scrollLeft() {
    railRef.current?.scrollBy({ left: -360, behavior: "smooth" });
  }

  function scrollRight() {
    railRef.current?.scrollBy({ left: 360, behavior: "smooth" });
  }

  function handleChooseCategory(slug: string) {
    router.push(`/valencia/${slug}`);
  }

  function handleGoToGroup(group: EnrichedGroup) {
    if (!group.category?.slug) return;
    router.push(`/valencia/${group.category.slug}/group/${group.slug}`);
  }

  function toggleGroupSelection(groupId: string) {
    setBoardError(null);

    setSelectedGroupIds((prev) => {
      const isSelected = prev.includes(groupId);

      if (isSelected) {
        return prev.filter((id) => id !== groupId);
      }

      if (prev.length >= MAX_BOARD_ITEMS) {
        setBoardError(`Puedes guardar hasta ${MAX_BOARD_ITEMS} subgrupos en tu board.`);
        return prev;
      }

      return [...prev, groupId];
    });
  }

  function toggleSection(categoryId: string) {
    setOpenSections((prev) =>
      prev.includes(categoryId)
        ? prev.filter((id) => id !== categoryId)
        : [...prev, categoryId]
    );
  }

  async function handleSaveBoard() {
    if (!user?.id) return;

    setBoardSaving(true);
    setBoardError(null);

    try {
      const currentUserId = user.id;

      const { error: deleteError } = await supabase
        .from("user_group_board")
        .delete()
        .eq("user_id", currentUserId)
        .eq("city_id", VALENCIA_CITY_ID);

      if (deleteError) throw deleteError;

      if (selectedGroupIds.length > 0) {
        const rows = selectedGroupIds.map((groupId) => ({
          user_id: currentUserId,
          group_id: groupId,
          city_id: VALENCIA_CITY_ID,
        }));

        const { error: insertError } = await supabase
          .from("user_group_board")
          .insert(rows);

        if (insertError) throw insertError;
      }

      const newSavedGroups = groups.filter((g) => selectedGroupIds.includes(g.id));
      setSavedBoardGroups(newSavedGroups);
      setIsEditingBoard(false);
    } catch (err) {
      console.error("Error saving board:", err);
      setBoardError("No pudimos guardar tu board. Inténtalo de nuevo.");
    } finally {
      setBoardSaving(false);
    }
  }

  function handleEditBoard() {
    setSelectedGroupIds(savedBoardGroups.map((g) => g.id));
    setBoardError(null);
    setIsEditingBoard(true);
  }

  function handleCancelEdit() {
    setSelectedGroupIds(savedBoardGroups.map((g) => g.id));
    setBoardError(null);
    setIsEditingBoard(false);
  }

  if (loading || !user) {
    return (
      <main className="min-h-screen grid place-items-center bg-gcBackground text-gcText">
        {t("common.misc.loading", "Cargando…")}
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gcBackground text-gcText font-montserrat">
      {/* top */}
      <section className="max-w-4xl mx-auto px-6 pt-6 md:pt-6">
        <div className="flex justify-center">
          <Image
            src="/cities/valencia-title.png"
            alt="Valencia"
            width={280}
            height={100}
            className="w-[180px] sm:w-[220px] md:w-[280px] h-auto"
            priority
          />
        </div>

        <div className="max-w-2xl md:max-w-3xl mx-auto mt-2 px-2 md:px-0">
  <p className="text-sm md:text-base leading-[1.45] text-justify md:text-left">
    Este es tu espacio para encontrar nuevas amigas, compartir intereses y crear planes que de verdad te llenen.
    Elige la categoría que más resuene contigo y empieza a construir comunidad.
    <br />
    A tu ritmo, a tu manera💫
  </p>
</div>
      </section>

      {/* board */}
      <section className="max-w-6xl mx-auto px-6 py-10">
        <div className="flex items-start justify-between gap-4 mb-4">
          <div>
            <h2 className="text-xl md:text-2xl font-dmserif uppercase tracking-[0.02em]">
              CREA TU BOARD
            </h2>
            <p className="text-sm md:text-base mt-1">
              Guarda aquí tus subgrupos favoritos para acceder más rápido.
            </p>
          </div>

          {hasSavedBoard && !isEditingBoard && (
            <button
              onClick={handleEditBoard}
              className="underline underline-offset-2 text-sm md:text-base hover:opacity-70 transition"
            >
              Editar
            </button>
          )}
        </div>

        {boardLoading ? (
          <div className="py-6 text-sm">Cargando tu board…</div>
        ) : (
          <>
            {!hasSavedBoard || isEditingBoard ? (
              <div className="space-y-6">
                <div className="flex flex-col md:flex-row gap-4 md:gap-5">
                  {[boardColumns.left, boardColumns.right].map((column, columnIndex) => (
                    <div key={columnIndex} className="flex-1 flex flex-col gap-4 md:gap-5">
                      {column.map((section) => {
                        const isOpen = openSections.includes(section.categoryId);

                        return (
                          <div
                            key={section.categoryId}
                            className="rounded-[24px] border border-gcText/15 bg-white/20 backdrop-blur-sm overflow-hidden"
                          >
                            <button
                              type="button"
                              onClick={() => toggleSection(section.categoryId)}
                              className="w-full flex items-center justify-between gap-4 px-5 py-4 text-left"
                            >
                              <div>
                                <h3 className="font-dmserif text-lg md:text-xl leading-none">
                                  {section.categoryName}
                                </h3>
                                <p className="text-xs md:text-sm opacity-70 mt-1">
                                  {section.groups.length} subgrupos
                                </p>
                              </div>

                              <ChevronDown
                                className={`w-5 h-5 shrink-0 transition-transform ${
                                  isOpen ? "rotate-180" : ""
                                }`}
                              />
                            </button>

                            {isOpen && (
                              <div className="px-5 pb-5">
                                <div className="flex flex-wrap gap-3">
                                  {section.groups.map((group) => {
                                    const checked = selectedGroupIds.includes(group.id);

                                    return (
                                      <button
                                        key={group.id}
                                        type="button"
                                        onClick={() => toggleGroupSelection(group.id)}
                                        className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm md:text-base transition ${
                                          checked
                                            ? "bg-[#fef8f4] border-gcText"
                                            : "bg-transparent border-gcText/25"
                                        }`}
                                      >
                                        <span
                                          className={`grid place-items-center w-5 h-5 rounded-[4px] border text-xs ${
                                            checked
                                              ? "border-gcText bg-[#fef8f4]"
                                              : "border-gcText/40 bg-white/50"
                                          }`}
                                        >
                                          {checked ? "✓" : ""}
                                        </span>
                                        <span>{group.name}</span>
                                      </button>
                                    );
                                  })}
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  ))}
                </div>

                <div className="flex flex-wrap items-center gap-3 pt-1">
                  <button
                    onClick={handleSaveBoard}
                    disabled={boardSaving}
                    className="rounded-full bg-gcText text-white px-5 py-2.5 text-sm md:text-base hover:opacity-90 transition disabled:opacity-50"
                  >
                    {boardSaving ? "Guardando..." : "Guardar"}
                  </button>

                  {hasSavedBoard && (
                    <button
                      onClick={handleCancelEdit}
                      disabled={boardSaving}
                      className="rounded-full border border-gcText px-5 py-2.5 text-sm md:text-base hover:opacity-70 transition disabled:opacity-50"
                    >
                      Cancelar
                    </button>
                  )}

                  <span className="text-sm opacity-70">
                    {selectedGroupIds.length}/{MAX_BOARD_ITEMS} seleccionados
                  </span>
                </div>
              </div>
            ) : (
              <div className="flex flex-wrap gap-3">
                {savedBoardGroups.map((group) => (
                  <button
                    key={group.id}
                    onClick={() => handleGoToGroup(group)}
                    className="rounded-full bg-[#fef8f4] px-4 py-2 text-sm md:text-base border border-transparent hover:scale-[1.02] transition"
                  >
                    {group.name}
                  </button>
                ))}
              </div>
            )}

            {boardError && (
              <p className="text-sm mt-4 text-red-600">{boardError}</p>
            )}
          </>
        )}
      </section>

      {/* categories carousel */}
      <section className="max-w-6xl mx-auto px-6 py-4 md:py-6 pb-12">
        <h2 className="text-xl md:text-2xl font-dmserif text-left mb-4 md:mb-5 uppercase">
          O EXPLORA CADA UNA DE LAS CATEGORÍAS:
        </h2>

        <div className="relative">
          <button
            aria-label={t("common.prev", "Anterior")}
            onClick={scrollLeft}
            className="absolute left-2 top-1/2 -translate-y-1/2 z-10 text-[#fffacd] hover:scale-110 transition"
          >
            <ChevronLeft size={40} strokeWidth={2.5} />
          </button>

          <button
            aria-label={t("common.next", "Siguiente")}
            onClick={scrollRight}
            className="absolute right-2 top-1/2 -translate-y-1/2 z-10 text-[#fffacd] hover:scale-110 transition"
          >
            <ChevronRight size={40} strokeWidth={2.5} />
          </button>

          <div
            ref={railRef}
            className="flex gap-6 overflow-x-auto scroll-smooth snap-x snap-mandatory px-10 py-2 no-scrollbar"
          >
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => handleChooseCategory(cat.slug)}
                className="relative shrink-0 w-[260px] snap-start rounded-[30px] overflow-hidden shadow-lg hover:scale-[1.02] transition"
                title={cat.name}
              >
                <div className="relative w-full" style={{ paddingTop: "125%" }}>
                  <Image
                    src={`/categories/${cat.slug}.jpg`}
                    alt={cat.name}
                    fill
                    className="object-cover"
                    sizes="260px"
                  />
                </div>
              </button>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}