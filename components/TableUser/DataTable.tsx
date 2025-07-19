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
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog"
import { AlertCircle, Download, FileText, Loader2, Plus, Search, SlidersHorizontal, Upload } from "lucide-react"
import { User } from "@prisma/client"
import { Label } from "@/components/ui/label"
import { createUser, createUsersFromCSV, deleteUser, updateUserWithFormData } from "@/lib/user.actions"
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
  const [showCreateModal, setShowCreateModal] = React.useState(false)
  const [selectedUser, setSelectedUser] = React.useState<Partial<User> | null>(null);
  const [showEditModal, setShowEditModal] = React.useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = React.useState(false)

  // Tambahkan state baru untuk CSV upload di dalam komponen DataTable
  const [showCSVModal, setShowCSVModal] = React.useState(false)
  const [csvFile, setCsvFile] = React.useState<File | null>(null)
  const [csvResults, setCsvResults] = React.useState<{
    success: number;
    failed: number;
    errors: string[];
  } | null>(null)

  // Tambahkan fungsi untuk handle CSV upload
  const handleCSVUpload = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!csvFile) return

    setIsLoading(true)
    const formData = new FormData()
    formData.append('csvFile', csvFile)

    try {
      const result = await createUsersFromCSV(formData)
      if ('error' in result) {
        toast.error(result.error)
      } else {
        setCsvResults(result.results)
        toast.success(result.message)
        setTimeout(() => location.reload(), 2000)
      }
    } catch (error) {
      console.error("Failed to upload CSV", error)
      toast.error("Failed to upload CSV")
    } finally {
      setIsLoading(false)
    }
  }

  const downloadCSVTemplate = () => {
    const template = `name,email,password,role
John Doe,john@example.com,password123,BRAND
Jane Smith,jane@example.com,password456,INFLUENCER
Admin User,admin@example.com,adminpass,ADMIN`

    const blob = new Blob([template], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'users_template.csv'
    a.click()
    window.URL.revokeObjectURL(url)
  }

  // Form state

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

  const handleDeleteUser = async () => {
    if (!selectedUser) return

    setIsLoading(true)
    try {
      await deleteUser(selectedUser.id ?? "")
      setShowDeleteConfirm(false)
      toast.success("User deleted successfully")
      setTimeout(() => location.reload(), 1000) // Ideally, refetch data instead of reloading
    } catch (error) {
      console.error("Failed to delete user", error)
      toast.error("Failed to delete user")
    } finally {
      setIsLoading(false)
    }
  }


  React.useEffect(() => {
    const handleEdit = (e: Event) => {
      const customEvent = e as CustomEvent<User>
      setSelectedUser(customEvent.detail)
      setShowEditModal(true)
    }

    const handleDelete = (e: Event) => {
      const customEvent = e as CustomEvent<User>
      setSelectedUser(customEvent.detail)
      setShowDeleteConfirm(true)
    }

    window.addEventListener("edit-user", handleEdit as EventListener)
    window.addEventListener("delete-user", handleDelete as EventListener)

    return () => {
      window.removeEventListener("edit-user", handleEdit as EventListener)
      window.removeEventListener("delete-user", handleDelete as EventListener)
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
            placeholder="Pencarian Users..."
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

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="default" size="sm" className="h-8 gap-1.5">
                <Plus className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Add Users</span>
                <span className="sm:hidden">Add</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem
                onClick={() => {
                  setShowCreateModal(true)
                }}
              >
                <Plus className="h-4 w-4 mr-2" />
                Create Single User
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => setShowCSVModal(true)}
              >
                <Upload className="h-4 w-4 mr-2" />
                Upload CSV
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={downloadCSVTemplate}
              >
                <Download className="h-4 w-4 mr-2" />
                Download Template
              </DropdownMenuItem>
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
                        <p>No user found</p>
                        <p className="text-sm">Try changing your search or create a new user</p>
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
                  <p>No user found</p>
                  <p className="text-sm">Try changing your search or create a new user</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Pagination */}
        <div className="flex flex-col sm:flex-row items-center justify-between border-t p-4 gap-4">
          <div className="text-sm text-gray-500 order-2 sm:order-1">
            {table.getFilteredRowModel().rows.length}
            {table.getFilteredRowModel().rows.length === 1 ? ' user' : ' users'} found
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

      {/* Create User Modal */}
      <Dialog
        open={showCreateModal}
        onOpenChange={(open) => {
          setShowCreateModal(open)
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl">Create User</DialogTitle>
          </DialogHeader>
          <form action={async (formData) => {
            const result = await createUser(formData)
            if ('error' in result) {
              toast.error(result.error)
            } else {
              toast.success("User created successfully")
              setShowCreateModal(false)
              setTimeout(() => location.reload(), 1000)
            }
          }}>
            <div className="space-y-4 py-2">
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input id="name" name="name" required />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" name="email" type="email" required />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input id="password" name="password" type="password" required />
              </div>

              <div className="space-y-2">
                <Label htmlFor="role">Role</Label>
                <select
                  id="role"
                  name="role"
                  className="w-full border rounded px-3 py-2 text-sm"
                  required
                >
                  <option value="">Pilih Role</option>
                  <option value="ADMIN">Admin</option>
                  <option value="BRAND">Brand</option>
                  <option value="INFLUENCER">Influencer</option>
                </select>
              </div>
            </div>
            <DialogFooter className="mt-4 flex flex-col sm:flex-row gap-2">
              <Button type="button" variant="outline" onClick={() => setShowCreateModal(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Create User
              </Button>
            </DialogFooter>
          </form>

        </DialogContent>
      </Dialog>

      {/** CSV Modal Upload */}
      <Dialog
        open={showCSVModal}
        onOpenChange={(open) => {
          setShowCSVModal(open)
          if (!open) {
            setCsvFile(null)
            setCsvResults(null)
          }
        }}
      >
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-xl">Upload Users CSV</DialogTitle>
          </DialogHeader>

          {!csvResults ? (
            <form onSubmit={handleCSVUpload}>
              <div className="space-y-4 py-2">
                <div className="space-y-2">
                  <Label htmlFor="csvFile">Select CSV File</Label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                    <input
                      id="csvFile"
                      type="file"
                      accept=".csv"
                      onChange={(e) => setCsvFile(e.target.files?.[0] || null)}
                      className="hidden"
                    />
                    <label
                      htmlFor="csvFile"
                      className="cursor-pointer flex flex-col items-center space-y-2"
                    >
                      <Upload className="h-8 w-8 text-gray-400" />
                      <div className="text-sm text-gray-600">
                        <span className="font-medium text-blue-600">Click to upload</span> or drag and drop
                      </div>
                      <div className="text-xs text-gray-500">CSV files only</div>
                    </label>
                  </div>
                  {csvFile && (
                    <div className="flex items-center space-x-2 p-2 bg-gray-50 rounded">
                      <FileText className="h-4 w-4 text-gray-500" />
                      <span className="text-sm text-gray-700">{csvFile.name}</span>
                    </div>
                  )}
                </div>

                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="flex items-start space-x-2">
                    <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
                    <div className="text-sm text-blue-800">
                      <p className="font-medium mb-1">CSV Format Requirements:</p>
                      <ul className="text-xs space-y-1 list-disc list-inside">
                        <li>Headers: name, email, password, role</li>
                        <li>Role must be: ADMIN, BRAND, or INFLUENCER</li>
                        <li>Email must be unique and valid format</li>
                        <li>Password minimum 6 characters</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>

              <DialogFooter className="mt-4 flex flex-col sm:flex-row gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowCSVModal(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={downloadCSVTemplate}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download Template
                </Button>
                <Button type="submit" disabled={!csvFile || isLoading}>
                  {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Upload CSV
                </Button>
              </DialogFooter>
            </form>
          ) : (
            <div className="space-y-4 py-2">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{csvResults.success}</div>
                <div className="text-sm text-gray-600">Users created successfully</div>
              </div>

              {csvResults.failed > 0 && (
                <div className="text-center">
                  <div className="text-2xl font-bold text-red-600">{csvResults.failed}</div>
                  <div className="text-sm text-gray-600">Failed to create</div>
                </div>
              )}

              {csvResults.errors.length > 0 && (
                <div className="bg-red-50 p-4 rounded-lg max-h-40 overflow-y-auto">
                  <div className="text-sm font-medium text-red-800 mb-2">Errors:</div>
                  <ul className="text-xs text-red-700 space-y-1">
                    {csvResults.errors.map((error, index) => (
                      <li key={index}>{error}</li>
                    ))}
                  </ul>
                </div>
              )}

              <DialogFooter>
                <Button onClick={() => setShowCSVModal(false)}>
                  Close
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Category Modal */}
      <Dialog
        open={showEditModal}
        onOpenChange={(open) => {
          setShowEditModal(open)
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl">Edit User</DialogTitle>
          </DialogHeader>
          <form
            action={async (formData) => {
              const result = await updateUserWithFormData(formData)
              if ("error" in result) {
                toast.error(result.error)
              } else {
                toast.success("User updated successfully")
                setShowEditModal(false)
                setTimeout(() => location.reload(), 1000)
              }
            }}
          >
            <input type="hidden" name="id" value={selectedUser?.id} />

            <div className="space-y-4 py-2">
              <div className="space-y-2">
                <Label htmlFor="edit-name">Name</Label>
                <Input
                  id="edit-name"
                  name="name"
                  defaultValue={selectedUser?.name ?? ""}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-email">Email</Label>
                <Input
                  id="edit-email"
                  name="email"
                  type="email"
                  defaultValue={selectedUser?.email ?? ""}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-password">Password</Label>
                <Input
                  id="edit-password"
                  name="password"
                  type="password"
                  placeholder="Leave blank to keep current"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-role">Role</Label>
                <select
                  id="edit-role"
                  name="role"
                  className="w-full border rounded px-3 py-2 text-sm"
                  defaultValue={selectedUser?.role ?? ""}
                  required
                >
                  <option value="ADMIN">Admin</option>
                  <option value="BRAND">Brand</option>
                  <option value="INFLUENCER">Influencer</option>
                </select>
              </div>
            </div>

            <DialogFooter className="mt-4 flex flex-col sm:flex-row gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setShowEditModal(false)
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
            <AlertDialogTitle>Confirm Delete</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete <Badge variant="outline" className="ml-1 font-semibold">{selectedUser?.name}</Badge>?
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-4 flex flex-col sm:flex-row gap-2">
            <AlertDialogCancel asChild>
              <Button variant="outline" className="mt-0">Cancel</Button>
            </AlertDialogCancel>
            <AlertDialogAction asChild>
              <Button
                variant="destructive"
                onClick={handleDeleteUser}
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