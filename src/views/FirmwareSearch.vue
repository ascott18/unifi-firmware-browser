<template>
  <v-container max-width="1600px">
    <v-card class="overflow-visible">
      <v-row no-gutters>
        <!-- Filters Sidebar -->
        <v-col cols="12" md="3" lg="3">
          <FirmwareFilters
            ref="filtersRef"
            :products="filterOptions.state.value.products"
            :platforms="filterOptions.state.value.platforms"
            v-model:selected-products="selectedProducts"
            v-model:selected-platforms="selectedPlatforms"
            v-model:selected-channels="selectedChannels"
            :loading="filterOptions.isLoading.value"
            :disabled="firmware.isLoading.value"
            @clear="clearFilters"
          />
        </v-col>
        <v-divider :vertical="$vuetify.display.mdAndUp"></v-divider>

        <!-- Main Content -->
        <v-col cols="12" md="9" lg="9">
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
          <div
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
            <p class="text-h6 text-medium-emphasis">
              Loading firmware database...
            </p>
            <p class="text-body-2 text-disabled">This may take a few moments</p>
          </div>

          <!-- Results -->
          <template v-else>
            <!-- No Results State -->
            <div
              v-if="firmware.state.value.length === 0"
              class="text-center py-12"
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
            </div>

            <!-- Results Table -->
            <div v-else>
              <v-card-title class="d-flex align-center justify-space-between">
                <div class="d-flex align-center">
                  <v-icon class="mr-2">mdi-table</v-icon>
                  Firmware Results ({{ firmware.state.value.length }})
                  <v-chip
                    v-if="isShowingLatestFirmwareData"
                    class="ml-2"
                    size="small"
                    variant="elevated"
                    color="primary"
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
                hover
                density="compact"
              >
                <template #item.product="{ item }">
                  <v-chip
                    color="primary"
                    variant="outlined"
                    size="small"
                    @click="toggleFilter('product', item.product)"
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
                    @click="toggleFilter('platform', item.platform)"
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
                        item.channel === 'beta' ||
                        item.channel === 'beta-public',
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
                      variant="outlined"
                      size="x-small"
                      color="primary"
                      prepend-icon="mdi-information"
                      :to="`/firmware/${item.id}`"
                    >
                      Details
                    </v-btn>
                    <v-btn
                      variant="outlined"
                      size="x-small"
                      prepend-icon="mdi-download"
                      :href="firmwareService.getDownloadUrl(item)"
                      tag="a"
                    >
                      Download
                    </v-btn>
                  </div>
                </template>
              </v-data-table>
            </div>
          </template>
        </v-col>
      </v-row>
    </v-card>
  </v-container>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from "vue";
import firmwareService, { type FirmwareItem } from "@/firmwareService";
import {
  formatFileSize,
  formatDate,
  getChannelDisplayName,
} from "@/formatters";
import { useRouteQuery } from "@vueuse/router";
import { useAsyncState, useDebounceFn } from "@vueuse/core";
import type { DataTableHeader } from "vuetify";
import FirmwareFilters from "@/components/FirmwareFilters.vue";

// Filters ref for calling toggleFilter from table
const filtersRef = ref<InstanceType<typeof FirmwareFilters> | null>(null);

// Reactive data - arrays for multi-select
const selectedProducts = useRouteQuery<string[]>("products", [], {
  transform: (v) => (Array.isArray(v) ? v : v ? [v] : []),
});
const selectedPlatforms = useRouteQuery<string[]>("platforms", [], {
  transform: (v) => (Array.isArray(v) ? v : v ? [v] : []),
});
const selectedChannels = useRouteQuery<string[]>("channels", [], {
  transform: (v) => (Array.isArray(v) ? v : v ? [v] : []),
});

// Sort state synced with URL
const sortBy = useRouteQuery<string>("sortBy", "created");
const sortOrder = useRouteQuery<"asc" | "desc">("sortOrder", "desc");

// Toggle filter (delegates to component)
const toggleFilter = (
  type: "product" | "platform" | "channel",
  value: string
) => {
  filtersRef.value?.toggleFilter(type, value);
};

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
    const hasFilters =
      selectedProducts.value.length > 0 ||
      selectedPlatforms.value.length > 0 ||
      selectedChannels.value.length > 0;

    let response;
    if (!hasFilters) {
      // No filters applied - use firmware-latest
      response = await firmwareService.fetchLatestFirmware();

      // Manually sort by created date descending since firmware-latest doesn't sort
      const sortedFirmware = response._embedded.firmware.sort(
        (a, b) => new Date(b.created).getTime() - new Date(a.created).getTime()
      );

      isShowingLatestFirmwareData.value = true;
      return sortedFirmware;
    } else {
      // Need to fetch all firmware and filter client-side for multi-select
      response = await firmwareService.fetchFirmware({ limit: 10000 });
      let firmware = response._embedded.firmware;

      // Apply filters client-side
      if (selectedProducts.value.length > 0) {
        firmware = firmware.filter((fw) =>
          selectedProducts.value.includes(fw.product)
        );
      }
      if (selectedPlatforms.value.length > 0) {
        firmware = firmware.filter((fw) =>
          selectedPlatforms.value.includes(fw.platform)
        );
      }
      if (selectedChannels.value.length > 0) {
        firmware = firmware.filter((fw) =>
          selectedChannels.value.includes(fw.channel)
        );
      }

      isShowingLatestFirmwareData.value = false;
      return firmware;
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
  selectedProducts.value = [];
  selectedPlatforms.value = [];
  selectedChannels.value = [];
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

watch(
  [selectedProducts, selectedPlatforms, selectedChannels],
  () => {
    debouncedExecute();
  },
  { deep: true }
);

onMounted(async () => {
  await filterOptions.execute();
  await firmware.execute();
});
</script>
