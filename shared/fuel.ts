export interface FuelSite {
  SiteName: string;
  CityName?: string;
  RegionName?: string;
  NextFuelingPlan: string;
  lat: number;
  lng: number;
}

export interface FuelStats {
  totalSites: number;
  needFuelToday: number;
  tomorrow: number;
  afterTomorrow: number;
  overdue: number;
  lastUpdated: string;
}

export interface FuelApiResponse {
  success: boolean;
  data?: FuelSite[];
  stats?: FuelStats;
  error?: string;
  lastUpdated?: string;
}
