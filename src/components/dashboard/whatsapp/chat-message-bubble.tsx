import { cn } from "@/lib/utils/cn";

interface ChatMessageBubbleProps {
  role: "customer" | "assistant" | "system";
  content: string;
  mediaUrl: string | null;
  mediaType: string | null;
  toolCalls: Record<string, unknown>[] | null;
  createdAt: string;
}

export function ChatMessageBubble({
  role,
  content,
  mediaUrl,
  mediaType,
  toolCalls,
  createdAt,
}: ChatMessageBubbleProps) {
  const isAssistant = role === "assistant";
  const time = new Date(createdAt).toLocaleTimeString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div className={cn("flex", isAssistant ? "justify-end" : "justify-start")}>
      <div
        className={cn(
          "max-w-[75%] rounded-xl px-4 py-2",
          isAssistant
            ? "rounded-br-sm bg-brand-600 text-white"
            : "rounded-bl-sm bg-bg-secondary text-text-primary"
        )}
      >
        {/* Image */}
        {mediaType === "image" && mediaUrl && (
          <div className="mb-2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={mediaUrl}
              alt="Imagem"
              className="max-h-48 rounded-lg object-cover"
            />
          </div>
        )}

        {/* Audio */}
        {mediaType === "audio" && (
          <div className="mb-1 flex items-center gap-2">
            <span className="text-xs">🎵 Mensagem de áudio</span>
          </div>
        )}

        {/* Document */}
        {mediaType === "document" && (
          <div className="mb-1 flex items-center gap-2">
            <span className="text-xs">📄 Documento</span>
          </div>
        )}

        {/* Text content */}
        {content && (
          <p className="whitespace-pre-wrap text-sm leading-relaxed">
            {content}
          </p>
        )}

        {/* Tools used indicator (AI messages) */}
        {isAssistant && toolCalls && toolCalls.length > 0 && (
          <div
            className={cn(
              "mt-1 border-t pt-1",
              isAssistant ? "border-brand-500/30" : "border-border"
            )}
          >
            <p className="text-xs opacity-70">
              🔧{" "}
              {toolCalls
                .map((t) => (t as { tool?: string }).tool)
                .filter(Boolean)
                .join(", ")}
            </p>
          </div>
        )}

        {/* Timestamp */}
        <div
          className={cn(
            "mt-1 text-right text-[10px]",
            isAssistant ? "text-white/60" : "text-text-tertiary"
          )}
        >
          {isAssistant && <span className="mr-1">🤖</span>}
          {time}
        </div>
      </div>
    </div>
  );
}
