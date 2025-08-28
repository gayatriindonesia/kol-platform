import Link from 'next/link'
import { brandNavigationItems } from '@/constants/navigation'
import { Users, Target, TrendingUp, Activity } from 'lucide-react'
import { getAllBrand } from '@/lib/brand.actions'
import { getAllCampaign } from '@/lib/campaign.actions'
import BrandCampaignChart from '@/components/brand/BrandCampaignChart'

// Type definitions
interface Brand {
  id: string
  name: string
  createdAt?: Date
  created_at?: Date
  [key: string]: any
}

interface Campaign {
  id: string
  name: string
  status?: string
  createdAt?: Date
  created_at?: Date
  [key: string]: any
}

interface MonthlyData {
  month: string
  brands: number
  campaigns: number
}

interface CampaignStatus {
  active: number
  pending: number
  completed: number
  activePercentage: number
  pendingPercentage: number
  completedPercentage: number
}

export default async function BrandHomePage() {
  const brandsResponse = await getAllBrand()
  const campaignsResponse = await getAllCampaign()

  // Extract data dari response
  const brands: Brand[] = brandsResponse?.data || []
  const campaigns: Campaign[] = campaignsResponse?.data || []
  
  const brandsCount = brands.length
  const campaignsCount = campaigns.length

  // Fungsi untuk menghitung status campaign dinamis
  const calculateCampaignStatus = (): CampaignStatus => {
    if (campaigns.length === 0) {
      return {
        active: 0,
        pending: 0,
        completed: 0,
        activePercentage: 0,
        pendingPercentage: 0,
        completedPercentage: 0
      }
    }

    // Hitung berdasarkan status field yang ada di data campaign
    const statusCounts = campaigns.reduce((acc, campaign) => {
      const status = campaign.status?.toLowerCase() || 'pending'
      
      if (status === 'active' || status === 'running' || status === 'live') {
        acc.active++
      } else if (status === 'completed' || status === 'finished' || status === 'ended') {
        acc.completed++
      } else {
        acc.pending++
      }
      
      return acc
    }, { active: 0, pending: 0, completed: 0 })

    const total = campaigns.length
    return {
      ...statusCounts,
      activePercentage: Math.round((statusCounts.active / total) * 100),
      pendingPercentage: Math.round((statusCounts.pending / total) * 100),
      completedPercentage: Math.round((statusCounts.completed / total) * 100)
    }
  }

  // Fungsi untuk menghitung trend bulanan dinamis
  // Fungsi untuk menghitung trend bulanan dinamis - FIXED VERSION
const calculateMonthlyTrend = (): MonthlyData[] => {
  const currentDate = new Date()
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  
  // Generate 5 bulan terakhir
  const monthlyData: MonthlyData[] = []
  for (let i = 4; i >= 0; i--) {
    const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1)
    const monthName = monthNames[date.getMonth()]
    const year = date.getFullYear()
    
    // Filter brands dan campaigns berdasarkan bulan pembuatan
    const brandsInMonth = brands.filter(brand => {
      const brandDate = new Date(brand.createdAt || brand.created_at || '')
      return brandDate.getMonth() === date.getMonth() && brandDate.getFullYear() === year
    }).length

    const campaignsInMonth = campaigns.filter(campaign => {
      const campaignDate = new Date(campaign.createdAt || campaign.created_at || '')
      return campaignDate.getMonth() === date.getMonth() && campaignDate.getFullYear() === year
    }).length

    // FIXED: Only use fallback if we have actual data but no creation dates
    // If no data exists for that month, show 0 instead of artificial minimum
    let finalBrands = brandsInMonth
    let finalCampaigns = campaignsInMonth

    // Only use fallback distribution if:
    // 1. We have total brands/campaigns but no monthly data (missing createdAt)
    // 2. AND we're looking at recent months where data should exist
    const hasValidCreationDates = brands.some(b => b.createdAt || b.created_at) || 
                                 campaigns.some(c => c.createdAt || c.created_at)

    if (!hasValidCreationDates && (brandsCount > 0 || campaignsCount > 0)) {
      // Only use fallback if no creation dates exist at all
      // Remove Math.max(1, ...) to allow 0 values
      finalBrands = Math.floor(brandsCount * (0.6 + (4-i) * 0.1))
      finalCampaigns = Math.floor(campaignsCount * (0.6 + (4-i) * 0.1))
    }

    monthlyData.push({
      month: monthName,
      brands: finalBrands,
      campaigns: finalCampaigns
    })
  }

  return monthlyData
}

  // Fungsi untuk menghitung persentase pertumbuhan
  const calculateGrowthRate = (): number => {
    if (brands.length === 0 && campaigns.length === 0) return 0
    
    const currentDate = new Date()
    const lastMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1)
    const twoMonthsAgo = new Date(currentDate.getFullYear(), currentDate.getMonth() - 2, 1)
    
    // Hitung data bulan lalu dan 2 bulan lalu
    const lastMonthData = brands.filter(brand => {
      const brandDate = new Date(brand.createdAt || brand.created_at || '')
      return brandDate >= lastMonth && brandDate < currentDate
    }).length + campaigns.filter(campaign => {
      const campaignDate = new Date(campaign.createdAt || campaign.created_at || '')
      return campaignDate >= lastMonth && campaignDate < currentDate
    }).length

    const twoMonthsAgoData = brands.filter(brand => {
      const brandDate = new Date(brand.createdAt || brand.created_at || '')
      return brandDate >= twoMonthsAgo && brandDate < lastMonth
    }).length + campaigns.filter(campaign => {
      const campaignDate = new Date(campaign.createdAt || campaign.created_at || '')
      return campaignDate >= twoMonthsAgo && campaignDate < lastMonth
    }).length

    if (twoMonthsAgoData === 0) return lastMonthData > 0 ? 100 : 0
    
    const growthRate = Math.round(((lastMonthData - twoMonthsAgoData) / twoMonthsAgoData) * 100)
    return growthRate
  }

  const campaignStatus = calculateCampaignStatus()
  const monthlyTrendData = calculateMonthlyTrend()
  const growthRate = calculateGrowthRate()

  // Hitung perubahan dari bulan lalu untuk brands dan campaigns
  const calculateMonthlyChange = (data: MonthlyData[], type: 'brands' | 'campaigns'): number => {
    if (data.length < 2) return 0
    const current = data[data.length - 1][type]
    const previous = data[data.length - 2][type]
    if (previous === 0) return current > 0 ? 100 : 0
    return Math.round(((current - previous) / previous) * 100)
  }

  const brandChange = calculateMonthlyChange(monthlyTrendData, 'brands')
  const campaignChange = calculateMonthlyChange(monthlyTrendData, 'campaigns')

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6 lg:p-8">
      <div className="space-y-8">
        {/* Header */}
        <div className="text-center md:text-left">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
            Brand Dashboard
          </h1>
          <p className="text-gray-600 text-lg">
            Kelola brand dan campaign Anda dengan mudah
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {/* Total Brands Card */}
          <div className="bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 border border-gray-100">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Users className="h-5 w-5 text-blue-600" />
                  </div>
                  <h3 className="text-sm font-medium text-gray-600">
                    <Link href="/brand/brands">Total Brand</Link>
                  </h3>
                </div>
              </div>
              <div className="space-y-1">
                <div className="text-2xl font-bold text-gray-900">{brandsCount}</div>
                <p className={`text-xs ${brandChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {brandChange >= 0 ? '+' : ''}{brandChange}% dari bulan lalu
                </p>
              </div>
            </div>
          </div>

          {/* Total Campaigns Card */}
          <div className="bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 border border-gray-100">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <Target className="h-5 w-5 text-green-600" />
                  </div>
                  <h3 className="text-sm font-medium text-gray-600">
                    <Link href="/brand/campaigns">Total Campaigns</Link>
                  </h3>
                </div>
              </div>
              <div className="space-y-1">
                <div className="text-2xl font-bold text-gray-900">{campaignsCount}</div>
                <p className={`text-xs ${campaignChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {campaignChange >= 0 ? '+' : ''}{campaignChange}% dari bulan lalu
                </p>
              </div>
            </div>
          </div>

          {/* Active Campaigns Card */}
          <div className="bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 border border-gray-100">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <div className="p-2 bg-orange-100 rounded-lg">
                    <Activity className="h-5 w-5 text-orange-600" />
                  </div>
                  <h3 className="text-sm font-medium text-gray-600">
                    <Link href="/brand/campaigns">Campaign Aktif</Link>
                  </h3>
                </div>
              </div>
              <div className="space-y-1">
                <div className="text-2xl font-bold text-gray-900">{campaignStatus.active}</div>
                <p className="text-xs text-orange-600">{campaignStatus.activePercentage}% dari total campaign</p>
              </div>
            </div>
          </div>

          {/* Growth Rate Card */}
          <div className="bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 border border-gray-100">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <TrendingUp className="h-5 w-5 text-purple-600" />
                  </div>
                  <h3 className="text-sm font-medium text-gray-600">Tingkat Pertumbuhan</h3>
                </div>
              </div>
              <div className="space-y-1">
                <div className={`text-2xl font-bold ${growthRate >= 0 ? 'text-gray-900' : 'text-red-600'}`}>
                  {growthRate >= 0 ? '+' : ''}{growthRate}%
                </div>
                <p className="text-xs text-purple-600">Pertumbuhan bulanan</p>
              </div>
            </div>
          </div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Dynamic Recharts Bar Chart */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Tren Brands & Campaigns
              </h3>
              <p className="text-sm text-gray-600">
                Perbandingan jumlah brands dan campaigns dalam 5 bulan terakhir
              </p>
            </div>
            <BrandCampaignChart data={monthlyTrendData} />
          </div>

          {/* Dynamic Status Overview */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Status Campaign
              </h3>
              <p className="text-sm text-gray-600">
                Distribusi status campaign saat ini
              </p>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-4 h-4 bg-blue-500 rounded-full"></div>
                  <span className="font-medium text-gray-900">Campaign Aktif</span>
                </div>
                <div className="text-right">
                  <div className="font-bold text-gray-900">{campaignStatus.active}</div>
                  <div className="text-xs text-gray-500">{campaignStatus.activePercentage}%</div>
                </div>
              </div>
              
              <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-4 h-4 bg-green-500 rounded-full"></div>
                  <span className="font-medium text-gray-900">Campaign Pending</span>
                </div>
                <div className="text-right">
                  <div className="font-bold text-gray-900">{campaignStatus.pending}</div>
                  <div className="text-xs text-gray-500">{campaignStatus.pendingPercentage}%</div>
                </div>
              </div>
              
              <div className="flex items-center justify-between p-4 bg-yellow-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-4 h-4 bg-yellow-500 rounded-full"></div>
                  <span className="font-medium text-gray-900">Campaign Selesai</span>
                </div>
                <div className="text-right">
                  <div className="font-bold text-gray-900">{campaignStatus.completed}</div>
                  <div className="text-xs text-gray-500">{campaignStatus.completedPercentage}%</div>
                </div>
              </div>

              {/* Dynamic Visual Progress Bar */}
              <div className="mt-6">
                <div className="flex rounded-full overflow-hidden h-3">
                  <div 
                    className="bg-blue-500" 
                    style={{ width: `${campaignStatus.activePercentage}%` }}
                  ></div>
                  <div 
                    className="bg-green-500" 
                    style={{ width: `${campaignStatus.pendingPercentage}%` }}
                  ></div>
                  <div 
                    className="bg-yellow-500" 
                    style={{ width: `${campaignStatus.completedPercentage}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Grid */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Navigasi Cepat
            </h3>
            <p className="text-sm text-gray-600">
              Akses cepat ke fitur-fitur utama
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {brandNavigationItems.map((item) => {
              const Icon = item.icon
              // Add type guard to ensure path exists
              if (!item.path) return null
              
              return (
                <Link 
                  key={item.path} 
                  href={item.path} 
                  className="group block"
                >
                  <div className="h-full p-6 bg-gray-50 hover:bg-white border border-gray-200 hover:border-blue-200 rounded-xl transition-all duration-300 group-hover:scale-105 hover:shadow-md">
                    <div className="flex flex-col items-center text-center space-y-4">
                      <div className="p-3 bg-white group-hover:bg-blue-50 rounded-full transition-colors shadow-sm">
                        <Icon className="h-6 w-6 text-blue-600" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-1">
                          {item.name}
                        </h4>
                        <p className="text-sm text-gray-500">
                          Manage {item.name.toLowerCase()}
                        </p>
                      </div>
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        </div>

        {/* Quick Tips */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-6">
          <div className="mb-4">
            <h3 className="text-lg font-semibold text-blue-900 mb-2">
              💡 Tips Cepat
            </h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-start space-x-3">
              <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
              <p className="text-sm text-blue-800">
                Gunakan sidebar untuk navigasi cepat antar section
              </p>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
              <p className="text-sm text-blue-800">
                Cek dashboard untuk statistik dan aktivitas terbaru
              </p>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
              <p className="text-sm text-blue-800">
                Konfigurasi profil dan preferensi di halaman settings
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}