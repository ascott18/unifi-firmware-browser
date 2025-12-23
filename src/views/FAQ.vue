<template>
  <v-container max-width="1000px">
    <v-row>
      <v-col cols="12">
        <h1 class="text-h3">Frequently Asked Questions</h1>
      </v-col>
    </v-row>

    <!-- FAQ Content -->
    <v-row>
      <v-col cols="12">
        <v-card id="platform-detection">
          <v-card-title class="text-h3"> What is 'platform'? </v-card-title>
          <v-card-text>
            <p>
              Platform is an identifier of the specific hardware or chips in a
              device. Sometimes platform is unique to a single device model, or
              sometimes it is shared between many device models. There could
              even be a model with multiple revisions on different platforms.
            </p>
            <p>
              Knowing your platform is needed to select the correct firmware,
              and is often not obvious.
            </p>
            <p>
              Some platforms in the platform filter list have some common device
              models listed to aid in your searching. There is no official
              source for this data - it has been gathered from various online
              sources and community contributions. You should not rely on it
              without verifying first using the methods below. See the list
              <a
                href="https://github.com/ascott18/unifi-firmware-browser/blob/main/src/platformModels.ts"
                >here</a
              >.
            </p>

            <v-divider></v-divider>

            <h4 class="text-h4">
              Platform Identification via UniFi Network API (Easier)
            </h4>
            <ol>
              <li>
                <strong>Sign in to UniFi Controller:</strong> Access your UniFi
                Controller web interface.
              </li>
              <li>
                <strong>Navigate to </strong>
                <a
                  href="https://unifi.local/proxy/network/v2/api/site/default/device"
                  target="_blank"
                  >https://unifi.local/proxy/network/v2/api/site/default/device</a
                >. Replace <code>unifi.local</code> with your controller's DNS
                name or IP if different.
              </li>
              <li>
                <strong>Enable readable JSON:</strong> Use Firefox for more
                readable JSON, or in Chrome/Edge check "pretty-print". Or, save
                and open the JSON in a tool like VS Code.
              </li>
              <li>
                <strong>Find your device in the JSON:</strong>
                Search for the name, IP, or MAC address of your device to
                quickly jump to it in the results.
                <ul>
                  <li>
                    <strong>For cameras:</strong> The firmware version is in the
                    <code>version</code> field, and should contain the product
                    and platform identifiers.
                    <div>
                      Example:
                      <code>UVC.SAV530q.v5.1.1.67.ef5e486.250708.0630</code>
                      <ul>
                        <li>
                          <strong>Product: </strong> <code>UVC</code> (first
                          part)
                        </li>
                        <li>
                          <strong>Platform: </strong>
                          <code>SAV530q</code> (second part) ← This is what you
                          need for firmware selection
                        </li>
                        <li>
                          <strong>Current Version: </strong>
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

            <v-divider></v-divider>

            <h4 id="camera-access" class="text-h4">
              Alternative Method (Protect Only, Harder)
            </h4>
            <ol>
              <li>
                <strong>Access the camera:</strong> Log into your camera using a
                web browser - navigate to its IP address.
                <ul>
                  <li>Username: <code>ubnt</code></li>
                  <li>
                    Password: Recovery Code from Protect > Settings > System >
                    Advanced
                  </li>
                </ul>
              </li>
              <li>
                <strong>View logs:</strong> In the System tab, click
                <strong>View Camera Log</strong>.
              </li>
              <li>
                <strong>Search for version:</strong> Use <kbd>Ctrl+F</kbd> (or
                <kbd>Cmd+F</kbd> on Mac) to search the logs for any of the
                following:
                <ul>
                  <li><code>FW Version</code></li>
                  <li><code>rescue FW</code></li>
                </ul>
              </li>
              <li>
                <strong>Examine the firmware string</strong> (same format as API
                method above).
              </li>
            </ol>
          </v-card-text>
        </v-card>

        <v-card>
          <v-card-title class="text-h3">
            How do I manually install firmware?
          </v-card-title>
          <v-card-text>
            <p>
              After downloading firmware from this site, you'll need to upload
              it to your devices.
            </p>

            <h4 class="text-h4">
              Disable Auto-Updates (<strong>Important</strong>)
            </h4>
            <p>
              Before manually updating firmware, disable auto-updates. If you
              don't, then it defeats the purpose of manually rolling back your
              firmware.
            </p>
            <ol>
              <li>
                <strong>Navigate to Settings:</strong> In your UniFi Controller,
                go to <strong>Settings > Control Plane > Updates</strong>.
              </li>
              <li>
                <strong>Select the application:</strong> Click on the
                application that manages your device (<strong>Network</strong>,
                <strong>Protect</strong>, <strong>Access</strong>, etc.).
              </li>
              <li>
                <strong>Disable auto-updates:</strong> Uncheck
                <strong>"Device Auto-Update"</strong> (and optionally
                <strong>"Application Auto-Update"</strong> as well).
              </li>
            </ol>

            <v-divider></v-divider>

            <h4 class="text-h4">Network Devices</h4>
            <ol>
              <li>
                <strong>Open device settings:</strong> In the UniFi Network
                application, go to the <strong>Settings</strong> tab of your
                device.
              </li>
              <li>
                <strong>Get firmware URL:</strong> In this firmware browser,
                right-click the <strong>Download</strong> button and select
                <strong>"Copy link address"</strong> or
                <strong>"Copy URL"</strong>.
              </li>
              <li>
                <strong>Start manual update:</strong> Click
                <strong>"Manual Firmware Update"</strong> in the device
                settings.
              </li>
              <li>
                <strong>Paste URL:</strong> Paste the firmware URL in the manual
                update dialog.
              </li>
            </ol>

            <v-divider></v-divider>

            <h4 class="text-h4">Cameras</h4>
            <ol>
              <li>
                <strong>Download firmware file:</strong> Download the firmware
                to your computer.
              </li>
              <li>
                <strong>Access camera web interface:</strong> Follow the
                <a href="#camera-access" class="text-decoration-none"
                  >camera access steps</a
                >
                from the platform detection section above.
              </li>
              <li>
                <strong>Upload firmware:</strong> In the camera's web interface,
                go to the <strong>System</strong> tab and select the firmware
                file.
              </li>
              <li>
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

<style scoped>
h1 {
  margin-bottom: 0.5rem;
}

.v-card {
  margin-bottom: 1rem;
}

.v-card-text p {
  margin-bottom: 1rem;
}

.v-card-text h4 {
  margin-bottom: 0.75rem;
}

.v-card-text ol,
.v-card-text ul {
  margin-bottom: 1rem;
}

.v-card-text li {
  margin-bottom: 0.5rem;
}

.v-card-text ul li {
  margin-bottom: 0.5rem;
}

.v-card-text ul.mt-2 {
  margin-top: 0.5rem;
}

.v-card-text ul.mt-1,
.v-card-text div.mt-1 {
  margin-top: 0.25rem;
}

.v-divider {
  margin-bottom: 1rem;
}
</style>
