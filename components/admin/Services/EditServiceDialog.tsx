"use client"

import * as React from "react"
import { useRouter } from 'next/navigation'
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Service } from '@prisma/client'
import { getAllPlatform } from '@/lib/platform.actions'
import { updateService } from '@/lib/service.actions'

export type Platform = {
  id: string
  name: string
}

interface EditServiceDialogProps {
  isOpen: boolean
  onClose: () => void
  service: Service | null
}

const serviceTypes = [
  { value: "POST", label: "Post" },
  { value: "REELS", label: "Reels" },
  { value: "VIDEO", label: "Video" },
  { value: "STORY", label: "Story" },
  { value: "LIVE", label: "Live" },
  { value: "OTHER", label: "Lainnya" },
]

export function EditServiceDialog({ isOpen, onClose, service }: EditServiceDialogProps) {
  const router = useRouter()
  
  // Semua React Hook dipanggil di awal
  const [platforms, setPlatforms] = React.useState<Platform[]>([])
  const [loading, setLoading] = React.useState(true)
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const [errors, setErrors] = React.useState<{
    name?: string[]
    description?: string[]
    type?: string[]
    platformId?: string[]
    _form?: string[]
  }>({})

  // Form state dengan nilai default
  const [name, setName] = React.useState('')
  const [description, setDescription] = React.useState('')
  const [type, setType] = React.useState('POST')
  const [isActive, setIsActive] = React.useState(true)
  const [platformId, setPlatformId] = React.useState('')

  // Load platforms dan update form state saat dialog terbuka
  React.useEffect(() => {
    const loadPlatforms = async () => {
      const result = await getAllPlatform()
      if (result.success) {
        setPlatforms(result.data)
      }
      setLoading(false)
    }

    const initializeForm = () => {
      if (service) {
        setName(service.name)
        setDescription(service.description || '')
        setType(service.type)
        setIsActive(service.isActive)
        setPlatformId(service.platformId)
        setErrors({})
      }
    }

    if (isOpen) {
      setLoading(true)
      loadPlatforms()
      initializeForm()
    }
  }, [isOpen, service]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!service) return

    setIsSubmitting(true)
    setErrors({})

    const formData = new FormData()
    formData.append('name', name)
    formData.append('description', description)
    formData.append('type', type)
    formData.append('isActive', isActive.toString())
    formData.append('platformId', platformId)

    const result = await updateService(service.id, formData)
    setIsSubmitting(false)

    if (!result.success) {
      if (typeof result.error === 'string') {
        setErrors({ _form: [result.error] })
      } else {
        setErrors(result.error as any)
      }
      return
    }

    onClose()
    router.refresh()
  }

  // Pindahkan conditional check ke sini
  if (!service) return null

  if (loading && isOpen) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Edit Service</DialogTitle>
          </DialogHeader>
          <div className="flex justify-center py-10">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-600"></div>
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Edit Service</DialogTitle>
            <DialogDescription>
              Perbarui informasi service. Klik simpan setelah selesai.
            </DialogDescription>
          </DialogHeader>

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
                    {platforms.map((plat) => (
                      <SelectItem key={plat.id} value={plat.id}>
                        {plat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.platformId && (
                  <p className="text-red-600 text-sm mt-1">{errors.platformId[0]}</p>
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
                />
                {errors.name && (
                  <p className="text-red-600 text-sm mt-1">{errors.name[0]}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-4 items-start gap-4">
              <Label htmlFor="description" className="text-right">
                Deskripsi
              </Label>
              <div className="col-span-3">
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={4}
                />
                {errors.description && (
                  <p className="text-red-600 text-sm mt-1">{errors.description[0]}</p>
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
                    <SelectValue placeholder="Pilih tipe" />
                  </SelectTrigger>
                  <SelectContent>
                    {serviceTypes.map((st) => (
                      <SelectItem key={st.value} value={st.value}>
                        {st.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.type && (
                  <p className="text-red-600 text-sm mt-1">{errors.type[0]}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="isActive" className="text-right">
                Aktif
              </Label>
              <div className="col-span-3 flex items-center space-x-2">
                <Switch
                  id="isActive"
                  checked={isActive}
                  onCheckedChange={setIsActive}
                />
                <span>{isActive ? 'Ya' : 'Tidak'}</span>
              </div>
            </div>

            {errors._form && (
              <div className="col-span-full text-center text-red-600">{errors._form[0]}</div>
            )}
          </div>

          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="secondary">
                Batal
              </Button>
            </DialogClose>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Menyimpan...' : 'Simpan'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}