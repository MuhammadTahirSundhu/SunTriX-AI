import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { apiRequest, ENDPOINTS } from "@/lib/api";
import { toast } from "@/hooks/use-toast";
import { Plus, Pencil, Trash2, Eye, EyeOff, X, Save, GripVertical, ArrowUp, ArrowDown, Monitor } from "lucide-react";
import LivePreview from "@/components/admin/LivePreview";
import type { DepartmentPreviewData } from "@/components/admin/LivePreview";

interface Department {
  _id: string;
  name: string;
  subtitle: string;
  description: string;
  image: string;
  href: string;
  capabilities: string[];
  order: number;
  enabled: boolean;
}

type EditState = Omit<Department, "_id"> & { _id?: string };

const EMPTY_DEPT: EditState = {
  name: "", subtitle: "", description: "", image: "",
  href: "/services/agentic-ai", capabilities: [], order: 1, enabled: true,
};

const AdminDepartments = () => {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [editing, setEditing] = useState<EditState | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  const reload = async () => {
    const { data } = await apiRequest<Department[]>(ENDPOINTS.DEPARTMENTS_LIST + "?all=true");
    if (data) setDepartments(data);
  };

  useEffect(() => { reload(); }, []);

  const handleNew = () => {
    setIsNew(true);
    setEditing({ ...EMPTY_DEPT, order: departments.length + 1 });
  };

  const handleSave = async () => {
    if (!editing) return;
    if (!editing.name) { toast({ title: "Name required" }); return; }
    setSaving(true);
    if (isNew) {
      const { error } = await apiRequest(ENDPOINTS.DEPARTMENTS_CREATE, { method: "POST", body: editing });
      if (error) toast({ title: "Error", description: error });
      else toast({ title: "Department created ✅" });
    } else if (editing._id) {
      const { error } = await apiRequest(ENDPOINTS.DEPARTMENTS_UPDATE(editing._id), { method: "PUT", body: editing });
      if (error) toast({ title: "Error", description: error });
      else toast({ title: "Department updated ✅" });
    }
    setSaving(false);
    setEditing(null);
    setIsNew(false);
    reload();
  };

  const handleDelete = async (id: string) => {
    await apiRequest(ENDPOINTS.DEPARTMENTS_DELETE(id), { method: "DELETE" });
    toast({ title: "Department deleted" });
    reload();
  };

  const toggleEnabled = async (dept: Department) => {
    await apiRequest(ENDPOINTS.DEPARTMENTS_UPDATE(dept._id), { method: "PUT", body: { enabled: !dept.enabled } });
    reload();
  };

  const moveOrder = async (dept: Department, dir: -1 | 1) => {
    await apiRequest(ENDPOINTS.DEPARTMENTS_UPDATE(dept._id), { method: "PUT", body: { order: dept.order + dir } });
    reload();
  };

  const inp = "w-full rounded-lg border border-border bg-muted/50 px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary";

  return (
    <div className="p-6 lg:p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">Departments</h1>
          <p className="text-sm text-muted-foreground">Manage website departments/services sections</p>
        </div>
        <button onClick={handleNew} className="gradient-bg inline-flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold text-primary-foreground hover:opacity-90 transition-opacity">
          <Plus className="h-4 w-4" /> Add Department
        </button>
      </div>

      <div className="space-y-3">
        {[...departments].sort((a, b) => a.order - b.order).map((dept) => (
          <motion.div
            key={dept._id}
            layout
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center gap-4 rounded-xl border border-border bg-card p-4"
          >
            <GripVertical className="h-4 w-4 text-muted-foreground/40 shrink-0" />

            <div className="h-12 w-16 rounded-lg bg-muted overflow-hidden shrink-0">
              {dept.image && <img src={dept.image} alt={dept.name} className="w-full h-full object-cover" />}
            </div>

            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-foreground truncate">{dept.name}</p>
              <p className="text-xs text-muted-foreground truncate">{dept.subtitle} — {dept.href}</p>
            </div>

            <span className={`text-xs rounded-full px-2 py-0.5 font-medium ${
              dept.enabled ? "bg-success/20 text-success" : "bg-muted text-muted-foreground"
            }`}>
              {dept.enabled ? "Active" : "Hidden"}
            </span>

            <div className="flex items-center gap-1">
              <button onClick={() => moveOrder(dept, -1)} className="p-1.5 rounded-lg text-muted-foreground hover:bg-muted transition-colors"><ArrowUp className="h-3.5 w-3.5" /></button>
              <button onClick={() => moveOrder(dept, 1)} className="p-1.5 rounded-lg text-muted-foreground hover:bg-muted transition-colors"><ArrowDown className="h-3.5 w-3.5" /></button>
              <button onClick={() => toggleEnabled(dept)} className="p-1.5 rounded-lg text-muted-foreground hover:bg-muted transition-colors">
                {dept.enabled ? <Eye className="h-3.5 w-3.5 text-success" /> : <EyeOff className="h-3.5 w-3.5" />}
              </button>
              <button onClick={() => { setEditing(dept); setIsNew(false); }} className="p-1.5 rounded-lg text-muted-foreground hover:bg-muted transition-colors"><Pencil className="h-3.5 w-3.5" /></button>
              <button onClick={() => handleDelete(dept._id)} className="p-1.5 rounded-lg text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"><Trash2 className="h-3.5 w-3.5" /></button>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Edit Modal */}
      <AnimatePresence>
        {editing && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center"
            onClick={(e) => { if (e.target === e.currentTarget) { setEditing(null); setIsNew(false); } }}
          >
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 20, scale: 0.95 }}
              className="w-full max-w-lg rounded-2xl border border-border bg-card p-6 shadow-2xl"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-bold text-foreground">{isNew ? "New Department" : "Edit Department"}</h2>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setShowPreview(!showPreview)}
                    className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
                      showPreview ? "bg-primary text-primary-foreground" : "border border-border text-muted-foreground hover:bg-muted"
                    }`}
                  >
                    <Monitor className="h-3.5 w-3.5" />
                    {showPreview ? "Hide Preview" : "Live Preview"}
                  </button>
                  <button onClick={() => { setEditing(null); setIsNew(false); setShowPreview(false); }} className="p-1 rounded-lg hover:bg-muted">
                    <X className="h-5 w-5 text-muted-foreground" />
                  </button>
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1">Name *</label>
                  <input value={editing.name} onChange={(e) => setEditing({ ...editing, name: e.target.value })} className={inp} />
                </div>
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1">Subtitle</label>
                  <input value={editing.subtitle} onChange={(e) => setEditing({ ...editing, subtitle: e.target.value })} className={inp} />
                </div>
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1">Description</label>
                  <textarea value={editing.description} onChange={(e) => setEditing({ ...editing, description: e.target.value })} rows={3} className={inp + " resize-none"} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-muted-foreground mb-1">Link (href)</label>
                    <input value={editing.href} onChange={(e) => setEditing({ ...editing, href: e.target.value })} className={inp} />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-muted-foreground mb-1">Order</label>
                    <input type="number" value={editing.order} onChange={(e) => setEditing({ ...editing, order: Number(e.target.value) })} className={inp} />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1">Image URL</label>
                  <input value={editing.image} onChange={(e) => setEditing({ ...editing, image: e.target.value })} placeholder="Cloudinary URL" className={inp} />
                </div>
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1">Capabilities (one per line)</label>
                  <textarea 
                    value={editing.capabilities?.join("\n")} 
                    onChange={(e) => setEditing({ ...editing, capabilities: e.target.value.split("\n").filter(v => v.trim()) })} 
                    rows={4} 
                    className={inp + " resize-none"}
                    placeholder="e.g. Workflow Automation&#10;Agentic AI"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-border">
                <button onClick={() => { setEditing(null); setIsNew(false); }} className="rounded-lg border border-border px-4 py-2 text-sm text-muted-foreground hover:bg-muted transition-colors">Cancel</button>
                <button onClick={handleSave} disabled={saving} className="gradient-bg inline-flex items-center gap-2 rounded-lg px-5 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90 disabled:opacity-50">
                  <Save className="h-4 w-4" /> {saving ? "Saving..." : isNew ? "Create" : "Save"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Live Preview Panel */}
      <LivePreview
        data={editing && showPreview ? {
          type: "department",
          name: editing.name,
          subtitle: editing.subtitle,
          description: editing.description,
          image: editing.image,
          href: editing.href,
          capabilities: editing.capabilities,
          enabled: editing.enabled,
        } satisfies DepartmentPreviewData : null}
        onClose={() => setShowPreview(false)}
      />
    </div>
  );
};

export default AdminDepartments;
