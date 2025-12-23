<template>
  <v-card
    class="filters-card overflow-visible"
    elevation="0"
    style="box-shadow: rgb(0 0 0 / 5%) 10px 0px 10px -5px !important"
  >
    <v-card-title class="d-flex align-center justify-space-between py-3">
      <div class="d-flex align-center">
        <v-icon class="mr-2" size="small">mdi-filter</v-icon>
        Filters
        <span v-if="activeFiltersCount">&nbsp;({{ activeFiltersCount }})</span>
      </div>
      <v-btn
        v-if="activeFiltersCount"
        variant="outlined"
        @click="clearFilters"
        color="primary"
        :disabled="disabled"
        prepend-icon="mdi-filter-remove"
        size="small"
        title="Clear all filters"
        text="Clear Filters"
      />
    </v-card-title>

    <v-divider />

    <v-expansion-panels
      variant="accordion"
      elevation="0"
      multiple
      v-model="expandedPanels"
    >
      <v-expansion-panel
        v-for="filter in filterConfigs"
        :key="filter.key"
        :value="filter.key"
      >
        <v-expansion-panel-title>
          <div
            class="d-flex align-center"
            :class="{ 'justify-space-between w-100': filter.helpLink }"
          >
            <div class="d-flex align-center">
              <v-icon size="small" class="mr-2">{{ filter.icon }}</v-icon>
              {{ filter.label }}
              <v-chip
                v-if="getSelected(filter.key).length"
                size="small"
                color="primary"
                class="ml-2 my-n1"
              >
                {{ getSelected(filter.key).length }}
              </v-chip>
            </div>
            <v-btn
              v-if="filter.helpLink"
              :to="filter.helpLink"
              color="primary"
              class="text-caption mr-2"
              title="Help"
              size="x-small"
              variant="text"
              prepend-icon="mdi-help-circle"
              @click.stop
            >
              What's this?
            </v-btn>
          </div>
        </v-expansion-panel-title>
        <v-expansion-panel-text>
          <v-text-field
            v-if="filter.searchable"
            v-model="searchTerms[filter.key]"
            placeholder="Search..."
            density="compact"
            rounded
            variant="outlined"
            hide-details
            clearable
            persistent-clear
            prepend-inner-icon="mdi-magnify"
            class="mb-1"
          />
          <div v-if="loading && filter.searchable" class="text-center pa-2">
            <v-progress-circular size="20" indeterminate />
          </div>
          <div
            v-else-if="
              filter.searchable && getFilteredItems(filter).length === 0
            "
            class="text-caption text-disabled pa-2"
          >
            No {{ filter.label.toLowerCase() }}s found
          </div>
          <v-virtual-scroll
            v-else
            :items="getFilteredItems(filter)"
            :height="filter.height ?? 255"
          >
            <template v-slot:default="{ item }">
              <v-list-item
                :key="typeof item === 'string' ? item : item.value"
                class="px-0"
                density="compact"
                min-height="20px"
                :title="item.title"
                :subtitle="item.subtitle"
                @click="
                  toggleFilter(
                    filter.key,
                    typeof item === 'string' ? item : item.value
                  )
                "
              >
                <template #prepend>
                  <v-checkbox-btn
                    :model-value="
                      getSelected(filter.key).includes(
                        typeof item === 'string' ? item : item.value
                      )
                    "
                    density="compact"
                  >
                  </v-checkbox-btn>
                </template>
              </v-list-item>
            </template>
          </v-virtual-scroll>
        </v-expansion-panel-text>
      </v-expansion-panel>
    </v-expansion-panels>
  </v-card>
</template>

<script setup lang="ts">
import { ref, computed, reactive } from "vue";
import { platformModels } from "@/platformModels";
import { getChannelDisplayName } from "@/formatters";
import { useDisplay } from "vuetify";

type FilterKey = "product" | "platform" | "channel";
type FilterItem = { title: string; value: string; subtitle?: string };

interface FilterConfig {
  key: FilterKey;
  label: string;
  icon: string;
  searchable: boolean;
  height?: number;
  items: () => FilterItem[];
  helpLink?: string;
}

const props = defineProps<{
  products: string[];
  platforms: string[];
  selectedProducts: string[];
  selectedPlatforms: string[];
  selectedChannels: string[];
  loading?: boolean;
  disabled?: boolean;
}>();

const emit = defineEmits<{
  "update:selectedProducts": [value: string[]];
  "update:selectedPlatforms": [value: string[]];
  "update:selectedChannels": [value: string[]];
  clear: [];
}>();

const channelOptions = [{ value: "release" }, { value: "beta-public" }].map(
  (x) => ({ ...x, title: getChannelDisplayName(x.value) })
);

const filterConfigs: FilterConfig[] = [
  {
    key: "product",
    label: "Product",
    icon: "mdi-package-variant",
    searchable: true,
    items: () =>
      props.products.map((product) => {
        return { title: product, value: product };
      }),
  },
  {
    key: "platform",
    label: "Platform",
    icon: "mdi-chip",
    searchable: true,
    items: () =>
      props.platforms.map((platform) => {
        const products = platformModels[platform] || [];
        const subtitle = products.length > 0 ? products.join(", ") : undefined;
        return { title: platform, value: platform, subtitle };
      }),
    helpLink: "/faq#platform-detection",
  },
  {
    key: "channel",
    label: "Channel",
    icon: "mdi-tag",
    searchable: false,
    height: 75,
    items: () => channelOptions,
  },
];

const searchTerms = reactive<Record<FilterKey, string>>({
  product: "",
  platform: "",
  channel: "",
});

const display = useDisplay();
const expandedPanels = ref<string[]>(
  display.smAndDown.value ? [] : ["product", "platform", "channel"]
);

const selectionMap: Record<
  FilterKey,
  { get: () => string[]; emit: `update:selected${string}` }
> = {
  product: {
    get: () => props.selectedProducts,
    emit: "update:selectedProducts",
  },
  platform: {
    get: () => props.selectedPlatforms,
    emit: "update:selectedPlatforms",
  },
  channel: {
    get: () => props.selectedChannels,
    emit: "update:selectedChannels",
  },
};

const getSelected = (key: FilterKey) => selectionMap[key].get();

const getFilteredItems = (filter: FilterConfig): FilterItem[] => {
  const items = filter.items();
  const selected = getSelected(filter.key);

  let filtered = items;
  if (filter.searchable) {
    const search = searchTerms[filter.key]?.toLowerCase();
    if (search) {
      filtered = items.filter((item) => {
        return (
          item.title.toLowerCase().includes(search) ||
          item.subtitle?.toLowerCase().includes(search)
        );
      });
    }
  }

  // Sort selected items first
  return filtered.sort((a, b) => {
    const aValue = typeof a === "string" ? a : a.value;
    const bValue = typeof b === "string" ? b : b.value;
    const aSelected = selected.includes(aValue);
    const bSelected = selected.includes(bValue);

    if (aSelected && !bSelected) return -1;
    if (!aSelected && bSelected) return 1;
    return 0;
  });
};

const activeFiltersCount = computed(
  () =>
    props.selectedProducts.length +
    props.selectedPlatforms.length +
    props.selectedChannels.length
);

const toggleFilter = (key: FilterKey, value: string) => {
  const selected = getSelected(key);
  const newValue = selected.includes(value)
    ? selected.filter((v) => v !== value)
    : [...selected, value];
  emit(selectionMap[key].emit as any, newValue);
};

const clearFilters = () => {
  Object.keys(searchTerms).forEach(
    (key) => (searchTerms[key as FilterKey] = "")
  );
  emit("clear");
};

// Expose toggleFilter for parent to use
defineExpose({ toggleFilter });
</script>

<style lang="scss">
.filters-card {
  .v-expansion-panel-title {
    min-height: 20px !important;
    padding-top: 12px;
    padding-bottom: 12px;
  }
  .v-expansion-panel-text__wrapper {
    padding-left: 16px !important;
    padding-right: 16px !important;
  }
  .v-list-item-subtitle {
    font-size: 12px !important;
    line-height: 1.1;
  }
}
</style>
