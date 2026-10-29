import React from "react";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import Image from "next/image";
import { Heart, ArrowLeft, Bell, BookOpen, Trash2 } from "lucide-react";
import WishlistClientView from "@/components/account/WishlistClientView";

export const dynamic = "force-dynamic";

export default async function WishlistPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    redirect("/login");
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    include: {
      wishlists: {
        include: {
          book: {
            include: {
              images: { where: { isCover: true }, take: 1 },
            },
          },
        },
      },
      subscriptions: true,
    },
  });

  if (!user) {
    redirect("/login");
  }

  return (
    <WishlistClientView
      initialWishlists={user.wishlists}
      initialSubscriptions={user.subscriptions}
      userEmail={user.email}
    />
  );
}
