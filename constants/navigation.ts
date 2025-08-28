import type { IconType } from 'react-icons'
import {
  MdDashboard,
  MdSettings,
  MdCampaign,
  MdReport,
  MdPeople,
  MdBusiness,
  MdPerson,
  MdCategory,
  MdMiscellaneousServices,
  MdDevices,
  MdList,
  MdAdd,
  MdNote,
} from 'react-icons/md'

export interface NavigationItem {
  name: string
  path?: string
  icon: IconType
  badge?: string | number
  children?: NavigationItem[]
}

export const adminNavigationItems: NavigationItem[] = [
  {
    name: 'Dashboard',
    path: '/admin',
    icon: MdDashboard,
  },
  {
    name: 'Manage User',
    path: '/admin/users',
    icon: MdPeople,
  },
  {
    name: 'Brands',
    path: '/admin/brands',
    icon: MdBusiness,
  },
  {
    name: 'Campaign',
    icon: MdCampaign,
    children: [
      {
        name: 'All Campaign',
        path: '/admin/campaigns',
        icon: MdList,
      },
      {
        name: 'Request Campaign',
        path: '/admin/campaigns/requests',
        icon: MdCampaign,
      },
    ],
  },
  {
    name: "Management MOU",
    path: '/admin/mou',
    icon: MdNote,
  },
  {
    name: 'Influencers',
    path: '/admin/influencers',
    icon: MdPerson,
  },
  {
    name: 'Category',
    path: '/admin/categories',
    icon: MdCategory,
  },
  {
    name: 'Platform',
    path: '/admin/platform',
    icon: MdDevices,
  },
  {
    name: 'Services Platform',
    path: '/admin/services',
    icon: MdMiscellaneousServices,
  },
  {
    name: 'Audit Logs',
    path: '/admin/audit-log',
    icon: MdReport,
  },
  {
    name: 'Reports Bug',
    path: '/admin/reports',
    icon: MdReport,
  },
  {
    name: 'Settings',
    path: '/admin/settings',
    icon: MdSettings,
  },
]

export const brandNavigationItems: NavigationItem[] = [
  {
    name: 'Dashboard',
    path: '/brand',
    icon: MdDashboard,
  },
  {
    name: 'Brands',
    path: '/brand/brands',
    icon: MdBusiness,
  },
  {
    name: 'Campaign',
    icon: MdCampaign,
    children: [
      {
        name: 'Table Campaigns',
        path: '/brand/campaigns',
        icon: MdList,
      },
      {
        name: 'Buat Campaign',
        path: '/brand/new-campaigns',
        icon: MdAdd,
      },
    ],
  },
  {
    name: "Management MOU",
    path: '/brand/mou',
    icon: MdNote,
  },
  {
    name: 'Reports Bug',
    path: '/brand/reports',
    icon: MdReport,
  },
  {
    name: 'Pengaturan',
    path: '/brand/profile',
    icon: MdSettings,
  },
]

export const kolNavigationItems: NavigationItem[] = [
  {
    name: 'Dashboard',
    path: '/kol',
    icon: MdDashboard,
  },
  {
    name: 'Campaign',
    path: '/kol/campaigns',
    icon: MdCampaign,
  },
  {
    name: "Management MOU",
    path: '/kol/mou',
    icon: MdNote,
  },
  {
    name: 'Platform',
    path: '/kol/platform',
    icon: MdDevices,
  },
  {
    name: 'Reports Bug',
    path: '/kol/reports',
    icon: MdReport,
  },
  {
    name: 'Settings',
    path: '/kol/profile',
    icon: MdSettings,
  },
]
