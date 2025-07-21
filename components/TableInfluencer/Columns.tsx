"use client"

import { ColumnDef } from "@tanstack/react-table"
import { Pencil, Trash2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Influencer } from "@/types/influencer"
import { Badge } from "../ui/badge"
import Link from "next/link"
// import { PlatformWithServices } from "@/types/platform"
// export type PlatformColumn = Platform

export const columns: ColumnDef<Influencer>[] = [
  {
    header: "No.",
    cell: ({ row }) => <p className="text-14-medium">{row.index + 1}</p>
  },
  {
    accessorKey: 'user.email',
    header: 'Email'
  },
  {
    header: "Category",
    cell: ({ row }) => {
      const categories = row.original.categories;

      return (
        <div className="flex flex-col gap-1">
          {/* Baris pertama (maksimal 3 kategori) */}
          <div className="flex flex-wrap gap-1">
            {categories.slice(0, 3).map((category) => (
              <Badge
                key={category.id}
                variant="secondary"
                className="bg-blue-100 text-blue-600 hover:bg-blue-200 dark:bg-blue-800 dark:text-blue-300"
              >
                {category.name}
              </Badge>
            ))}
          </div>

          {/* Baris kedua untuk kategori lebih dari 3 */}
          {categories.length > 3 && (
            <div className="flex flex-wrap gap-1">
              {categories.slice(3).map((category) => (
                <Badge
                  key={category.id}
                  variant="secondary"
                  className="bg-blue-100 text-blue-600 hover:bg-blue-200 dark:bg-blue-800 dark:text-blue-300"
                >
                  {category.name}
                </Badge>
              ))}
            </div>
          )}
        </div>
      );
    }
  },
  {
    header: 'Platform',
    cell: ({ row }) => {
      const platforms = row.original.platforms;

      return (
        <div className="flex flex-col gap-1">
          {/* Baris pertama (maksimal 3 kategori) */}
          <div className="flex flex-wrap gap-1">
            {platforms.slice(0, 3).map((platform) => (
              <Badge
                key={platform.id}
                variant="secondary"
                className="bg-red-100 text-red-600 hover:bg-red-200 dark:bg-red-800 dark:text-red-300"
              >
                {platform.name}
              </Badge>
            ))}
          </div>

          {/* Baris kedua untuk kategori lebih dari 3 */}
          {platforms.length > 3 && (
            <div className="flex flex-wrap gap-1">
              {platforms.slice(3).map((platform) => (
                <Badge
                  key={platform.id}
                  variant="secondary"
                  className="bg-blue-100 text-blue-600 hover:bg-blue-200 dark:bg-blue-800 dark:text-blue-300"
                >
                  {platform.name}
                </Badge>
              ))}
            </div>
          )}
        </div>
      );
    }
  },
  {
    accessorKey: 'user.role',
    header: 'Role'
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const influencer = row.original;
      return (
        <div className="flex gap-2">
          <Link href={`/admin/influencers/${influencer.id}`}>
            <Button variant="outline" size="sm">
              Detail
            </Button>
          </Link>
          <Button
            variant="outline"
            size="icon"
            onClick={() => {
              const event = new CustomEvent("edit-influencer", { detail: influencer });
              window.dispatchEvent(event);
            }}
          >
            <Pencil className="h-4 w-4" />
          </Button>
          <Button
            variant="destructive"
            size="icon"
            onClick={() => {
              const event = new CustomEvent("delete-influencer", {
                detail: influencer,
              })
              window.dispatchEvent(event)
            }}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      );
    },
  },
]