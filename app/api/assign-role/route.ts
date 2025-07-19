// app/api/assign-role/route.ts
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    
    // Check if user is authenticated
    if (!session || !session.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" }, 
        { status: 401 }
      );
    }

    // Get form data
    const formData = await request.formData();
    const role = formData.get("role") as string;

    // Validate role
    const validRoles = ["INFLUENCER", "BRAND", "ADMIN"];
    if (!role || !validRoles.includes(role)) {
      return NextResponse.json(
        { error: "Invalid role selected" }, 
        { status: 400 }
      );
    }

    // Update user role in database
    await db.user.update({
      where: {
        id: session.user.id
      },
      data: {
        role: role as "INFLUENCER" | "BRAND" | "ADMIN"
      }
    });

    // If role is INFLUENCER, create influencer entry
    if (role === "INFLUENCER") {
      const existingInfluencer = await db.influencer.findUnique({
        where: {
          userId: session.user.id
        }
      });

      if (!existingInfluencer) {
        await db.influencer.create({
          data: {
            userId: session.user.id
          }
        });
      }
    }

    // Redirect to 
    return NextResponse.redirect(new URL("/settings", request.url));

  } catch (error) {
    console.error("Error assigning role:", error);
    return NextResponse.json(
      { error: "Internal server error" }, 
      { status: 500 }
    );
  }
}