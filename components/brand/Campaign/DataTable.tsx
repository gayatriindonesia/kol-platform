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
} from "@/components/ui/dropdown-menu"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog"
import { Loader2, Search, SlidersHorizontal } from "lucide-react"
import { deleteCampaign, updateCampaign } from "@/lib/campaign.actions"
import { Label } from "@/components/ui/label"
import { useEffect } from "react"
import { Campaign } from "@prisma/client"
// import { toast } from "sonner"

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
}

export function DataTable<TData, TValue>({
  columns,
  data,
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
        pageIndex: 0,
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
      toast.success("Campaign updated successfully")
      setTimeout(() => location.reload(), 1000) // Ideally, refetch data instead of reloading
    } catch (error) {
      console.error("Failed to update campaign", error)
      toast.error("Failed to update campaign")
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
      toast.success("Campaign deleted successfully")
      setTimeout(() => location.reload(), 1000) // Ideally, refetch data instead of reloading
    } catch (error) {
      console.error("Failed to delete Campaign", error)
      toast.error("Failed to delete Campaign")
    } finally {
      setIsLoading(false)
    }
  }

  const resetForm = () => {
    setEditName("")
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
    // Start
    const handleStartCampaign = (event: Event) => {
      const customEvent = event as CustomEvent<Campaign>;
      const campaign = customEvent.detail;
      console.log('Campaign Dimulai : ', campaign)
    }
    // Stop
    const handleStopCampaign = (event: Event) => {
      const customEvent = event as CustomEvent<Campaign>;
      const campaign = customEvent.detail;
      // Logika untuk stop campaign
      console.log('Campaign berhenti : ', campaign);
    };


    window.addEventListener("edit-campaign", handleEdit as EventListener)
    window.addEventListener("delete-campaign", handleDelete as EventListener)
    window.addEventListener('start-campaign', handleStartCampaign as EventListener);
    window.addEventListener('stop-campaign', handleStopCampaign as EventListener);

    return () => {
      window.removeEventListener("edit-campaign", handleEdit as EventListener)
      window.removeEventListener("delete-campaign", handleDelete as EventListener)
      window.removeEventListener('start-campaign', handleStartCampaign as EventListener);
      window.removeEventListener('stop-campaign', handleStopCampaign as EventListener);
    }
  }, [])

  return (
    <div className="space-y-4">
      <Toaster position="top-right" richColors />
      {/* Header with search and actions */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 justify-between">
        <div className={`relative transition-all duration-200 ${isSearchFocused ? 'w-full sm:w-80' : 'w-full sm:w-64'}`}>
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Pencarian Campaign..."
            value={(table.getColumn("name")?.getFilterValue() as string) ?? ""}
            onChange={(event) =>
              table.getColumn("name")?.setFilterValue(event.target.value)
            }
            className="pl-9 pr-4 py-2 h-10 w-full"
            onFocus={() => setIsSearchFocused(true)}
            onBlur={() => setIsSearchFocused(false)}
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="h-8 gap-1">
                <SlidersHorizontal className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">View</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-[180px]">
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

      {/* Table */}
      <div className="rounded-md border bg-white shadow-sm">
        <div className="overflow-auto">
          <div className="hidden md:block">
            <Table>
              <TableHeader>
                {table.getHeaderGroups().map((headerGroup) => (
                  <TableRow key={headerGroup.id} className="bg-gray-50 hover:bg-gray-50">
                    {headerGroup.headers.map((header) => {
                      return (
                        <TableHead key={header.id} className="font-semibold">
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
                  table.getRowModel().rows.map((row) => (
                    <TableRow
                      key={row.id}
                      data-state={row.getIsSelected() && "selected"}
                      className="transition-colors hover:bg-gray-50"
                    >
                      {row.getVisibleCells().map((cell) => (
                        <TableCell key={cell.id}>
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={columns.length} className="h-32 text-center">
                      <div className="flex flex-col items-center justify-center text-gray-500">
                        <div className="rounded-full bg-gray-100 p-3 mb-2">
                          <Search className="h-6 w-6" />
                        </div>
                        <p>No Campaign found</p>
                        <p className="text-sm">Try changing your search or create a new campaign</p>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          {/* Mobile View */}
          <div className="md:hidden">
            {table.getRowModel().rows?.length ? (
              <div className="divide-y">
                {table.getRowModel().rows.map((row) => (
                  <div key={row.id} className="p-4 space-y-3">
                    {row.getVisibleCells().map((cell) => {
                      // Get the header for this cell
                      const header = table
                        .getHeaderGroups()
                        .flatMap(headerGroup => headerGroup.headers)
                        .find(header => header.id === cell.column.id);

                      const headerContent = header ?
                        flexRender(header.column.columnDef.header, header.getContext()) :
                        cell.column.id;

                      return (
                        <div key={cell.id} className="grid grid-cols-2 gap-1">
                          <div className="font-medium text-gray-500">{headerContent}</div>
                          <div>{flexRender(cell.column.columnDef.cell, cell.getContext())}</div>
                        </div>
                      );
                    })}
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center">
                <div className="flex flex-col items-center justify-center text-gray-500">
                  <div className="rounded-full bg-gray-100 p-3 mb-2">
                    <Search className="h-6 w-6" />
                  </div>
                  <p>No Campaign found</p>
                  <p className="text-sm">Try changing your search or create a new campaign</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Pagination */}
        <div className="flex flex-col sm:flex-row items-center justify-between border-t p-4 gap-4">
          <div className="text-sm text-gray-500 order-2 sm:order-1">
            {table.getFilteredRowModel().rows.length}
            {table.getFilteredRowModel().rows.length === 1 ? ' campaign' : ' campaigns'} found
          </div>
          <div className="flex items-center gap-4 order-1 sm:order-2">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium hidden sm:inline">Rows</span>
              <select
                className="h-8 w-16 rounded-md border border-gray-200 bg-white text-sm"
                value={table.getState().pagination.pageSize}
                onChange={e => {
                  const value = Number(e.target.value)
                  setRowsPerPage(value)
                  table.setPageSize(value)
                }}
              >
                {[5, 10, 20, 30, 40, 50].map(pageSize => (
                  <option key={pageSize} value={pageSize}>
                    {pageSize}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex items-center justify-center text-sm font-medium">
              Page {table.getState().pagination.pageIndex + 1} of{" "}
              {table.getPageCount()}
            </div>
            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                size="sm"
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
                className="h-8 w-8 p-0"
              >
                <span className="sr-only">Go to previous page</span>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-4 w-4"
                >
                  <path d="m15 18-6-6 6-6" />
                </svg>
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
                className="h-8 w-8 p-0"
              >
                <span className="sr-only">Go to next page</span>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-4 w-4"
                >
                  <path d="m9 18 6-6-6-6" />
                </svg>
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Brand Modal */}
      <Dialog
        open={showEditModal}
        onOpenChange={(open) => {
          setShowEditModal(open)
          if (!open) resetForm()
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl">Edit Campaign</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleUpdateCampaign}>
            <div className="space-y-4 py-2">
              <div className="space-y-2">
                <Label htmlFor="edit-name">Name</Label>
                <Input
                  id="edit-name"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  placeholder="Enter campaign name"
                  required
                />
              </div>
            </div>
            <DialogFooter className="mt-4 flex flex-col sm:flex-row gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setShowEditModal(false)
                  resetForm()
                }}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Save Changes
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Campaign Dihapus</AlertDialogTitle>
            <AlertDialogDescription>
              Apakah anda yakin ingin menghapus <Badge variant="outline" className="ml-1 font-semibold">{selectedCampaign?.name}</Badge>?
              Tindakan ini tidak dapat dibatalkan.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-4 flex flex-col sm:flex-row gap-2">
            <AlertDialogCancel asChild>
              <Button variant="outline" className="mt-0">Batal</Button>
            </AlertDialogCancel>
            <AlertDialogAction asChild>
              <Button
                variant="destructive"
                onClick={handleDeleteCampaign}
                disabled={isLoading}
              >
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Hapus
              </Button>
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}