"use client"

import * as React from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Toaster, toast } from "sonner"
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"

import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog"
import { 
  Search, 
  SlidersHorizontal, 
  Download, 
  RefreshCw,
  Filter,
  Eye,
  Edit3,
  Trash2,
  MoreHorizontal,
  Calendar,
  TrendingUp,
  Activity
} from "lucide-react"
import { deleteCampaign, updateCampaign } from "@/lib/campaign.actions"
import { Label } from "@/components/ui/label"
import { useEffect } from "react"
import { Campaign } from "@prisma/client"

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
  onRefresh?: () => void
}

export function DataTable<TData, TValue>({
  columns,
  data,
  onRefresh
}: DataTableProps<TData, TValue>) {
  // Table state
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({})
  const [rowsPerPage, setRowsPerPage] = React.useState(10)
  const [isSearchFocused, setIsSearchFocused] = React.useState(false)
  const [isLoading, setIsLoading] = React.useState(false)

  // Modal state
  const [selectedCampaign, setSelectedCampaign] = React.useState<Campaign | null>(null)
  const [showEditModal, setShowEditModal] = React.useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = React.useState(false)

  // Form state
  const [editName, setEditName] = React.useState("")

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    onColumnFiltersChange: setColumnFilters,
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      pagination: {
        pageIndex: 0, // Start with page 0
        pageSize: rowsPerPage,
      },
    },
  })

  const handleUpdateCampaign = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedCampaign) return

    setIsLoading(true)
    try {
      await updateCampaign(selectedCampaign.id, {
        name: editName,
      })
      setShowEditModal(false)
      toast.success("Campaign updated successfully", {
        description: "Changes have been saved and applied."
      })
      if (onRefresh) onRefresh()
    } catch (error) {
      console.error("Failed to update campaign", error)
      toast.error("Failed to update campaign", {
        description: "Please try again or contact support if the issue persists."
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteCampaign = async () => {
    if (!selectedCampaign) return

    setIsLoading(true)
    try {
      await deleteCampaign(selectedCampaign.id)
      setShowDeleteConfirm(false)
      toast.success("Campaign deleted successfully", {
        description: "The campaign has been permanently removed."
      })
      if (onRefresh) onRefresh()
    } catch (error) {
      console.error("Failed to delete Campaign", error)
      toast.error("Failed to delete campaign", {
        description: "Please try again or contact support if the issue persists."
      })
    } finally {
      setIsLoading(false)
    }
  }

  const resetForm = () => {
    setEditName("")
  }

  const exportData = () => {
    const csvContent = table.getFilteredRowModel().rows
      .map(row => row.getVisibleCells().map(cell => 
        String(cell.getValue()).replace(/,/g, ';')
      ).join(','))
      .join('\n')
    
    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'campaigns.csv'
    link.click()
    window.URL.revokeObjectURL(url)
    
    toast.success("Data exported successfully")
  }

  useEffect(() => {
    // Edit
    const handleEdit = (e: Event) => {
      const customEvent = e as CustomEvent<Campaign>
      setSelectedCampaign(customEvent.detail)
      setEditName(customEvent.detail.name)
      setShowEditModal(true)
    }
    // Delete
    const handleDelete = (e: Event) => {
      const customEvent = e as CustomEvent<Campaign>
      setSelectedCampaign(customEvent.detail)
      setShowDeleteConfirm(true)
    }

    window.addEventListener("edit-campaign", handleEdit as EventListener)
    window.addEventListener("delete-campaign", handleDelete as EventListener)

    return () => {
      window.removeEventListener("edit-campaign", handleEdit as EventListener)
      window.removeEventListener("delete-campaign", handleDelete as EventListener)
    }
  }, [])

  const getStats = () => {
    const totalCampaigns = table.getFilteredRowModel().rows.length
    const activeCampaigns = table.getFilteredRowModel().rows.filter(row => 
      (row.original as any).status === 'ACTIVE'
    ).length
    const pendingCampaigns = table.getFilteredRowModel().rows.filter(row => 
      (row.original as any).status === 'PENDING'
    ).length

    return { totalCampaigns, activeCampaigns, pendingCampaigns }
  }

  const stats = getStats()

  return (
    <div className="space-y-6">
      <Toaster position="top-right" richColors />
      
      {/* Header with stats and controls */}
      <div className="bg-white rounded-lg border shadow-sm p-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          {/* Stats */}
          <div className="grid grid-cols-3 gap-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-50 rounded-lg">
                <Activity className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Total Campaigns</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalCampaigns}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-50 rounded-lg">
                <TrendingUp className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Active</p>
                <p className="text-2xl font-bold text-green-600">{stats.activeCampaigns}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-yellow-50 rounded-lg">
                <Calendar className="h-5 w-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Pending</p>
                <p className="text-2xl font-bold text-yellow-600">{stats.pendingCampaigns}</p>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3">
            {onRefresh && (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={onRefresh}
                className="gap-2"
              >
                <RefreshCw className="h-4 w-4" />
                Refresh
              </Button>
            )}
            <Button 
              variant="outline" 
              size="sm" 
              onClick={exportData}
              className="gap-2"
            >
              <Download className="h-4 w-4" />
              Export
            </Button>
          </div>
        </div>
      </div>

      {/* Search and filters */}
      <div className="bg-white rounded-lg border shadow-sm p-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 justify-between">
          <div className={`relative transition-all duration-300 ${isSearchFocused ? 'w-full sm:w-80' : 'w-full sm:w-64'}`}>
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search campaigns, brands, or status..."
              value={(table.getColumn("name")?.getFilterValue() as string) ?? ""}
              onChange={(event) =>
                table.getColumn("name")?.setFilterValue(event.target.value)
              }
              className="pl-10 pr-4 py-2.5 h-11 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all"
              onFocus={() => setIsSearchFocused(true)}
              onBlur={() => setIsSearchFocused(false)}
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="h-11 gap-2 border-gray-200">
                  <Filter className="h-4 w-4" />
                  <span className="hidden sm:inline">Filter</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem>All Status</DropdownMenuItem>
                <DropdownMenuItem>Active</DropdownMenuItem>
                <DropdownMenuItem>Pending</DropdownMenuItem>
                <DropdownMenuItem>Completed</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem>This Week</DropdownMenuItem>
                <DropdownMenuItem>This Month</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="h-11 gap-2 border-gray-200">
                  <SlidersHorizontal className="h-4 w-4" />
                  <span className="hidden sm:inline">View</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                {table
                  .getAllColumns()
                  .filter((column) => column.getCanHide())
                  .map((column) => {
                    return (
                      <DropdownMenuCheckboxItem
                        key={column.id}
                        className="capitalize"
                        checked={column.getIsVisible()}
                        onCheckedChange={(value) =>
                          column.toggleVisibility(!!value)
                        }
                      >
                        {column.id}
                      </DropdownMenuCheckboxItem>
                    )
                  })}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg border shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <div className="hidden md:block">
            <Table>
              <TableHeader>
                {table.getHeaderGroups().map((headerGroup) => (
                  <TableRow key={headerGroup.id} className="bg-gray-50/50 hover:bg-gray-50/50 border-b">
                    {headerGroup.headers.map((header) => {
                      return (
                        <TableHead key={header.id} className="font-semibold text-gray-900 h-14">
                          {header.isPlaceholder
                            ? null
                            : flexRender(
                              header.column.columnDef.header,
                              header.getContext()
                            )}
                        </TableHead>
                      )
                    })}
                  </TableRow>
                ))}
              </TableHeader>
              <TableBody>
                {table.getRowModel().rows?.length ? (
                  table.getRowModel().rows.map((row, index) => (
                    <TableRow
                      key={row.id}
                      data-state={row.getIsSelected() && "selected"}
                      className={`transition-all hover:bg-gray-50/50 ${
                        index % 2 === 0 ? 'bg-white' : 'bg-gray-50/20'
                      }`}
                    >
                      {row.getVisibleCells().map((cell) => (
                        <TableCell key={cell.id} className="py-4">
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={columns.length} className="h-48">
                      <div className="flex flex-col items-center justify-center text-gray-500 space-y-4">
                        <div className="rounded-full bg-gray-100 p-4">
                          <Search className="h-8 w-8 text-gray-400" />
                        </div>
                        <div className="text-center space-y-2">
                          <h3 className="text-lg font-medium text-gray-900">No campaigns found</h3>
                          <p className="text-sm text-gray-500 max-w-sm">
                            Try adjusting your search or filter criteria, or create a new campaign to get started.
                          </p>
                        </div>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          {/* Mobile View - Enhanced Cards */}
          <div className="md:hidden">
            {table.getRowModel().rows?.length ? (
              <div className="divide-y divide-gray-100">
                {table.getRowModel().rows.map((row) => (
                  <div key={row.id} className="p-6 space-y-4 hover:bg-gray-50/50 transition-colors">
                    {/* Campaign header with action menu */}
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-900 truncate">
                          {(row.original as any).name}
                        </h3>
                        <p className="text-sm text-gray-500 mt-1">
                          Brand: {(row.original as any)['brands.name'] || 'N/A'}
                        </p>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>
                            <Eye className="h-4 w-4 mr-2" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => {
                            const event = new CustomEvent("edit-campaign", { detail: row.original });
                            window.dispatchEvent(event);
                          }}>
                            <Edit3 className="h-4 w-4 mr-2" />
                            Edit Campaign
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem 
                            className="text-red-600"
                            onClick={() => {
                              const event = new CustomEvent("delete-campaign", { detail: row.original });
                              window.dispatchEvent(event);
                            }}
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                    
                    {/* Campaign details grid */}
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-500 block">Type</span>
                        <Badge variant="outline" className="mt-1">
                          {(row.original as any).type}
                        </Badge>
                      </div>
                      <div>
                        <span className="text-gray-500 block">Status</span>
                        <div className="mt-1">
                          {(() => {
                            // const statusColumn = table.getAllColumns().find(col => col.id === 'status')
                            const statusCell = row.getVisibleCells().find(cell => cell.column.id === 'status')
                            if (statusCell) {
                              return flexRender(statusCell.column.columnDef.cell, statusCell.getContext())
                            }
                            // Fallback if status column/cell not found
                            return <Badge variant="outline">{(row.original as any).status}</Badge>
                          })()}
                        </div>
                      </div>
                      <div className="col-span-2">
                        <span className="text-gray-500 block">Created</span>
                        <span className="text-gray-900 mt-1 block">
                          {new Date((row.original as any).createdAt).toLocaleDateString("id-ID", {
                            day: "2-digit",
                            month: "short", 
                            year: "numeric"
                          })}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-12 text-center">
                <div className="flex flex-col items-center justify-center text-gray-500 space-y-4">
                  <div className="rounded-full bg-gray-100 p-4">
                    <Search className="h-8 w-8 text-gray-400" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-lg font-medium text-gray-900">No campaigns found</h3>
                    <p className="text-sm text-gray-500">
                      Try adjusting your search or create a new campaign.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Enhanced Pagination */}
        <div className="border-t bg-gray-50/50">
          <div className="flex flex-col sm:flex-row items-center justify-between px-6 py-4 gap-4">
            <div className="flex items-center gap-6 text-sm text-gray-600 order-2 sm:order-1">
              <span>
                {table.getFilteredRowModel().rows.length === 0 
                  ? 'No campaigns'
                  : `Showing ${table.getState().pagination.pageIndex * table.getState().pagination.pageSize + 1} to ${
                      Math.min(
                        (table.getState().pagination.pageIndex + 1) * table.getState().pagination.pageSize,
                        table.getFilteredRowModel().rows.length
                      )
                    } of ${table.getFilteredRowModel().rows.length} campaigns`
                }
              </span>
            </div>
            
            <div className="flex items-center gap-4 order-1 sm:order-2">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-gray-700 hidden sm:inline">Rows per page</span>
                <select
                  className="h-9 w-20 rounded-md border border-gray-200 bg-white text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  value={table.getState().pagination.pageSize}
                  onChange={e => {
                    const value = Number(e.target.value)
                    setRowsPerPage(value)
                    table.setPageSize(value)
                  }}
                >
                  {[5, 10, 20, 30, 50, 100].map(pageSize => (
                    <option key={pageSize} value={pageSize}>
                      {pageSize}
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="flex items-center gap-1">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => table.setPageIndex(0)}
                  disabled={!table.getCanPreviousPage()}
                  className="h-9 w-9 p-0"
                >
                  «
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => table.previousPage()}
                  disabled={!table.getCanPreviousPage()}
                  className="h-9 w-9 p-0"
                >
                  ‹
                </Button>
                <div className="flex items-center gap-1 mx-2">
                  <span className="text-sm font-medium text-gray-700">
                    Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
                  </span>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => table.nextPage()}
                  disabled={!table.getCanNextPage()}
                  className="h-9 w-9 p-0"
                >
                  ›
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => table.setPageIndex(table.getPageCount() - 1)}
                  disabled={!table.getCanNextPage()}
                  className="h-9 w-9 p-0"
                >
                  »
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Edit Modal */}
      <Dialog
        open={showEditModal}
        onOpenChange={(open) => {
          setShowEditModal(open)
          if (!open) resetForm()
        }}
      >
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold">Edit Campaign</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleUpdateCampaign}>
            <div className="space-y-6 py-4">
              <div className="space-y-2">
                <Label htmlFor="edit-name" className="text-sm font-medium">Campaign Name</Label>
                <Input
                  id="edit-name"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  placeholder="Enter campaign name"
                  className="h-11"
                  required
                />
              </div>
            </div>
            <DialogFooter className="mt-6 flex flex-col sm:flex-row gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setShowEditModal(false)
                  resetForm()
                }}
                className="h-11"
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading} className="h-11">
                {isLoading && <RefreshCw className="mr-2 h-4 w-4 animate-spin" />}
                Save Changes
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Enhanced Delete Confirmation */}
      <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <AlertDialogContent className="sm:max-w-lg">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <div className="p-2 bg-red-100 rounded-full">
                <Trash2 className="h-5 w-5 text-red-600" />
              </div>
              Delete Campaign
            </AlertDialogTitle>
            <AlertDialogDescription className="text-base leading-relaxed">
              Are you sure you want to delete 
              <Badge variant="outline" className="mx-2 font-semibold">
                {selectedCampaign?.name}
              </Badge>
              ? This action cannot be undone and will permanently remove all associated data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-6 flex flex-col sm:flex-row gap-2">
            <AlertDialogCancel asChild>
              <Button variant="outline" className="h-11">Cancel</Button>
            </AlertDialogCancel>
            <AlertDialogAction asChild>
              <Button
                variant="destructive"
                onClick={handleDeleteCampaign}
                disabled={isLoading}
                className="h-11"
              >
                {isLoading && <RefreshCw className="mr-2 h-4 w-4 animate-spin" />}
                Delete Campaign
              </Button>
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}