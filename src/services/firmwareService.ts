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

export interface FilterCondition {
  field: string;
  operator: "eq" | "ne" | "gt" | "gte" | "lt" | "lte" | "like" | "in";
  value: string;
}

class FirmwareService {
  private readonly baseUrl = "https://fw-update.ubnt.com/api";
  private readonly firmwareEndpoint = "/firmware";
  private readonly firmwareLatestEndpoint = "/firmware-latest";

  // In-memory cache
  private cache = new Map<string, any>();

  /**
   * Generate cache key from URL
   */
  private getCacheKey(url: string): string {
    return url;
  }

  /**
   * Get cached result or null if not cached
   */
  private getCached(key: string): any | null {
    return this.cache.get(key) || null;
  }

  /**
   * Store result in cache
   */
  private setCache(key: string, data: any): void {
    this.cache.set(key, data);
  }

  /**
   * Cached fetch wrapper
   */
  private async cachedFetch(url: string): Promise<any> {
    // Check cache first
    const cacheKey = this.getCacheKey(url);
    const cached = this.getCached(cacheKey);
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
    this.setCache(cacheKey, data);
    return data;
  }

  /**
   * Build filter query string from conditions
   */
  private buildFilterQuery(conditions: FilterCondition[]): string {
    return conditions
      .map(
        (condition) =>
          `filter=${condition.operator}~~${condition.field}~~${condition.value}`
      )
      .join("&");
  }

  /**
   * Build query parameters string
   */
  private buildQueryParams(params: Record<string, any>): string {
    const queryParams = new URLSearchParams();

    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        queryParams.append(key, value.toString());
      }
    });

    return queryParams.toString();
  }

  /**
   * Fetch firmware data with filters
   */
  async fetchFirmware(
    filters: FirmwareFilters = {},
    additionalConditions: FilterCondition[] = []
  ): Promise<FirmwareResponse> {
    try {
      const conditions: FilterCondition[] = [...additionalConditions];

      // Convert simple filters to filter conditions
      if (filters.product) {
        conditions.push({
          field: "product",
          operator: "eq",
          value: filters.product,
        });
      }
      if (filters.platform) {
        conditions.push({
          field: "platform",
          operator: "eq",
          value: filters.platform,
        });
      }
      if (filters.channel) {
        conditions.push({
          field: "channel",
          operator: "eq",
          value: filters.channel,
        });
      }

      const filterQuery = this.buildFilterQuery(conditions);
      const params = this.buildQueryParams({
        limit: filters.limit || 50,
        offset: filters.offset || 0,
        sort: filters.sort,
      });

      const queryString = [filterQuery, params].filter(Boolean).join("&");
      const url = `${this.baseUrl}${this.firmwareEndpoint}${
        queryString ? "?" + queryString : ""
      }`;

      return await this.cachedFetch(url);
    } catch (error) {
      console.error("Error fetching firmware:", error);
      throw error;
    }
  }

  /**
   * Fetch latest firmware versions
   */
  async fetchLatestFirmware(): Promise<FirmwareResponse> {
    try {
      const url = `${this.baseUrl}${this.firmwareLatestEndpoint}`;
      return await this.cachedFetch(url);
    } catch (error) {
      console.error("Error fetching latest firmware:", error);
      throw error;
    }
  }

  /**
   * Search firmware with text query (searches across multiple fields)
   */
  async searchFirmware(
    searchTerm: string,
    filters: FirmwareFilters = {}
  ): Promise<FirmwareResponse> {
    const conditions: FilterCondition[] = [];

    if (searchTerm.trim()) {
      // Search in product and platform fields
      conditions.push({
        field: "product",
        operator: "like",
        value: `*${searchTerm}*`,
      });
    }

    return this.fetchFirmware(filters, conditions);
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

      return {
        products: Array.from(products).toSorted((a: string, b: string) =>
          a.toLowerCase().localeCompare(b.toLowerCase())
        ),
        platforms: Array.from(platforms).toSorted((a: string, b: string) =>
          a.toLowerCase().localeCompare(b.toLowerCase())
        ),
        channels: Array.from(channels).toSorted((a: string, b: string) =>
          a.toLowerCase().localeCompare(b.toLowerCase())
        ),
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

      try {
        return await this.cachedFetch(url);
      } catch (error: any) {
        // Handle 404 specially
        if (error.message.includes("404")) {
          return null;
        }
        throw error;
      }
    } catch (error) {
      console.error("Error fetching firmware by ID:", error);
      throw error;
    }
  }

  /**
   * Format file size for display
   */
  formatFileSize(bytes: number): string {
    const sizes = ["B", "KB", "MB", "GB"];
    if (bytes === 0) return "0 B";
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    const size = (bytes / Math.pow(1024, i)).toFixed(1);
    return `${size} ${sizes[i]}`;
  }

  /**
   * Format date for display
   */
  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  }

  /**
   * Get download URL from firmware item
   */
  getDownloadUrl(firmware: FirmwareItem) {
    // The download URL is in the _links.data.href
    return firmware._links.data?.href;
  }

  /**
   * Determine if a channel is stable
   */
  isStableChannel(channel: string): boolean {
    return channel === "release";
  }

  /**
   * Get channel display name
   */
  getChannelDisplayName(channel: string): string {
    switch (channel) {
      case "release":
        return "Official";
      case "beta-public":
        return "Beta";
      case "beta":
        return "Beta";
      case "alpha":
        return "Alpha";
      default:
        return channel.charAt(0).toUpperCase() + channel.slice(1);
    }
  }
}

// Export singleton instance
export const firmwareService = new FirmwareService();
export default firmwareService;
