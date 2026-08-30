// app/api/register/route.ts (or your signup API)
import { prisma } from "@/lib/prisma";
import { UserRole } from "@prisma/client";
import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { name, email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const existingUser = await prisma.user.findUnique({
      where: { email: email.trim().toLowerCase() },
    });

    if (existingUser) {
      return NextResponse.json({ error: "User already exists" }, { status: 400 });
    }

    // ALWAYS hash the password before saving
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        name,
        email: email.trim().toLowerCase(),
        password: hashedPassword,
        role: "Applicant" as UserRole, // default role
      },
    });

    return NextResponse.json({ success: true, userId: user.id });
  } catch (error) {
    return NextResponse.json({ error: "Registration failed" }, { status: 500 });
  }
}