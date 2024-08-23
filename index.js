"use strict";
// Copyright 2020 Google LLC
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//    http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
Object.defineProperty(exports, "__esModule", { value: true });
exports.authenticate = void 0;
/**
 * This is used by several samples to easily provide an oauth2 workflow.
 */
const google_auth_library_1 = require("google-auth-library");
const http = require("http");
const url_1 = require("url");
const opn = require("open");
const arrify = require("arrify");
const destroyer = require("server-destroy");
const invalidRedirectUri = `The provided keyfile does not define a valid
redirect URI. There must be at least one redirect URI defined, and this sample
assumes it redirects to 'http://localhost:3000/oauth2callback'.  Please edit
your keyfile, and add a 'redirect_uris' section.  For example:

"redirect_uris": [
  "http://localhost:3000/oauth2callback"
]
`;
function isAddressInfo(addr) {
  return addr.port !== undefined;
}
// Open an http server to accept the oauth callback. In this
// simple example, the only request to our webserver is to
// /oauth2callback?code=<code>
async function authenticate(options) {
  var _a;
  if (
    !options ||
    !options.keyfilePath ||
    typeof options.keyfilePath !== "string"
  ) {
    throw new Error(
      "keyfilePath must be set to the fully qualified path to a GCP credential keyfile."
    );
  }
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const keyFile = require(options.keyfilePath);
  const keys = keyFile.installed || keyFile.web;
  if (!keys.redirect_uris || keys.redirect_uris.length === 0) {
    throw new Error(invalidRedirectUri);
  }
  const redirectUri = new url_1.URL(
    (_a = keys.redirect_uris[0]) !== null && _a !== void 0
      ? _a
      : "http://localhost"
  );
  if (redirectUri.hostname !== "localhost") {
    throw new Error(invalidRedirectUri);
  }
  // create an oAuth client to authorize the API call
  const client = new google_auth_library_1.OAuth2Client({
    clientId: keys.client_id,
    clientSecret: keys.client_secret,
  });
  return new Promise((resolve, reject) => {
    const server = http.createServer(async (req, res) => {
      try {
        const url = new url_1.URL(req.url, "http://localhost:3000");
        if (url.pathname !== redirectUri.pathname) {
          res.end("Invalid callback URL");
          return;
        }
        const searchParams = url.searchParams;
        if (searchParams.has("error")) {
          res.end("Authorization rejected.");
          reject(new Error(searchParams.get("error")));
          return;
        }
        if (!searchParams.has("code")) {
          res.end("No authentication code provided.");
          reject(new Error("Cannot read authentication code."));
          return;
        }
        const code = searchParams.get("code");
        const { tokens } = await client.getToken({
          code: code,
          redirect_uri: redirectUri.toString(),
        });
        client.credentials = tokens;
        resolve(client);
        res.end("Authentication successful! Please return to the console.");
      } catch (e) {
        reject(e);
      } finally {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        server.destroy();
      }
    });
    let listenPort = 3000;
    if (keyFile.installed) {
      // Use emphemeral port if not a web client
      listenPort = 0;
    } else if (redirectUri.port !== "") {
      listenPort = Number(redirectUri.port);
    }
    server.listen(listenPort, () => {
      console.log(`server running on port ${listenPort}`);
      const runSample = require("./index.js");
      runSample()
        .then((result) => {
          console.log(result);
        })
        .catch((error) => {
          console.error(error);
        });
      const address = server.address();
      if (isAddressInfo(address)) {
        redirectUri.port = String(address.port);
      }
      const scopes = arrify(options.scopes || []);
      // open the browser to the authorize url to start the workflow
      const authorizeUrl = client.generateAuthUrl({
        redirect_uri: redirectUri.toString(),
        access_type: "offline",
        scope: scopes.join(" "),
      });
      opn(authorizeUrl, { wait: false }).then((cp) => cp.unref());
    });
    destroyer(server);
  });
}
exports.authenticate = authenticate;
//# sourceMappingURL=index.js.map
