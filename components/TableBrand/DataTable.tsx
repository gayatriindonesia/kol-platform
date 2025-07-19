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
import { Loader2, Plus, Search, SlidersHorizontal } from "lucide-react"
import { createBrand, deleteBrand, updateBrand } from "@/lib/brand.actions"
import { Label } from "@/components/ui/label"
import { useEffect } from "react"
import { Brand } from "@/types/brand"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../ui/card"

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

  // Form state
  const [editName, setEditName] = React.useState("")
  const [selectedBrand, setSelectedBrand] = React.useState<Brand | null>(null)
  const [showEditModal, setShowEditModal] = React.useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = React.useState(false)

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

  const handleCreateBrand = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    
    try {
      await createBrand(editName)
      setEditName("")
      toast.success("Brand created successfully")
      setTimeout(() => location.reload(), 1000)
    } catch (error) {
      console.error("Failed to create brand", error)
      toast.error("Failed to create brand")
    } finally {
      setIsLoading(false)
    }
  }

  const handleUpdateBrand = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedBrand) return
    
    setIsLoading(true)
    try {
      await updateBrand(selectedBrand.id, {
        name: editName,
      })
      setShowEditModal(false)
      toast.success("Brand updated successfully")
      setTimeout(() => location.reload(), 1000)
    } catch (error) {
      console.error("Failed to update brand", error)
      toast.error("Failed to update brand")
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteBrand = async () => {
    if (!selectedBrand) return
    
    setIsLoading(true)
    try {
      await deleteBrand(selectedBrand.id)
      setShowDeleteConfirm(false)
      toast.success("Brand deleted successfully")
      setTimeout(() => location.reload(), 1000)
    } catch (error) {
      console.error("Failed to delete brand", error)
      toast.error("Failed to delete brand")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    const handleEdit = (e: Event) => {
      const customEvent = e as CustomEvent<Brand>
      setSelectedBrand(customEvent.detail)
      setEditName(customEvent.detail.name)
      setShowEditModal(true)
    }

    const handleDelete = (e: Event) => {
      const customEvent = e as CustomEvent<Brand>
      setSelectedBrand(customEvent.detail)
      setShowDeleteConfirm(true)
    }
    
    window.addEventListener("edit-brand", handleEdit as EventListener)
    window.addEventListener("delete-brand", handleDelete as EventListener)

    return () => {
      window.removeEventListener("edit-brand", handleEdit as EventListener)
      window.removeEventListener("delete-brand", handleDelete as EventListener)
    }
  }, [])

  return (
    <div className="space-y-4">
      <Toaster position="top-right" richColors />
      
      {/* Create Brand Form dalam Card */}
      <Card className="w-full max-w-[350px]">
        <CardHeader>
          <CardTitle>Buat Brand</CardTitle>
          <CardDescription>Tambahkan Brand Untuk Mengikuti Campaign</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleCreateBrand}>
            <div className="grid w-full items-center gap-4">
              <div className="flex flex-col space-y-1.5">
                <Label htmlFor="name">Brand Name</Label>
                <Input
                  id="name"
                  placeholder="Enter brand name"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  required
                />
              </div>
            </div>
          </form>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button 
            variant="outline" 
            onClick={() => setEditName("")}
          >
            Reset
          </Button>
          <Button 
            onClick={handleCreateBrand}
            disabled={isLoading}
          >
            {isLoading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Plus className="mr-2 h-4 w-4" />
            )}
            Tambah Brand
          </Button>
        </CardFooter>
      </Card>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 justify-between">
        <div className={`relative transition-all duration-200 ${isSearchFocused ? 'w-full sm:w-80' : 'w-full sm:w-64'}`}>
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search brands..."
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
                .map((column) => (
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
                ))}
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
                    {headerGroup.headers.map((header) => (
                      <TableHead key={header.id} className="font-semibold">
                        {flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                      </TableHead>
                    ))}
                  </TableRow>
                ))}
              </TableHeader>
              <TableBody>
                {table.getRowModel().rows?.length ? (
                  table.getRowModel().rows.map((row) => (
                    <TableRow
                      key={row.id}
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
                        <p>No brands found</p>
                        <p className="text-sm">Try changing your search or create a new brand</p>
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
                      const header = table
                        .getHeaderGroups()
                        .flatMap(headerGroup => headerGroup.headers)
                        .find(header => header.id === cell.column.id);
                        
                      return (
                        <div key={cell.id} className="grid grid-cols-2 gap-1">
                          <div className="font-medium text-gray-500">
                            {header ? flexRender(header.column.columnDef.header, header.getContext()) : cell.column.id}
                          </div>
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
                  <p>No brands found</p>
                  <p className="text-sm">Try changing your search or create a new brand</p>
                </div>
              </div>
            )}
          </div>
        </div>
        
        {/* Pagination */}
        <div className="flex flex-col sm:flex-row items-center justify-between border-t p-4 gap-4">
          <div className="text-sm text-gray-500 order-2 sm:order-1">
            {table.getFilteredRowModel().rows.length} 
            {table.getFilteredRowModel().rows.length === 1 ? ' brand' : ' brands'} found
          </div>
          <div className="flex items-center gap-4 order-1 sm:order-2">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium hidden sm:inline">Rows</span>
              <select
                className="h-8 w-16 rounded-md border border-gray-200 bg-white text-sm"
                value={rowsPerPage}
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
                <span className="sr-only">Previous</span>
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
                <span className="sr-only">Next</span>
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
          if (!open) setEditName("")
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl">Edit Brand</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleUpdateBrand}>
            <div className="space-y-4 py-2">
              <div className="space-y-2">
                <Label htmlFor="edit-name">Name</Label>
                <Input
                  id="edit-name"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  placeholder="Enter brand name"
                  required
                />
              </div>
            </div>
            <DialogFooter className="mt-4 flex flex-col sm:flex-row gap-2">
              <Button 
                type="button" 
                variant="outline"
                onClick={() => setShowEditModal(false)}
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
            <AlertDialogTitle>Confirm Delete</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete <Badge variant="outline" className="ml-1 font-semibold">{selectedBrand?.name}</Badge>? 
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-4 flex flex-col sm:flex-row gap-2">
            <AlertDialogCancel asChild>
              <Button variant="outline">Cancel</Button>
            </AlertDialogCancel>
            <AlertDialogAction asChild>
              <Button 
                variant="destructive" 
                onClick={handleDeleteBrand}
                disabled={isLoading}
              >
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Delete
              </Button>
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}