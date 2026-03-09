import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Plus, Pencil, Trash2, Eye, EyeOff, FileText } from "lucide-react";
import { toast } from "sonner";

interface BlogPostRow {
  id: string;
  slug: string;
  title_en: string;
  title_ar: string;
  title_es: string;
  title_fr: string;
  excerpt_en: string;
  excerpt_ar: string;
  excerpt_es: string;
  excerpt_fr: string;
  content_en: string;
  content_ar: string;
  content_es: string;
  content_fr: string;
  cover_image: string;
  category: string;
  published_at: string;
  read_time: number;
  is_published: boolean;
  created_at: string;
}

const emptyPost: Omit<BlogPostRow, "id" | "created_at"> = {
  slug: "",
  title_en: "", title_ar: "", title_es: "", title_fr: "",
  excerpt_en: "", excerpt_ar: "", excerpt_es: "", excerpt_fr: "",
  content_en: "", content_ar: "", content_es: "", content_fr: "",
  cover_image: "",
  category: "pottery",
  published_at: new Date().toISOString().split("T")[0],
  read_time: 5,
  is_published: false,
};

export function BlogSection() {
  const [posts, setPosts] = useState<BlogPostRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<BlogPostRow | null>(null);
  const [form, setForm] = useState(emptyPost);
  const [saving, setSaving] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const fetchPosts = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("blog_posts")
      .select("*")
      .order("published_at", { ascending: false });
    setPosts((data as BlogPostRow[]) || []);
    setLoading(false);
  };

  useEffect(() => { fetchPosts(); }, []);

  const openNew = () => {
    setEditing(null);
    setForm(emptyPost);
    setDialogOpen(true);
  };

  const openEdit = (post: BlogPostRow) => {
    setEditing(post);
    const { id, created_at, ...rest } = post;
    setForm(rest);
    setDialogOpen(true);
  };

  const generateSlug = (title: string) =>
    title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

  const handleSave = async () => {
    if (!form.slug.trim() || !form.title_en.trim()) {
      toast.error("Slug and English title are required");
      return;
    }
    setSaving(true);
    if (editing) {
      const { error } = await supabase
        .from("blog_posts")
        .update(form)
        .eq("id", editing.id);
      if (error) toast.error(error.message);
      else toast.success("Post updated");
    } else {
      const { error } = await supabase
        .from("blog_posts")
        .insert(form);
      if (error) toast.error(error.message);
      else toast.success("Post created");
    }
    setSaving(false);
    setDialogOpen(false);
    fetchPosts();
  };

  const handleDelete = async (id: string) => {
    if (deleteConfirm !== id) {
      setDeleteConfirm(id);
      return;
    }
    const { error } = await supabase.from("blog_posts").delete().eq("id", id);
    if (error) toast.error(error.message);
    else { toast.success("Post deleted"); fetchPosts(); }
    setDeleteConfirm(null);
  };

  const togglePublish = async (post: BlogPostRow) => {
    await supabase.from("blog_posts").update({ is_published: !post.is_published }).eq("id", post.id);
    fetchPosts();
  };

  const updateField = (key: string, value: string | number | boolean) => {
    setForm((f) => ({ ...f, [key]: value }));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold">Blog Posts</h2>
          <p className="text-sm text-muted-foreground">{posts.length} posts total</p>
        </div>
        <Button onClick={openNew} className="gap-2 bg-[hsl(24,90%,50%)] hover:bg-[hsl(24,90%,45%)]">
          <Plus size={16} /> New Post
        </Button>
      </div>

      {loading ? (
        <p className="text-muted-foreground text-sm">Loading...</p>
      ) : posts.length === 0 ? (
        <Card><CardContent className="py-12 text-center text-muted-foreground">
          <FileText className="mx-auto mb-3 h-10 w-10 opacity-40" />
          No blog posts yet. Create your first one!
        </CardContent></Card>
      ) : (
        <div className="grid gap-4">
          {posts.map((post) => (
            <Card key={post.id} className="border-border/50">
              <CardContent className="flex items-center gap-4 p-4">
                {post.cover_image && (
                  <img src={post.cover_image} alt="" className="w-20 h-14 object-cover rounded-lg shrink-0" />
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold truncate">{post.title_en || "Untitled"}</h3>
                    <Badge variant={post.is_published ? "default" : "secondary"} className="text-[10px] shrink-0">
                      {post.is_published ? "Published" : "Draft"}
                    </Badge>
                    <Badge variant="outline" className="text-[10px] shrink-0 capitalize">{post.category}</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground truncate">{post.excerpt_en}</p>
                  <p className="text-[10px] text-muted-foreground mt-1">/{post.slug} · {post.read_time} min · {post.published_at}</p>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => togglePublish(post)} title={post.is_published ? "Unpublish" : "Publish"}>
                    {post.is_published ? <Eye size={14} /> : <EyeOff size={14} />}
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(post)}>
                    <Pencil size={14} />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className={`h-8 w-8 ${deleteConfirm === post.id ? "text-destructive" : ""}`}
                    onClick={() => handleDelete(post.id)}
                  >
                    <Trash2 size={14} />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Editor Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editing ? "Edit Post" : "New Post"}</DialogTitle>
          </DialogHeader>

          <div className="space-y-6">
            {/* Meta */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label>Slug</Label>
                <Input
                  value={form.slug}
                  onChange={(e) => updateField("slug", e.target.value)}
                  placeholder="my-blog-post"
                />
                {!editing && form.title_en && !form.slug && (
                  <Button variant="link" size="sm" className="text-xs p-0 h-auto" onClick={() => updateField("slug", generateSlug(form.title_en))}>
                    Generate from title
                  </Button>
                )}
              </div>
              <div>
                <Label>Category</Label>
                <Select value={form.category} onValueChange={(v) => updateField("category", v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pottery">Pottery</SelectItem>
                    <SelectItem value="tetouan">Tetouan</SelectItem>
                    <SelectItem value="culture">Culture</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Cover Image URL</Label>
                <Input value={form.cover_image} onChange={(e) => updateField("cover_image", e.target.value)} placeholder="/images/impact-1.jpg" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label>Published Date</Label>
                <Input type="date" value={form.published_at} onChange={(e) => updateField("published_at", e.target.value)} />
              </div>
              <div>
                <Label>Read Time (min)</Label>
                <Input type="number" min={1} value={form.read_time} onChange={(e) => updateField("read_time", parseInt(e.target.value) || 5)} />
              </div>
              <div className="flex items-end gap-2 pb-1">
                <Switch checked={form.is_published} onCheckedChange={(v) => updateField("is_published", v)} />
                <Label>Published</Label>
              </div>
            </div>

            {/* Multilingual content */}
            <Tabs defaultValue="en">
              <TabsList>
                <TabsTrigger value="en">EN</TabsTrigger>
                <TabsTrigger value="ar">AR</TabsTrigger>
                <TabsTrigger value="es">ES</TabsTrigger>
                <TabsTrigger value="fr">FR</TabsTrigger>
              </TabsList>
              {["en", "ar", "es", "fr"].map((lang) => (
                <TabsContent key={lang} value={lang} className="space-y-4">
                  <div>
                    <Label>Title ({lang.toUpperCase()})</Label>
                    <Input
                      value={(form as any)[`title_${lang}`]}
                      onChange={(e) => updateField(`title_${lang}`, e.target.value)}
                      dir={lang === "ar" ? "rtl" : "ltr"}
                    />
                  </div>
                  <div>
                    <Label>Excerpt ({lang.toUpperCase()})</Label>
                    <Textarea
                      value={(form as any)[`excerpt_${lang}`]}
                      onChange={(e) => updateField(`excerpt_${lang}`, e.target.value)}
                      rows={2}
                      dir={lang === "ar" ? "rtl" : "ltr"}
                    />
                  </div>
                  <div>
                    <Label>Content ({lang.toUpperCase()}) — Markdown supported</Label>
                    <Textarea
                      value={(form as any)[`content_${lang}`]}
                      onChange={(e) => updateField(`content_${lang}`, e.target.value)}
                      rows={12}
                      className="font-mono text-sm"
                      dir={lang === "ar" ? "rtl" : "ltr"}
                    />
                  </div>
                </TabsContent>
              ))}
            </Tabs>

            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
              <Button onClick={handleSave} disabled={saving} className="bg-[hsl(24,90%,50%)] hover:bg-[hsl(24,90%,45%)]">
                {saving ? "Saving..." : editing ? "Update" : "Create"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
