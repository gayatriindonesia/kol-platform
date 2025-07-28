"use client"

import { ColumnDef } from "@tanstack/react-table"
import { ArrowUpDown, Pencil, Trash2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Campaign } from "@prisma/client"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { FaEye } from "react-icons/fa"
// import { PlatformWithServices } from "@/types/platform"
// export type PlatformColumn = Platform

export const columns: ColumnDef<Campaign>[] = [
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
    accessorKey: 'brands.name',
    header: 'Nama Brand'
  },
  {
    accessorKey: "type",
    header: "Tipe Campaign",
    cell: ({ row }) => (
      <Badge variant="outline">{row.getValue("type")}</Badge>
    ),
  },
  {
    accessorKey: "createdAt",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="h-8 px-2 lg:px-3"
        >
          {/**
          <Calendar className="mr-2 h-4 w-4" />
           */}
          Created Date
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => {
      const date = new Date(row.getValue("createdAt"))
      return (
        <div className="flex flex-col">
          <div className="font-medium">
            {date.toLocaleDateString("id-ID", {
              day: "2-digit",
              month: "short",
              year: "numeric"
            })}
          </div>
          <div className="text-sm text-gray-500">
            {date.toLocaleTimeString("id-ID", {
              hour: "2-digit",
              minute: "2-digit"
            })}
          </div>
        </div>
      )
    },
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.getValue("status") as string;

      const statusColorMap: Record<string, string> = {
        PENDING: "bg-yellow-100 text-yellow-800",
        ACTIVE: "bg-green-100 text-green-800",
        REJECTED: "bg-red-100 text-red-800",
      };

      return (
        <span
          className={`px-2 py-1 rounded-full text-xs font-medium ${statusColorMap[status] || "bg-gray-100 text-gray-800"}`}
        >
          {status}
        </span>
      );
    },
  },
  {
    id: "actions",
    header: "Actions",
    cell: ({ row }) => {
      const campaign = row.original;
      return (
        <div className="flex gap-2">

          <Link href={`/brand/campaigns/${campaign.id}`}>
            <Button variant="outline" size="sm">
              <FaEye className="h-4 w-4" />
            </Button>
          </Link>
          {/* Edit Button */}
          <Button
            variant="outline"
            size="icon"
            onClick={() => {
              const event = new CustomEvent("edit-campaign", { detail: campaign });
              window.dispatchEvent(event);
            }}
            title="Edit Campaign"
          >
            <Pencil className="h-4 w-4" />
          </Button>

          {/* Delete Button */}
          <Button
            variant="destructive"
            size="icon"
            onClick={() => {
              const event = new CustomEvent("delete-campaign", {
                detail: campaign,
              })
              window.dispatchEvent(event)
            }}
            title="Hapus Campaign"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      );
    },
  },
]