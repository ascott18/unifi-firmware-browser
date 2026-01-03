import { createApp } from "vue";
import App from "./App.vue";
import router from "./router";

// Vuetify
import "./styles.scss";
import "vuetify/styles";
import { createVuetify } from "vuetify";
import "@mdi/font/css/materialdesignicons.css";

const vuetify = createVuetify({
  theme: {
    defaultTheme: "light",
    themes: {
      light: {
        dark: false,
        colors: {
          primary: "#006fff",
          background: "#f3f3f3",
        },
      },
      dark: {
        dark: true,
        colors: {
          primary: "#006fff",
          background: "#121212",
          surface: "#1E1E1E",
        },
      },
    },
  },
});

const app = createApp(App);

app.use(router);
app.use(vuetify);

app.mount("#app");
