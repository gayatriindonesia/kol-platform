"use client";

import { AlertDialogFooter, AlertDialogHeader } from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { createService } from '@/lib/service.actions';
import { useRouter } from 'next/navigation';
import React, { useState } from 'react';

// Definisikan type untuk platform
type Platform = {
    id: string
    name: string
  }
  
  interface CreateServiceDialogProps {
    isOpen: boolean
    onClose: () => void
    platforms: Platform[]
  }

export function CreateServiceDialog({ isOpen, onClose, platforms }: CreateServiceDialogProps) {
    const router = useRouter()

    // Form state
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [type, setType] = useState('')
  const [isActive, setIsActive] = useState(true)
  const [platformId, setPlatformId] = useState('')
  
  // Loading and error states
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errors, setErrors] = useState<{
    name?: string[]
    description?: string[]
    type?: string[]
    platformId?: string[]
    _form?: string[]
  }>({})

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!platformId) {
      setErrors({ platformId: ['Platform harus dipilih'] })
      return
    }
    
    if (!name.trim()) {
      setErrors({ name: ['Nama service harus diisi'] })
      return
    }
    
    if (!type) {
      setErrors({ type: ['Tipe service harus dipilih'] })
      return
    }
    
    setIsSubmitting(true)
    setErrors({})

    const formData = new FormData()
    formData.append('name', name)
    formData.append('description', description)
    formData.append('type', type)
    formData.append('isActive', isActive.toString())
    formData.append('platformId', platformId)

    const result = await createService(formData)
    
    setIsSubmitting(false)

    if (!result.success) {
      // Handle errors
      if (typeof result.error === 'string') {
        setErrors({ _form: [result.error] })
      } else {
        setErrors(result.error as any)
      }
      return
    }

    // Success - close dialog and refresh
    resetForm()
    onClose()
    router.refresh()
  }

  const resetForm = () => {
    setName('')
    setDescription('')
    setType('')
    setIsActive(true)
    setPlatformId('')
    setErrors({})
  }

  const handleClose = () => {
    resetForm()
    onClose()
  }

  const serviceTypes = [
    { value: "POST", label: "Post" },
    { value: "REELS", label: "Reels" },
    { value: "VIDEO", label: "Video" },
    { value: "STORY", label: "Story" },
    { value: "LIVE", label: "Live" },
    { value: "OTHER", label: "Lainnya" },
  ]

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <form onSubmit={handleSubmit}>
          <AlertDialogHeader>
            <DialogTitle>Buat Service Baru</DialogTitle>
            <DialogDescription>
              Tambahkan service baru untuk platform. Klik simpan setelah selesai.
            </DialogDescription>
          </AlertDialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="platform" className="text-right">
                Platform
              </Label>
              <div className="col-span-3">
                <Select 
                  value={platformId} 
                  onValueChange={setPlatformId}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih platform" />
                  </SelectTrigger>
                  <SelectContent>
                    {platforms.length > 0 ? (
                      platforms.map((platform) => (
                        <SelectItem key={platform.id} value={platform.id}>
                          {platform.name}
                        </SelectItem>
                      ))
                    ) : (
                      <SelectItem value="none" disabled>
                        Tidak ada platform tersedia
                      </SelectItem>
                    )}
                  </SelectContent>
                </Select>
                {errors.platformId && (
                  <p className="mt-1 text-sm text-red-600">{errors.platformId[0]}</p>
                )}
              </div>
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Nama
              </Label>
              <div className="col-span-3">
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Nama service"
                />
                {errors.name && (
                  <p className="mt-1 text-sm text-red-600">{errors.name[0]}</p>
                )}
              </div>
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="type" className="text-right">
                Tipe
              </Label>
              <div className="col-span-3">
                <Select 
                  value={type} 
                  onValueChange={setType}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih tipe service" />
                  </SelectTrigger>
                  <SelectContent>
                    {serviceTypes.map((serviceType) => (
                      <SelectItem key={serviceType.value} value={serviceType.value}>
                        {serviceType.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.type && (
                  <p className="mt-1 text-sm text-red-600">{errors.type[0]}</p>
                )}
              </div>
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="description" className="text-right">
                Deskripsi
              </Label>
              <div className="col-span-3">
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Deskripsi service (opsional)"
                  className="min-h-24"
                />
                {errors.description && (
                  <p className="mt-1 text-sm text-red-600">{errors.description[0]}</p>
                )}
              </div>
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="isActive" className="text-right">
                Status
              </Label>
              <div className="flex items-center space-x-2 col-span-3">
                <Switch
                  id="isActive" 
                  checked={isActive} 
                  onCheckedChange={setIsActive} 
                />
                <Label htmlFor="isActive">Aktif</Label>
              </div>
            </div>
          </div>
          
          {errors._form && (
            <div className="rounded-md bg-red-50 p-3 mb-4">
              <p className="text-sm text-red-800">{errors._form[0]}</p>
            </div>
          )}
          
          <AlertDialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline">
                Batal
              </Button>
            </DialogClose>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Menyimpan...' : 'Simpan'}
            </Button>
          </AlertDialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
