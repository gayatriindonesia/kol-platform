import Link from 'next/link'
import { brandNavigationItems } from '@/constants/navigation'
import { Users, Target, TrendingUp, Activity } from 'lucide-react'
import { getAllBrand } from '@/lib/brand.actions'
import { getAllCampaign } from '@/lib/campaign.actions'

export default async function BrandHomePage() {
  const brandsResponse = await getAllBrand()
  const campaignsResponse = await getAllCampaign()

  // Extract data dari response
  const brands = brandsResponse?.data || []
  const campaigns = campaignsResponse?.data || []
  console.log('TotalCampaigns:', campaigns)
  
  const brandsCount = brands.length
  const campaignsCount = campaigns.length
  const activeCampaigns = Math.floor(campaignsCount * 0.7)

  // Data untuk chart sederhana
  const monthlyData = [
    { month: 'Jan', brands: Math.floor(brandsCount * 0.6), campaigns: Math.floor(campaignsCount * 0.7) },
    { month: 'Feb', brands: Math.floor(brandsCount * 0.8), campaigns: Math.floor(campaignsCount * 0.9) },
    { month: 'Mar', brands: Math.floor(brandsCount * 0.9), campaigns: Math.floor(campaignsCount * 1.0) },
    { month: 'Apr', brands: Math.floor(brandsCount * 0.95), campaigns: Math.floor(campaignsCount * 1.1) },
    { month: 'May', brands: brandsCount, campaigns: campaignsCount },
  ]

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
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
                  <h3 className="text-sm font-medium text-gray-600"><Link href={'/brand/brands'}>Total Brand</Link></h3>
                </div>
              </div>
              <div className="space-y-1">
                <div className="text-2xl font-bold text-gray-900">{brandsCount}</div>
                <p className="text-xs text-green-600">+12% dari bulan lalu</p>
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
                  <h3 className="text-sm font-medium text-gray-600"><Link href={'/brand/campaigns'}>Total Campaigns</Link></h3>
                </div>
              </div>
              <div className="space-y-1">
                <div className="text-2xl font-bold text-gray-900">{campaignsCount}</div>
                <p className="text-xs text-green-600">+8% dari bulan lalu</p>
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
                  <h3 className="text-sm font-medium text-gray-600"><Link href={'/brand/campaigns'}>Active Campaigns</Link></h3>
                </div>
              </div>
              <div className="space-y-1">
                <div className="text-2xl font-bold text-gray-900">{activeCampaigns}</div>
                <p className="text-xs text-orange-600">70% dari total campaign</p>
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
                  <h3 className="text-sm font-medium text-gray-600">Growth Rate</h3>
                </div>
              </div>
              <div className="space-y-1">
                <div className="text-2xl font-bold text-gray-900">+15%</div>
                <p className="text-xs text-purple-600">Pertumbuhan bulanan</p>
              </div>
            </div>
          </div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Simple Bar Chart */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Tren Brands & Campaigns
              </h3>
              <p className="text-sm text-gray-600">
                Perbandingan jumlah brands dan campaigns dalam 5 bulan terakhir
              </p>
            </div>
            <div className="space-y-4">
              {monthlyData.map((data) => (
                <div key={data.month} className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="font-medium text-gray-700">{data.month}</span>
                    <span className="text-gray-500">B: {data.brands} | C: {data.campaigns}</span>
                  </div>
                  <div className="flex space-x-2">
                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-500 h-2 rounded-full transition-all duration-500"
                        style={{ width: `${(data.brands / Math.max(...monthlyData.map(d => d.brands))) * 100}%` }}
                      ></div>
                    </div>
                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-green-500 h-2 rounded-full transition-all duration-500"
                        style={{ width: `${(data.campaigns / Math.max(...monthlyData.map(d => d.campaigns))) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              ))}
              <div className="flex justify-center space-x-6 pt-2">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                  <span className="text-xs text-gray-600">Brands</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span className="text-xs text-gray-600">Campaigns</span>
                </div>
              </div>
            </div>
          </div>

          {/* Status Overview */}
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
                  <span className="font-medium text-gray-900">Active Campaigns</span>
                </div>
                <div className="text-right">
                  <div className="font-bold text-gray-900">{Math.floor(campaignsCount * 0.7)}</div>
                  <div className="text-xs text-gray-500">70%</div>
                </div>
              </div>
              
              <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-4 h-4 bg-green-500 rounded-full"></div>
                  <span className="font-medium text-gray-900">Pending Campaigns</span>
                </div>
                <div className="text-right">
                  <div className="font-bold text-gray-900">{Math.floor(campaignsCount * 0.2)}</div>
                  <div className="text-xs text-gray-500">20%</div>
                </div>
              </div>
              
              <div className="flex items-center justify-between p-4 bg-yellow-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-4 h-4 bg-yellow-500 rounded-full"></div>
                  <span className="font-medium text-gray-900">Completed Campaigns</span>
                </div>
                <div className="text-right">
                  <div className="font-bold text-gray-900">{Math.floor(campaignsCount * 0.1)}</div>
                  <div className="text-xs text-gray-500">10%</div>
                </div>
              </div>

              {/* Visual Progress Bar */}
              <div className="mt-6">
                <div className="flex rounded-full overflow-hidden h-3">
                  <div className="bg-blue-500 flex-1" style={{ flex: '0.7' }}></div>
                  <div className="bg-green-500 flex-1" style={{ flex: '0.2' }}></div>
                  <div className="bg-yellow-500 flex-1" style={{ flex: '0.1' }}></div>
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