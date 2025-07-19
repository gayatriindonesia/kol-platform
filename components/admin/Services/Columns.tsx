"use client"

import { ColumnDef } from "@tanstack/react-table"
import { ArrowUpDown, MoreHorizontal, Pencil, Trash } from "lucide-react"

import { Service } from "@prisma/client"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { deleteServices, toggleServiceStatus } from "@/lib/service.actions"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { EditServiceDialog } from "./EditServiceDialog"
export type ServiceColumn = Service

export const columns: ColumnDef<ServiceColumn>[] = [
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
    accessorKey: "type",
    header: "Tipe",
    cell: ({ row }) => (
      <Badge variant="outline">{row.getValue("type")}</Badge>
    ),
  },
  {
    accessorKey: "isActive",
    header: "Status",
    cell: ({ row }) => {
      const isActive = row.getValue("isActive")
      
      return isActive ? (
        <Badge className="bg-green-100 text-green-800 hover:bg-green-200">
          Aktif
        </Badge>
      ) : (
        <Badge variant="outline" className="text-red-500 border-red-300">
          Nonaktif
        </Badge>
      )
    },
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
      new Date(row.original.createdAt).toLocaleDateString(),
  },
  {
    id: "actions",
    cell: function Cell({ row }) {
      const service = row.original
      const router = useRouter()
      const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
      
      const handleToggleStatus = async () => {
        await toggleServiceStatus(service.id)
        router.refresh()
      }
      
      const handleDelete = async () => {
        if (confirm(`Yakin ingin menghapus service "${service.name}"?`)) {
          await deleteServices(service.id)
          router.refresh()
        }
      }
      
      return (
        <>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Buka menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Aksi</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => setIsEditDialogOpen(true)}>
                <Pencil className="mr-2 h-4 w-4" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleToggleStatus}>
                {service.isActive ? "Nonaktifkan" : "Aktifkan"}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                onClick={handleDelete}
                className="text-red-600 focus:text-red-700"
              >
                <Trash className="mr-2 h-4 w-4" />
                Hapus
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          
          {/* Dialog untuk mengedit service */}
          <EditServiceDialog 
            isOpen={isEditDialogOpen} 
            onClose={() => setIsEditDialogOpen(false)} 
            service={service}
          />
        </>
      )
    },
  },
]