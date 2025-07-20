import { db } from "@/lib/db";

export const getUserByEmail = async (email: string) => {
    try {
        const user = await db.user.findUnique({
            where: {
                email
            }
        })
        return user;
    } catch (error) {
        return null;
    }
}

export const getUserById = async (id: string) => {
    try {
        const user = await db.user.findUnique({
            where: {
                id
            },
            select: {
                id: true,
                email: true,
                role: true,
                name: true,
                emailVerified: true,
            }
        });
        return user;
    } catch (error) {
        return null;
    }
}