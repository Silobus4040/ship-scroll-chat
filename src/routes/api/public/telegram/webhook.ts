import { createFileRoute } from "@tanstack/react-router";

// Telegram webhook: receives updates from the Telegram bot and routes admin
// replies back to the chat widget. Admins reply from Telegram using:
//   /reply <session_id> your message here
export const Route = createFileRoute("/api/public/telegram/webhook")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          const update = await request.json() as any;
          const message = update.message ?? update.edited_message;
          const text: string = message?.text ?? "";
          if (!text.startsWith("/reply ")) return Response.json({ ok: true, ignored: true });

          const rest = text.slice("/reply ".length).trim();
          const spaceIdx = rest.indexOf(" ");
          if (spaceIdx < 0) return Response.json({ ok: true, ignored: true });
          const sessionId = rest.slice(0, spaceIdx);
          const reply = rest.slice(spaceIdx + 1);
          if (!sessionId || !reply) return Response.json({ ok: true, ignored: true });

          const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
          const { error } = await supabaseAdmin.from("chat_messages").insert({
            session_id: sessionId, direction: "out", content: reply,
          });
          if (error) throw error;
          await supabaseAdmin.from("chat_sessions").update({ last_message_at: new Date().toISOString() }).eq("id", sessionId);

          // ack in Telegram
          const botToken = process.env.TELEGRAM_BOT_TOKEN;
          const chatId = message?.chat?.id;
          if (botToken && chatId) {
            await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
              method: "POST", headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ chat_id: chatId, text: `✅ Reply sent to session ${sessionId.slice(0, 8)}…` }),
            });
          }

          return Response.json({ ok: true });
        } catch (e) {
          console.error("tg webhook error", e);
          return Response.json({ ok: false }, { status: 500 });
        }
      },
    },
  },
});
