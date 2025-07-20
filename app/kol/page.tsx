import Link from 'next/link'
import { kolNavigationItems } from '@/constants/navigation'

export default function KolHomePage() {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Welcome to KOL Panel</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {kolNavigationItems.map((item) => {
          const Icon = item.icon
          if (!item.path) return null
          return(
          <Link 
            key={item.path} 
            href={item.path} 
            className="bg-white rounded-lg shadow hover:shadow-md transition-shadow p-6 flex items-center"
          >
            <div className="mr-4 text-3xl"><Icon size={18} className="mr-3" /></div>
            <div>
              <h2 className="font-medium text-lg">{item.name}</h2>
              <p className="text-gray-500">Manage {item.name.toLowerCase()}</p>
            </div>
          </Link>
          )
        })}
      </div>
      
      <div className="mt-10 bg-blue-50 border border-blue-100 rounded-lg p-6">
        <h2 className="font-medium text-lg mb-2">Quick Tips</h2>
        <ul className="list-disc pl-6 space-y-2 text-gray-600">
          <li>Use the sidebar for quick navigation between sections</li>
          <li>Check the dashboard for important statistics and recent activities</li>
          <li>Configure your profile and preferences in the settings page</li>
        </ul>
      </div>
    </div>
  )
}