'use client'

import React, { useState, useTransition } from 'react'
import { removeInfluencerCategory, updateInfluencerCategories } from '@/lib/category.actions'
import { Category, InfluencerCategory } from '@prisma/client'

interface CategoryManagerProps {
  categories: Category[]
  influencerCategories: (InfluencerCategory & { category: Category })[]
}

const CategoryManager: React.FC<CategoryManagerProps> = ({ 
  categories, 
  influencerCategories 
}) => {
  const [selectedCategories, setSelectedCategories] = useState<string[]>(
    influencerCategories.map(ic => ic.categoryId)
  )
  const [isUpdating, setIsUpdating] = useState(false)
  const [isPending, startTransition] = useTransition()

  const handleCategoryToggle = (categoryId: string) => {
    setSelectedCategories(prev => 
      prev.includes(categoryId)
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId]
    )
  }

  const handleUpdateCategories = () => {
    setIsUpdating(true)
    startTransition(async () => {
      try {
        const result = await updateInfluencerCategories(selectedCategories)
        if (result.error) {
          alert(result.error)
        } else {
          alert('Kategori berhasil diperbarui!')
        }
      } catch {
        alert('Gagal memperbarui kategori')
      } finally {
        setIsUpdating(false)
      }
    })
  }

  const handleQuickRemove = (categoryId: string) => {
    startTransition(async () => {
      try {
        const result = await removeInfluencerCategory(categoryId)
        if (result.error) {
          alert(result.error)
        } else {
          setSelectedCategories(prev => prev.filter(id => id !== categoryId))
        }
      } catch {
        alert('Gagal menghapus kategori')
      }
    })
  }

  const hasChanges = JSON.stringify(selectedCategories.sort()) !== 
                   JSON.stringify(influencerCategories.map(ic => ic.categoryId).sort())

  return (
    <div className="space-y-6">
      {/* Current Categories */}
      <div>
        <h3 className="text-lg font-semibold mb-3">Kategori Saat Ini</h3>
        {influencerCategories.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {influencerCategories.map(({ category }) => (
              <div
                key={category.id}
                className="flex items-center gap-2 bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm"
              >
                <span>{category.name}</span>
                <button
                  onClick={() => handleQuickRemove(category.id)}
                  disabled={isPending}
                  className="text-blue-600 hover:text-blue-800 disabled:opacity-50"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-sm">Belum ada kategori yang dipilih</p>
        )}
      </div>

      {/* Category Selection */}
      <div>
        <h3 className="text-lg font-semibold mb-3">Pilih Kategori</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {categories.map(category => {
            const isSelected = selectedCategories.includes(category.id)
            const isCurrentlyActive = influencerCategories.some(ic => ic.categoryId === category.id)
            
            return (
              <div
                key={category.id}
                className={`
                  relative border rounded-lg p-3 cursor-pointer transition-all
                  ${isSelected 
                    ? 'border-blue-500 bg-blue-50' 
                    : 'border-gray-200 hover:border-gray-300'
                  }
                  ${isPending ? 'opacity-50 cursor-not-allowed' : ''}
                `}
                onClick={() => !isPending && handleCategoryToggle(category.id)}
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">{category.name}</span>
                  <div className="flex items-center gap-1">
                    {isCurrentlyActive && (
                      <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                        Aktif
                      </span>
                    )}
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => {}}
                      className="w-4 h-4 text-blue-600"
                      disabled={isPending}
                    />
                  </div>
                </div>
                {category.description && (
                  <p className="text-xs text-gray-500 mt-1">{category.description}</p>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3">
        <button
          onClick={handleUpdateCategories}
          disabled={!hasChanges || isUpdating || isPending}
          className={`
            px-4 py-2 rounded-lg font-medium transition-colors
            ${hasChanges && !isUpdating && !isPending
              ? 'bg-blue-600 text-white hover:bg-blue-700'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }
          `}
        >
          {isUpdating ? 'Memperbarui...' : 'Perbarui Kategori'}
        </button>
        
        <button
          onClick={() => setSelectedCategories(influencerCategories.map(ic => ic.categoryId))}
          disabled={!hasChanges || isPending}
          className="px-4 py-2 border border-gray-300 rounded-lg font-medium hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Reset
        </button>
      </div>

      {/* Selected Count */}
      <div className="text-sm text-gray-600">
        {selectedCategories.length} kategori dipilih
        {hasChanges && (
          <span className="ml-2 text-orange-600">
            (ada perubahan yang belum disimpan)
          </span>
        )}
      </div>
    </div>
  )
}

export default CategoryManager