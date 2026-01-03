<template>
  <v-app>
    <template v-if="!hasAcceptedEula">
      <DisclaimerDialog v-model="hasAcceptedEula" />
    </template>

    <template v-else>
      <v-app-bar color="primary" dark density="compact">
        <v-app-bar-title>
          <RouterLink
            to="/"
            class="text-white text-decoration-none d-flex align-center"
          >
            <v-icon class="mr-2" size="28">mdi-router-wireless</v-icon>
            <span class="font-weight-bold">UniFi Firmware Browser</span>
          </RouterLink>
        </v-app-bar-title>
        <v-spacer></v-spacer>
        <v-btn to="/" variant="text" prepend-icon="mdi-magnify" class="mr-2">
          Search
        </v-btn>
        <v-btn
          to="/faq"
          variant="text"
          prepend-icon="mdi-help-circle"
          class="mr-2"
        >
          FAQ
        </v-btn>
        <v-btn
          href="https://github.com/ascott18/unifi-firmware-browser"
          target="_blank"
          variant="text"
          prepend-icon="mdi-github"
        >
          GitHub
        </v-btn>

        <v-btn
          variant="text"
          :icon="isDark ? 'mdi-weather-sunny' : 'mdi-weather-night'"
          @click="toggleTheme"
          :title="isDark ? 'Switch to light mode' : 'Switch to dark mode'"
        ></v-btn>
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
import { useTheme } from "vuetify";
import { computed } from "vue";

const hasAcceptedEula = useLocalStorage("disclaimer-agreed", false);

const theme = useTheme();
const savedTheme = useLocalStorage("user-theme", "light");

// Initialize theme
theme.global.name.value = savedTheme.value;

const isDark = computed(() => theme.global.current.value.dark);

const toggleTheme = () => {
  const newTheme = isDark.value ? "light" : "dark";
  theme.global.name.value = newTheme;
  savedTheme.value = newTheme;
};
</script>

<style>
.v-application ul,
.v-application ol {
  padding-left: 24px;
}

.v-application code {
  background-color: rgb(var(--v-theme-surface-variant));
  color: white;
  padding: 2px 6px;
  border-radius: 4px;
  font-family: "Monaco", "Menlo", "Ubuntu Mono", "Consolas", "source-code-pro",
    monospace;
  font-size: 0.875em;
  font-weight: 500;
  border: 1px solid rgb(var(--v-theme-outline-variant));
}
</style>
