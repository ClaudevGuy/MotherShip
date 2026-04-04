import { prisma } from "@/lib/prisma";

interface NotificationInput {
  projectId: string;
  title: string;
  message: string;
  type: "success" | "error" | "warning" | "info";
  category: "agent" | "workflow" | "incident" | "cost" | "system";
  link?: string;
}

export async function createNotification({
  projectId,
  title,
  message,
  type,
  category,
  link,
}: NotificationInput) {
  return prisma.notification.create({
    data: {
      projectId,
      title,
      message,
      type,
      category,
      actionUrl: link,
    },
  });
}
