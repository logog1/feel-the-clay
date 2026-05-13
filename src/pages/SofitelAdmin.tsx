import { useEffect, useMemo, useState, FormEvent } from "react";
import { Helmet } from "react-helmet-async";
import { supabase } from "@/integrations/supabase/client";
import { format, parseISO } from "date-fns";
import {
  Calendar, Users, MapPin, Clock, LogOut, Loader2, Plus, X, Pencil, Trash2,
  Image as ImageIcon, Search, ToggleLeft, ToggleRight, ListOrdered, Sparkles,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

type Experience = {
  id: string;
  slug: string;
  title: string;
  subtitle: string | null;
  description: string;
  cover_image: string | null;
  category: string;
  audience: string;
  difficulty: string;
  capacity: number;
  location: string | null;
  scheduled_at: string;
  duration_minutes: number;
  price_per_person: number;
  currency: string;
  is_active: boolean;
  sort_order: number;
};

type Booking = {
  id: string;
  experience_id: string;
  guest_name: string;
  room_number: string;
  guest_email: string | null;
  guest_phone: string | null;
  participants: number;
  status: string;
  source: string;
  notes: string | null;
  created_at: string;
};

const PALETTE = {
  bg: "#FBFAF6",
  ink: "#0E1418",
  blue: "#5B8AA6",
  blueDeep: "#2E5168",
  sand: "#E6C36B",
  sandSoft: "#F1E2BE",
  line: "#E8E2D2",
};

const slugify = (s: string) =>
  s.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

export default function SofitelAdmin() {
  const [session, setSession] = useState<any>(null);
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    supabase.auth.onAuthStateChange((_e, s) => setSession(s));
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setChecking(false);
    });
  }, []);

  useEffect(() => {
    if (!session) { setIsAdmin(null); return; }
    (async () => {
      const { data } = await supabase
        .from("user_roles").select("role").eq("user_id", session.user.id);
      setIsAdmin(((data || []) as any[]).some((r) => r.role === "admin"));
    })();
  }, [session]);

  return (
    <div className="min-h-screen" style={{ background: PALETTE.bg, color: PALETTE.ink, fontFamily: "'Inter', system-ui, sans-serif" }}>
      <Helmet>
        <title>Sofitel · Admin | Terraria Workshop</title>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@300;400;500;600&family=Inter:wght@300;400;500;600&display=swap" rel="stylesheet" />
      </Helmet>

      {checking ? (
        <div className="min-h-screen grid place-items-center">
          <Loader2 className="animate-spin" />
        </div>
      ) : !session ? (
        <AuthGate />
      ) : isAdmin === null ? (
        <div className="min-h-screen grid place-items-center"><Loader2 className="animate-spin" /></div>
      ) : !isAdmin ? (
        <NotAuthorized />
      ) : (
        <Console session={session} />
      )}
    </div>
  );
}

function AuthGate() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) toast.error(error.message);
  };

  return (
    <div className="min-h-screen grid place-items-center px-4">
      <form onSubmit={submit} className="w-full max-w-sm bg-white rounded-2xl p-8 shadow-sm" style={{ border: `1px solid ${PALETTE.line}` }}>
        <div className="text-center mb-6">
          <div className="text-xs tracking-[0.3em] uppercase" style={{ color: PALETTE.blueDeep }}>Sofitel · Admin</div>
          <h1 className="text-2xl mt-2" style={{ fontFamily: "'Cormorant Garamond', serif" }}>Terraria Console</h1>
        </div>
        <label className="block text-xs uppercase tracking-wide mb-1">Email</label>
        <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
          className="w-full px-3 py-2 rounded-lg mb-4 outline-none" style={{ border: `1px solid ${PALETTE.line}` }} />
        <label className="block text-xs uppercase tracking-wide mb-1">Password</label>
        <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)}
          className="w-full px-3 py-2 rounded-lg mb-6 outline-none" style={{ border: `1px solid ${PALETTE.line}` }} />
        <button disabled={loading} className="w-full py-2.5 rounded-lg text-white font-medium" style={{ background: PALETTE.blueDeep }}>
          {loading ? "Signing in..." : "Sign in"}
        </button>
      </form>
    </div>
  );
}

function NotAuthorized() {
  return (
    <div className="min-h-screen grid place-items-center px-4 text-center">
      <div>
        <div className="text-xs tracking-[0.3em] uppercase mb-2" style={{ color: PALETTE.blueDeep }}>Restricted</div>
        <h1 className="text-3xl mb-2" style={{ fontFamily: "'Cormorant Garamond', serif" }}>Admin access only</h1>
        <p className="opacity-70 mb-6 text-sm">This area is reserved for Terraria administrators.</p>
        <button onClick={() => supabase.auth.signOut()} className="px-4 py-2 rounded-lg text-sm" style={{ border: `1px solid ${PALETTE.line}` }}>
          Sign out
        </button>
      </div>
    </div>
  );
}

function Console({ session }: { session: any }) {
  const [tab, setTab] = useState<"experiences" | "bookings">("experiences");
  return (
    <div>
      <header className="sticky top-0 z-40 backdrop-blur" style={{ background: "rgba(251,250,246,0.85)", borderBottom: `1px solid ${PALETTE.line}` }}>
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <div>
            <div className="text-[10px] tracking-[0.3em] uppercase" style={{ color: PALETTE.blueDeep }}>Sofitel × Terraria</div>
            <div className="text-lg" style={{ fontFamily: "'Cormorant Garamond', serif" }}>Admin Console</div>
          </div>
          <div className="flex items-center gap-2">
            <span className="hidden sm:inline text-xs opacity-60">{session.user.email}</span>
            <button onClick={() => supabase.auth.signOut()} className="p-2 rounded-lg hover:bg-black/5" title="Sign out">
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
        <div className="max-w-6xl mx-auto px-4 flex gap-1">
          {(["experiences", "bookings"] as const).map((t) => (
            <button key={t} onClick={() => setTab(t)}
              className={cn("px-4 py-2 text-sm capitalize border-b-2 transition-colors",
                tab === t ? "" : "border-transparent opacity-60 hover:opacity-100")}
              style={tab === t ? { borderColor: PALETTE.blueDeep, color: PALETTE.blueDeep } : { borderColor: "transparent" }}>
              {t}
            </button>
          ))}
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-6">
        {tab === "experiences" ? <ExperiencesTab /> : <BookingsTab />}
      </main>
    </div>
  );
}

/* ==================== EXPERIENCES ==================== */

function ExperiencesTab() {
  const [items, setItems] = useState<Experience[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Experience | null>(null);
  const [creating, setCreating] = useState(false);

  const load = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("sofitel_experiences").select("*")
      .order("sort_order", { ascending: true })
      .order("scheduled_at", { ascending: true });
    if (error) toast.error(error.message);
    setItems((data || []) as Experience[]);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const remove = async (id: string) => {
    if (!confirm("Delete this experience? This cannot be undone.")) return;
    const { error } = await supabase.from("sofitel_experiences").delete().eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Deleted");
    load();
  };

  const toggleActive = async (exp: Experience) => {
    const { error } = await supabase.from("sofitel_experiences")
      .update({ is_active: !exp.is_active }).eq("id", exp.id);
    if (error) return toast.error(error.message);
    load();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-2xl" style={{ fontFamily: "'Cormorant Garamond', serif" }}>Experiences</h2>
          <p className="text-sm opacity-60">{items.length} total · {items.filter(i => i.is_active).length} active</p>
        </div>
        <button onClick={() => setCreating(true)}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm text-white"
          style={{ background: PALETTE.blueDeep }}>
          <Plus className="w-4 h-4" /> New experience
        </button>
      </div>

      {loading ? (
        <div className="py-20 text-center"><Loader2 className="animate-spin inline" /></div>
      ) : items.length === 0 ? (
        <div className="text-center py-20 rounded-2xl bg-white" style={{ border: `1px dashed ${PALETTE.line}` }}>
          <Sparkles className="w-6 h-6 mx-auto mb-2 opacity-40" />
          <p className="opacity-60 text-sm">No experiences yet. Create your first one.</p>
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((exp) => (
            <div key={exp.id} className="bg-white rounded-2xl overflow-hidden flex flex-col" style={{ border: `1px solid ${PALETTE.line}` }}>
              <div className="aspect-[4/3] bg-gray-100 relative">
                {exp.cover_image ? (
                  <img src={exp.cover_image} alt={exp.title} className="w-full h-full object-cover" />
                ) : (
                  <div className="grid place-items-center h-full opacity-40"><ImageIcon /></div>
                )}
                {!exp.is_active && (
                  <div className="absolute top-2 left-2 px-2 py-0.5 bg-black/70 text-white text-[10px] rounded">Hidden</div>
                )}
              </div>
              <div className="p-4 flex-1 flex flex-col">
                <div className="text-[10px] uppercase tracking-wider opacity-60">{exp.category}</div>
                <div className="font-medium mt-0.5">{exp.title}</div>
                <div className="text-xs opacity-60 mt-1 flex items-center gap-2 flex-wrap">
                  <span className="inline-flex items-center gap-1"><Calendar className="w-3 h-3" />{format(parseISO(exp.scheduled_at), "MMM d, HH:mm")}</span>
                  <span className="inline-flex items-center gap-1"><Users className="w-3 h-3" />{exp.capacity}</span>
                  <span className="inline-flex items-center gap-1"><Clock className="w-3 h-3" />{exp.duration_minutes}m</span>
                </div>
                <div className="text-sm mt-2 font-medium" style={{ color: PALETTE.blueDeep }}>
                  {exp.price_per_person} {exp.currency}
                </div>
                <div className="mt-auto pt-3 flex items-center gap-1">
                  <button onClick={() => setEditing(exp)} className="flex-1 inline-flex items-center justify-center gap-1 px-3 py-1.5 rounded-lg text-xs hover:bg-black/5" style={{ border: `1px solid ${PALETTE.line}` }}>
                    <Pencil className="w-3 h-3" /> Edit
                  </button>
                  <button onClick={() => toggleActive(exp)} className="p-2 rounded-lg hover:bg-black/5" title={exp.is_active ? "Hide" : "Show"} style={{ border: `1px solid ${PALETTE.line}` }}>
                    {exp.is_active ? <ToggleRight className="w-4 h-4" /> : <ToggleLeft className="w-4 h-4 opacity-40" />}
                  </button>
                  <button onClick={() => remove(exp.id)} className="p-2 rounded-lg hover:bg-red-50 text-red-600" style={{ border: `1px solid ${PALETTE.line}` }}>
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {(editing || creating) && (
        <ExperienceEditor
          experience={editing}
          onClose={() => { setEditing(null); setCreating(false); }}
          onSaved={() => { setEditing(null); setCreating(false); load(); }}
        />
      )}
    </div>
  );
}

function ExperienceEditor({ experience, onClose, onSaved }: { experience: Experience | null; onClose: () => void; onSaved: () => void }) {
  const isNew = !experience;
  const [form, setForm] = useState({
    title: experience?.title || "",
    slug: experience?.slug || "",
    subtitle: experience?.subtitle || "",
    description: experience?.description || "",
    cover_image: experience?.cover_image || "",
    category: experience?.category || "in-hotel",
    audience: experience?.audience || "all",
    difficulty: experience?.difficulty || "easy",
    capacity: experience?.capacity ?? 8,
    location: experience?.location || "",
    scheduled_at: experience?.scheduled_at
      ? format(parseISO(experience.scheduled_at), "yyyy-MM-dd'T'HH:mm")
      : format(new Date(Date.now() + 86400000), "yyyy-MM-dd'T'HH:mm"),
    duration_minutes: experience?.duration_minutes ?? 90,
    price_per_person: experience?.price_per_person ?? 0,
    currency: experience?.currency || "MAD",
    is_active: experience?.is_active ?? true,
    sort_order: experience?.sort_order ?? 0,
  });
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  const upload = async (file: File) => {
    setUploading(true);
    const path = `sofitel/${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.\-_]/g, "_")}`;
    const { error } = await supabase.storage.from("site-images").upload(path, file, { upsert: false });
    if (error) { toast.error(error.message); setUploading(false); return; }
    const { data } = supabase.storage.from("site-images").getPublicUrl(path);
    setForm((f) => ({ ...f, cover_image: data.publicUrl }));
    setUploading(false);
  };

  const save = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const payload = {
      ...form,
      slug: form.slug || slugify(form.title),
      scheduled_at: new Date(form.scheduled_at).toISOString(),
      capacity: Number(form.capacity),
      duration_minutes: Number(form.duration_minutes),
      price_per_person: Number(form.price_per_person),
      sort_order: Number(form.sort_order),
    };
    const { error } = isNew
      ? await supabase.from("sofitel_experiences").insert(payload as any)
      : await supabase.from("sofitel_experiences").update(payload as any).eq("id", experience!.id);
    setSaving(false);
    if (error) return toast.error(error.message);
    toast.success(isNew ? "Created" : "Saved");
    onSaved();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 grid place-items-center p-4 overflow-y-auto" onClick={onClose}>
      <form onClick={(e) => e.stopPropagation()} onSubmit={save}
        className="w-full max-w-2xl bg-white rounded-2xl p-6 my-6" style={{ border: `1px solid ${PALETTE.line}` }}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
            {isNew ? "New experience" : "Edit experience"}
          </h3>
          <button type="button" onClick={onClose} className="p-1 hover:bg-black/5 rounded"><X className="w-5 h-5" /></button>
        </div>

        <div className="grid sm:grid-cols-2 gap-3">
          <Field label="Title" className="sm:col-span-2">
            <input required value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value, slug: form.slug || slugify(e.target.value) })}
              className="input" style={{ border: `1px solid ${PALETTE.line}` }} />
          </Field>
          <Field label="Slug">
            <input value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })}
              className="input" style={{ border: `1px solid ${PALETTE.line}` }} />
          </Field>
          <Field label="Category">
            <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}
              className="input" style={{ border: `1px solid ${PALETTE.line}` }}>
              <option value="in-hotel">In-hotel</option>
              <option value="excursion">Excursion</option>
              <option value="private">Private</option>
              <option value="signature">Signature</option>
            </select>
          </Field>
          <Field label="Subtitle" className="sm:col-span-2">
            <input value={form.subtitle} onChange={(e) => setForm({ ...form, subtitle: e.target.value })}
              className="input" style={{ border: `1px solid ${PALETTE.line}` }} />
          </Field>
          <Field label="Description" className="sm:col-span-2">
            <textarea rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="input" style={{ border: `1px solid ${PALETTE.line}` }} />
          </Field>

          <Field label="Cover image" className="sm:col-span-2">
            <div className="flex items-start gap-3">
              <div className="w-24 h-24 rounded-lg overflow-hidden bg-gray-100 shrink-0">
                {form.cover_image
                  ? <img src={form.cover_image} className="w-full h-full object-cover" />
                  : <div className="grid place-items-center h-full opacity-40"><ImageIcon /></div>}
              </div>
              <div className="flex-1">
                <input value={form.cover_image} onChange={(e) => setForm({ ...form, cover_image: e.target.value })}
                  placeholder="Image URL" className="input mb-2" style={{ border: `1px solid ${PALETTE.line}` }} />
                <label className="inline-flex items-center gap-2 px-3 py-1.5 text-xs rounded-lg cursor-pointer hover:bg-black/5"
                  style={{ border: `1px solid ${PALETTE.line}` }}>
                  {uploading ? <Loader2 className="w-3 h-3 animate-spin" /> : <ImageIcon className="w-3 h-3" />}
                  Upload
                  <input type="file" accept="image/*" className="hidden"
                    onChange={(e) => e.target.files?.[0] && upload(e.target.files[0])} />
                </label>
              </div>
            </div>
          </Field>

          <Field label="Scheduled at">
            <input type="datetime-local" required value={form.scheduled_at}
              onChange={(e) => setForm({ ...form, scheduled_at: e.target.value })}
              className="input" style={{ border: `1px solid ${PALETTE.line}` }} />
          </Field>
          <Field label="Location">
            <input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })}
              className="input" style={{ border: `1px solid ${PALETTE.line}` }} />
          </Field>

          <Field label="Capacity">
            <input type="number" min={1} value={form.capacity} onChange={(e) => setForm({ ...form, capacity: Number(e.target.value) })}
              className="input" style={{ border: `1px solid ${PALETTE.line}` }} />
          </Field>
          <Field label="Duration (min)">
            <input type="number" min={15} step={15} value={form.duration_minutes} onChange={(e) => setForm({ ...form, duration_minutes: Number(e.target.value) })}
              className="input" style={{ border: `1px solid ${PALETTE.line}` }} />
          </Field>
          <Field label="Price / person">
            <input type="number" min={0} value={form.price_per_person} onChange={(e) => setForm({ ...form, price_per_person: Number(e.target.value) })}
              className="input" style={{ border: `1px solid ${PALETTE.line}` }} />
          </Field>
          <Field label="Currency">
            <select value={form.currency} onChange={(e) => setForm({ ...form, currency: e.target.value })}
              className="input" style={{ border: `1px solid ${PALETTE.line}` }}>
              <option>MAD</option><option>EUR</option><option>USD</option>
            </select>
          </Field>

          <Field label="Audience">
            <select value={form.audience} onChange={(e) => setForm({ ...form, audience: e.target.value })}
              className="input" style={{ border: `1px solid ${PALETTE.line}` }}>
              <option value="all">All</option>
              <option value="adults">Adults</option>
              <option value="kids">Kids</option>
              <option value="couples">Couples</option>
            </select>
          </Field>
          <Field label="Difficulty">
            <select value={form.difficulty} onChange={(e) => setForm({ ...form, difficulty: e.target.value })}
              className="input" style={{ border: `1px solid ${PALETTE.line}` }}>
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="advanced">Advanced</option>
            </select>
          </Field>

          <Field label="Sort order">
            <input type="number" value={form.sort_order} onChange={(e) => setForm({ ...form, sort_order: Number(e.target.value) })}
              className="input" style={{ border: `1px solid ${PALETTE.line}` }} />
          </Field>
          <Field label="Status">
            <button type="button" onClick={() => setForm({ ...form, is_active: !form.is_active })}
              className="input text-left flex items-center gap-2" style={{ border: `1px solid ${PALETTE.line}` }}>
              {form.is_active ? <ToggleRight className="w-4 h-4" /> : <ToggleLeft className="w-4 h-4 opacity-40" />}
              {form.is_active ? "Active" : "Hidden"}
            </button>
          </Field>
        </div>

        <div className="flex items-center justify-end gap-2 mt-6">
          <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg text-sm" style={{ border: `1px solid ${PALETTE.line}` }}>
            Cancel
          </button>
          <button disabled={saving} className="px-4 py-2 rounded-lg text-sm text-white inline-flex items-center gap-2" style={{ background: PALETTE.blueDeep }}>
            {saving && <Loader2 className="w-3 h-3 animate-spin" />}
            {isNew ? "Create" : "Save"}
          </button>
        </div>

        <style>{`.input{width:100%;padding:0.5rem 0.75rem;border-radius:0.5rem;outline:none;background:white;font-size:0.875rem;}`}</style>
      </form>
    </div>
  );
}

function Field({ label, children, className }: { label: string; children: React.ReactNode; className?: string }) {
  return (
    <label className={cn("block", className)}>
      <div className="text-[10px] uppercase tracking-wide opacity-60 mb-1">{label}</div>
      {children}
    </label>
  );
}

/* ==================== BOOKINGS ==================== */

function BookingsTab() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const load = async () => {
    setLoading(true);
    const [b, e] = await Promise.all([
      supabase.from("sofitel_bookings").select("*").order("created_at", { ascending: false }),
      supabase.from("sofitel_experiences").select("*"),
    ]);
    if (b.error) toast.error(b.error.message);
    setBookings((b.data || []) as Booking[]);
    setExperiences((e.data || []) as Experience[]);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const expMap = useMemo(() => Object.fromEntries(experiences.map((e) => [e.id, e])), [experiences]);

  const filtered = useMemo(() => {
    return bookings.filter((b) => {
      if (statusFilter !== "all" && b.status !== statusFilter) return false;
      if (!search) return true;
      const q = search.toLowerCase();
      return (
        b.guest_name.toLowerCase().includes(q) ||
        b.room_number.toLowerCase().includes(q) ||
        (b.guest_email || "").toLowerCase().includes(q) ||
        (expMap[b.experience_id]?.title || "").toLowerCase().includes(q)
      );
    });
  }, [bookings, search, statusFilter, expMap]);

  const setStatus = async (id: string, status: string) => {
    const { error } = await supabase.from("sofitel_bookings").update({ status }).eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Updated");
    load();
  };

  const remove = async (id: string) => {
    if (!confirm("Delete this booking?")) return;
    const { error } = await supabase.from("sofitel_bookings").delete().eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Deleted");
    load();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
        <div>
          <h2 className="text-2xl" style={{ fontFamily: "'Cormorant Garamond', serif" }}>Bookings</h2>
          <p className="text-sm opacity-60">{filtered.length} of {bookings.length}</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-2.5 top-1/2 -translate-y-1/2 opacity-50" />
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search guest, room, experience..."
              className="pl-8 pr-3 py-2 rounded-lg text-sm bg-white outline-none w-64" style={{ border: `1px solid ${PALETTE.line}` }} />
          </div>
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 rounded-lg text-sm bg-white outline-none" style={{ border: `1px solid ${PALETTE.line}` }}>
            <option value="all">All</option>
            <option value="pending">Pending</option>
            <option value="confirmed">Confirmed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="py-20 text-center"><Loader2 className="animate-spin inline" /></div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 rounded-2xl bg-white" style={{ border: `1px dashed ${PALETTE.line}` }}>
          <p className="opacity-60 text-sm">No bookings yet.</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl overflow-hidden" style={{ border: `1px solid ${PALETTE.line}` }}>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead style={{ background: PALETTE.sandSoft }}>
                <tr className="text-left text-[11px] uppercase tracking-wider">
                  <th className="px-4 py-3">Guest</th>
                  <th className="px-4 py-3">Experience</th>
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3">Pax</th>
                  <th className="px-4 py-3">Source</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((b) => {
                  const exp = expMap[b.experience_id];
                  return (
                    <tr key={b.id} className="border-t" style={{ borderColor: PALETTE.line }}>
                      <td className="px-4 py-3">
                        <div className="font-medium">{b.guest_name}</div>
                        <div className="text-xs opacity-60">Room {b.room_number}{b.guest_email ? ` · ${b.guest_email}` : ""}</div>
                      </td>
                      <td className="px-4 py-3">{exp?.title || <span className="opacity-40">—</span>}</td>
                      <td className="px-4 py-3">{exp ? format(parseISO(exp.scheduled_at), "MMM d, HH:mm") : "—"}</td>
                      <td className="px-4 py-3">{b.participants}</td>
                      <td className="px-4 py-3 text-xs opacity-70">{b.source}</td>
                      <td className="px-4 py-3">
                        <select value={b.status} onChange={(e) => setStatus(b.id, e.target.value)}
                          className="px-2 py-1 rounded text-xs bg-white" style={{ border: `1px solid ${PALETTE.line}` }}>
                          <option value="pending">Pending</option>
                          <option value="confirmed">Confirmed</option>
                          <option value="cancelled">Cancelled</option>
                        </select>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button onClick={() => remove(b.id)} className="p-1.5 rounded hover:bg-red-50 text-red-600">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
