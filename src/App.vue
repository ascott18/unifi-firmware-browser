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
