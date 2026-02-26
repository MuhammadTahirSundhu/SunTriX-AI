import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { departmentStore, type Department } from "@/lib/cms-store";
import { toast } from "@/hooks/use-toast";
import {
  Plus, Pencil, Trash2, Eye, EyeOff, X, Save, GripVertical, ArrowUp, ArrowDown
} from "lucide-react";

const AdminDepartments = () => {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [editing, setEditing] = useState<Department | null>(null);
  const [isNew, setIsNew] = useState(false);

  const reload = () => setDepartments(departmentStore.getAll());
  useEffect(reload, []);

  const handleNew = () => {
    setIsNew(true);
    setEditing({
      id: "", name: "", subtitle: "", description: "",
      image: "", href: "/services/agentic-ai", order: departments.length + 1,
      enabled: true, updatedAt: "",
    });
  };

  const handleSave = () => {
    if (!editing) return;
    if (!editing.name) { toast({ title: "Name required" }); return; }
    if (isNew) {
      departmentStore.create(editing);
      toast({ title: "Department created" });
    } else {
      departmentStore.update(editing.id, editing);
      toast({ title: "Department updated" });
    }
    setEditing(null);
    setIsNew(false);
    reload();
  };

  const handleDelete = (id: string) => {
    departmentStore.delete(id);
    toast({ title: "Department deleted" });
    reload();
  };

  const toggleEnabled = (dept: Department) => {
    departmentStore.update(dept.id, { enabled: !dept.enabled });
    reload();
  };

  const moveOrder = (dept: Department, dir: -1 | 1) => {
    departmentStore.update(dept.id, { order: dept.order + dir });
    reload();
  };

  const inputCls = "w-full rounded-lg border border-border bg-muted/50 px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary";

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
        {departments.sort((a, b) => a.order - b.order).map((dept) => (
          <motion.div
            key={dept.id}
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
              <button onClick={() => moveOrder(dept, -1)} className="p-1.5 rounded-lg text-muted-foreground hover:bg-muted transition-colors">
                <ArrowUp className="h-3.5 w-3.5" />
              </button>
              <button onClick={() => moveOrder(dept, 1)} className="p-1.5 rounded-lg text-muted-foreground hover:bg-muted transition-colors">
                <ArrowDown className="h-3.5 w-3.5" />
              </button>
              <button onClick={() => toggleEnabled(dept)} className="p-1.5 rounded-lg text-muted-foreground hover:bg-muted transition-colors">
                {dept.enabled ? <Eye className="h-3.5 w-3.5 text-success" /> : <EyeOff className="h-3.5 w-3.5" />}
              </button>
              <button onClick={() => { setEditing(dept); setIsNew(false); }} className="p-1.5 rounded-lg text-muted-foreground hover:bg-muted transition-colors">
                <Pencil className="h-3.5 w-3.5" />
              </button>
              <button onClick={() => handleDelete(dept.id)} className="p-1.5 rounded-lg text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors">
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Edit Modal */}
      <AnimatePresence>
        {editing && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center"
            onClick={(e) => { if (e.target === e.currentTarget) { setEditing(null); setIsNew(false); } }}
          >
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.95 }}
              className="w-full max-w-lg rounded-2xl border border-border bg-card p-6 shadow-2xl"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-bold text-foreground">{isNew ? "New Department" : "Edit Department"}</h2>
                <button onClick={() => { setEditing(null); setIsNew(false); }} className="p-1 rounded-lg hover:bg-muted"><X className="h-5 w-5 text-muted-foreground" /></button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1">Name *</label>
                  <input value={editing.name} onChange={(e) => setEditing({ ...editing, name: e.target.value })} className={inputCls} />
                </div>
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1">Subtitle</label>
                  <input value={editing.subtitle} onChange={(e) => setEditing({ ...editing, subtitle: e.target.value })} className={inputCls} />
                </div>
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1">Description</label>
                  <textarea value={editing.description} onChange={(e) => setEditing({ ...editing, description: e.target.value })} rows={3} className={inputCls + " resize-none"} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-muted-foreground mb-1">Link (href)</label>
                    <input value={editing.href} onChange={(e) => setEditing({ ...editing, href: e.target.value })} className={inputCls} />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-muted-foreground mb-1">Order</label>
                    <input type="number" value={editing.order} onChange={(e) => setEditing({ ...editing, order: Number(e.target.value) })} className={inputCls} />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1">Image URL</label>
                  <input value={editing.image} onChange={(e) => setEditing({ ...editing, image: e.target.value })} placeholder="Cloudinary URL" className={inputCls} />
                </div>
              </div>
              <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-border">
                <button onClick={() => { setEditing(null); setIsNew(false); }} className="rounded-lg border border-border px-4 py-2 text-sm text-muted-foreground hover:bg-muted transition-colors">Cancel</button>
                <button onClick={handleSave} className="gradient-bg inline-flex items-center gap-2 rounded-lg px-5 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90"><Save className="h-4 w-4" /> {isNew ? "Create" : "Save"}</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminDepartments;
