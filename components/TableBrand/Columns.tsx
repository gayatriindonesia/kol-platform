"use client"

import { ColumnDef } from "@tanstack/react-table"
import { ArrowUpDown, Pencil, Trash2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Brand } from "@/types/brand"
// import { PlatformWithServices } from "@/types/platform"
// export type PlatformColumn = Platform

export const columns: ColumnDef<Brand>[] = [
    {
        header: "No.",
        cell: ({ row }) => <p className="text-14-medium">{row.index + 1}</p>
    },
    {
        accessorKey: 'name',
        header: ({ column }) => {
          return (
            <Button
              variant="ghost"
              onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            >
              Name
              <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
          )
        },
      },
      {
        accessorKey: 'user.email',
        header: 'Email'
      },
      {
        id: "actions",
        cell: ({ row }) => {
          const brands = row.original;
    
          return (
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={() => {
                  const event = new CustomEvent("edit-brand", { detail: brands });
                  window.dispatchEvent(event);
                }}
              >
                <Pencil className="h-4 w-4" />
              </Button>
              <Button
                variant="destructive"
                size="icon"
                onClick={() => {
                  const event = new CustomEvent("delete-brand", {
                    detail: brands,
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