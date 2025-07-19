import type { IconType } from 'react-icons'
import { 
  MdDashboard, 
  MdSettings, 
  MdCampaign, 
  MdReport, 
  MdHome, 
  MdPeople, 
  MdBusiness, 
  MdPerson, 
  MdCategory, 
  MdMiscellaneousServices
} from 'react-icons/md'

export interface NavigationItem {
  name: string
  path: string
  icon: IconType        // tipenya ikon React component dari react-icons
}

export const adminNavigationItems: NavigationItem[] = [
  {
    name: 'Dashboard',
    path: '/admin',
    icon: MdDashboard
  },
  {
    name: 'Manage User',
    path: '/admin/users',
    icon: MdPeople
  },
  {
    name: 'Brands',
    path: '/admin/brands',
    icon: MdBusiness
  },
  {
    name: 'Campaign',
    path: '/admin/campaigns',
    icon: MdCampaign
  },
  {
    name: 'Influencers',
    path: '/admin/influencers',
    icon: MdPerson
  },
  {
    name: 'Category',
    path: '/admin/categories',
    icon: MdCategory
  },
  {
    name: 'Platform',
    path: '/admin/platform',
    icon: MdHome
  },
  {
    name: 'Services Platform',
    path: '/admin/services',
    icon: MdMiscellaneousServices
  },
  {
    name: 'Audit Logs',
    path: '/admin/audit-log',
    icon: MdReport
  },
  {
    name: 'Reports',
    path: '/admin/reports',
    icon: MdReport
  },
  {
    name: 'Settings',
    path: '/admin/settings',
    icon: MdSettings
  },
]

export const brandNavigationItems: NavigationItem[] = [
  {
    name: 'Dashboard',
    path: '/brand',
    icon: MdDashboard
  },
  {
    name: 'Brands',
    path: '/brand/brands',
    icon: MdBusiness
  },
  {
    name: 'Campaign',
    path: '/brand/new-campaigns',
    icon: MdCampaign
  },
  {
    name: 'Reports',
    path: '/brand/reports',
    icon: MdReport
  },
  {
    name: 'Settings',
    path: '/brand/settings',
    icon: MdSettings
  },
]

export const kolNavigationItems: NavigationItem[] = [
  {
    name: 'Dashboard',
    path: '/kol',
    icon: MdDashboard
  },
  {
    name: 'Campaign',
    path: '/kol/campaigns',
    icon: MdCampaign
  },
  {
    name: 'Platform',
    path: '/kol/platform',
    icon: MdHome
  },
  {
    name: 'Reports',
    path: '/kol/reports',
    icon: MdReport
  },
  {
    name: 'Settings',
    path: '/kol/settings',
    icon: MdSettings
  }
]