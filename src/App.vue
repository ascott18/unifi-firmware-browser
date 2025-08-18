<template>
  <v-app>
    <template v-if="!hasAcceptedEula">
      <DisclaimerDialog v-model="hasAcceptedEula" />
    </template>

    <template v-else>
      <v-app-bar color="primary" dark density="compact">
        <v-app-bar-title>
          <RouterLink to="/" class="text-white text-decoration-none">
            UniFi Firmware Browser
          </RouterLink>
        </v-app-bar-title>
        <v-spacer></v-spacer>
        <v-btn to="/" text prepend-icon="mdi-magnify">Search</v-btn>
        <v-btn to="/faq" text prepend-icon="mdi-help-circle">FAQ</v-btn>
        <v-btn
          href="https://github.com/ascott18/unifi-firmware-browser"
          target="_blank"
          text
          prepend-icon="mdi-github"
        >
          GitHub
        </v-btn>
      </v-app-bar>

      <v-main>
        <RouterView />
      </v-main>
    </template>
  </v-app>
</template>

<script setup lang="ts">
import { RouterLink, RouterView } from "vue-router";
import { useLocalStorage } from "@vueuse/core";
import DisclaimerDialog from "./components/DisclaimerDialog.vue";

const hasAcceptedEula = useLocalStorage("disclaimer-agreed", false);
</script>

<style>
.v-application ul,
.v-application ol {
  padding-left: 24px;
}

.v-application code {
  background-color: rgb(var(--v-theme-surface-variant));
  color: rgb(var(--v-theme-on-surface-variant));
  padding: 2px 6px;
  border-radius: 4px;
  font-family: "Monaco", "Menlo", "Ubuntu Mono", "Consolas", "source-code-pro",
    monospace;
  font-size: 0.875em;
  font-weight: 500;
  border: 1px solid rgb(var(--v-theme-outline-variant));
}
</style>
