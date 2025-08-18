<template>
  <v-container class="d-flex flex-column" max-width="1400px">
    <!-- Search & Filters Section -->
    <v-card class="mb-6" elevation="3">
      <v-card-title class="d-flex align-center">
        <v-icon class="mr-2">mdi-filter</v-icon>
        Search & Filter Firmware
      </v-card-title>
      <v-card-text class="pb-4">
        <v-row align="center">
          <v-col cols="12" md="5">
            <v-autocomplete
              v-model="selectedProductType"
              :items="filterOptions.state.value.products"
              :loading="filterOptions.isLoading.value"
              label="Product"
              placeholder="Select a product..."
              prepend-inner-icon="mdi-package-variant"
              variant="outlined"
              density="comfortable"
              hide-details
              clearable
              @keydown.enter="(e: KeyboardEvent) => selectedProductType = (e.target as HTMLInputElement).value"
            >
              <template #no-data>
                <v-list-item>
                  <v-list-item-title>Loading products...</v-list-item-title>
                </v-list-item>
              </template>
            </v-autocomplete>
          </v-col>

          <v-col cols="12" md="5">
            <div class="position-relative">
              <div
                class="position-absolute text-caption text-medium-emphasis"
                style="top: -20px; right: 0"
              >
                <v-icon size="small" class="mr-1">mdi-help-circle</v-icon>
                <router-link
                  to="/faq#platform-detection"
                  class="text-primary text-decoration-none"
                >
                  Need help finding your platform?
                </router-link>
              </div>
              <v-autocomplete
                v-model="selectedPlatform"
                :items="filterOptions.state.value.platforms"
                :loading="filterOptions.isLoading.value"
                label="Platform"
                placeholder="Select a platform..."
                prepend-inner-icon="mdi-chip"
                variant="outlined"
                density="comfortable"
                hide-details
                clearable
                @keydown.enter="(e: KeyboardEvent) => selectedPlatform = (e.target as HTMLInputElement).value"
              >
                <template #no-data>
                  <v-list-item>
                    <v-list-item-title>Loading platforms...</v-list-item-title>
                  </v-list-item>
                </template>
              </v-autocomplete>
            </div>
          </v-col>

          <v-col cols="12" md="2" class="d-flex justify-center">
            <v-btn
              color="error"
              variant="text"
              @click="clearFilters"
              :disabled="firmware.isLoading.value"
              icon="mdi-filter-remove"
              size="large"
            >
            </v-btn>
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>
    <!-- Results Section -->
    <v-alert
      v-if="firmware.error.value"
      type="error"
      class="mb-6"
      variant="tonal"
      dismissible
      @click:close="firmware.error.value = null"
    >
      <template #prepend>
        <v-icon>mdi-alert-circle</v-icon>
      </template>
      {{ firmware.error.value }}
    </v-alert>

    <!-- Loading State -->
    <v-card
      v-if="
        (firmware.isLoading.value || filterOptions.isLoading.value) &&
        firmware.state.value.length === 0
      "
      class="text-center py-12"
      elevation="2"
    >
      <v-progress-circular
        indeterminate
        size="64"
        color="primary"
        class="mb-4"
      ></v-progress-circular>
      <p class="text-h6 text-medium-emphasis">Loading firmware database...</p>
      <p class="text-body-2 text-disabled">This may take a few moments</p>
    </v-card>

    <!-- Results -->
    <template v-else>
      <!-- No Results State -->
      <v-card
        v-if="firmware.state.value.length === 0"
        class="text-center py-12"
        elevation="2"
      >
        <v-icon size="80" color="disabled" class="mb-4"
          >mdi-database-search</v-icon
        >
        <h3 class="text-h5 mb-2">No firmware found</h3>
        <p class="text-body-1 text-medium-emphasis mb-4">
          Try adjusting your search criteria or clearing all filters
        </p>
        <v-btn color="primary" variant="outlined" @click="clearFilters">
          <v-icon start>mdi-filter-remove</v-icon>
          Clear All Filters
        </v-btn>
      </v-card>

      <!-- Results Table -->
      <v-card v-else elevation="3" class="overflow-hidden">
        <v-card-title class="d-flex align-center justify-space-between">
          <div class="d-flex align-center">
            <v-icon class="mr-2">mdi-table</v-icon>
            Firmware Results
            <v-chip class="ml-2" size="small" color="primary">
              {{ firmware.state.value.length }} found
            </v-chip>
            <v-chip
              v-if="isShowingLatestFirmwareData"
              class="ml-2"
              size="small"
              color="info"
            >
              Showing latest versions only - apply filters for more
            </v-chip>
          </div>
          <div v-if="firmware.isLoading.value">
            <v-progress-circular
              indeterminate
              size="20"
              color="primary"
            ></v-progress-circular>
          </div>
        </v-card-title>

        <v-data-table
          :headers="tableHeaders"
          :items="firmware.state.value"
          :loading="firmware.isLoading.value"
          :items-per-page="100"
          :sort-by="sortBy ? [{ key: sortBy, order: sortOrder }] : []"
          @update:sort-by="handleSort"
          item-key="id"
          class="elevation-0"
          hover
          density="compact"
        >
          <template #item.product="{ item }">
            <v-chip
              color="primary"
              variant="outlined"
              size="small"
              @click="selectedProductType = item.product"
              class="cursor-pointer"
              :title="'Filter by product: ' + item.product"
            >
              {{ item.product }}
            </v-chip>
          </template>

          <template #item.platform="{ item }">
            <v-chip
              color="purple"
              variant="outlined"
              size="small"
              @click="selectedPlatform = item.platform"
              class="cursor-pointer"
              :title="'Filter by platform: ' + item.platform"
            >
              {{ item.platform }}
            </v-chip>
          </template>

          <template #item.version="{ item }">
            <span class="font-weight-medium">{{ item.version }}</span>
          </template>

          <template #item.channel="{ item }">
            <span
              class="font-weight-medium"
              :class="{
                'text-success': item.channel === 'release',
                'text-warning':
                  item.channel === 'beta' || item.channel === 'beta-public',
                'text-info': item.channel === 'alpha',
              }"
            >
              {{ getChannelDisplayName(item.channel) }}
            </span>
          </template>

          <template #item.file_size="{ item }">
            <span class="font-weight-medium">{{
              formatFileSize(item.file_size)
            }}</span>
          </template>

          <template #item.created="{ item }">
            <span class="font-weight-medium">{{
              formatDate(item.created)
            }}</span>
          </template>

          <template #item.actions="{ item }">
            <div class="d-flex ga-2">
              <v-btn
                color="success"
                variant="flat"
                size="small"
                prepend-icon="mdi-download"
                :href="firmwareService.getDownloadUrl(item)"
                tag="a"
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
      </v-card>
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
    if (!selectedProductType.value && !selectedPlatform.value) {
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

// Table headers
const tableHeaders: DataTableHeader[] = [
  { title: "Product", key: "product", sortable: true },
  { title: "Platform", key: "platform", sortable: true },
  { title: "Version", key: "version", sortable: true },
  {
    title: "Release Date",
    key: "created",
    sortable: true,
    value: (item: any) => formatDate(item.created),
    sortRaw: (a: any, b: any) =>
      new Date(a.created).getTime() - new Date(b.created).getTime(),
  },
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
  { title: "Actions", key: "actions", sortable: false, width: "200px" },
];

const clearFilters = () => {
  selectedProductType.value = null;
  selectedPlatform.value = null;
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

watch([selectedProductType, selectedPlatform], () => {
  debouncedExecute();
});

onMounted(async () => {
  await filterOptions.execute();
  await firmware.execute();
});
</script>
