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
import { Loader2, Plus, Search, SlidersHorizontal, ChevronRight } from "lucide-react"
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
  const [searchValue, setSearchValue] = React.useState("")
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/50 p-4 sm:p-6">
      <div className="mx-auto max-w-7xl space-y-6">
        <Toaster position="top-right" richColors />
      
        {/* Header Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-900 via-blue-800 to-indigo-800 bg-clip-text text-transparent">
            Brand Management
          </h1>
          <p className="text-slate-600 mt-2">Manage your brands and campaigns efficiently</p>
        </div>

        {/* Create Brand Form */}
        <Card className="w-full max-w-md backdrop-blur-sm bg-white/80 shadow-xl border-0 ring-1 ring-slate-200/50">
          <CardHeader className="pb-4">
            <CardTitle className="text-xl font-semibold text-slate-900">Create New Brand</CardTitle>
            <CardDescription className="text-slate-600">Add a new brand to join campaigns</CardDescription>
          </CardHeader>
          <CardContent className="pb-4">
            <form onSubmit={handleCreateBrand}>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-sm font-medium text-slate-700">Brand Name</Label>
                  <Input
                    id="name"
                    placeholder="Enter brand name"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="h-11 border-slate-200 focus:border-blue-500 focus:ring-blue-500/20"
                    required
                  />
                </div>
              </div>
            </form>
          </CardContent>
          <CardFooter className="flex justify-between pt-4">
            <Button 
              variant="outline" 
              onClick={() => setEditName("")}
              className="border-slate-200 text-slate-600 hover:bg-slate-50"
            >
              Reset
            </Button>
            <Button 
              onClick={handleCreateBrand}
              disabled={isLoading}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 transform-gpu disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              {isLoading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Plus className="mr-2 h-4 w-4" />
              )}
              Add Brand
            </Button>
          </CardFooter>
        </Card>

        {/* Search and Filters */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 justify-between p-6 bg-white/60 backdrop-blur-sm rounded-xl border border-slate-200/50 shadow-sm">
          <div className={`relative transition-all duration-300 ${isSearchFocused ? 'w-full sm:w-96' : 'w-full sm:w-80'}`}>
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Search brands..."
              value={searchValue}
              onChange={(event) => {
                const value = event.target.value
                setSearchValue(value)
                table.getColumn("name")?.setFilterValue(value)
              }}
              className="pl-10 pr-10 h-11 w-full border-slate-200 focus:border-blue-500 focus:ring-blue-500/20 bg-white/80 transition-all duration-200"
              onFocus={() => setIsSearchFocused(true)}
              onBlur={() => setIsSearchFocused(false)}
            />
            {searchValue && (
              <button
                onClick={() => {
                  setSearchValue("")
                  table.getColumn("name")?.setFilterValue("")
                }}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors duration-200 p-1 rounded-full hover:bg-slate-100"
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
          
          <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="h-9 gap-2 border-slate-200 text-slate-600 hover:bg-slate-50">
                  <SlidersHorizontal className="h-4 w-4" />
                  <span className="hidden sm:inline">Columns</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48 bg-white/95 backdrop-blur-sm border-slate-200">
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
              <div className="divide-y divide-slate-200">
                {table.getRowModel().rows.map((row, index) => (
                  <div key={row.id} className={`p-6 space-y-4 transition-all duration-200 hover:bg-gradient-to-r hover:from-blue-50/50 hover:to-indigo-50/30 hover:shadow-sm ${
                    index % 2 === 0 ? 'bg-white/60' : 'bg-slate-50/30'
                  }`}>
                    {row.getVisibleCells().map((cell) => {
                      const header = table
                        .getHeaderGroups()
                        .flatMap(headerGroup => headerGroup.headers)
                        .find(header => header.id === cell.column.id);
                        
                      return (
                        <div key={cell.id} className="flex justify-between items-center py-2">
                          <div className="font-medium text-slate-600 text-sm">
                            {header ? flexRender(header.column.columnDef.header, header.getContext()) : cell.column.id}
                          </div>
                          <div className="text-slate-800 font-medium">{flexRender(cell.column.columnDef.cell, cell.getContext())}</div>
                        </div>
                      );
                    })}
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-12 text-center">
                <div className="flex flex-col items-center justify-center text-slate-500">
                  <div className="rounded-full bg-gradient-to-br from-slate-100 to-blue-100 p-4 mb-4">
                    <Search className="h-8 w-8 text-slate-400" />
                  </div>
                  <p className="text-lg font-medium mb-1">No brands found</p>
                  <p className="text-sm text-slate-400">Try changing your search or create a new brand</p>
                </div>
              </div>
            )}
          </div>
        </div>
        
        {/* Pagination */}
        <div className="flex flex-col sm:flex-row items-center justify-between border-t border-slate-200 bg-gradient-to-r from-slate-50/50 to-blue-50/30 p-6 gap-4">
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
                <ChevronRight className="h-4 w-4" />
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
          <DialogContent className="sm:max-w-md bg-white/95 backdrop-blur-sm border-0 ring-1 ring-slate-200">
            <DialogHeader>
              <DialogTitle className="text-xl font-semibold text-slate-900">Edit Brand</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleUpdateBrand}>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-name" className="text-sm font-medium text-slate-700">Brand Name</Label>
                  <Input
                    id="edit-name"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    placeholder="Enter brand name"
                    className="h-11 border-slate-200 focus:border-blue-500 focus:ring-blue-500/20"
                    required
                  />
                </div>
              </div>
              <DialogFooter className="mt-6 flex flex-col sm:flex-row gap-3">
                <Button 
                  type="button" 
                  variant="outline"
                  onClick={() => setShowEditModal(false)}
                  className="border-slate-200 text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={isLoading}
                  className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg"
                >
                  {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Save Changes
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation */}
        <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
          <AlertDialogContent className="bg-white/95 backdrop-blur-sm border-0 ring-1 ring-slate-200">
            <AlertDialogHeader>
              <AlertDialogTitle className="text-xl font-semibold text-slate-900">Confirm Delete</AlertDialogTitle>
              <AlertDialogDescription className="text-slate-600">
                Are you sure you want to delete <Badge variant="outline" className="ml-1 font-semibold border-red-200 text-red-700">{selectedBrand?.name}</Badge>? 
                This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter className="mt-6 flex flex-col sm:flex-row gap-3">
              <AlertDialogCancel asChild>
                <Button variant="outline" className="border-slate-200 text-slate-600 hover:bg-slate-50">Cancel</Button>
              </AlertDialogCancel>
              <AlertDialogAction asChild>
                <Button 
                  variant="destructive" 
                  onClick={handleDeleteBrand}
                  disabled={isLoading}
                  className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 shadow-lg"
                >
                  {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Delete Brand
                </Button>
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  )
}