import { Prisma } from "@prisma/client";
import webpush from "web-push";
export function sendNotifications({
  subscription,
  payload,
}: {
  subscription?: { endpoint: string; auth: string; p256dh: string } | null;
  payload: {
    title: string;
    body?: string;
    userId?: string;
    createdAt?: Date;
    updatedAt?: Date;
    id?: string;
    type?: string;
    message?: string;
    referenceId?: string | null;
    actions?: Prisma.JsonValue | null;
    read?: boolean;
  };
}) {
  webpush.setVapidDetails(
    "mailto:anumalansk@gmail.com",
    process.env.VAPID_PUBLIC_KEY || "",
    process.env.VAPID_PRIVATE_KEY || ""
  );
  if (!subscription) return;

  const pushPayload = JSON.stringify(payload);

  return webpush.sendNotification(
    {
      endpoint: subscription.endpoint,
      keys: {
        auth: subscription.auth,
        p256dh: subscription.p256dh,
      },
    },
    pushPayload
  );
}
