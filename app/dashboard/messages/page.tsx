import { getCurrentUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getConversations } from "@/lib/actions/chat";
import { ChatLayout } from "@/components/chat/chat-layout";
import { ShieldAlert } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export const metadata = {
  title: "Messages | WeCare",
  description: "Secure, HIPAA-compliant encrypted patient and provider consultations.",
};

interface MessagesPageProps {
  searchParams?: Promise<{ appointmentId?: string }>;
}

export default async function MessagesPage({ searchParams }: MessagesPageProps) {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }

  // Functional Requirement: Guests are not able to send or view clinical messages
  if (user.is_guest) {
    return (
      <div className="flex h-[calc(100vh-12rem)] items-center justify-center">
        <div className="flex max-w-md flex-col items-center gap-4 rounded-3xl border border-border bg-card p-8 text-center shadow-sm">
          <div className="flex size-14 items-center justify-center rounded-2xl bg-amber-50 text-amber-600 dark:bg-amber-950/50 dark:text-amber-400">
            <ShieldAlert className="size-7" />
          </div>
          <div className="space-y-1">
            <h1 className="text-lg font-semibold tracking-tight text-foreground">
              Guest Access Restricted
            </h1>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Under HIPAA § 164.312 security standards, clinical messaging requires
              verified identity credentials. Guest accounts cannot send or view
              consultation messages.
            </p>
          </div>
          <div className="flex w-full flex-col gap-2 pt-2">
            <Button asChild className="bg-teal-600 text-white hover:bg-teal-700">
              <Link href="/signup">Create Verified Account</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/login">Sign In</Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const resolvedParams = searchParams ? await searchParams : undefined;

  // Load user's conversations
  const conversationsResult = await getConversations();
  const initialConversations = conversationsResult.success
    ? conversationsResult.data || []
    : [];

  const defaultConversationId = resolvedParams?.appointmentId
    ? initialConversations.find(
        (c) => c.appointmentId === resolvedParams.appointmentId
      )?.id
    : undefined;

  return (
    <div className="space-y-4">
      {/* Dashboard Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
          Messages
        </h1>
      </div>

      {/* Main Chat Workspace */}
      <ChatLayout
        currentUserId={user.id}
        currentUserRole={user.role || "patient"}
        initialConversations={initialConversations}
        defaultConversationId={defaultConversationId}
      />
    </div>
  );
}
