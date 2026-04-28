import { getCurrentUser } from "@/lib/auth";
import { getDoctorByUserId } from "@/lib/actions/doctors";
import { MessagesClient } from "@/components/dashboard/messages/messages-client";
import { prisma } from "@/lib/prisma-db";
import { redirect } from "next/navigation";

export default async function MessagesPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  // Fetch conversations/notifications
  const logs = await prisma.notification_logs.findMany({
    where: {
      OR: [
        { user_id: user.id },
        { recipient: user.email }
      ]
    },
    orderBy: { created_at: "desc" },
    take: 50
  });

  return <MessagesClient initialLogs={logs} user={user} />;
}
