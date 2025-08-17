<template>
  <v-container class="fill-height" max-width="600px">
    <v-card class="pa-6">
      <v-card-title class="text-h4 text-center mb-4">
        UniFi Firmware Browser
      </v-card-title>

      <v-card-text>
        <v-alert type="warning" variant="tonal" class="mb-6">
          <v-alert-title>Notice</v-alert-title>
          <p class="mt-3">
            This is an
            <strong>unofficial, community-created tool</strong> that provides
            listings of existing, publicly available UniFi firmware files. By
            using this page, you acknowledge and agree that:
          </p>
        </v-alert>

        <div class="mb-6">
          <ul class="text-body-1">
            <li class="mb-3">
              <strong>Not affiliated with Ubiquiti:</strong> This tool is not
              created, endorsed, or supported by Ubiquiti Inc.
            </li>
            <li class="mb-3">
              <strong>Use at your own risk:</strong> Installing firmware may
              void warranties or brick your device if done incorrectly.
            </li>
            <li class="mb-3">
              <strong>EULA Compliance:</strong> You must comply with
              <a
                href="https://www.ui.com/eula/"
                target="_blank"
                class="text-primary"
              >
                Ubiquiti's End User License Agreement (EULA)</a
              >
              in any usage of the data and/or firmware files acquired.
            </li>
            <li class="mb-3">
              <strong>Backup your devices:</strong> Always create backups before
              updating firmware.
            </li>
            <li class="mb-3">
              <strong>Verify compatibility:</strong> Ensure you're using the
              correct firmware for your specific device model.
            </li>
          </ul>
        </div>

        <v-divider class="mb-4"></v-divider>

        <div class="text-center">
          <p class="text-body-1 mb-4">
            By clicking "I Understand and Agree" below, you acknowledge that you
            have read and understood this disclaimer, and agree to use this tool
            and any downloaded firmware in accordance with Ubiquiti's EULA and
            at your own risk.
          </p>

          <div class="d-flex flex-column flex-sm-row ga-3 justify-center">
            <v-btn
              variant="outlined"
              size="large"
              prepend-icon="mdi-close-circle"
              @click="declineDisclaimer"
              class="flex-grow-1 flex-sm-grow-0"
            >
              Decline
            </v-btn>
            <v-btn
              color="primary"
              size="large"
              prepend-icon="mdi-check-circle"
              @click="acceptDisclaimer"
              class="flex-grow-1 flex-sm-grow-0"
            >
              I Understand and Agree
            </v-btn>
          </div>
        </div>
      </v-card-text>
    </v-card>
  </v-container>
</template>

<script setup lang="ts">
const accepted = defineModel<boolean>({ required: true });

const acceptDisclaimer = () => {
  accepted.value = true;
};

const declineDisclaimer = () => {
  window.location.href = "https://google.com";
};
</script>
