<template>
  <v-container max-width="1200px">
    <v-row class="mb-4">
      <v-col cols="12">
        <h1 class="text-h3 mb-2">Frequently Asked Questions</h1>
      </v-col>
    </v-row>

    <!-- FAQ Content -->
    <v-row>
      <v-col cols="12">
        <v-card class="mb-4" id="platform-detection">
          <v-card-title> How do I determine my platform? </v-card-title>
          <v-card-text>
            <p class="mb-4">
              Knowing your platform is needed to select the correct firmware,
              and is often not obvious.
            </p>

            <v-divider class="mb-4"></v-divider>

            <h4 class="text-h6 mb-3">
              <v-icon class="mr-2">mdi-api</v-icon>
              Using UniFi Network API (Recommended)
            </h4>
            <ol class="mb-4">
              <li class="mb-2">
                <strong>Sign in to UniFi Controller:</strong> Access your UniFi
                Controller web interface.
              </li>
              <li class="mb-2">
                <strong>Navigate to or download the device API:</strong> Go to
                <code>/proxy/network/v2/api/site/default/device</code>
                <div class="mt-1">
                  Example:
                  <code
                    >https://unifi.local/proxy/network/v2/api/site/default/device</code
                  >
                </div>
              </li>
              <li class="mb-2">
                <strong>Enable readable JSON:</strong> Use Firefox for more
                readable JSON, or in Chrome/Edge check "pretty-print". Or, save
                and open the JSON in a tool like VS Code.
              </li>
              <li class="mb-2">
                <strong>Find your device in the JSON:</strong>
                Search for the name, IP, or MAC address of your device to
                quickly jump to it in the results.
                <ul class="mt-2">
                  <li class="mb-2">
                    <strong>For cameras:</strong> The firmware version is in the
                    <code>version</code> field.
                    <div class="mt-1">
                      Example:
                      <code>UVC.SAV530q.v5.1.1.67.ef5e486.250708.0630</code>
                      <ul class="mt-1">
                        <li>
                          <strong>Product:</strong> <code>UVC</code> (first
                          part)
                        </li>
                        <li>
                          <strong>Platform:</strong>
                          <code>SAV530q</code> (second part) ← This is what you
                          need for firmware selection
                        </li>
                        <li>
                          <strong>Current Version:</strong>
                          <code>v5.1.1</code> (third part)
                        </li>
                      </ul>
                    </div>
                  </li>
                  <li>
                    <strong>For network appliances:</strong> The platform is in
                    the <code>model</code> field. The current firmware version
                    is in the <code>version</code> field.
                  </li>
                </ul>
              </li>
            </ol>

            <v-divider class="mb-4"></v-divider>

            <h4 id="camera-access" class="text-h6 mb-3">
              <v-icon class="mr-2">mdi-camera</v-icon>
              Alternative (Cameras Only)
            </h4>
            <ol class="mb-4">
              <li class="mb-2">
                <strong>Access the camera:</strong> Log into your camera using a
                web browser - navigate to its IP address.
                <ul class="mt-1">
                  <li>Username: <code>ubnt</code></li>
                  <li>
                    Password: Recovery Code from Protect > Settings > System >
                    Advanced
                  </li>
                </ul>
              </li>
              <li class="mb-2">
                <strong>View logs:</strong> In the System tab, click
                <strong>View Camera Log</strong>.
              </li>
              <li class="mb-2">
                <strong>Search for version:</strong> Use <kbd>Ctrl+F</kbd> (or
                <kbd>Cmd+F</kbd> on Mac) to search the logs for any of the
                following:
                <ul class="mt-1">
                  <li><code>FW Version</code></li>
                  <li><code>rescue FW</code></li>
                </ul>
              </li>
              <li class="mb-2">
                <strong>Examine the firmware string</strong> (same format as API
                method above).
              </li>
            </ol>
          </v-card-text>
        </v-card>

        <v-card class="mb-4">
          <v-card-title> How do I upload and install firmware? </v-card-title>
          <v-card-text>
            <p class="mb-4">
              After downloading firmware from this site, you'll need to upload
              it to your devices.
            </p>

            <h4 class="text-h6 mb-3">
              <v-icon class="mr-2">mdi-update</v-icon>
              Disable Auto-Updates (<strong>Important</strong>)
            </h4>
            <ol class="mb-4">
              <li class="mb-2">
                <strong>Navigate to Settings:</strong> In your UniFi Controller,
                go to <strong>Settings > Control Plane > Updates</strong>.
              </li>
              <li class="mb-2">
                <strong>Select the application:</strong> Click on the
                application that manages your device (<strong>Network</strong>,
                <strong>Protect</strong>, <strong>Access</strong>, etc.).
              </li>
              <li class="mb-2">
                <strong>Disable auto-updates:</strong> Uncheck
                <strong>"Device Auto-Update"</strong> (and optionally
                <strong>"Application Auto-Update"</strong> as well).
              </li>
            </ol>

            <v-divider class="mb-4"></v-divider>

            <h4 class="text-h6 mb-3">
              <v-icon class="mr-2">mdi-router-wireless</v-icon>
              Network Devices (Access Points, Switches, Gateways)
            </h4>
            <ol class="mb-4">
              <li class="mb-2">
                <strong>Open device settings:</strong> In the UniFi Network
                application, go to the <strong>Settings</strong> tab of your
                device.
              </li>
              <li class="mb-2">
                <strong>Get firmware URL:</strong> In this firmware browser,
                right-click the <strong>Download</strong> button and select
                <strong>"Copy link address"</strong> or
                <strong>"Copy URL"</strong>.
              </li>
              <li class="mb-2">
                <strong>Start manual update:</strong> Click
                <strong>"Manual Firmware Update"</strong> in the device
                settings.
              </li>
              <li class="mb-2">
                <strong>Paste URL:</strong> Paste the firmware URL in the manual
                update dialog.
              </li>
            </ol>

            <v-divider class="mb-4"></v-divider>

            <h4 class="text-h6 mb-3">
              <v-icon class="mr-2">mdi-camera</v-icon>
              Cameras
            </h4>
            <ol class="mb-4">
              <li class="mb-2">
                <strong>Download firmware file:</strong> Download the firmware
                to your computer.
              </li>
              <li class="mb-2">
                <strong>Access camera web interface:</strong> Follow the
                <a href="#camera-access" class="text-decoration-none"
                  >camera access steps</a
                >
                from the platform detection section above.
              </li>
              <li class="mb-2">
                <strong>Upload firmware:</strong> In the camera's web interface,
                go to the <strong>System</strong> tab and select the firmware
                file.
              </li>
              <li class="mb-2">
                <strong>Install:</strong> Follow the on-screen prompts to
                complete the firmware installation.
              </li>
            </ol>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>
