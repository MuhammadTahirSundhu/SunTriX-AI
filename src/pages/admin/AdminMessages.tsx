import { useState, useEffect } from "react";
import { apiRequest, ENDPOINTS } from "@/lib/api";
import { Trash2, Mail, MailOpen } from "lucide-react";

interface ContactMessage {
  _id: string;
  name: string;
  email: string;
  company: string;
  subject: string;
  message: string;
  read: boolean;
  createdAt: string;
}

const AdminMessages = () => {
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [selected, setSelected] = useState<ContactMessage | null>(null);

  const fetchMessages = async () => {
    const { data } = await apiRequest<ContactMessage[]>(ENDPOINTS.ADMIN_CONTACTS);
    if (data) setMessages(data);
  };

  useEffect(() => { fetchMessages(); }, []);

  const markRead = async (id: string) => {
    await apiRequest(`${ENDPOINTS.ADMIN_CONTACTS}/${id}/read`, { method: "PUT" });
    setMessages((prev) => prev.map((m) => m._id === id ? { ...m, read: true } : m));
  };

  const deleteMessage = async (id: string) => {
    await apiRequest(`${ENDPOINTS.ADMIN_CONTACTS}/${id}`, { method: "DELETE" });
    fetchMessages();
    if (selected?._id === id) setSelected(null);
  };

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-display font-bold text-foreground">Messages</h1>
        <p className="text-sm text-muted-foreground">Contact form submissions</p>
      </div>

      <div className="flex gap-6">
        {/* List */}
        <div className="flex-1 rounded-xl border border-border bg-card divide-y divide-border overflow-hidden">
          {messages.length === 0 ? (
            <div className="p-12 text-center">
              <Mail className="h-10 w-10 text-muted-foreground/20 mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">No messages yet</p>
            </div>
          ) : (
            messages.map((msg) => (
              <div
                key={msg._id}
                onClick={() => { setSelected(msg); if (!msg.read) markRead(msg._id); }}
                className={`p-4 cursor-pointer hover:bg-muted/30 transition-colors ${selected?._id === msg._id ? "bg-muted/40" : ""}`}
              >
                <div className="flex items-center justify-between mb-1">
                  <p className="text-sm font-medium text-foreground flex items-center gap-2">
                    {msg.read ? <MailOpen className="h-3.5 w-3.5 text-muted-foreground" /> : <Mail className="h-3.5 w-3.5 text-primary" />}
                    {msg.name}
                  </p>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">{new Date(msg.createdAt).toLocaleDateString()}</span>
                    <button onClick={(e) => { e.stopPropagation(); deleteMessage(msg._id); }} className="p-1 rounded hover:bg-destructive/10">
                      <Trash2 className="h-3 w-3 text-muted-foreground hover:text-destructive" />
                    </button>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">{msg.subject}</p>
              </div>
            ))
          )}
        </div>

        {/* Detail */}
        {selected && (
          <div className="w-96 rounded-xl border border-border bg-card p-6 shrink-0 self-start">
            <h3 className="text-lg font-semibold text-foreground mb-1">{selected.subject}</h3>
            <p className="text-xs text-muted-foreground mb-4">From: {selected.name} ({selected.email})</p>
            {selected.company && <p className="text-xs text-muted-foreground mb-4">Company: {selected.company}</p>}
            <div className="border-t border-border pt-4">
              <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">{selected.message}</p>
            </div>
            <p className="text-xs text-muted-foreground/50 mt-4">{new Date(selected.createdAt).toLocaleString()}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminMessages;
