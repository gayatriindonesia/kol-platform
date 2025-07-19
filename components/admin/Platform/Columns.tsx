"use client"
import { ColumnDef } from "@tanstack/react-table"
import { ArrowUpDown, Pencil, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { PlatformWithServices } from "@/types/platform"

export const columns: ColumnDef<PlatformWithServices>[] = [
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
        id: 'services',
        header: 'Services',
        cell: ({ row }) => {
          const services = row.original.services;
          
          // Jika tidak ada services
          if (!services || services.length === 0) {
            return <span className="text-gray-500">-</span>;
          }
          
          return (
            <div className="flex flex-col gap-1">
              {/* Baris pertama (maksimal 3 services) */}
              <div className="flex flex-wrap gap-1">
                {services.slice(0, 3).map((service, index) => (
                  <Badge
                    key={service.id || index}
                    variant="secondary"
                    className="bg-green-100 text-green-600 hover:bg-green-200 dark:bg-green-800 dark:text-green-300"
                  >
                    {service.type}
                  </Badge>
                ))}
              </div>
              {/* Baris kedua untuk services lebih dari 3 */}
              {services.length > 3 && (
                <div className="flex flex-wrap gap-1">
                  {services.slice(3).map((service, index) => (
                    <Badge
                      key={service.id || index + 3}
                      variant="secondary"
                      className="bg-green-100 text-green-600 hover:bg-green-200 dark:bg-green-800 dark:text-green-300"
                    >
                      {service.type}
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          );
        }
      },
      {
        accessorKey: 'createdAt',
        header: 'Tanggal Buat',
        cell: ({ row }) =>
          new Date(row.original.createdAt).toLocaleDateString(),
      },
      {
        accessorKey: 'updatedAt',
        header: 'Tanggal Update',
        cell: ({ row }) =>
          new Date(row.original.updatedAt).toLocaleDateString(), // Fixed: should be updatedAt
      },
      {
        id: "actions",
        cell: ({ row }) => {
          const platform = row.original;
   
          return (
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={() => {
                  const event = new CustomEvent("edit-platform", { detail: platform });
                  window.dispatchEvent(event);
                }}
              >
                <Pencil className="h-4 w-4" />
              </Button>
              <Button
                variant="destructive"
                size="icon"
                onClick={() => {
                  const event = new CustomEvent("delete-platform", {
                    detail: platform,
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