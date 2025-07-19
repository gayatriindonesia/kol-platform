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
import { Check, ChevronsUpDown, Loader2, Search, SlidersHorizontal, X } from "lucide-react"
import { deleteInfluencer, updateInfluencer } from "@/lib/influencer.actions"
import { Label } from "@/components/ui/label"
import { useEffect } from "react"
import { Influencer } from "@/types/influencer"
import { Category } from "@/types/category"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { getAllCategories } from "@/lib/category.actions"
import { getAllPlatform } from "@/lib/platform.actions"
import { Platform } from "@prisma/client"

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
  const [selectedInfluencer, setSelectedInfluencer] = React.useState<Influencer | null>(null)
  const [showEditModal, setShowEditModal] = React.useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = React.useState(false)

  // Form state
  // const [editSocialLink, setEditSocialLink] = React.useState("")
  const [selectedCategories, setSelectedCategories] = React.useState<string[]>([])
  const [availableCategories, setAvailableCategories] = React.useState<Partial<Category>[]>([])
  const [availablePlatforms, setAvailablePlatforms] = React.useState<Platform[]>([])
  const [selectedPlatforms, setSelectedPlatforms] = React.useState<{
    platformId: string;
    username: string;
  }[]>([])
  const [platformCommandOpen, setPlatformCommandOpen] = React.useState(false)
  const [commandOpen, setCommandOpen] = React.useState(false)

  // Fetch dCategory
  const fetchCategories = async () => {
    try {
      const response = await getAllCategories();
      if (response.status === 200 && response.data) {
        setAvailableCategories(response.data);
      } else {
        toast.error("Failed to load categories");
      }
    } catch (error) {
      console.error("Error fetching categories:", error);
      toast.error("Failed to load categories");
    }
  };

  // Fetch Platforms
  const fetchPlatform = async () => {
    try {
      const response = await getAllPlatform();
      if (response.status === 200 && response.data) {
        setAvailablePlatforms(response.data);
        console.log("Platforms loaded:", response.data); // Debug log
      } else {
        toast.error("Failed to load platforms");
        console.error("API response error:", response); // Debug log
      }
    } catch (error) {
      console.error("Error fetching platforms:", error);
      toast.error("Failed to load platforms");
    }
  };

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

  const handleUpdateInfluencer = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedInfluencer) return

    setIsLoading(true)
    try {
      await updateInfluencer(selectedInfluencer.id, {
        categories: selectedCategories,
        platforms: selectedPlatforms
      })
      setShowEditModal(false)
      toast.success("Influencer updated successfully")
      setTimeout(() => location.reload(), 1000) // Ideally, refetch data instead of reloading
    } catch (error) {
      console.error("Failed to update Influencer", error)
      toast.error("Failed to update Influencer")
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteInfluencer = async () => {
    if (!selectedInfluencer) return

    setIsLoading(true)
    try {
      await deleteInfluencer(selectedInfluencer.id)
      setShowDeleteConfirm(false)
      toast.success("Influencer deleted successfully")
      setTimeout(() => location.reload(), 1000) // Ideally, refetch data instead of reloading
    } catch (error) {
      console.error("Failed to delete influencer", error)
      toast.error("Failed to delete influencer")
    } finally {
      setIsLoading(false)
    }
  }

  const resetForm = () => {
    // setEditSocialLink("")
    // setEditFollower("")
    setSelectedCategories([])
  }

  // handle delete category update
  const handleAddRemoveCategory = (categoryId: string) => {
    setSelectedCategories(current =>
      current.includes(categoryId)
        ? current.filter(id => id !== categoryId)
        : [...current, categoryId]
    );
  };

  //handle delete platform update
  const handleAddRemovePlatform = (platformId: string, username: string = "") => {
    setSelectedPlatforms(current =>
      current.some(p => p.platformId === platformId)
        ? current.filter(p => p.platformId !== platformId)
        : [...current, { platformId, username }]
    );
  };

  // Effect to fetch categories when component mounts
  useEffect(() => {
    fetchCategories();
    fetchPlatform();
  }, []);

  useEffect(() => {
    const handleEdit = (e: Event) => {
      const customEvent = e as CustomEvent<Influencer>
      setSelectedInfluencer(customEvent.detail)
      // setEditSocialLink(customEvent.detail.link_social) // attributtes link_social

      // Set selected categories if they exist
      if (customEvent.detail.categories) {
        setSelectedCategories(
          customEvent.detail.categories.map(cat => cat.id)
        );
      } else {
        setSelectedCategories([]);
      }

      // Set selected platforms if they exist
      if (customEvent.detail.platforms) {
        setSelectedPlatforms(
          customEvent.detail.platforms.map(platform => ({
            platformId: platform.id,
            username: platform.name || ""
          }))
        );
      } else {
        setSelectedPlatforms([]);
      }

      setShowEditModal(true)
    }

    const handleDelete = (e: Event) => {
      const customEvent = e as CustomEvent<Influencer>
      setSelectedInfluencer(customEvent.detail)
      setShowDeleteConfirm(true)
    }

    window.addEventListener("edit-influencer", handleEdit as EventListener)
    window.addEventListener("delete-influencer", handleDelete as EventListener)

    return () => {
      window.removeEventListener("edit-influencer", handleEdit as EventListener)
      window.removeEventListener("delete-influencer", handleDelete as EventListener)
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
            placeholder="Pencarian Influencer..."
            value={(table.getColumn("platforms.name")?.getFilterValue() as string) ?? ""}
            onChange={(event) =>
              table.getColumn("platforms.name")?.setFilterValue(event.target.value)
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
                        <p>No influencers found</p>
                        <p className="text-sm">Try changing your search or create a new influencer</p>
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
                  <p>No influencers found</p>
                  <p className="text-sm">Try changing your search or create a new influencer</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Pagination */}
        <div className="flex flex-col sm:flex-row items-center justify-between border-t p-4 gap-4">
          <div className="text-sm text-gray-500 order-2 sm:order-1">
            {table.getFilteredRowModel().rows.length}
            {table.getFilteredRowModel().rows.length === 1 ? ' influencer' : ' influencers'} found
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

      {/* Edit Influencer Modal */}
      <Dialog
        open={showEditModal}
        onOpenChange={(open) => {
          setShowEditModal(open)
          if (!open) resetForm()
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl">Edit Influencer</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleUpdateInfluencer}>
            <div className="space-y-4 py-2">
              <div className="space-y-2">
                <Label>Categories</Label>
                <Popover open={commandOpen} onOpenChange={setCommandOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={commandOpen}
                      className="w-full justify-between"
                    >
                      {selectedCategories.length > 0
                        ? `${selectedCategories.length} categories selected`
                        : "Select categories..."}
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-full p-0">
                    <Command>
                      <CommandInput placeholder="Search categories..." />
                      <CommandEmpty>No category found.</CommandEmpty>
                      <CommandGroup className="max-h-64 overflow-auto">
                        {availableCategories.map((category) => (
                          <CommandItem
                            key={category.id}
                            value={category.name}
                            onSelect={() => handleAddRemoveCategory(category.id!)}
                          >
                            <Check
                              className={cn(
                                "mr-2 h-4 w-4",
                                selectedCategories.includes(category.id!)
                                  ? "opacity-100"
                                  : "opacity-0"
                              )}
                            />
                            {category.name}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </Command>
                  </PopoverContent>
                </Popover>
                {selectedCategories.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {selectedCategories.map(categoryId => {
                      const category = availableCategories.find(c => c.id === categoryId);
                      return (
                        <Badge key={categoryId} variant="secondary" className="gap-1">
                          {category?.name || 'Category'}
                          <X
                            className="h-3 w-3 cursor-pointer"
                            onClick={() => handleAddRemoveCategory(categoryId)}
                          />
                        </Badge>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Platforms Selector */}
              <div className="space-y-2">
                <Label>Platforms</Label>
                <Popover open={platformCommandOpen} onOpenChange={setPlatformCommandOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={platformCommandOpen}
                      className="w-full justify-between"
                    >
                      {selectedPlatforms.length > 0
                        ? `${selectedPlatforms.length} platforms selected`
                        : "Select platforms..."}
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-full p-0">
                    <Command>
                      <CommandInput placeholder="Search platforms..." />
                      <CommandEmpty>No platform found.</CommandEmpty>
                      <CommandGroup className="max-h-64 overflow-auto">
                        {availablePlatforms.map((platform) => (
                          <CommandItem
                            key={platform.id}
                            value={platform.name}
                            onSelect={() => handleAddRemovePlatform(platform.id)}
                          >
                            <Check
                              className={cn(
                                "mr-2 h-4 w-4",
                                selectedPlatforms.some(p => p.platformId === platform.id)
                                  ? "opacity-100"
                                  : "opacity-0"
                              )}
                            />
                            {platform.name}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </Command>
                  </PopoverContent>
                </Popover>
                {selectedPlatforms.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {selectedPlatforms.map(platform => {
                      const platformInfo = availablePlatforms.find(p => p.id === platform.platformId);
                      return (
                        <Badge key={platform.platformId} variant="secondary" className="gap-1">
                          {platformInfo?.name || 'Platform'}
                          <X
                            className="h-3 w-3 cursor-pointer"
                            onClick={() => handleAddRemovePlatform(platform.platformId)}
                          />
                        </Badge>
                      );
                    })}
                  </div>
                )}
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
            <AlertDialogTitle>Confirm Delete</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete <Badge variant="outline" className="ml-1 font-semibold">{selectedInfluencer?.id}</Badge>?
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
                onClick={handleDeleteInfluencer}
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