"use server";

import { db } from "./db";
import { auth } from "@/auth"; // ini auth() dari konfigurasi NextAuth kamu
import { revalidatePath } from "next/cache";
import { genSalt, hash, compare } from "bcrypt-ts";
import { createNotification } from "./notification.actions";

export async function createUser(formData: FormData) {
  const name = formData.get('name') as string;
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;
  const role = formData.get('role') as 'BRAND' | 'INFLUENCER' | 'ADMIN';

  const session = await auth();
  if (!session?.user || session.user.role !== 'ADMIN') {
    return { error: 'Unauthorized', status: 401 };
  }

  const salt = await genSalt(10);
  const hashed = await hash(password, salt);

  await db.user.create({ data: { name, email, role, password: hashed } });
  revalidatePath('/admin/users');

  return { success: true, status: 201 };
}

export async function getAllUser() {
  try {
    const session = await auth();

    if (!session || !session.user?.id) {
      return { error: "Unauthorized", status: 401, success: false };
    }

    const users = await db.user.findMany({
      where: {
        id: {
          not: session.user.id, // exclude user yang sedang login
        },
        // role: 'BRAND' // hanya menentukan 1 role saja 
      },
      orderBy: {
        name: "desc",
      }
    });

    return { data: users, status: 200, success: true };
  } catch (error) {
    console.error("Error fetching user data", error);
    return { error: "Failed to fetch users", status: 500, success: false };
  }
}

// Delete category
export async function deleteUser(id: string) {
  try {
    await db.user.delete({
      where: { id },
    })

    return { message: "Users deleted", status: 200 }
  } catch (error) {
    console.error("Error deleting users:", error)
    return { error: "Failed to delete users", status: 500 }
  }
}

export async function updateUserRole(userId: string, role: "BRAND" | "INFLUENCER" | "ADMIN") {
  try {
    const session = await auth();

    // Pastikan user yang melakukan update adalah user yang sedang login
    if (!session?.user || session.user.id !== userId) {
      return { error: "Unauthorized" };
    }

    // Update role di database
    await db.user.update({
      where: { id: userId },
      data: { role: role }
    });

    // Revalidate untuk memperbarui session
    revalidatePath("/settings");

    return { success: true };

  } catch (error) {
    console.error("Error updating user role:", error);
    return { error: "Failed to update role" };
  }
}

// Update user By Admin Panel
export async function updateUserWithFormData(formData: FormData) {
  const id = formData.get("id") as string
  const name = formData.get("name") as string
  const email = formData.get("email") as string
  const password = formData.get("password") as string
  const role = formData.get("role") as "ADMIN" | "BRAND" | "INFLUENCER"

  const session = await auth()
  if (!session?.user.id) {
    return { error: "Session not Found", status: 401 }
  }

  if (!session?.user || session.user.role !== "ADMIN") {
    return { error: "Unauthorized" }
  }

  if (session.user.id === id && role !== "ADMIN") {
    return { error: "You cannot downgrade your own role" }
  }

  const updateData: any = { name, email, role }

  if (password && password.trim() !== "") {
    const salt = await genSalt(10)
    const hashed = await hash(password, salt)
    updateData.password = hashed
  }

  try {
    await db.user.update({
      where: { id },
      data: updateData,
    })

    await createNotification({
      userId: id, // target user
      title: 'Role Updated',
      type: 'ROLE_UPDATE',
      message: 'Your user role has been changed by an admin.',
      data: {
        updatedBy: session.user.email,
        redirectUrl: '/settings',
      },
    })


    await db.auditLog.create({
      data: {
        action: "USER_UPDATE",
        message: `Admin ${session.user.email} updated user ${email}`,
        userId: session.user.id,
        targetId: id,
      },
    })

    revalidatePath("/admin/users")
    return { success: true }
  } catch (error) {
    console.error("Error updating user:", error)
    return { error: "Failed to update user" }
  }
}


export async function getUserById(userId: string) {
  try {
    const user = await db.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        image: true
      }
    });

    return user;
  } catch (error) {
    console.error("Error fetching user:", error);
    return null;
  }
}


// Update User Profile
export async function updateProfile(formData: FormData) {
  try {
    const session = await auth()
    if (!session?.user?.id) return { error: "Unauthorized" }

    const name = formData.get("name") as string
    const currentPassword = formData.get("currentPassword") as string
    const newPassword = formData.get("newPassword") as string

    if (!name || name.trim() === "") return { error: "Name is required" }

    if (newPassword && newPassword.trim() !== "") {
      if (!currentPassword) return { error: "Current password is required to change password" }

      const user = await db.user.findUnique({ where: { id: session.user.id } })
      if (!user || !user.password) return { error: "User not found" }

      const isValid = await compare(currentPassword, user.password)
      if (!isValid) return { error: "Current password is incorrect" }

      const hashed = await hash(newPassword, await genSalt(10))
      const updatedUser = await db.user.update({
        where: { id: session.user.id },
        data: { name: name.trim(), password: hashed }
      })
      
      console.log("Updated user with password:", updatedUser) // LOG INI
    } else {
      const updatedUser = await db.user.update({
        where: { id: session.user.id },
        data: { name: name.trim() }
      })
      
      console.log("Updated user name only:", updatedUser)
    }

    // revalidatePath('/brand/profile')
    return { success: true }
  } catch (err) {
    console.error(err)
    return { error: "Something went wrong" }
  }
}

export async function changePassword(formData: FormData) {
  try {
    const session = await auth()
    if (!session?.user?.id) return { error: "Unauthorized" }

    const currentPassword = formData.get("currentPassword") as string
    const newPassword = formData.get("newPassword") as string
    const confirmPassword = formData.get("confirmPassword") as string

    if (!currentPassword || !newPassword || !confirmPassword)
      return { error: "All fields are required" }
    if (newPassword !== confirmPassword)
      return { error: "Passwords do not match" }
    if (newPassword.length < 6)
      return { error: "Password must be at least 6 characters" }

    const user = await db.user.findUnique({ where: { id: session.user.id } })
    if (!user || !user.password) return { error: "User not found" }

    const isValid = await compare(currentPassword, user.password)
    if (!isValid) return { error: "Current password is incorrect" }

    const hashed = await hash(newPassword, await genSalt(10))
    await db.user.update({
      where: { id: session.user.id },
      data: { password: hashed }
    })

    revalidatePath('/profile')
    return { success: true }
  } catch (err) {
    console.error(err)
    return { error: "Something went wrong" }
  }
}

// CSV Upload
export async function createUsersFromCSV(formData: FormData) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== 'ADMIN') {
      return { error: 'Unauthorized', status: 401 };
    }

    const file = formData.get('csvFile') as File;
    if (!file) {
      return { error: 'No file uploaded', status: 400 };
    }

    // Validasi file type
    if (!file.name.endsWith('.csv')) {
      return { error: 'Please upload a CSV file', status: 400 };
    }

    // Baca file CSV
    const text = await file.text();
    const lines = text.split('\n').filter(line => line.trim());
    
    if (lines.length < 2) {
      return { error: 'CSV file must contain at least a header and one data row', status: 400 };
    }

    // Parse header
    const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
    const requiredHeaders = ['name', 'email', 'password', 'role'];
    
    // Validasi headers
    for (const required of requiredHeaders) {
      if (!headers.includes(required)) {
        return { error: `Missing required column: ${required}`, status: 400 };
      }
    }

    const results = {
      success: 0,
      failed: 0,
      errors: [] as string[]
    };

    // Process setiap baris data
    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map(v => v.trim());
      
      if (values.length !== headers.length) {
        results.failed++;
        results.errors.push(`Row ${i + 1}: Invalid number of columns`);
        continue;
      }

      const userData: any = {};
      headers.forEach((header, index) => {
        userData[header] = values[index];
      });

      // Validasi data
      if (!userData.name || !userData.email || !userData.password || !userData.role) {
        results.failed++;
        results.errors.push(`Row ${i + 1}: Missing required fields`);
        continue;
      }

      // Validasi role
      if (!['ADMIN', 'BRAND', 'INFLUENCER'].includes(userData.role.toUpperCase())) {
        results.failed++;
        results.errors.push(`Row ${i + 1}: Invalid role "${userData.role}". Must be ADMIN, BRAND, or INFLUENCER`);
        continue;
      }

      // Validasi email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(userData.email)) {
        results.failed++;
        results.errors.push(`Row ${i + 1}: Invalid email format`);
        continue;
      }

      try {
        // Cek apakah email sudah ada
        const existingUser = await db.user.findUnique({
          where: { email: userData.email }
        });

        if (existingUser) {
          results.failed++;
          results.errors.push(`Row ${i + 1}: Email "${userData.email}" already exists`);
          continue;
        }

        // Hash password
        const salt = await genSalt(10);
        const hashedPassword = await hash(userData.password, salt);

        // Create user
        await db.user.create({
          data: {
            name: userData.name,
            email: userData.email,
            password: hashedPassword,
            role: userData.role.toUpperCase() as 'ADMIN' | 'BRAND' | 'INFLUENCER'
          }
        });

        results.success++;

      } catch (error) {
        results.failed++;
        results.errors.push(`Row ${i + 1}: Database error - ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }

    // Create audit log
    {/**
    await db.auditLog.create({
      data: {
        action: "BULK_USER_CREATE",
        message: `Admin ${session.user.email} uploaded CSV with ${results.success} users created, ${results.failed} failed`,
        userId: session.user.id,
      },
    });
     */}

    revalidatePath('/admin/users');

    return { 
      success: true, 
      results,
      message: `${results.success} users created successfully, ${results.failed} failed`
    };

  } catch (error) {
    console.error("Error processing CSV:", error);
    return { 
      error: "Failed to process CSV file", 
      status: 500 
    };
  }
}
