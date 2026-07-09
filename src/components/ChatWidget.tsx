import { useEffect, useRef, useState } from "react";
import { MessageCircle, X, Send } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

type Msg = { id: string; direction: "in" | "out"; content: string; created_at: string };

const VKEY = "zipco_visitor_key";

function getVisitorKey() {
  if (typeof window === "undefined") return "";
  let k = localStorage.getItem(VKEY);
  if (!k) { k = crypto.randomUUID(); localStorage.setItem(VKEY, k); }
  return k;
}

export function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [text, setText] = useState("");
  const [visitor, setVisitor] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const k = getVisitorKey();
    setVisitor(k);
    if (!k) return;
    supabase.from("chat_sessions").select("*").eq("visitor_key", k).maybeSingle().then(({ data }) => {
      if (data) {
        setSessionId(data.id);
        setName(data.visitor_name ?? "");
        setEmail(data.visitor_email ?? "");
        supabase.from("chat_messages").select("*").eq("session_id", data.id).order("created_at").then(({ data: m }) => setMsgs((m as Msg[]) ?? []));
      }
    });
  }, []);

  useEffect(() => {
    if (!sessionId) return;
    const ch = supabase.channel(`chat-${sessionId}`)
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "chat_messages", filter: `session_id=eq.${sessionId}` },
        (payload) => setMsgs((m) => [...m, payload.new as Msg]))
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [sessionId]);

  useEffect(() => { scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" }); }, [msgs, open]);

  async function startChat(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    const { data, error } = await supabase.from("chat_sessions").insert({
      visitor_key: visitor, visitor_name: name.trim(), visitor_email: email.trim() || null,
    }).select().single();
    if (error || !data) return;
    setSessionId(data.id);
    // welcome message
    await supabase.from("chat_messages").insert({
      session_id: data.id, direction: "out",
      content: `Hello ${name.trim()}, welcome to Zipco International! A coordinator will be with you shortly. How can we help?`,
    });
  }

  async function send(e: React.FormEvent) {
    e.preventDefault();
    if (!text.trim() || !sessionId) return;
    const content = text.trim();
    setText("");
    await supabase.from("chat_messages").insert({ session_id: sessionId, direction: "in", content });
    await supabase.from("chat_sessions").update({ last_message_at: new Date().toISOString() }).eq("id", sessionId);
    // forward to Telegram (best-effort; ignored if not configured yet)
    fetch("/api/public/chat/incoming", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ session_id: sessionId, name, content }),
    }).catch(() => {});
  }

  return (
    <>
      {!open && (
        <button
          onClick={() => setOpen(true)}
          className="fixed bottom-5 right-5 z-50 grid h-14 w-14 place-items-center rounded-full bg-gradient-gold shadow-gold transition hover:scale-105"
          aria-label="Open chat"
        >
          <MessageCircle className="h-6 w-6" />
        </button>
      )}

      {open && (
        <div className="fixed bottom-5 right-5 z-50 flex h-[560px] max-h-[85vh] w-[calc(100vw-2.5rem)] max-w-sm flex-col overflow-hidden rounded-2xl border bg-card shadow-elegant">
          <div className="flex items-center justify-between bg-navy px-4 py-3 text-navy-foreground">
            <div>
              <p className="font-display font-bold">Zipco Support</p>
              <p className="text-xs text-navy-foreground/70">Typically replies within minutes</p>
            </div>
            <button onClick={() => setOpen(false)} aria-label="Close" className="rounded p-1 hover:bg-white/10"><X className="h-5 w-5" /></button>
          </div>

          {!sessionId ? (
            <form onSubmit={startChat} className="flex flex-1 flex-col justify-center gap-3 p-5">
              <p className="text-sm text-muted-foreground">Start a conversation with our team.</p>
              <input required placeholder="Your name" value={name} onChange={(e) => setName(e.target.value)} className="rounded-md border bg-background px-3 py-2 text-sm" />
              <input type="email" placeholder="Email (optional)" value={email} onChange={(e) => setEmail(e.target.value)} className="rounded-md border bg-background px-3 py-2 text-sm" />
              <button className="rounded-md bg-gradient-gold px-4 py-2 text-sm font-semibold shadow-gold">Start chat</button>
            </form>
          ) : (
            <>
              <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto bg-secondary/40 p-4">
                {msgs.map((m) => (
                  <div key={m.id} className={`flex ${m.direction === "in" ? "justify-end" : "justify-start"}`}>
                    <div className={`max-w-[80%] rounded-2xl px-4 py-2 text-sm ${m.direction === "in" ? "bg-primary text-primary-foreground" : "bg-card border"}`}>
                      {m.content}
                    </div>
                  </div>
                ))}
              </div>
              <form onSubmit={send} className="flex gap-2 border-t bg-background p-3">
                <input value={text} onChange={(e) => setText(e.target.value)} placeholder="Type a message…" className="flex-1 rounded-md border bg-background px-3 py-2 text-sm" />
                <button className="grid h-10 w-10 place-items-center rounded-md bg-gradient-gold" aria-label="Send"><Send className="h-4 w-4" /></button>
              </form>
            </>
          )}
        </div>
      )}
    </>
  );
}
