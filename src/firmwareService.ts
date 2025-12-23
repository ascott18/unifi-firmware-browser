// Types for the UniFi firmware API
export interface FirmwareItem {
  id: string;
  channel: "release" | "beta-public" | "beta" | "alpha";
  created: string;
  updated: string;
  file_size: number;
  md5: string;
  sha256_checksum: string;
  platform: string;
  product: string;
  version: string;
  version_major: number;
  version_minor: number;
  version_patch: number;
  version_prerelease?: string;
  probability_computed: number;
  tags?: {
    fullVersion?: string;
    [key: string]: any;
  };
  _links: {
    self: {
      href: string;
    };
    data: {
      href: string;
    };
    upload?: Array<{
      name: string;
      href: string;
    }>;
  };
}

export interface FirmwareResponse {
  _embedded: {
    firmware: FirmwareItem[];
  };
  _links?: {
    self: {
      href: string;
    };
    next?: {
      href: string;
    };
    prev?: {
      href: string;
    };
  };
  page?: {
    size: number;
    totalElements: number;
    totalPages: number;
    number: number;
  };
}

export interface FirmwareFilters {
  product?: string;
  platform?: string;
  channel?: string;
  version?: string;
  limit?: number;
  offset?: number;
  sort?: string; // e.g., '-created' for desc, 'created' for asc
}

// Platform to model mapping
export const PLATFORM_PRODUCTS: Record<string, string[]> = {
  a5s: ["UVC Bullet", "UVC Dome", "UVC Micro", "UVC Pro"],
  cv22: ["AI DSLR"],
  cv2x: ["AI 360", "AI Bullet", "AI Pro", "AI Theta"],
  s2l: ["G3 Bullet", "G3 Dome", "G3 Flex", "G3 Pro"],
  s2lb: ["Vision Go"],
  s2lm: ["Vision Go", "G3 Micro"],
  s5l: [
    "G4 Bullet",
    "G4 Dome",
    "G4 Doorbell",
    "G4 Doorbell Pro",
    "G4 Doorbell Pro PoE",
    "G4 Pro",
    "G4 PTZ",
  ],
  sav530q: [
    "G4 Instant",
    "G5 Bullet",
    "G5 Dome",
    "G5 Flex",
    "G5 Pro",
    "G5 PTZ",
    "G5 Turret Ultra",
  ],
  sav532q: ["G3 Instant"],
  sav539g: ["G6 Instant"],
  sav539gp: ["G6 PTZ"],
  sav837gw: [
    "G4 Instant",
    "G5 Bullet",
    "G5 Dome",
    "G5 Flex",
    "G5 Pro",
    "G5 PTZ",
    "G5 Turret Ultra",
  ],
};

class FirmwareService {
  private readonly baseUrl = "https://fw-update.ubnt.com/api";
  private readonly firmwareEndpoint = "/firmware";
  private readonly firmwareLatestEndpoint = "/firmware-latest";

  // In-memory cache
  private cache = new Map<string, any>();

  /**
   * Cached fetch wrapper
   */
  private async cachedFetch(url: string): Promise<any> {
    // Check cache first
    const cached = this.cache.get(url);
    if (cached) {
      return cached;
    }

    // Fetch and cache
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(
        `Failed to fetch: ${response.status} ${response.statusText}`
      );
    }

    const data = await response.json();
    this.cache.set(url, data);
    return data;
  }

  /**
   * Fetch firmware data with filters
   */
  async fetchFirmware(
    filters: FirmwareFilters = {}
  ): Promise<FirmwareResponse> {
    const params = new URLSearchParams();

    // Add basic parameters
    params.append("limit", (filters.limit || 50).toString());
    params.append("offset", (filters.offset || 0).toString());
    if (filters.sort) {
      params.append("sort", filters.sort);
    }

    // Add filters
    if (filters.product) {
      params.append("filter", `eq~~product~~${filters.product}`);
    }
    if (filters.platform) {
      params.append("filter", `eq~~platform~~${filters.platform}`);
    }
    if (filters.channel) {
      params.append("filter", `eq~~channel~~${filters.channel}`);
    }

    const url = `${this.baseUrl}${this.firmwareEndpoint}?${params.toString()}`;
    return await this.cachedFetch(url);
  }

  /**
   * Fetch latest firmware versions
   */
  async fetchLatestFirmware(): Promise<FirmwareResponse> {
    const url = `${this.baseUrl}${this.firmwareLatestEndpoint}`;
    return await this.cachedFetch(url);
  }

  /**
   * Get all initial filter values in a single call for efficiency
   */
  async getInitialFilterValues(): Promise<{
    products: string[];
    platforms: string[];
    channels: string[];
  }> {
    try {
      // Single call to firmware-latest (no limit needed - returns latest of each)
      const response = await this.fetchLatestFirmware();
      const firmware = response._embedded.firmware;

      const products = new Set(firmware.map((fw) => fw.product));
      const platforms = new Set(firmware.map((fw) => fw.platform));
      const channels = new Set(firmware.map((fw) => fw.channel));

      const sortAlphabetically = (a: string, b: string) =>
        a.toLowerCase().localeCompare(b.toLowerCase());

      return {
        products: Array.from(products).toSorted(sortAlphabetically),
        platforms: Array.from(platforms).toSorted(sortAlphabetically),
        channels: Array.from(channels).toSorted(sortAlphabetically),
      };
    } catch (error) {
      console.error("Error fetching initial filter values:", error);
      return {
        products: [],
        platforms: [],
        channels: [],
      };
    }
  }

  /**
   * Get firmware by ID
   */
  async getFirmwareById(id: string): Promise<FirmwareItem | null> {
    try {
      const url = `${this.baseUrl}${this.firmwareEndpoint}/${id}`;
      return await this.cachedFetch(url);
    } catch (error: any) {
      // Handle 404 specially - return null for not found
      if (error.message.includes("404")) {
        return null;
      }
      throw error;
    }
  }

  /**
   * Get download URL from firmware item
   */
  getDownloadUrl(firmware: FirmwareItem): string {
    return firmware._links.data?.href;
  }
}

// Export singleton instance
export const firmwareService = new FirmwareService();
export default firmwareService;
