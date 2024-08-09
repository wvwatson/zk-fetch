"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/index.ts
var src_exports = {};
__export(src_exports, {
  HttpMethod: () => HttpMethod,
  LogType: () => LogType,
  ReclaimClient: () => ReclaimClient
});
module.exports = __toCommonJS(src_exports);

// src/zkfetch.ts
var import_witness_sdk = require("@reclaimprotocol/witness-sdk");

// src/types.ts
var HttpMethod = /* @__PURE__ */ ((HttpMethod2) => {
  HttpMethod2["GET"] = "GET";
  HttpMethod2["POST"] = "POST";
  return HttpMethod2;
})(HttpMethod || {});
var LogType = /* @__PURE__ */ ((LogType2) => {
  LogType2["VERIFICATION_STARTED"] = "VERIFICATION_STARTED";
  LogType2["PROOF_GENERATED"] = "PROOF_GENERATED";
  LogType2["ERROR"] = "ERROR";
  LogType2["SUCCESS"] = "SUCCESS";
  LogType2["FAILED"] = "FAILED";
  return LogType2;
})(LogType || {});

// src/errors.ts
var InvalidParamError = class extends Error {
  constructor(message) {
    super(message);
    this.name = "InvalidParamError";
  }
};
var DisallowedOptionError = class extends Error {
  constructor(message) {
    super(message);
    this.name = "DisallowedOptionError";
  }
};
var InvalidMethodError = class extends Error {
  constructor(message) {
    super(message);
    this.name = "InvalidMethodError";
  }
};
var FetchError = class extends Error {
  constructor(message) {
    super(message);
    this.name = "FetchError";
  }
};
var NetworkError = class extends Error {
  constructor(message) {
    super(message);
    this.name = "NetworkError";
  }
};
var ApplicationError = class extends Error {
  constructor(message) {
    super(message);
    this.name = "ApplicationError";
  }
};

// src/utils.ts
var import_ethers = require("ethers");

// src/constants.ts
var LOGS_BACKEND_URL = "https://logs.reclaimprotocol.org";
var APP_BACKEND_URL = "https://api.reclaimprotocol.org";
var WITNESS_NODE_URL = "wss://witness.reclaimprotocol.org/ws";

// src/utils.ts
var import_pino = __toESM(require("pino"));
var logger = (0, import_pino.default)();
function assertCorrectnessOfOptions(options) {
  if (!options.method) {
    throw new InvalidParamError("Method is required");
  }
  if (options.method !== "GET" /* GET */ && options.method !== "POST" /* POST */) {
    throw new InvalidMethodError(`Method ${options.method} is not allowed`);
  }
}
function assertCorrectionOfSecretOptions(secretOptions) {
  if (secretOptions.body) {
    throw new DisallowedOptionError(`Option: body is not allowed`);
  }
}
function validateNotNullOrUndefined(input, paramName, functionName) {
  if (input == null) {
    throw new InvalidParamError(`${paramName} passed to ${functionName} must not be null or undefined.`);
  }
}
function validateNonEmptyString(input, paramName, functionName) {
  if (typeof input !== "string") {
    throw new InvalidParamError(`${paramName} passed to ${functionName} must be a string.`);
  }
  if (input.trim() === "") {
    throw new InvalidParamError(`${paramName} passed to ${functionName} must be a non-empty string.`);
  }
}
function validateApplicationIdAndSecret(applicationId, applicationSecret) {
  validateNotNullOrUndefined(applicationId, "applicationId", "the constructor");
  validateNonEmptyString(applicationId, "applicationId", "the constructor");
  validateNotNullOrUndefined(applicationSecret, "applicationSecret", "the constructor");
  validateNonEmptyString(applicationSecret, "applicationSecret", "the constructor");
  try {
    const wallet = new import_ethers.ethers.Wallet(applicationSecret);
    if (wallet.address !== applicationId) {
      throw new InvalidParamError(`Invalid applicationId and applicationSecret passed to the constructor.`);
    }
  } catch (error) {
    throw new InvalidParamError(`Invalid applicationId and applicationSecret passed to the constructor.`);
  }
}
function validateURL(url, functionName) {
  validateNotNullOrUndefined(url, "url", functionName);
  validateNonEmptyString(url, "url", functionName);
  try {
    new URL(url);
  } catch (e) {
    throw new InvalidParamError(`Invalid URL format passed to ${functionName}.`);
  }
}
var appNameCache = {};
async function fetchAppById(appId) {
  if (appNameCache[appId]) {
    return appNameCache[appId];
  }
  try {
    const response = await fetch(`${APP_BACKEND_URL}/api/zkfetch/sdk/${appId}`);
    if (response.status === 404) {
      throw new ApplicationError("Application not found");
    }
    if (response.status !== 200) {
      throw new ApplicationError("Failed to fetch application");
    }
    const res = await response.json();
    const appName = res.application.applicationName;
    appNameCache[appId] = appName;
    return appName;
  } catch (err) {
    throw new ApplicationError("Application not found");
  }
}
async function sendLogs({
  sessionId,
  logType,
  applicationId
}) {
  try {
    const getAppName = await fetchAppById(applicationId);
    const url = `${LOGS_BACKEND_URL}/api/business-logs/zkfetch`;
    const body = JSON.stringify({
      sessionId,
      logType,
      date: (/* @__PURE__ */ new Date()).toISOString(),
      applicationId,
      applicationName: getAppName
    });
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body
    });
    if (!response.ok) {
      logger.error("Failed to send logs");
    }
  } catch (error) {
    if (error instanceof ApplicationError) {
      throw error;
    }
    throw new NetworkError("Failed to send logs");
  }
}

// src/zkfetch.ts
var import_uuid = require("uuid");
var import_pino2 = __toESM(require("pino"));
var logger2 = (0, import_pino2.default)();
var ReclaimClient = class {
  constructor(applicationId, applicationSecret, logs) {
    validateApplicationIdAndSecret(applicationId, applicationSecret);
    this.applicationId = applicationId;
    this.applicationSecret = applicationSecret;
    this.sessionId = (0, import_uuid.v4)().toString();
    logger2.level = logs ? "info" : "silent";
    logger2.info(
      `Initializing client with applicationId: ${this.applicationId} and sessionId: ${this.sessionId}`
    );
  }
  async zkFetch(url, options, secretOptions, retries = 1, retryInterval = 1e3) {
    validateURL(url, "zkFetch");
    if (options !== void 0) {
      assertCorrectnessOfOptions(options);
    }
    if (secretOptions) {
      assertCorrectionOfSecretOptions(secretOptions);
    }
    const fetchOptions = {
      method: options?.method || "GET" /* GET */,
      body: options?.body,
      headers: { ...options?.headers, ...secretOptions?.headers }
    };
    await sendLogs({
      sessionId: this.sessionId,
      logType: "VERIFICATION_STARTED" /* VERIFICATION_STARTED */,
      applicationId: this.applicationId
    });
    let attempt = 0;
    while (attempt < retries) {
      try {
        const response = await fetch(url, fetchOptions);
        if (!response.ok) {
          throw new FetchError(
            `Failed to fetch ${url} with status ${response.status}`
          );
        }
        const fetchResponse = await response.text();
        const claim = await (0, import_witness_sdk.createClaimOnWitness)({
          name: "http",
          params: {
            method: fetchOptions.method,
            url,
            responseMatches: [
              {
                type: "contains",
                value: fetchResponse
              }
            ],
            headers: options?.headers,
            geoLocation: options?.geoLocation,
            responseRedactions: [],
            body: fetchOptions.body
          },
          secretParams: {
            cookieStr: "abc=pqr",
            ...secretOptions
          },
          ownerPrivateKey: this.applicationSecret,
          logger: logger2,
          client: {
            url: WITNESS_NODE_URL
          }
        });
        await sendLogs({
          sessionId: this.sessionId,
          logType: "PROOF_GENERATED" /* PROOF_GENERATED */,
          applicationId: this.applicationId
        });
        return claim;
      } catch (error) {
        attempt++;
        if (attempt >= retries) {
          await sendLogs({
            sessionId: this.sessionId,
            logType: "ERROR" /* ERROR */,
            applicationId: this.applicationId
          });
          logger2.error(error);
          throw error;
        }
        await new Promise((resolve) => setTimeout(resolve, retryInterval));
      }
    }
  }
};
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  HttpMethod,
  LogType,
  ReclaimClient
});
//# sourceMappingURL=index.js.map