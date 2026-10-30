import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ points: 0, isLoggedIn: false });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true, email: true, name: true, rewardPoints: true },
    });

    if (!user) {
      return NextResponse.json({ points: 0, isLoggedIn: false });
    }

    return NextResponse.json({
      isLoggedIn: true,
      points: user.rewardPoints,
      email: user.email,
      name: user.name,
    });
  } catch (error) {
    console.error("Error fetching points:", error);
    return NextResponse.json({ points: 0, error: "Failed to fetch points" }, { status: 500 });
  }
}
