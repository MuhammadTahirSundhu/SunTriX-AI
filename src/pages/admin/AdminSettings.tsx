import { authStore } from "@/lib/store";
import { Shield, Database, Globe } from "lucide-react";

const AdminSettings = () => {
  const user = authStore.getSession();

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-display font-bold text-foreground">Settings</h1>
        <p className="text-sm text-muted-foreground">Admin configuration</p>
      </div>

      <div className="space-y-6 max-w-2xl">
        {/* Profile */}
        <div className="rounded-xl border border-border bg-card p-6">
          <h2 className="text-sm font-semibold text-foreground flex items-center gap-2 mb-4">
            <Shield className="h-4 w-4 text-primary" /> Admin Profile
          </h2>
          <div className="grid gap-4">
            <div>
              <label className="text-xs text-muted-foreground">Name</label>
              <p className="text-sm text-foreground">{user?.name}</p>
            </div>
            <div>
              <label className="text-xs text-muted-foreground">Email</label>
              <p className="text-sm text-foreground">{user?.email}</p>
            </div>
            <div>
              <label className="text-xs text-muted-foreground">Role</label>
              <p className="text-sm text-foreground capitalize">{user?.role}</p>
            </div>
          </div>
        </div>

        {/* Backend Config */}
        <div className="rounded-xl border border-border bg-card p-6">
          <h2 className="text-sm font-semibold text-foreground flex items-center gap-2 mb-4">
            <Database className="h-4 w-4 text-secondary" /> Backend Configuration
          </h2>
          <div className="rounded-lg bg-muted/50 border border-dashed border-border p-4 text-center">
            <Globe className="h-8 w-8 text-muted-foreground/20 mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">Currently using <strong className="text-primary">localStorage</strong></p>
            <p className="text-xs text-muted-foreground/60 mt-1">Connect Node.js + MongoDB backend to go live</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminSettings;
