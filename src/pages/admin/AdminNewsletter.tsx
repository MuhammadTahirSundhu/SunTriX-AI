import { useState, useEffect } from "react";
import { apiRequest, ENDPOINTS } from "@/lib/api";
import { Users, Mail, Trash2, Send, Edit3, Loader2, Sparkles } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Subscriber {
  _id: string;
  name: string;
  email: string;
  interest: string;
  subscribed: boolean;
  createdAt: string;
}

const AdminNewsletter = () => {
  const [subs, setSubs] = useState<Subscriber[]>([]);
  const [tab, setTab] = useState<"subscribers" | "compose">("subscribers");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [targetAudience, setTargetAudience] = useState("All");
  const [sending, setSending] = useState(false);
  
  // AI Form State
  const [aiPrompt, setAiPrompt] = useState("");
  const [generating, setGenerating] = useState(false);
  
  const { toast } = useToast();

  const fetchSubs = async () => {
    const { data } = await apiRequest<Subscriber[]>(ENDPOINTS.NEWSLETTER_LIST);
    if (data) setSubs(data);
  };

  useEffect(() => { fetchSubs(); }, []);

  const remove = async (id: string) => {
    await apiRequest(`${ENDPOINTS.NEWSLETTER_LIST}/${id}`, { method: "DELETE" });
    fetchSubs();
  };

  const handleGenerateTemplate = async () => {
    if (!aiPrompt) return toast({ title: "Validation Error", description: "Please enter a prompt.", variant: "destructive" });
    setGenerating(true);
    const { data, error } = await apiRequest<{html: string}>(ENDPOINTS.NEWSLETTER_GENERATE, {
      method: "POST",
      body: { prompt: aiPrompt }
    });
    setGenerating(false);
    
    if (error) {
      toast({ title: "Generation failed", description: error, variant: "destructive" });
    } else if (data?.html) {
      setBody(data.html);
      toast({ title: "AI Generated", description: "Your template has been placed in the editor." });
    }
  };

  const handleBroadcast = async () => {
    if (!subject || !body) return toast({ title: "Validation Error", description: "Subject and Body are required.", variant: "destructive" });
    setSending(true);
    const { error } = await apiRequest(ENDPOINTS.NEWSLETTER_BROADCAST, {
      method: "POST",
      body: { subject, body, targetAudience }
    });
    setSending(false);
    
    if (error) {
      toast({ title: "Failed to broadcast", description: error, variant: "destructive" });
    } else {
      toast({ title: "Success", description: "Newsletter broadcast sent successfully." });
      setSubject("");
      setBody("");
      setTargetAudience("All");
      setTab("subscribers");
    }
  };

  return (
    <div className="p-6 lg:p-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">Newsletter</h1>
          <p className="text-sm text-muted-foreground">{subs.length} active subscribers</p>
        </div>
        <div className="flex bg-muted/50 p-1 rounded-lg w-fit">
          <button onClick={() => setTab("subscribers")} className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors ${tab === "subscribers" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}>Subscribers</button>
          <button onClick={() => setTab("compose")} className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors ${tab === "compose" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}>Compose</button>
        </div>
      </div>

      {tab === "subscribers" && (
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
                  <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground">Subscriber</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground">Interest</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground">Subscribed</th>
                  <th className="text-right px-4 py-3 text-xs font-medium text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {subs.map((s) => (
                  <tr key={s._id} className="hover:bg-muted/20">
                    <td className="px-4 py-3">
                      <div className="font-medium text-foreground">{s.name || "Unknown"}</div>
                      <div className="flex items-center gap-1.5 text-muted-foreground text-xs mt-0.5">
                        <Mail className="h-3 w-3" /> {s.email}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-primary/10 text-primary">
                        {s.interest || "General News"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{new Date(s.createdAt).toLocaleDateString()}</td>
                    <td className="px-4 py-3 text-right">
                      <button onClick={() => remove(s._id)} className="p-1 rounded hover:bg-destructive/10">
                        <Trash2 className="h-3.5 w-3.5 text-muted-foreground hover:text-destructive" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {tab === "compose" && (
        <div className="rounded-xl border border-border bg-card p-6 space-y-6">
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">Target Audience</label>
                <select 
                  value={targetAudience}
                  onChange={(e) => setTargetAudience(e.target.value)}
                  className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-colors"
                >
                  <option value="All">All Subscribers</option>
                  <option value="General News">General News</option>
                  <option value="Call to Action">Call to Action</option>
                  <option value="Platform Updates">Platform Updates</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">Subject</label>
                <input 
                  value={subject} 
                  onChange={e => setSubject(e.target.value)}
                  placeholder="What's this newsletter about?"
                  className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary placeholder:text-muted-foreground/50 transition-colors"
                />
              </div>
            </div>
            
            <div className="bg-primary/5 border border-primary/20 rounded-lg p-4 mb-2">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="h-4 w-4 text-primary" />
                <label className="block text-sm font-semibold text-primary">AI Template Generator</label>
              </div>
              <div className="flex gap-3">
                <input 
                  value={aiPrompt} 
                  onChange={e => setAiPrompt(e.target.value)}
                  placeholder="E.g., Create a modern promotional email for our new agentic AI automation service..."
                  className="flex-1 rounded-md border border-primary/20 bg-background px-4 py-2 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary placeholder:text-muted-foreground/50 transition-colors"
                />
                <button 
                  onClick={handleGenerateTemplate}
                  disabled={generating || !aiPrompt}
                  className="flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-bold text-primary-foreground hover:bg-primary/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                >
                  {generating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                  {generating ? "Generating..." : "Generate HTML"}
                </button>
              </div>
              <p className="text-xs text-primary/70 mt-2">The AI will generate clean, responsive HTML directly into the editor below.</p>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-sm font-medium text-foreground">HTML Code</label>
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground bg-muted px-2 py-1 rounded">
                    <Edit3 className="h-3.5 w-3.5" /> Editor
                  </div>
                </div>
                <textarea 
                  value={body} 
                  onChange={e => setBody(e.target.value)}
                  placeholder="<h1>Hello!</h1><br/><p>Weekly update...</p>"
                  className="w-full h-[500px] resize-none rounded-lg border border-border bg-background px-4 py-3 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary placeholder:text-muted-foreground/50 transition-colors font-mono"
                />
              </div>
              
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-sm font-medium text-foreground">Live Preview (Desktop View)</label>
                </div>
                <div 
                  className="w-full h-[500px] rounded-lg border border-border bg-white text-black p-6 overflow-y-auto prose prose-sm max-w-none" 
                  dangerouslySetInnerHTML={{ __html: body || "<p style='color: #9ca3af; font-family: sans-serif;'>Preview will appear here...</p>" }} 
                />
              </div>
            </div>
            
            <div className="pt-2 flex items-center justify-end">
              <button 
                onClick={handleBroadcast}
                disabled={sending || subs.length === 0}
                className="flex items-center gap-2 rounded-lg bg-primary px-6 py-2.5 text-sm font-bold text-primary-foreground hover:bg-primary/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                {sending ? "Sending..." : `Broadcast (${targetAudience})`}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminNewsletter;
