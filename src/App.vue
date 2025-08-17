<template>
  <v-app>
    <v-app-bar color="primary" dark>
      <v-app-bar-title>
        <RouterLink to="/" class="text-white text-decoration-none">
          UniFi Firmware Browser
        </RouterLink>
      </v-app-bar-title>
      <v-spacer></v-spacer>
      <v-btn to="/" text>Search</v-btn>
      <v-btn to="/faq" text>FAQ</v-btn>
    </v-app-bar>

    <v-main>
      <v-container>
        <RouterView />
      </v-container>
    </v-main>
  </v-app>
</template>

<script setup lang="ts">
import { RouterLink, RouterView } from "vue-router";
</script>
