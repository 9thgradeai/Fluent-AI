import Link from "next/link";
import { Chat } from "@/components/app/chat";

export default async function ConversationPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return (
    <main className="mx-auto flex h-[calc(100dvh-3.5rem)] max-w-3xl flex-col">
      <header className="flex items-center justify-between border-b px-4 py-3">
        <Link href="/conversations" className="text-sm text-muted-foreground hover:underline">
          ← All conversations
        </Link>
        <Link href="/dashboard" className="text-sm text-muted-foreground hover:underline">
          Dashboard
        </Link>
      </header>
      <Chat conversationId={id} />
    </main>
  );
}
