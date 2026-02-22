import { useEffect, useState, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { LogOut, CalendarDays, ShoppingCart, RefreshCw, Clock, CheckCircle2, XCircle, Package, Calendar, Plus, Trash2, Tag, ToggleLeft, ToggleRight, ChevronLeft, ChevronRight, Upload, ImagePlus, X, LayoutList, GripVertical, Eye, EyeOff, Save, AlertTriangle } from "lucide-react";
import SEOHead from "@/components/SEOHead";
import { cn } from "@/lib/utils";
import { format, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, getDay } from "date-fns";

// ── Types ──────────────────────────────────────────────────────────────────
interface Booking {
  id: string; name: string; city: string | null; email: string | null;
  phone: string | null; workshop: string; session_info: string | null;
  participants: number | null; booking_date: string | null; notes: string | null;
  status: string; created_at: string;
}
interface Order {
  id: string; customer_name: string; customer_phone: string | null;
  customer_address: string | null; region: string | null;
  items: Array<{ name: string; quantity: number; price: number }>;
  subtotal: number; delivery_fee: number; grand_total: number; status: string; created_at: string;
}
interface Product {
  id: string; name: string; price: number; original_price: number | null;
  images: string[]; category: string; stock: number; is_sold_out: boolean;
  is_promotion: boolean; promotion_label: string | null; dimensions: string | null;
}
interface StoreSection {
  id: string;
  title_en: string; title_ar: string; title_es: string; title_fr: string;
  description_en: string; description_ar: string; description_es: string; description_fr: string;
  enabled: boolean; sort_order: number; donation: boolean;
}
interface Availability {
  id: string; date: string; workshop: string; is_available: boolean;
}

// ── Status helpers ─────────────────────────────────────────────────────────
const statusColors: Record<string, string> = {
  pending: "bg-amber-100 text-amber-800 border-amber-200",
  confirmed: "bg-emerald-100 text-emerald-800 border-emerald-200",
  cancelled: "bg-red-100 text-red-800 border-red-200",
  delivered: "bg-blue-100 text-blue-800 border-blue-200",
  packed: "bg-purple-100 text-purple-800 border-purple-200",
  retour: "bg-orange-100 text-orange-800 border-orange-200",
  done: "bg-teal-100 text-teal-800 border-teal-200",
};
const StatusBadge = ({ status }: { status: string }) => (
  <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium border ${statusColors[status] || statusColors.pending}`}>
    {status === "pending" && <Clock size={12} />}
    {(status === "confirmed" || status === "delivered" || status === "done") && <CheckCircle2 size={12} />}
    {status === "cancelled" && <XCircle size={12} />}
    {status === "packed" && <Package size={12} />}
    {status === "retour" && <AlertTriangle size={12} />}
    {status.charAt(0).toUpperCase() + status.slice(1)}
  </span>
);

// ── Main Component ─────────────────────────────────────────────────────────
const AdminDashboard = () => {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [storeSections, setStoreSections] = useState<StoreSection[]>([]);
  const [sectionDrafts, setSectionDrafts] = useState<Record<string, StoreSection>>({});
  const [savingSection, setSavingSection] = useState<string | null>(null);
  const [availability, setAvailability] = useState<Availability[]>([]);
  const [loading, setLoading] = useState(true);
  const [authed, setAuthed] = useState(false);

  // Confirm delete dialog (supports products, bookings, orders)
  const [confirmDelete, setConfirmDelete] = useState<{ id: string; name: string; table: "products" | "bookings" | "orders" } | null>(null);

  // Products edit state
  const [editingProduct, setEditingProduct] = useState<string | null>(null);
  const [productDraft, setProductDraft] = useState<Partial<Product>>({});

  // Add product form
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [newProduct, setNewProduct] = useState({
    id: "", name: "", price: 0, original_price: "", stock: 1,
    category: "terraria", dimensions: "", is_promotion: false,
    promotion_label: "", is_sold_out: false,
  });
  const [newProductImages, setNewProductImages] = useState<string[]>([]);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [savingNewProduct, setSavingNewProduct] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Availability calendar
  const [calMonth, setCalMonth] = useState(new Date());
  const [savingDate, setSavingDate] = useState<string | null>(null);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { navigate("/admin/login"); return; }
      const { data: roles } = await supabase.from("user_roles").select("role").eq("role", "admin").maybeSingle();
      if (!roles) { await supabase.auth.signOut(); navigate("/admin/login"); return; }
      setAuthed(true);
      fetchAll();
    };
    checkAuth();
  }, [navigate]);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    const [b, o, p, a, s] = await Promise.all([
      supabase.from("bookings").select("*").order("created_at", { ascending: false }),
      supabase.from("orders").select("*").order("created_at", { ascending: false }),
      supabase.from("products").select("*").order("category"),
      supabase.from("workshop_availability").select("*"),
      supabase.from("store_sections").select("*").order("sort_order"),
    ]);
    setBookings((b.data as Booking[]) || []);
    setOrders((o.data as Order[]) || []);
    setProducts((p.data || []).map((prod: any) => ({
      ...prod,
      images: Array.isArray(prod.images) ? prod.images : JSON.parse(prod.images || "[]"),
    })));
    setAvailability((a.data as Availability[]) || []);
    const secs = (s.data as StoreSection[]) || [];
    setStoreSections(secs);
    const drafts: Record<string, StoreSection> = {};
    secs.forEach((sec) => { drafts[sec.id] = { ...sec }; });
    setSectionDrafts(drafts);
    setLoading(false);
  }, []);

  const updateStatus = async (table: "bookings" | "orders", id: string, status: string) => {
    const { error } = await supabase.from(table).update({ status }).eq("id", id);
    if (!error) await fetchAll();
  };

  const handleLogout = async () => { await supabase.auth.signOut(); navigate("/admin/login"); };

  // ── Store Sections management ─────────────────────────────────────────
  const updateSectionDraft = (id: string, field: keyof StoreSection, value: any) => {
    setSectionDrafts((d) => ({ ...d, [id]: { ...d[id], [field]: value } }));
  };

  const saveSection = async (id: string) => {
    const draft = sectionDrafts[id];
    if (!draft) return;
    setSavingSection(id);
    await supabase.from("store_sections").update({
      title_en: draft.title_en, title_ar: draft.title_ar, title_es: draft.title_es, title_fr: draft.title_fr,
      description_en: draft.description_en, description_ar: draft.description_ar,
      description_es: draft.description_es, description_fr: draft.description_fr,
      enabled: draft.enabled, sort_order: draft.sort_order, donation: draft.donation,
    }).eq("id", id);
    setSavingSection(null);
    fetchAll();
  };

  // ── Products management ────────────────────────────────────────────────
  const startEdit = (p: Product) => { setEditingProduct(p.id); setProductDraft({ ...p }); };
  const cancelEdit = () => { setEditingProduct(null); setProductDraft({}); };

  const saveProduct = async (id: string) => {
    const { error } = await supabase.from("products").update({
      name: productDraft.name,
      price: productDraft.price,
      original_price: productDraft.original_price || null,
      stock: productDraft.stock,
      is_sold_out: productDraft.is_sold_out,
      is_promotion: productDraft.is_promotion,
      promotion_label: productDraft.promotion_label || null,
      dimensions: productDraft.dimensions || null,
      images: productDraft.images || [],
      category: productDraft.category,
    }).eq("id", id);
    if (!error) {
      setEditingProduct(null);
      await fetchAll();
    }
  };

  const toggleSoldOut = async (p: Product) => {
    const { error } = await supabase.from("products").update({ is_sold_out: !p.is_sold_out }).eq("id", p.id);
    if (!error) await fetchAll();
  };

  // Upload images for an existing product being edited
  const editFileInputRef = useRef<HTMLInputElement>(null);
  const [uploadingEditImage, setUploadingEditImage] = useState(false);

  const handleEditImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    setUploadingEditImage(true);
    const uploaded: string[] = [];
    for (const file of Array.from(files)) {
      const ext = file.name.split(".").pop();
      const fileName = `product-${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
      const { error } = await supabase.storage.from("product-images").upload(fileName, file, { upsert: true });
      if (!error) {
        const { data: urlData } = supabase.storage.from("product-images").getPublicUrl(fileName);
        uploaded.push(urlData.publicUrl);
      }
    }
    setProductDraft((d) => ({ ...d, images: [...(d.images || []), ...uploaded] }));
    setUploadingEditImage(false);
    if (editFileInputRef.current) editFileInputRef.current.value = "";
  };

  const removeEditImage = (idx: number) => {
    setProductDraft((d) => ({ ...d, images: (d.images || []).filter((_, i) => i !== idx) }));
  };

  // ── Add new product ────────────────────────────────────────────────────
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    setUploadingImage(true);
    const uploaded: string[] = [];
    for (const file of Array.from(files)) {
      const ext = file.name.split(".").pop();
      const fileName = `product-${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
      const { error } = await supabase.storage.from("product-images").upload(fileName, file, { upsert: true });
      if (!error) {
        const { data: urlData } = supabase.storage.from("product-images").getPublicUrl(fileName);
        uploaded.push(urlData.publicUrl);
      }
    }
    setNewProductImages((prev) => [...prev, ...uploaded]);
    setUploadingImage(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const saveNewProduct = async () => {
    if (!newProduct.id || !newProduct.name || newProductImages.length === 0) return;
    setSavingNewProduct(true);
    await supabase.from("products").insert({
      id: newProduct.id,
      name: newProduct.name,
      price: newProduct.price,
      original_price: newProduct.original_price ? Number(newProduct.original_price) : null,
      stock: newProduct.stock,
      category: newProduct.category,
      dimensions: newProduct.dimensions || null,
      is_promotion: newProduct.is_promotion,
      promotion_label: newProduct.promotion_label || null,
      is_sold_out: newProduct.is_sold_out,
      images: newProductImages,
    });
    setNewProduct({ id: "", name: "", price: 0, original_price: "", stock: 1, category: "terraria", dimensions: "", is_promotion: false, promotion_label: "", is_sold_out: false });
    setNewProductImages([]);
    setShowAddProduct(false);
    setSavingNewProduct(false);
    await fetchAll();
  };

  const confirmDeleteItem = (id: string, name: string, table: "products" | "bookings" | "orders") => {
    setConfirmDelete({ id, name, table });
  };

  const executeDelete = async () => {
    if (!confirmDelete) return;
    const { error } = await supabase.from(confirmDelete.table).delete().eq("id", confirmDelete.id);
    setConfirmDelete(null);
    if (!error) await fetchAll();
  };

  // ── Availability calendar ─────────────────────────────────────────────
  const toggleDateAvailability = async (dateStr: string) => {
    setSavingDate(dateStr);
    const existing = availability.find((a) => a.date === dateStr);
    if (existing) {
      await supabase.from("workshop_availability").update({ is_available: !existing.is_available }).eq("id", existing.id);
    } else {
      await supabase.from("workshop_availability").insert({ date: dateStr, workshop: "all", is_available: true });
    }
    const { data } = await supabase.from("workshop_availability").select("*");
    setAvailability((data as Availability[]) || []);
    setSavingDate(null);
  };

  const getDateStatus = (dateStr: string) => {
    const found = availability.find((a) => a.date === dateStr);
    if (!found) return "default";
    return found.is_available ? "available" : "blocked";
  };

  const renderCalendar = () => {
    const start = startOfMonth(calMonth);
    const end = endOfMonth(calMonth);
    const days = eachDayOfInterval({ start, end });
    const startPad = getDay(start); // 0=Sun
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return (
      <div>
        {/* Month nav */}
        <div className="flex items-center justify-between mb-4">
          <Button variant="outline" size="icon" className="rounded-xl" onClick={() => setCalMonth(subMonths(calMonth, 1))}>
            <ChevronLeft size={16} />
          </Button>
          <span className="font-bold text-foreground">{format(calMonth, "MMMM yyyy")}</span>
          <Button variant="outline" size="icon" className="rounded-xl" onClick={() => setCalMonth(addMonths(calMonth, 1))}>
            <ChevronRight size={16} />
          </Button>
        </div>
        {/* Day labels */}
        <div className="grid grid-cols-7 mb-2">
          {["Su","Mo","Tu","We","Th","Fr","Sa"].map((d) => (
            <div key={d} className="text-center text-xs font-semibold text-muted-foreground py-1">{d}</div>
          ))}
        </div>
        {/* Days grid */}
        <div className="grid grid-cols-7 gap-1">
          {[...Array(startPad)].map((_, i) => <div key={`pad-${i}`} />)}
          {days.map((day) => {
            const dateStr = format(day, "yyyy-MM-dd");
            const isPast = day < today;
            const status = getDateStatus(dateStr);
            const isSaving = savingDate === dateStr;

            return (
              <button
                key={dateStr}
                disabled={isPast || isSaving}
                onClick={() => toggleDateAvailability(dateStr)}
                className={cn(
                  "h-10 w-full rounded-xl text-sm font-medium transition-all border-2",
                  isPast && "opacity-30 cursor-default border-transparent",
                  !isPast && status === "default" && "border-border/40 text-foreground hover:border-cta/40 hover:bg-cta/5",
                  !isPast && status === "available" && "bg-emerald-100 border-emerald-300 text-emerald-800 hover:bg-emerald-200",
                  !isPast && status === "blocked" && "bg-red-100 border-red-300 text-red-800 hover:bg-red-200",
                  isSaving && "opacity-50 cursor-wait"
                )}
              >
                {day.getDate()}
              </button>
            );
          })}
        </div>
        {/* Legend */}
        <div className="flex items-center gap-4 mt-4 text-xs text-muted-foreground">
          <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded bg-emerald-200 border border-emerald-300" /> Available</div>
          <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded bg-red-200 border border-red-300" /> Blocked</div>
          <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded border-2 border-border/40" /> Default (weekends open)</div>
        </div>
      </div>
    );
  };

  if (!authed) return null;

  return (
    <main className="min-h-screen bg-background">
      <SEOHead title="Admin Dashboard" description="Manage bookings and orders" path="/admin" />

      {/* Header */}
      <header className="sticky top-0 z-50 bg-card/95 backdrop-blur-md border-b-2 border-border/40 px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-foreground">Terraria Admin</h1>
            <p className="text-xs text-muted-foreground">{bookings.length} bookings · {orders.length} orders · {products.length} products</p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm" onClick={fetchAll} disabled={loading} className="gap-2 rounded-xl">
              <RefreshCw size={14} className={loading ? "animate-spin" : ""} /> Refresh
            </Button>
            <Button variant="ghost" size="sm" onClick={handleLogout} className="gap-2 rounded-xl text-muted-foreground">
              <LogOut size={14} /> Logout
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: "Bookings", value: bookings.length, icon: CalendarDays, sub: `${bookings.filter(b => b.status === "pending").length} pending` },
            { label: "Orders", value: orders.length, icon: ShoppingCart, sub: `${orders.filter(o => o.status === "pending").length} pending` },
            { label: "Products", value: products.length, icon: Package, sub: `${products.filter(p => p.is_sold_out).length} sold out` },
            { label: "Available Dates", value: availability.filter(a => a.is_available).length, icon: Calendar, sub: `${availability.filter(a => !a.is_available).length} blocked` },
          ].map((s) => (
            <div key={s.label} className="p-5 rounded-3xl bg-card border-2 border-border/40">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-2xl bg-cta/10 border border-cta/20 flex items-center justify-center">
                  <s.icon size={18} className="text-cta" />
                </div>
                <span className="text-2xl font-bold text-foreground">{s.value}</span>
              </div>
              <p className="text-sm text-muted-foreground">{s.label}</p>
              <p className="text-xs text-muted-foreground/70 mt-0.5">{s.sub}</p>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <Tabs defaultValue="bookings">
          <TabsList className="mb-6 rounded-2xl bg-muted/50 p-1 flex-wrap gap-1 h-auto">
            <TabsTrigger value="bookings" className="rounded-xl gap-2 data-[state=active]:bg-card"><CalendarDays size={14} /> Bookings</TabsTrigger>
            <TabsTrigger value="orders" className="rounded-xl gap-2 data-[state=active]:bg-card"><ShoppingCart size={14} /> Orders</TabsTrigger>
            <TabsTrigger value="products" className="rounded-xl gap-2 data-[state=active]:bg-card"><Package size={14} /> Products</TabsTrigger>
            <TabsTrigger value="availability" className="rounded-xl gap-2 data-[state=active]:bg-card"><Calendar size={14} /> Availability</TabsTrigger>
            <TabsTrigger value="sections" className="rounded-xl gap-2 data-[state=active]:bg-card"><LayoutList size={14} /> Store Sections</TabsTrigger>
          </TabsList>

          {/* ── Bookings ── */}
          <TabsContent value="bookings">
            {bookings.length === 0 ? (
              <p className="text-center text-muted-foreground py-12">No bookings yet</p>
            ) : (
              <div className="space-y-4">
                {bookings.map((b) => (
                  <div key={b.id} className="p-5 rounded-3xl bg-card border-2 border-border/40 space-y-3">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h3 className="font-bold text-foreground">{b.name}</h3>
                        <p className="text-sm text-muted-foreground">{b.workshop} — {b.session_info || "Open Workshop"}</p>
                      </div>
                      <StatusBadge status={b.status} />
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
                      {b.city && <div><span className="text-muted-foreground">City:</span> {b.city}</div>}
                      {b.email && <div><span className="text-muted-foreground">Email:</span> {b.email}</div>}
                      {b.phone && <div><span className="text-muted-foreground">Phone:</span> {b.phone}</div>}
                      <div><span className="text-muted-foreground">Participants:</span> {b.participants}</div>
                      {b.booking_date && <div><span className="text-muted-foreground">Date:</span> {b.booking_date}</div>}
                      <div><span className="text-muted-foreground">Submitted:</span> {new Date(b.created_at).toLocaleDateString()}</div>
                    </div>
                    {b.notes && <p className="text-sm text-muted-foreground bg-muted/30 p-3 rounded-xl">{b.notes}</p>}
                    <div className="flex flex-wrap gap-2 pt-1">
                      {b.status !== "confirmed" && (
                        <Button size="sm" variant="outline" className="rounded-xl text-xs gap-1" onClick={() => updateStatus("bookings", b.id, "confirmed")}>
                          <CheckCircle2 size={12} /> Confirm
                        </Button>
                      )}
                      {b.status !== "cancelled" && (
                        <Button size="sm" variant="outline" className="rounded-xl text-xs gap-1 text-destructive" onClick={() => updateStatus("bookings", b.id, "cancelled")}>
                          <XCircle size={12} /> Cancel
                        </Button>
                      )}
                      <Button size="sm" variant="outline" className="rounded-xl text-xs gap-1 text-destructive" onClick={() => confirmDeleteItem(b.id, b.name, "bookings")}>
                        <Trash2 size={12} /> Delete
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          {/* ── Orders ── */}
          <TabsContent value="orders">
            {orders.length === 0 ? (
              <p className="text-center text-muted-foreground py-12">No orders yet</p>
            ) : (
              <div className="space-y-4">
                {orders.map((o) => (
                  <div key={o.id} className="p-5 rounded-3xl bg-card border-2 border-border/40 space-y-3">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h3 className="font-bold text-foreground">{o.customer_name}</h3>
                        <p className="text-sm text-muted-foreground">{o.region} — {o.grand_total} DH</p>
                      </div>
                      <StatusBadge status={o.status} />
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-sm">
                      {o.customer_phone && <div><span className="text-muted-foreground">Phone:</span> {o.customer_phone}</div>}
                      {o.customer_address && <div className="col-span-2"><span className="text-muted-foreground">Address:</span> {o.customer_address}</div>}
                      <div><span className="text-muted-foreground">Submitted:</span> {new Date(o.created_at).toLocaleDateString()}</div>
                    </div>
                    <div className="bg-muted/30 p-3 rounded-xl space-y-1">
                      {o.items.map((item, i) => (
                        <div key={i} className="flex justify-between text-sm">
                          <span>{item.name} × {item.quantity}</span>
                          <span className="font-medium">{item.price * item.quantity} DH</span>
                        </div>
                      ))}
                      <div className="border-t border-border/30 pt-1 mt-1 flex justify-between text-sm">
                        <span className="text-muted-foreground">Delivery</span><span>{o.delivery_fee} DH</span>
                      </div>
                      <div className="flex justify-between font-bold text-sm">
                        <span>Total</span><span className="text-cta">{o.grand_total} DH</span>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2 pt-1">
                      {o.status !== "confirmed" && o.status !== "packed" && o.status !== "delivered" && o.status !== "done" && (
                        <Button size="sm" variant="outline" className="rounded-xl text-xs gap-1" onClick={() => updateStatus("orders", o.id, "confirmed")}>
                          <CheckCircle2 size={12} /> Confirm
                        </Button>
                      )}
                      {(o.status === "confirmed") && (
                        <Button size="sm" variant="outline" className="rounded-xl text-xs gap-1" onClick={() => updateStatus("orders", o.id, "packed")}>
                          <Package size={12} /> Packed
                        </Button>
                      )}
                      {(o.status === "packed") && (
                        <Button size="sm" variant="outline" className="rounded-xl text-xs gap-1" onClick={() => updateStatus("orders", o.id, "delivered")}>
                          <CheckCircle2 size={12} /> Delivered
                        </Button>
                      )}
                      {(o.status === "delivered") && (
                        <Button size="sm" variant="outline" className="rounded-xl text-xs gap-1" onClick={() => updateStatus("orders", o.id, "done")}>
                          <CheckCircle2 size={12} /> Done
                        </Button>
                      )}
                      {o.status !== "cancelled" && o.status !== "done" && o.status !== "retour" && (
                        <Button size="sm" variant="outline" className="rounded-xl text-xs gap-1 text-orange-600" onClick={() => updateStatus("orders", o.id, "retour")}>
                          <AlertTriangle size={12} /> Retour
                        </Button>
                      )}
                      {o.status !== "cancelled" && o.status !== "done" && (
                        <Button size="sm" variant="outline" className="rounded-xl text-xs gap-1 text-destructive" onClick={() => updateStatus("orders", o.id, "cancelled")}>
                          <XCircle size={12} /> Cancel
                        </Button>
                      )}
                      <Button size="sm" variant="outline" className="rounded-xl text-xs gap-1 text-destructive" onClick={() => confirmDeleteItem(o.id, o.customer_name, "orders")}>
                        <Trash2 size={12} /> Delete
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          {/* ── Products ── */}
          <TabsContent value="products">
            {/* Add Product Button */}
            <div className="flex justify-end mb-4">
              <Button
                onClick={() => setShowAddProduct((v) => !v)}
                className="gap-2 rounded-xl bg-cta hover:bg-cta-hover text-primary-foreground"
              >
                {showAddProduct ? <X size={16} /> : <Plus size={16} />}
                {showAddProduct ? "Cancel" : "Add New Product"}
              </Button>
            </div>

            {/* Add Product Form */}
            {showAddProduct && (
              <div className="p-6 rounded-3xl bg-card border-2 border-cta/30 mb-6 space-y-4">
                <h3 className="font-bold text-foreground flex items-center gap-2"><ImagePlus size={18} className="text-cta" /> New Product</h3>

                {/* Image upload */}
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-2 block">Product Images *</label>
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-border/60 hover:border-cta/40 rounded-2xl p-6 text-center cursor-pointer transition-colors"
                  >
                    {uploadingImage ? (
                      <p className="text-sm text-muted-foreground">Uploading...</p>
                    ) : (
                      <>
                        <Upload size={24} className="mx-auto mb-2 text-muted-foreground" />
                        <p className="text-sm text-muted-foreground">Click to upload images (multiple allowed)</p>
                      </>
                    )}
                  </div>
                  <input ref={fileInputRef} type="file" accept="image/*" multiple className="hidden" onChange={handleImageUpload} />
                  {newProductImages.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-3">
                      {newProductImages.map((url, i) => (
                        <div key={i} className="relative w-16 h-16 rounded-xl overflow-hidden border border-border/40">
                          <img src={url} className="w-full h-full object-cover" alt="" />
                          <button
                            onClick={() => setNewProductImages((imgs) => imgs.filter((_, idx) => idx !== i))}
                            className="absolute top-0.5 right-0.5 w-4 h-4 bg-destructive text-destructive-foreground rounded-full flex items-center justify-center text-[10px]"
                          >×</button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="text-xs font-medium text-muted-foreground mb-1 block">Product ID * (unique, no spaces)</label>
                    <Input value={newProduct.id} onChange={(e) => setNewProduct(p => ({ ...p, id: e.target.value.replace(/\s/g, "-").toLowerCase() }))} className="rounded-xl h-9 text-sm" placeholder="e.g. rug-red-2025" />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-muted-foreground mb-1 block">Name *</label>
                    <Input value={newProduct.name} onChange={(e) => setNewProduct(p => ({ ...p, name: e.target.value }))} className="rounded-xl h-9 text-sm" placeholder="Product name" />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-muted-foreground mb-1 block">Category *</label>
                    <select
                      value={newProduct.category}
                      onChange={(e) => setNewProduct(p => ({ ...p, category: e.target.value }))}
                      className="w-full h-9 rounded-xl border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                    >
                      <option value="terraria">Terraria</option>
                      <option value="artisan">Artisan</option>
                      <option value="traveler">Traveler</option>
                      <option value="student">Student</option>
                      <option value="amazigh">Amazigh Rugs</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-muted-foreground mb-1 block">Price (DH) *</label>
                    <Input type="number" value={newProduct.price} onChange={(e) => setNewProduct(p => ({ ...p, price: Number(e.target.value) }))} className="rounded-xl h-9 text-sm" />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-muted-foreground mb-1 block">Original Price (for strikethrough)</label>
                    <Input type="number" value={newProduct.original_price} onChange={(e) => setNewProduct(p => ({ ...p, original_price: e.target.value }))} className="rounded-xl h-9 text-sm" placeholder="Leave empty if none" />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-muted-foreground mb-1 block">Stock (quantity)</label>
                    <Input type="number" value={newProduct.stock} onChange={(e) => setNewProduct(p => ({ ...p, stock: Number(e.target.value) }))} className="rounded-xl h-9 text-sm" />
                  </div>
                  <div className="col-span-2 sm:col-span-1">
                    <label className="text-xs font-medium text-muted-foreground mb-1 block">Dimensions (optional)</label>
                    <Input value={newProduct.dimensions} onChange={(e) => setNewProduct(p => ({ ...p, dimensions: e.target.value }))} className="rounded-xl h-9 text-sm" placeholder="e.g. 68cm × 138cm" />
                  </div>
                  <div className="flex items-center gap-3 pt-4">
                    <label className="text-xs font-medium text-muted-foreground">Promotion?</label>
                    <button onClick={() => setNewProduct(p => ({ ...p, is_promotion: !p.is_promotion }))} className={cn("w-10 h-6 rounded-full transition-colors relative flex-shrink-0", newProduct.is_promotion ? "bg-cta" : "bg-muted")}>
                      <div className={cn("absolute top-1 w-4 h-4 rounded-full bg-card transition-all shadow", newProduct.is_promotion ? "left-5" : "left-1")} />
                    </button>
                  </div>
                  {newProduct.is_promotion && (
                    <div>
                      <label className="text-xs font-medium text-muted-foreground mb-1 block">Promotion Label</label>
                      <Input value={newProduct.promotion_label} onChange={(e) => setNewProduct(p => ({ ...p, promotion_label: e.target.value }))} className="rounded-xl h-9 text-sm" placeholder="e.g. -20%, Special Offer" />
                    </div>
                  )}
                </div>

                <div className="flex justify-end">
                  <Button
                    onClick={saveNewProduct}
                    disabled={savingNewProduct || !newProduct.id || !newProduct.name || newProductImages.length === 0}
                    className="rounded-xl gap-2 bg-cta hover:bg-cta-hover text-primary-foreground"
                  >
                    <CheckCircle2 size={16} />
                    {savingNewProduct ? "Saving..." : "Add Product"}
                  </Button>
                </div>
              </div>
            )}

            {/* Existing Products */}
            <div className="space-y-4">
              {products.map((p) => (
                <div key={p.id} className="p-5 rounded-3xl bg-card border-2 border-border/40 space-y-4">
                  <div className="flex items-center justify-between gap-4 flex-wrap">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-2xl overflow-hidden border border-border/40 flex-shrink-0 bg-muted">
                        {p.images[0]?.startsWith("http") ? (
                          <img src={p.images[0]} alt={p.name} className="w-full h-full object-cover" />
                        ) : (
                          <img src={`/placeholder.svg`} alt={p.name} className="w-full h-full object-cover" />
                        )}
                      </div>
                      <div>
                        <h3 className="font-bold text-foreground">{p.name}</h3>
                        <p className="text-xs text-muted-foreground capitalize">{p.category}{p.dimensions ? ` · ${p.dimensions}` : ""}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
                      {p.is_sold_out && <span className="text-xs bg-destructive/10 text-destructive border border-destructive/20 px-2.5 py-0.5 rounded-full font-medium">Sold Out</span>}
                      {p.is_promotion && <span className="text-xs bg-amber-100 text-amber-700 border border-amber-200 px-2.5 py-0.5 rounded-full font-medium flex items-center gap-1"><Tag size={10}/> {p.promotion_label || "On Sale"}</span>}
                      <Button size="sm" variant="outline" className="rounded-xl text-xs" onClick={() => p.id === editingProduct ? cancelEdit() : startEdit(p)}>
                        {p.id === editingProduct ? "Cancel" : "Edit"}
                      </Button>
                      <Button size="sm" variant="outline" className={cn("rounded-xl text-xs gap-1", p.is_sold_out ? "text-emerald-600" : "text-destructive")} onClick={() => toggleSoldOut(p)}>
                        {p.is_sold_out ? <><ToggleRight size={12}/> Mark Available</> : <><ToggleLeft size={12}/> Mark Sold Out</>}
                      </Button>
                      <Button size="sm" variant="outline" className="rounded-xl text-xs gap-1 text-destructive" onClick={() => confirmDeleteItem(p.id, p.name, "products")}>
                        <Trash2 size={12}/> Delete
                      </Button>
                    </div>
                  </div>

                  {editingProduct === p.id && (
                    <div className="border-t border-border/30 pt-4 space-y-4">
                      {/* Image management */}
                      <div>
                        <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2 block">Product Images</label>
                        <div className="flex flex-wrap gap-2 mb-3">
                          {(productDraft.images || []).map((url, idx) => (
                            <div key={idx} className="relative w-20 h-20 rounded-xl overflow-hidden border-2 border-border/40 group">
                              <img src={url} alt="" className="w-full h-full object-cover" />
                              <button
                                onClick={() => removeEditImage(idx)}
                                className="absolute inset-0 bg-destructive/70 text-destructive-foreground opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-xs font-bold"
                              >
                                ✕ Remove
                              </button>
                            </div>
                          ))}
                          <button
                            onClick={() => editFileInputRef.current?.click()}
                            disabled={uploadingEditImage}
                            className="w-20 h-20 rounded-xl border-2 border-dashed border-border/60 hover:border-cta/40 flex flex-col items-center justify-center gap-1 text-muted-foreground hover:text-cta transition-colors text-xs"
                          >
                            {uploadingEditImage ? <RefreshCw size={16} className="animate-spin" /> : <Upload size={16} />}
                            {uploadingEditImage ? "..." : "Add"}
                          </button>
                          <input ref={editFileInputRef} type="file" accept="image/*" multiple className="hidden" onChange={handleEditImageUpload} />
                        </div>
                      </div>

                      {/* Fields grid */}
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                        <div className="col-span-2 sm:col-span-3">
                          <label className="text-xs font-medium text-muted-foreground mb-1 block">Product Name</label>
                          <Input value={productDraft.name ?? ""} onChange={(e) => setProductDraft(d => ({ ...d, name: e.target.value }))} className="rounded-xl h-9 text-sm" placeholder="Product name" />
                        </div>
                        <div>
                          <label className="text-xs font-medium text-muted-foreground mb-1 block">Price (DH)</label>
                          <Input type="number" value={productDraft.price ?? ""} onChange={(e) => setProductDraft(d => ({ ...d, price: Number(e.target.value) }))} className="rounded-xl h-9 text-sm" />
                        </div>
                        <div>
                          <label className="text-xs font-medium text-muted-foreground mb-1 block">Original Price (strikethrough)</label>
                          <Input type="number" value={productDraft.original_price ?? ""} onChange={(e) => setProductDraft(d => ({ ...d, original_price: e.target.value ? Number(e.target.value) : null }))} className="rounded-xl h-9 text-sm" placeholder="Empty = none" />
                        </div>
                        <div>
                          <label className="text-xs font-medium text-muted-foreground mb-1 block">Stock</label>
                          <Input type="number" value={productDraft.stock ?? ""} onChange={(e) => setProductDraft(d => ({ ...d, stock: Number(e.target.value) }))} className="rounded-xl h-9 text-sm" />
                        </div>
                        <div className="col-span-2 sm:col-span-1">
                          <label className="text-xs font-medium text-muted-foreground mb-1 block">Dimensions</label>
                          <Input value={productDraft.dimensions ?? ""} onChange={(e) => setProductDraft(d => ({ ...d, dimensions: e.target.value }))} className="rounded-xl h-9 text-sm" placeholder="e.g. 68cm × 138cm" />
                        </div>
                        <div className="col-span-2 sm:col-span-1">
                          <label className="text-xs font-medium text-muted-foreground mb-1 block">Section</label>
                          <select
                            value={productDraft.category ?? ""}
                            onChange={(e) => setProductDraft(d => ({ ...d, category: e.target.value }))}
                            className="flex h-9 w-full rounded-xl border border-input bg-background px-3 py-1 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                          >
                            {storeSections.map(s => (
                              <option key={s.id} value={s.id}>{s.title_en}</option>
                            ))}
                          </select>
                        </div>
                        <div className="flex items-center gap-3 pt-4">
                          <label className="text-xs font-medium text-muted-foreground">Promotion?</label>
                          <button onClick={() => setProductDraft(d => ({ ...d, is_promotion: !d.is_promotion }))} className={cn("w-10 h-6 rounded-full transition-colors relative", productDraft.is_promotion ? "bg-cta" : "bg-muted")}>
                            <div className={cn("absolute top-1 w-4 h-4 rounded-full bg-card transition-all shadow", productDraft.is_promotion ? "left-5" : "left-1")} />
                          </button>
                        </div>
                        {productDraft.is_promotion && (
                          <div>
                            <label className="text-xs font-medium text-muted-foreground mb-1 block">Promotion Label</label>
                            <Input value={productDraft.promotion_label ?? ""} onChange={(e) => setProductDraft(d => ({ ...d, promotion_label: e.target.value }))} className="rounded-xl h-9 text-sm" placeholder="e.g. -20%, Special Offer" />
                          </div>
                        )}
                        <div className="col-span-full flex justify-end">
                          <Button size="sm" className="rounded-xl gap-2 bg-cta hover:bg-cta-hover text-primary-foreground" onClick={() => saveProduct(p.id)}>
                            <CheckCircle2 size={14} /> Save Changes
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Quick info row */}
                  {editingProduct !== p.id && (
                    <div className="flex gap-6 text-sm text-muted-foreground">
                      <span>Price: <strong className="text-foreground">{p.price} DH</strong></span>
                      {p.original_price && <span>Was: <strong className="line-through text-foreground/60">{p.original_price} DH</strong></span>}
                      <span>Stock: <strong className="text-foreground">{p.stock}</strong></span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </TabsContent>

          {/* ── Availability ── */}
          <TabsContent value="availability">
            <div className="grid md:grid-cols-2 gap-6">
              <div className="p-6 rounded-3xl bg-card border-2 border-border/40">
                <h3 className="font-bold text-foreground mb-2">Workshop Available Dates</h3>
                <p className="text-sm text-muted-foreground mb-6">Click a date to toggle it as available or blocked. Available dates will appear as options in the booking form. Default (grey) days follow the standard logic (weekends for small groups).</p>
                {renderCalendar()}
              </div>
              <div className="p-6 rounded-3xl bg-card border-2 border-border/40">
                <h3 className="font-bold text-foreground mb-4">Upcoming Available Dates</h3>
                {availability.filter(a => a.is_available && a.date >= format(new Date(), "yyyy-MM-dd")).sort((x,y) => x.date.localeCompare(y.date)).slice(0, 15).length === 0 ? (
                  <p className="text-sm text-muted-foreground">No specific dates marked yet. Click dates in the calendar to open them.</p>
                ) : (
                  <div className="space-y-2">
                    {availability
                      .filter(a => a.is_available && a.date >= format(new Date(), "yyyy-MM-dd"))
                      .sort((x,y) => x.date.localeCompare(y.date))
                      .slice(0, 15)
                      .map((a) => (
                        <div key={a.id} className="flex items-center justify-between p-3 rounded-xl bg-emerald-50 border border-emerald-200">
                          <span className="text-sm font-medium text-emerald-800">{format(new Date(a.date + "T00:00:00"), "EEEE, MMM d yyyy")}</span>
                          <button onClick={() => toggleDateAvailability(a.date)} className="text-xs text-red-500 hover:text-red-700">
                            <Trash2 size={14} />
                          </button>
                        </div>
                      ))
                    }
                  </div>
                )}

                <div className="mt-6 pt-4 border-t border-border/30">
                  <h4 className="font-semibold text-foreground mb-3 text-sm">Blocked Dates</h4>
                  {availability.filter(a => !a.is_available && a.date >= format(new Date(), "yyyy-MM-dd")).length === 0 ? (
                    <p className="text-xs text-muted-foreground">No blocked dates.</p>
                  ) : (
                    <div className="space-y-2">
                      {availability
                        .filter(a => !a.is_available && a.date >= format(new Date(), "yyyy-MM-dd"))
                        .sort((x,y) => x.date.localeCompare(y.date))
                        .map((a) => (
                          <div key={a.id} className="flex items-center justify-between p-3 rounded-xl bg-red-50 border border-red-200">
                            <span className="text-sm font-medium text-red-800">{format(new Date(a.date + "T00:00:00"), "EEEE, MMM d yyyy")}</span>
                            <button onClick={() => toggleDateAvailability(a.date)} className="text-xs text-emerald-600 hover:text-emerald-800 text-xs">unblock</button>
                          </div>
                        ))
                      }
                    </div>
                  )}
                </div>
              </div>
            </div>
          </TabsContent>

          {/* ── Store Sections ── */}
          <TabsContent value="sections">
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground mb-2">
                Edit store section titles, descriptions, visibility, and order. Changes go live immediately after saving.
              </p>
              {storeSections.map((sec) => {
                const draft = sectionDrafts[sec.id] || sec;
                const isSaving = savingSection === sec.id;
                return (
                  <div key={sec.id} className={cn("p-5 rounded-3xl bg-card border-2 transition-all", draft.enabled ? "border-border/40" : "border-border/20 opacity-60")}>
                    <div className="flex items-center justify-between mb-4 gap-3 flex-wrap">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-cta/10 border border-cta/20 flex items-center justify-center">
                          <GripVertical size={16} className="text-cta" />
                        </div>
                        <div>
                          <span className="font-bold text-foreground capitalize">{sec.id}</span>
                          <p className="text-xs text-muted-foreground">Category key: <code className="bg-muted px-1 rounded">{sec.id}</code></p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {/* Sort order */}
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs text-muted-foreground">Order:</span>
                          <Input
                            type="number"
                            value={draft.sort_order}
                            onChange={(e) => updateSectionDraft(sec.id, "sort_order", Number(e.target.value))}
                            className="rounded-xl h-8 w-16 text-sm text-center"
                          />
                        </div>
                        {/* Donation toggle */}
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs text-muted-foreground">Donation</span>
                          <button
                            onClick={() => updateSectionDraft(sec.id, "donation", !draft.donation)}
                            className={cn("w-9 h-5 rounded-full transition-colors relative flex-shrink-0", draft.donation ? "bg-amber-400" : "bg-muted")}
                          >
                            <div className={cn("absolute top-0.5 w-4 h-4 rounded-full bg-card transition-all shadow", draft.donation ? "left-4" : "left-0.5")} />
                          </button>
                        </div>
                        {/* Enabled toggle */}
                        <button
                          onClick={() => updateSectionDraft(sec.id, "enabled", !draft.enabled)}
                          className={cn("flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-xl border-2 transition-all",
                            draft.enabled
                              ? "border-emerald-300 bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                              : "border-border/40 bg-muted text-muted-foreground hover:bg-muted/80"
                          )}
                        >
                          {draft.enabled ? <Eye size={12} /> : <EyeOff size={12} />}
                          {draft.enabled ? "Visible" : "Hidden"}
                        </button>
                        <Button
                          size="sm"
                          disabled={isSaving}
                          onClick={() => saveSection(sec.id)}
                          className="rounded-xl gap-1.5 bg-cta hover:bg-cta-hover text-primary-foreground text-xs"
                        >
                          <Save size={12} />
                          {isSaving ? "Saving..." : "Save"}
                        </Button>
                      </div>
                    </div>

                    {/* Titles */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
                      {(["en", "ar", "es", "fr"] as const).map((lang) => (
                        <div key={lang}>
                          <label className="text-xs font-medium text-muted-foreground mb-1 block uppercase tracking-wide">
                            Title ({lang.toUpperCase()})
                          </label>
                          <Input
                            value={(draft as any)[`title_${lang}`] ?? ""}
                            onChange={(e) => updateSectionDraft(sec.id, `title_${lang}` as keyof StoreSection, e.target.value)}
                            className="rounded-xl h-9 text-sm"
                            dir={lang === "ar" ? "rtl" : "ltr"}
                          />
                        </div>
                      ))}
                    </div>

                    {/* Descriptions */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {(["en", "ar", "es", "fr"] as const).map((lang) => (
                        <div key={lang}>
                          <label className="text-xs font-medium text-muted-foreground mb-1 block uppercase tracking-wide">
                            Description ({lang.toUpperCase()})
                          </label>
                          <textarea
                            value={(draft as any)[`description_${lang}`] ?? ""}
                            onChange={(e) => updateSectionDraft(sec.id, `description_${lang}` as keyof StoreSection, e.target.value)}
                            className="w-full rounded-xl border border-input bg-background px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-ring"
                            rows={2}
                            dir={lang === "ar" ? "rtl" : "ltr"}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* ── Delete Confirmation Dialog ── */}
      {confirmDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-card border-2 border-destructive/30 rounded-3xl p-6 max-w-sm w-full mx-4 shadow-2xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-2xl bg-destructive/10 border border-destructive/20 flex items-center justify-center flex-shrink-0">
                <AlertTriangle size={22} className="text-destructive" />
              </div>
              <div>
                <h3 className="font-bold text-foreground">Delete {confirmDelete.table === "products" ? "Product" : confirmDelete.table === "bookings" ? "Booking" : "Order"}?</h3>
                <p className="text-sm text-muted-foreground">This action cannot be undone.</p>
              </div>
            </div>
            <p className="text-sm text-foreground mb-6 bg-muted/40 px-4 py-3 rounded-xl">
              Are you sure you want to delete <strong>"{confirmDelete.name}"</strong>?
            </p>
            <div className="flex gap-3">
              <Button
                variant="outline"
                className="flex-1 rounded-xl"
                onClick={() => setConfirmDelete(null)}
              >
                Cancel
              </Button>
              <Button
                className="flex-1 rounded-xl bg-destructive hover:bg-destructive/90 text-destructive-foreground gap-2"
                onClick={executeDelete}
              >
                <Trash2 size={14} /> Yes, Delete
              </Button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
};

export default AdminDashboard;
