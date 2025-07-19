import { Platform } from "@prisma/client";
import { Category } from "./category";

// types/index.ts (atau langsung di file yang pakai)
export type Influencer = {
    id: string;
    userId: string;
    createdAt: Date;
    updatedAt: Date;
    categories: Category[];
    platforms: Platform[];
  };
  