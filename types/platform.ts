export interface Service {
    id: string
    name: string
    type: string
  }
  
  export interface PlatformWithServices {
    id: string
    name: string
    createdAt: Date
    updatedAt: Date
    services: Service[]
  }

  export interface Platform {
    id: string;
    name: string;
    createdAt: Date;
    updatedAt: Date;
    username: string; // Add this property
  }
  