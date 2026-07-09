import { createFileRoute } from "@tanstack/react-router";

// Public endpoint the chat widget POSTs to when a visitor sends a message.
// Forwards the message to a configured Telegram chat. Best-effort — silently
// returns ok when Telegram is not configured yet.
export const Route = createFileRoute("/api/public/chat/incoming")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          const { session_id, name, content } = await request.json() as { session_id?: string; name?: string; content?: string };
          if (!session_id || !content) return Response.json({ ok: false, error: "missing" }, { status: 400 });

          const botToken = process.env.TELEGRAM_BOT_TOKEN;
          const chatId = process.env.TELEGRAM_ADMIN_CHAT_ID;
          if (!botToken || !chatId) return Response.json({ ok: true, forwarded: false });

          const text = `💬 New message from ${name || "Visitor"}\nSession: ${session_id}\n\n${content}\n\nReply with: /reply ${session_id} your message`;
          await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ chat_id: chatId, text }),
          });
          return Response.json({ ok: true, forwarded: true });
        } catch (e) {
          console.error("chat/incoming error", e);
          return Response.json({ ok: false }, { status: 500 });
        }
      },
    },
  },
});
