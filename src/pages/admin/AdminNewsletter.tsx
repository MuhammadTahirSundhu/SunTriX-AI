import { useState, useEffect } from "react";
import { newsletterStore } from "@/lib/store";
import { Users, Mail } from "lucide-react";

const AdminNewsletter = () => {
  const [subs, setSubs] = useState<{ email: string; date: string }[]>([]);

  useEffect(() => {
    setSubs(newsletterStore.getAll());
  }, []);

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-display font-bold text-foreground">Newsletter Subscribers</h1>
        <p className="text-sm text-muted-foreground">{subs.length} subscribers</p>
      </div>

      <div className="rounded-xl border border-border bg-card overflow-hidden">
        {subs.length === 0 ? (
          <div className="p-12 text-center">
            <Users className="h-10 w-10 text-muted-foreground/20 mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">No subscribers yet</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground">Email</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground">Subscribed</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {subs.map((s, i) => (
                <tr key={i} className="hover:bg-muted/20">
                  <td className="px-4 py-3 flex items-center gap-2">
                    <Mail className="h-3.5 w-3.5 text-primary" /> {s.email}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{new Date(s.date).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default AdminNewsletter;
