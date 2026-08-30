// app/actions/auth.ts
"use server";

import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

export async function registerCandidate(formData: FormData) {
  try {
    const name = formData.get("name") as string;
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const phone = (formData.get("phone") as string) || "";
    const location = (formData.get("location") as string) || "";

    if (!email || !password || !name) {
      return { error: "Name, email, and password are required." };
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return { error: "An account with this email already exists." };
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Transactionally create User and link Candidate profile
    const newUser = await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          name,
          email,
          password: hashedPassword,
          role: "APPLICANT",
        },
      });

      await tx.candidate.create({
        data: {
          userId: user.id,
          fullName: name,
          email: email,
          phone: phone,
          location: location,
          department: "General",
          professionalTitle: "Applicant",
        },
      });

      return user;
    });

    return { success: true, userId: newUser.id };
  } catch (error) {
    console.error("Registration error:", error);
    return { error: "Something went wrong during registration. Please try again." };
  }
}