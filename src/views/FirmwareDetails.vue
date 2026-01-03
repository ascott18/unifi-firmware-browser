<template>
  <v-container max-width="1200px">
    <v-btn
      prepend-icon="mdi-arrow-left"
      class="mb-4"
      variant="text"
      @click="$router.go(-1)"
    >
      Back to Search
    </v-btn>

    <div v-if="firmware.isLoading.value" class="text-center py-8">
      <v-progress-circular
        indeterminate
        size="64"
        color="primary"
      ></v-progress-circular>
      <p class="text-h6 mt-4">Loading firmware details...</p>
    </div>

    <v-alert v-if="firmware.error.value" type="error" class="mb-4">
      {{ firmware.error.value }}
    </v-alert>

    <v-row v-if="firmware.state.value && !firmware.isLoading.value">
      <v-col cols="12" md="8">
        <v-card>
          <v-card-text>
            <h3 class="text-h6 mb-2">
              {{
                firmwareService
                  .getDownloadUrl(firmware.state.value)
                  .split("/")
                  .pop()
              }}
            </h3>
            <v-row>
              <v-col cols="12" md="6">
                <v-list density="compact">
                  <v-list-item
                    prepend-icon="mdi-package-variant"
                    title="Product"
                    :subtitle="firmware.state.value.product"
                  />
                  <v-list-item prepend-icon="mdi-chip">
                    <v-list-item-title>
                      Platform
                      <v-chip
                        prepend-icon="mdi-help"
                        size="x-small"
                        color="primary"
                        :to="{ name: 'faq', hash: '#platform-detection' }"
                        class="ml-1"
                      >
                        What's this?
                      </v-chip>
                    </v-list-item-title>
                    <v-list-item-subtitle>{{
                      firmware.state.value.platform
                    }}</v-list-item-subtitle>
                  </v-list-item>
                  <v-list-item
                    v-if="knownModels"
                    prepend-icon="mdi-devices"
                    :lines="false"
                    title="Possible Models"
                    :subtitle="knownModels.join(', ')"
                  />
                  <v-list-item
                    prepend-icon="mdi-source-branch"
                    title="Release Channel"
                    :subtitle="
                      getChannelDisplayName(firmware.state.value.channel)
                    "
                  />
                </v-list>
              </v-col>
              <v-col cols="12" md="6">
                <v-list density="compact">
                  <v-list-item
                    prepend-icon="mdi-tag"
                    title="Version"
                    :subtitle="firmware.state.value.version"
                  />
                  <v-list-item
                    prepend-icon="mdi-calendar"
                    title="Release Date"
                    :subtitle="formatDate(firmware.state.value.created)"
                  />
                  <v-list-item
                    prepend-icon="mdi-file-outline"
                    title="File Size"
                    :subtitle="formatFileSize(firmware.state.value.file_size)"
                  />
                </v-list>
              </v-col>
            </v-row>
          </v-card-text>
        </v-card>
        <v-card class="mt-4">
          <v-card-title>Checksums</v-card-title>
          <v-card-text>
            <v-list density="compact">
              <v-list-item>
                <v-list-item-title>MD5 Checksum</v-list-item-title>
                <v-list-item-subtitle class="font-monospace">
                  {{ firmware.state.value.md5 }}
                </v-list-item-subtitle>
              </v-list-item>
              <v-list-item>
                <v-list-item-title>SHA256 Checksum</v-list-item-title>
                <v-list-item-subtitle class="font-monospace">
                  {{ firmware.state.value.sha256_checksum }}
                </v-list-item-subtitle>
              </v-list-item>
            </v-list>
          </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="12" md="4">
        <v-card>
          <v-card-title>Download</v-card-title>
          <v-card-text>
            <v-btn
              color="success"
              variant="elevated"
              size="large"
              prepend-icon="mdi-download"
              :href="firmwareService.getDownloadUrl(firmware.state.value)"
              tag="a"
              block
              class="mb-2"
            >
              Download Firmware
            </v-btn>

            <div class="text-center mb-4">
              <a
                :href="firmwareService.getDownloadUrl(firmware.state.value)"
                target="_blank"
                class="text-caption text-decoration-none"
              >
                {{ firmwareService.getDownloadUrl(firmware.state.value) }}
              </a>
            </div>

            <v-alert type="info" variant="tonal">
              <strong>Important:</strong> Always backup your device before
              updating firmware.
            </v-alert>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
import { onMounted, computed } from "vue";
import { useRoute } from "vue-router";
import { useAsyncState } from "@vueuse/core";
import firmwareService, { type FirmwareItem } from "@/services/firmwareService";
import { platformModels } from "@/platformModels";
import {
  formatFileSize,
  formatDate,
  getChannelDisplayName,
} from "@/utils/formatters";

const route = useRoute();

const knownModels = computed(() => {
  if (!firmware.state.value) return null;
  const models = platformModels[firmware.state.value.platform];
  return models && models.length > 0 ? models : null;
});

const firmware = useAsyncState(
  async () => {
    const firmwareId = route.params.id as string;
    if (!firmwareId) {
      throw new Error("No firmware ID provided");
    }

    const data = await firmwareService.getFirmwareById(firmwareId);
    if (!data) {
      throw new Error("Firmware not found");
    }

    return data;
  },
  null as FirmwareItem | null,
  {
    immediate: false,
  }
);

onMounted(() => {
  firmware.execute();
});
</script>
