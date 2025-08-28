"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";


type City = { id: string; name: string; slug: string; is_active: boolean };


export default function Home() {
const [cities, setCities] = useState<City[]>([]);
const [loading, setLoading] = useState(true);
const [error, setError] = useState<string | null>(null);


useEffect(() => {
(async () => {
const { data, error } = await supabase
.from("cities")
.select("id,name,slug,is_active")
.order("name");
if (error) setError(error.message);
setCities(data || []);
setLoading(false);
})();
}, []);


return (
<main className="min-h-screen p-8">
<h1 className="text-3xl font-semibold">Girls Collective</h1>
<p className="mt-2">Cities in database:</p>
{loading && <p className="mt-4">Loading…</p>}
{error && <p className="mt-4 text-red-600">{error}</p>}
<ul className="mt-4 list-disc pl-6">
{cities.map((c) => (
<li key={c.id}>{c.name} {c.is_active ? "✅" : "⏳"}</li>
))}
</ul>
</main>
);
}