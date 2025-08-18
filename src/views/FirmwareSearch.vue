<template>
  <v-container class="gr-4 d-flex flex-column" max-width="1200px">
    <!-- Filters Toolbar -->
    <v-card>
      <v-card-text>
        <v-row align="start">
          <v-col cols="12" sm="6" md="4">
            <v-autocomplete
              v-model="selectedProductType"
              :items="filterOptions.state.value.products"
              :loading="filterOptions.isLoading.value"
              label="Product Type"
              placeholder="All Products"
              persistent-placeholder
              persistent-clear
              variant="outlined"
              density="compact"
              hide-details
              clearable
              @keydown.enter="(e: KeyboardEvent) => selectedProductType = (e.target as HTMLInputElement).value"
            ></v-autocomplete>
          </v-col>

          <v-col cols="12" sm="6" md="4">
            <v-autocomplete
              v-model="selectedPlatform"
              :items="filterOptions.state.value.platforms"
              :loading="filterOptions.isLoading.value"
              label="Platform"
              placeholder="All Platforms"
              persistent-placeholder
              persistent-clear
              variant="outlined"
              density="compact"
              hide-details
              clearable
              @keydown.enter="(e: KeyboardEvent) => selectedPlatform = (e.target as HTMLInputElement).value"
            ></v-autocomplete>
            <div class="text-caption mt-1">
              <router-link
                to="/faq#platform-detection"
                class="text-primary text-decoration-none"
              >
                Need help finding your platform?
              </router-link>
            </div>
          </v-col>

          <v-col cols="12" sm="6" md="3">
            <v-select
              v-model="selectedReleaseDate"
              :items="releaseDates"
              label="Release Date"
              variant="outlined"
              density="compact"
              hide-details
            ></v-select>
          </v-col>

          <v-col cols="12" sm="6" md="1">
            <v-btn
              color="error"
              variant="outlined"
              @click="clearFilters"
              :disabled="firmware.isLoading.value"
              block
            >
              Clear
            </v-btn>
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>

    <!-- Results Section -->
    <v-alert
      v-if="firmware.error.value"
      type="error"
      class="mb-4"
      dismissible
      @click:close="firmware.error.value = null"
    >
      {{ firmware.error.value }}
    </v-alert>

    <v-alert
      v-if="isShowingLatestFirmwareData"
      type="info"
      variant="tonal"
      elevation="1"
    >
      Showing latest firmware versions. Apply filters to see more results or
      older versions.
    </v-alert>

    <div
      v-if="
        (firmware.isLoading.value || filterOptions.isLoading.value) &&
        firmware.state.value.length === 0
      "
      class="text-center py-8"
    >
      <v-progress-circular
        indeterminate
        size="64"
        color="primary"
      ></v-progress-circular>
      <p class="text-h6 mt-4">Loading firmware...</p>
    </div>

    <template v-else>
      <v-alert
        v-if="firmware.state.value.length === 0"
        type="info"
        class="mt-4"
      >
        No firmware found matching your criteria.
      </v-alert>

      <v-data-table
        v-else
        :headers="tableHeaders"
        :items="firmware.state.value"
        :loading="firmware.isLoading.value"
        :items-per-page="100"
        :sort-by="sortBy ? [{ key: sortBy, order: sortOrder }] : []"
        @update:sort-by="handleSort"
        item-key="id"
        class="elevation-2 rounded"
      >
        <template #item.product="{ item }">
          <span
            class="text-primary cursor-pointer text-decoration-underline"
            @click="selectedProductType = item.product"
            :title="'Filter by product: ' + item.product"
          >
            {{ item.product }}
          </span>
        </template>

        <template #item.platform="{ item }">
          <span
            class="text-primary cursor-pointer text-decoration-underline"
            @click="selectedPlatform = item.platform"
            :title="'Filter by platform: ' + item.platform"
          >
            {{ item.platform }}
          </span>
        </template>

        <template #item.channel="{ item }">
          <v-chip
            :color="item.channel === 'release' ? 'success' : 'warning'"
            size="small"
          >
            {{ getChannelDisplayName(item.channel) }}
          </v-chip>
        </template>

        <template #item.actions="{ item }">
          <div class="d-flex">
            <v-btn
              color="success"
              variant="outlined"
              size="small"
              prepend-icon="mdi-download"
              :href="firmwareService.getDownloadUrl(item)"
              tag="a"
              class="mr-2"
            >
              Download
            </v-btn>
            <v-btn
              color="primary"
              variant="outlined"
              size="small"
              prepend-icon="mdi-information"
              :to="`/firmware/${item.id}`"
            >
              Details
            </v-btn>
          </div>
        </template>
      </v-data-table>
    </template>
  </v-container>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, computed } from "vue";
import firmwareService, { type FirmwareItem } from "@/firmwareService";
import {
  formatFileSize,
  formatDate,
  getChannelDisplayName,
} from "@/formatters";
import { useRouteQuery } from "@vueuse/router";
import { useAsyncState, useDebounceFn } from "@vueuse/core";
import type { DataTableHeader } from "vuetify";

// Reactive data
const selectedProductType = useRouteQuery<string | null>("product", null);
const selectedPlatform = useRouteQuery<string | null>("platform", null);
const selectedReleaseDate = useRouteQuery<string | null>("date", "All Time");

// Sort state synced with URL
const sortBy = useRouteQuery<string>("sortBy", "created");
const sortOrder = useRouteQuery<"asc" | "desc">("sortOrder", "desc");

// Load filter options using useAsyncState
const filterOptions = useAsyncState(
  async () => {
    const filterValues = await firmwareService.getInitialFilterValues();
    return {
      products: filterValues.products,
      platforms: filterValues.platforms,
    };
  },
  { products: [], platforms: [] },
  {
    resetOnExecute: false,
    immediate: false,
  }
);

const firmware = useAsyncState(
  async () => {
    // Check if any filters are applied
    let response;
    if (
      !selectedProductType.value &&
      !selectedPlatform.value &&
      selectedReleaseDate.value === "All Time"
    ) {
      // No filters applied - use firmware-latest
      response = await firmwareService.fetchLatestFirmware();

      // Manually sort by created date descending since firmware-latest doesn't sort
      const sortedFirmware = response._embedded.firmware.sort(
        (a, b) => new Date(b.created).getTime() - new Date(a.created).getTime()
      );

      isShowingLatestFirmwareData.value = true;
      return sortedFirmware;
    } else {
      // Build filters for regular firmware search
      const filters: any = {
        limit: 10000,
      };

      // Map UI selections to API values
      if (selectedProductType.value) {
        filters.product = selectedProductType.value;
      }

      if (selectedPlatform.value) {
        filters.platform = selectedPlatform.value;
      }

      response = await firmwareService.fetchFirmware(filters);
      isShowingLatestFirmwareData.value = false;
      return response._embedded.firmware;
    }
  },
  [],
  {
    resetOnExecute: false,
    immediate: false,
  }
);

// Firmware loading state
const isShowingLatestFirmwareData = ref(false);

const releaseDates = [
  "All Time",
  "Last 30 Days",
  "Last 90 Days",
  "Last 6 Months",
  "Last Year",
];

// Table headers
const tableHeaders: DataTableHeader[] = [
  { title: "Product", key: "product", sortable: true },
  { title: "Platform", key: "platform", sortable: true },
  { title: "Version", key: "version", sortable: true },
  {
    title: "Type",
    key: "channel",
    sortable: true,
    value: (item: any) => getChannelDisplayName(item.channel),
  },
  {
    title: "Size",
    key: "file_size",
    sortable: true,
    value: (item: any) => formatFileSize(item.file_size),
    sortRaw: (a: any, b: any) => a.file_size - b.file_size,
  },
  {
    title: "Release Date",
    key: "created",
    sortable: true,
    value: (item: any) => formatDate(item.created),
    sortRaw: (a: any, b: any) =>
      new Date(a.created).getTime() - new Date(b.created).getTime(),
  },
  { title: "Actions", key: "actions", sortable: false, width: "200px" },
];

const clearFilters = () => {
  selectedProductType.value = null;
  selectedPlatform.value = null;
  selectedReleaseDate.value = "All Time";
  sortBy.value = "created";
  sortOrder.value = "desc";
};

const handleSort = (
  sortByArray: Array<{ key: string; order: "asc" | "desc" }>
) => {
  if (sortByArray.length === 0) {
    // No sort applied - clear sort state
    sortBy.value = "";
    sortOrder.value = "asc";
  } else {
    const sort = sortByArray[0];
    sortBy.value = sort.key;
    sortOrder.value = sort.order;
  }
};

// Create debounced version of firmware.execute
const debouncedExecute = useDebounceFn(() => {
  firmware.execute();
}, 300);

watch([selectedProductType, selectedPlatform, selectedReleaseDate], () => {
  debouncedExecute();
});

onMounted(async () => {
  await filterOptions.execute();
  await firmware.execute();
});
</script>
