var __defProp = Object.defineProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};

// src/errors/errors.ts
var ErrorWithResponse = class extends Error {
  constructor(res) {
    super(res.statusText);
    this.res = res;
    this.name = "ErrorWithResponse";
  }
  res;
};
var ServiceUnavailableError = class extends Error {
  constructor() {
    super("Service is unavailable.");
    this.name = "ServiceUnavailableError";
  }
};
var ServiceNotFoundError = class extends Error {
  constructor() {
    super("Service not found.");
    this.name = "ServiceNotFoundError";
  }
};
var ParsingBlobError = class extends Error {
  constructor(err) {
    super("Error parsing response as Blob: " + err);
    this.name = "ParsingBlobError";
  }
};
var JsonParseError = class extends Error {
  constructor(paramName, data) {
    super(`Error: in JSON parsing of ${paramName}. Cannot parse: ${data}`);
    this.name = "JsonParseError";
  }
};
var ParameterNotFoundError = class extends Error {
  constructor(paramName) {
    super(`Error: no parameter '${paramName}' was found`);
    this.name = "ParameterNotFoundError";
  }
};
var SettingParameterError = class extends Error {
  constructor(message) {
    super(`Error setting parameter to camera: ${message}`);
    this.name = "SettingParameterError";
  }
};
var ApplicationAPIError = class extends Error {
  constructor(action, reason) {
    super(`Error performing application action '${action}': ${reason}`);
    this.action = action;
    this.name = "ApplicationAPIError";
  }
  action;
};
var SDCardActionError = class extends Error {
  constructor(action, reason) {
    super(`Error performing SD card action '${action}': ${reason}`);
    this.action = action;
    this.name = "SDCardActionError";
  }
  action;
};
var SDCardJobError = class extends Error {
  constructor(reason) {
    super(`Error while fetching SD card job progress: ${reason}`);
    this.name = "SDCardJobError";
  }
};
var MAX_FPS_ERROR_MESSAGES = {
  MALFORMED_REPLY: "Malformed reply from camera",
  CHANNEL_NOT_FOUND: "Video channel not found.",
  CAPTURE_MODE_NOT_FOUND: "No enabled capture mode found.",
  FPS_NOT_SPECIFIED: "Max fps not specified for given capture mode."
};
var MaxFPSError = class extends Error {
  constructor(state) {
    super(`[MAX_FPS ${state}] Error: ` + MAX_FPS_ERROR_MESSAGES[state]);
    this.name = "MaxFPSError";
  }
};
var NoDeviceInfoError = class extends Error {
  constructor() {
    super("Did not get any data from remote camera");
    this.name = "NoDeviceInfoError";
  }
};
var FetchDeviceInfoError = class extends Error {
  constructor(err) {
    super("Error fetching remote camera data: " + err);
    this.name = "NoDeviceInfoFromCameraError";
  }
};
var AddNewClipError = class extends Error {
  constructor(message) {
    super("Error adding new clip: " + message);
    this.name = "AddNewClipError";
  }
};
var GenerateSilenceError = class extends Error {
  constructor(message) {
    super("Error generating silence clip: " + message);
    this.name = "GenerateSilenceError";
  }
};
var PtzNotSupportedError = class extends Error {
  constructor() {
    super("Ptz not supported.");
    this.name = "PtzNotSupportedError";
  }
};
var StorageDataFetchError = class extends Error {
  constructor(err) {
    super("Error fetching storage data: " + err);
    this.name = "StorageDataFetchError";
  }
};
var WsAuthorizationError = class extends Error {
  constructor(message) {
    super("Server error on ws authorization: " + message);
    this.name = "WsAuthorizationError";
  }
};
var UtcTimeFetchError = class extends Error {
  constructor(message) {
    super("Server error on get UTC time: " + message);
    this.name = "UtcTimeFetchError";
  }
};
var TimezoneNotSetupError = class extends Error {
  constructor() {
    super("Time zone not setup on the device");
    this.name = "TimezoneNotSetupError";
  }
};
var TimezoneFetchError = class extends Error {
  constructor(err) {
    super("Error fetching time zone information: " + err);
    this.name = "TimezoneFetchError";
  }
};
var ResetCalibrationError = class extends ErrorWithResponse {
  constructor(type, res) {
    super(res);
    this.type = type;
    this.name = "ResetCalibrationError";
  }
  type;
};
var ImportSettingsError = class extends ErrorWithResponse {
  constructor(res) {
    super(res);
    this.name = "ImportSettingsError";
  }
};
var CannotSetCoordsInAutoModeError = class extends Error {
  constructor() {
    super("The automatic mode doesn't allow control of the camera.");
    this.name = "CannotSetCoordsInAutoModeError";
  }
};
var InvalidLatLngError = class extends Error {
  constructor() {
    super("The provided latitude or longitude parameters are invalid.");
    this.name = "InvalidLatLngError";
  }
};
var InvalidAltitudeError = class extends Error {
  constructor() {
    super("The provided altitude parameter is invalid.");
    this.name = "InvalidAltitudeError";
  }
};
var ServerError = class extends Error {
  constructor() {
    super("An internal server error occurred.");
    this.name = "ServerError";
  }
};
var BadRequestError = class extends ErrorWithResponse {
  constructor(res) {
    super(res);
    this.name = "BadRequestError";
  }
};
var MigrationError = class extends Error {
  valid;
  old;
  invalid;
  unknown;
  constructor(valid, old, invalid = [], unknown = []) {
    super("Migration to newer version is needed: some stream entries failed to parse.");
    this.name = "MigrationError";
    this.valid = valid;
    this.old = old;
    this.invalid = invalid;
    this.unknown = unknown;
  }
};

// src/internal/constants.ts
var FIRMWARE_WITH_BITRATE_MODES_SUPPORT = "11.11.73";
var FIRMWARE_WITH_OVERLAYS_SUPPORT = "10.7.0";
var PORT_PARAMS = {
  inputNbr: "Input.NbrOfInputs",
  outputNbr: "Output.NbrOfOutputs",
  inputName: (port) => `IOPort.I${port}.Input.Name`,
  outputName: (port) => `IOPort.I${port}.Output.Name`,
  inputState: (port) => `IOPort.I${port}.Input.Trig`,
  outputState: (port) => `IOPort.I${port}.Output.Active`,
  configurable: (port) => `IOPort.I${port}.Configurable`,
  usage: (port) => `IOPort.I${port}.Usage`,
  direction: (port) => `IOPort.I${port}.Direction`
};

// src/internal/versionCompare.ts
var assertVersionString = (s, msg) => {
  if (!s.match(/^[0-9]+(\.[0-9]+){1,3}$/)) {
    throw new Error(msg ?? `${s} is not a version`);
  }
};
var isFirmwareVersionAtLeast = (version, compareVersion) => {
  return firmwareVersionCompare(version, compareVersion) >= 0;
};
var isVersionAtLeast = (version, compareVersion) => {
  return versionCompare(version, compareVersion) >= 0;
};
var firmwareVersionCompare = (a, b) => {
  const versions = [a, b];
  const matchBetaFirmwareVersion = (x) => /^CVP-/.test(x) || /^[0-9]+.*beta/.test(x);
  if (versions.every(matchBetaFirmwareVersion)) {
    return 0;
  }
  if (matchBetaFirmwareVersion(a)) {
    return -1;
  }
  if (matchBetaFirmwareVersion(b)) {
    return 1;
  }
  return versionCompare(a, b);
};
var versionCompare = (a, b) => {
  assertVersionString(a);
  assertVersionString(b);
  const aSplit = parseVersion(a);
  const bSplit = parseVersion(b);
  for (let i = 0; i < aSplit.length; i++) {
    if (aSplit[i] !== bSplit[i]) {
      return aSplit[i] < bSplit[i] ? -1 : 1;
    }
  }
  return 0;
};
var fixVersionToDots = (version) => version.replaceAll("-", ".");
var parseVersion = (version) => {
  assertVersionString(version);
  const parsed = version.split(".").map((s) => parseInt(s));
  parsed.push(...Array(4 - parsed.length).fill(0));
  return parsed;
};

// src/internal/convertors.ts
var parseBitrateOptionsToVapixParams = (firmWareVersion, bitrateMode, cameraOptions) => {
  if (!isFirmwareVersionAtLeast(firmWareVersion, FIRMWARE_WITH_BITRATE_MODES_SUPPORT)) {
    return `videomaxbitrate=${cameraOptions.maximumBitRate}`;
  }
  if (bitrateMode === void 0) {
    return "";
  }
  const data = {
    VBR: "videobitratemode=vbr",
    MBR: `videobitratemode=mbr&videomaxbitrate=${cameraOptions.maximumBitRate}&videobitratepriority=framerate`,
    ABR: `videobitratemode=abr&videoabrtargetbitrate=${cameraOptions.maximumBitRate}&videoabrretentiontime=${cameraOptions.retentionTime}&videoabrmaxbitrate=${cameraOptions.bitRateLimit}`
  };
  return data[bitrateMode];
};
var parseVapixParamsToBitrateOptions = (bitrateVapixParams) => {
  const params = {};
  const searchParams = new URLSearchParams(bitrateVapixParams);
  searchParams.forEach((value, key) => {
    params[key] = value;
  });
  const bitrateMode = params["videobitratemode"] !== void 0 ? params["videobitratemode"].toUpperCase() : void 0;
  const hasLowerFw = bitrateMode === void 0 && params["videomaxbitrate"] !== void 0;
  if (hasLowerFw) {
    const maximumBitRate = parseInt(params["videomaxbitrate"] ?? "0", 10);
    return {
      bitrateMode: "MBR",
      maximumBitRate,
      retentionTime: 1,
      bitRateLimit: Math.floor(maximumBitRate * 1.1)
    };
  }
  if (bitrateMode === "ABR") {
    const maximumBitRate = parseInt(params["videoabrtargetbitrate"] ?? "0", 10);
    const retentionTime = parseInt(params["videoabrretentiontime"] ?? "0", 10);
    const bitRateLimit = parseInt(params["videoabrmaxbitrate"] ?? "0", 10);
    return {
      bitrateMode,
      maximumBitRate,
      retentionTime,
      bitRateLimit
    };
  } else if (bitrateMode === "MBR") {
    const maximumBitRate = params["videomaxbitrate"] !== void 0 ? parseInt(params["videomaxbitrate"], 10) : null;
    const oldMaximumBitrateParamValue = parseInt(params["videombrmaxbitrate"] ?? "0", 10);
    return {
      bitrateMode,
      maximumBitRate: maximumBitRate ?? oldMaximumBitrateParamValue,
      retentionTime: 1,
      bitRateLimit: Math.floor(maximumBitRate ?? oldMaximumBitrateParamValue * 1.1)
    };
  }
  return {
    bitrateMode,
    retentionTime: 1,
    maximumBitRate: 0,
    bitRateLimit: 0
  };
};
var parseVideoOptionsToVapixParams = (firmWareVersion, video) => {
  const bitrateParams = parseBitrateOptionsToVapixParams(firmWareVersion, video.bitrateMode, {
    maximumBitRate: video.maximumBitRate,
    retentionTime: video.retentionTime,
    bitRateLimit: video.bitRateLimit
  });
  let overlaysParams = "";
  if (isFirmwareVersionAtLeast(firmWareVersion, FIRMWARE_WITH_OVERLAYS_SUPPORT) && video.overlays !== void 0) {
    overlaysParams = `&overlays=${video.overlays}`;
  }
  const nbrOfChannels = video.nbrOfChannels ? video.audio === 1 ? `&nbrOfChannels=${video.nbrOfChannels}` : "" : "";
  const audioParams = `audio=${video.audio}${nbrOfChannels}`;
  const videoCodecParams = video.videoCodec === "h264" ? `videocodec=${video.videoCodec}&h264profile=${video.h264Profile}` : `videocodec=${video.videoCodec}`;
  const videoParams = `camera=${video.camera}&resolution=${video.resolution}&fps=${video.fps}&compression=${video.compression}&videokeyframeinterval=${video.govLength}&${videoCodecParams}${overlaysParams}`;
  return [videoParams, bitrateParams, audioParams].join("&");
};
var parseVapixParamsToVideoOptions = (internalVapixParams) => {
  const bitrateOptions = parseVapixParamsToBitrateOptions(internalVapixParams);
  const params = {};
  const searchParams = new URLSearchParams(internalVapixParams);
  searchParams.forEach((value, key) => {
    params[key] = value;
  });
  let h264Profile = void 0;
  if (params["videocodec"] === "h264") {
    h264Profile = params["h264profile"] ?? params["h264Profile"] ?? "high";
  }
  let nbrOfChannels = void 0;
  if (params["audio"] === "1") {
    nbrOfChannels = parseInt(params["nbrOfChannels"] ?? "1");
  }
  return {
    ...bitrateOptions,
    camera: params["camera"] ?? "1",
    resolution: params["resolution"] ?? "",
    fps: parseInt(params["fps"] ?? "0", 10),
    compression: parseInt(params["compression"] ?? "0", 10),
    govLength: parseInt(params["videokeyframeinterval"] ?? "0", 10),
    videoCodec: params["videocodec"] ?? "h264",
    h264Profile,
    audio: parseInt(params["audio"] ?? "0"),
    nbrOfChannels,
    overlays: params["overlays"]
  };
};

// src/internal/utils.ts
var addParametersToPath = (path, params) => {
  if (params === void 0 || Object.keys(params).length === 0) {
    return path;
  }
  const joinChar = path.indexOf("?") === -1 ? "?" : "&";
  return `${path}${joinChar}${paramToUrl(params)}`;
};
var paramToUrl = (params) => {
  if (params === void 0) {
    return "";
  }
  let output = "";
  for (const key in params) {
    const value = params[key];
    if (isNullish(value)) {
      continue;
    }
    output += `${encodeURIComponent(key)}=${encodeURIComponent(value)}&`;
  }
  return output.slice(0, output.length - 1);
};
var arrayToUrl = (arr) => {
  if (Array.isArray(arr)) {
    return arr.join(",");
  }
  return arr;
};
var isCamera = (id) => id?.charAt(0) === "c";
var isStream = (id) => id?.charAt(0) === "c" || id?.charAt(0) === "a";
var isClip = (id) => id?.charAt(0) === "s";
var isTracker = (id) => id?.charAt(0) === "t";
var isPlaylist = (id) => id?.charAt(0) === "p";
var isLoopPlayType = (playType) => playType.includes("LOOP");
function pad(num, size) {
  const sign = Math.sign(num) === -1 ? "-" : "";
  return sign + new Array(size).concat([Math.abs(num)]).join("0").slice(-size);
}
function isNullish(value) {
  return value === null || value === void 0;
}

// src/internal/ProxyClient.ts
var ProxyClient = class {
  constructor(client, proxyParams) {
    this.client = client;
    this.proxyParams = proxyParams;
  }
  client;
  proxyParams;
  get(params) {
    const { path, parameters, headers, timeout } = params;
    const targetPath = addParametersToPath(path, parameters);
    const { realPath, realHeaders } = this.getReal(targetPath, headers);
    return this.client.get({ path: realPath, headers: realHeaders, timeout });
  }
  post(params) {
    const { path, data, parameters, headers, timeout } = params;
    const targetPath = addParametersToPath(path, parameters);
    const { realPath, realHeaders } = this.getReal(targetPath, headers);
    return this.client.post({ path: realPath, data, headers: realHeaders, timeout });
  }
  getReal(targetPath, headers) {
    return {
      realPath: this.proxyParams.path,
      realHeaders: {
        ...headers ?? {},
        "x-target-camera-protocol": this.proxyParams.target.port === 443 ? "https" : "http",
        "x-target-camera-path": targetPath,
        "x-target-camera-ip": this.proxyParams.target.ip,
        "x-target-camera-mdns": this.proxyParams.target.mdnsName,
        "x-target-camera-port": String(this.proxyParams.target.port),
        "x-target-camera-pass": this.proxyParams.target.pass,
        "x-target-camera-user": this.proxyParams.target.user
      }
    };
  }
};

// node_modules/zod/v3/external.js
var external_exports = {};
__export(external_exports, {
  BRAND: () => BRAND,
  DIRTY: () => DIRTY,
  EMPTY_PATH: () => EMPTY_PATH,
  INVALID: () => INVALID,
  NEVER: () => NEVER,
  OK: () => OK,
  ParseStatus: () => ParseStatus,
  Schema: () => ZodType,
  ZodAny: () => ZodAny,
  ZodArray: () => ZodArray,
  ZodBigInt: () => ZodBigInt,
  ZodBoolean: () => ZodBoolean,
  ZodBranded: () => ZodBranded,
  ZodCatch: () => ZodCatch,
  ZodDate: () => ZodDate,
  ZodDefault: () => ZodDefault,
  ZodDiscriminatedUnion: () => ZodDiscriminatedUnion,
  ZodEffects: () => ZodEffects,
  ZodEnum: () => ZodEnum,
  ZodError: () => ZodError,
  ZodFirstPartyTypeKind: () => ZodFirstPartyTypeKind,
  ZodFunction: () => ZodFunction,
  ZodIntersection: () => ZodIntersection,
  ZodIssueCode: () => ZodIssueCode,
  ZodLazy: () => ZodLazy,
  ZodLiteral: () => ZodLiteral,
  ZodMap: () => ZodMap,
  ZodNaN: () => ZodNaN,
  ZodNativeEnum: () => ZodNativeEnum,
  ZodNever: () => ZodNever,
  ZodNull: () => ZodNull,
  ZodNullable: () => ZodNullable,
  ZodNumber: () => ZodNumber,
  ZodObject: () => ZodObject,
  ZodOptional: () => ZodOptional,
  ZodParsedType: () => ZodParsedType,
  ZodPipeline: () => ZodPipeline,
  ZodPromise: () => ZodPromise,
  ZodReadonly: () => ZodReadonly,
  ZodRecord: () => ZodRecord,
  ZodSchema: () => ZodType,
  ZodSet: () => ZodSet,
  ZodString: () => ZodString,
  ZodSymbol: () => ZodSymbol,
  ZodTransformer: () => ZodEffects,
  ZodTuple: () => ZodTuple,
  ZodType: () => ZodType,
  ZodUndefined: () => ZodUndefined,
  ZodUnion: () => ZodUnion,
  ZodUnknown: () => ZodUnknown,
  ZodVoid: () => ZodVoid,
  addIssueToContext: () => addIssueToContext,
  any: () => anyType,
  array: () => arrayType,
  bigint: () => bigIntType,
  boolean: () => booleanType,
  coerce: () => coerce,
  custom: () => custom,
  date: () => dateType,
  datetimeRegex: () => datetimeRegex,
  defaultErrorMap: () => en_default,
  discriminatedUnion: () => discriminatedUnionType,
  effect: () => effectsType,
  enum: () => enumType,
  function: () => functionType,
  getErrorMap: () => getErrorMap,
  getParsedType: () => getParsedType,
  instanceof: () => instanceOfType,
  intersection: () => intersectionType,
  isAborted: () => isAborted,
  isAsync: () => isAsync,
  isDirty: () => isDirty,
  isValid: () => isValid,
  late: () => late,
  lazy: () => lazyType,
  literal: () => literalType,
  makeIssue: () => makeIssue,
  map: () => mapType,
  nan: () => nanType,
  nativeEnum: () => nativeEnumType,
  never: () => neverType,
  null: () => nullType,
  nullable: () => nullableType,
  number: () => numberType,
  object: () => objectType,
  objectUtil: () => objectUtil,
  oboolean: () => oboolean,
  onumber: () => onumber,
  optional: () => optionalType,
  ostring: () => ostring,
  pipeline: () => pipelineType,
  preprocess: () => preprocessType,
  promise: () => promiseType,
  quotelessJson: () => quotelessJson,
  record: () => recordType,
  set: () => setType,
  setErrorMap: () => setErrorMap,
  strictObject: () => strictObjectType,
  string: () => stringType,
  symbol: () => symbolType,
  transformer: () => effectsType,
  tuple: () => tupleType,
  undefined: () => undefinedType,
  union: () => unionType,
  unknown: () => unknownType,
  util: () => util,
  void: () => voidType
});

// node_modules/zod/v3/helpers/util.js
var util;
(function(util2) {
  util2.assertEqual = (_) => {
  };
  function assertIs(_arg) {
  }
  util2.assertIs = assertIs;
  function assertNever(_x) {
    throw new Error();
  }
  util2.assertNever = assertNever;
  util2.arrayToEnum = (items) => {
    const obj = {};
    for (const item of items) {
      obj[item] = item;
    }
    return obj;
  };
  util2.getValidEnumValues = (obj) => {
    const validKeys = util2.objectKeys(obj).filter((k) => typeof obj[obj[k]] !== "number");
    const filtered = {};
    for (const k of validKeys) {
      filtered[k] = obj[k];
    }
    return util2.objectValues(filtered);
  };
  util2.objectValues = (obj) => {
    return util2.objectKeys(obj).map(function(e) {
      return obj[e];
    });
  };
  util2.objectKeys = typeof Object.keys === "function" ? (obj) => Object.keys(obj) : (object) => {
    const keys = [];
    for (const key in object) {
      if (Object.prototype.hasOwnProperty.call(object, key)) {
        keys.push(key);
      }
    }
    return keys;
  };
  util2.find = (arr, checker) => {
    for (const item of arr) {
      if (checker(item))
        return item;
    }
    return void 0;
  };
  util2.isInteger = typeof Number.isInteger === "function" ? (val) => Number.isInteger(val) : (val) => typeof val === "number" && Number.isFinite(val) && Math.floor(val) === val;
  function joinValues(array, separator = " | ") {
    return array.map((val) => typeof val === "string" ? `'${val}'` : val).join(separator);
  }
  util2.joinValues = joinValues;
  util2.jsonStringifyReplacer = (_, value) => {
    if (typeof value === "bigint") {
      return value.toString();
    }
    return value;
  };
})(util || (util = {}));
var objectUtil;
(function(objectUtil2) {
  objectUtil2.mergeShapes = (first, second) => {
    return {
      ...first,
      ...second
      // second overwrites first
    };
  };
})(objectUtil || (objectUtil = {}));
var ZodParsedType = util.arrayToEnum([
  "string",
  "nan",
  "number",
  "integer",
  "float",
  "boolean",
  "date",
  "bigint",
  "symbol",
  "function",
  "undefined",
  "null",
  "array",
  "object",
  "unknown",
  "promise",
  "void",
  "never",
  "map",
  "set"
]);
var getParsedType = (data) => {
  const t = typeof data;
  switch (t) {
    case "undefined":
      return ZodParsedType.undefined;
    case "string":
      return ZodParsedType.string;
    case "number":
      return Number.isNaN(data) ? ZodParsedType.nan : ZodParsedType.number;
    case "boolean":
      return ZodParsedType.boolean;
    case "function":
      return ZodParsedType.function;
    case "bigint":
      return ZodParsedType.bigint;
    case "symbol":
      return ZodParsedType.symbol;
    case "object":
      if (Array.isArray(data)) {
        return ZodParsedType.array;
      }
      if (data === null) {
        return ZodParsedType.null;
      }
      if (data.then && typeof data.then === "function" && data.catch && typeof data.catch === "function") {
        return ZodParsedType.promise;
      }
      if (typeof Map !== "undefined" && data instanceof Map) {
        return ZodParsedType.map;
      }
      if (typeof Set !== "undefined" && data instanceof Set) {
        return ZodParsedType.set;
      }
      if (typeof Date !== "undefined" && data instanceof Date) {
        return ZodParsedType.date;
      }
      return ZodParsedType.object;
    default:
      return ZodParsedType.unknown;
  }
};

// node_modules/zod/v3/ZodError.js
var ZodIssueCode = util.arrayToEnum([
  "invalid_type",
  "invalid_literal",
  "custom",
  "invalid_union",
  "invalid_union_discriminator",
  "invalid_enum_value",
  "unrecognized_keys",
  "invalid_arguments",
  "invalid_return_type",
  "invalid_date",
  "invalid_string",
  "too_small",
  "too_big",
  "invalid_intersection_types",
  "not_multiple_of",
  "not_finite"
]);
var quotelessJson = (obj) => {
  const json = JSON.stringify(obj, null, 2);
  return json.replace(/"([^"]+)":/g, "$1:");
};
var ZodError = class _ZodError extends Error {
  get errors() {
    return this.issues;
  }
  constructor(issues) {
    super();
    this.issues = [];
    this.addIssue = (sub) => {
      this.issues = [...this.issues, sub];
    };
    this.addIssues = (subs = []) => {
      this.issues = [...this.issues, ...subs];
    };
    const actualProto = new.target.prototype;
    if (Object.setPrototypeOf) {
      Object.setPrototypeOf(this, actualProto);
    } else {
      this.__proto__ = actualProto;
    }
    this.name = "ZodError";
    this.issues = issues;
  }
  format(_mapper) {
    const mapper = _mapper || function(issue) {
      return issue.message;
    };
    const fieldErrors = { _errors: [] };
    const processError = (error) => {
      for (const issue of error.issues) {
        if (issue.code === "invalid_union") {
          issue.unionErrors.map(processError);
        } else if (issue.code === "invalid_return_type") {
          processError(issue.returnTypeError);
        } else if (issue.code === "invalid_arguments") {
          processError(issue.argumentsError);
        } else if (issue.path.length === 0) {
          fieldErrors._errors.push(mapper(issue));
        } else {
          let curr = fieldErrors;
          let i = 0;
          while (i < issue.path.length) {
            const el = issue.path[i];
            const terminal = i === issue.path.length - 1;
            if (!terminal) {
              curr[el] = curr[el] || { _errors: [] };
            } else {
              curr[el] = curr[el] || { _errors: [] };
              curr[el]._errors.push(mapper(issue));
            }
            curr = curr[el];
            i++;
          }
        }
      }
    };
    processError(this);
    return fieldErrors;
  }
  static assert(value) {
    if (!(value instanceof _ZodError)) {
      throw new Error(`Not a ZodError: ${value}`);
    }
  }
  toString() {
    return this.message;
  }
  get message() {
    return JSON.stringify(this.issues, util.jsonStringifyReplacer, 2);
  }
  get isEmpty() {
    return this.issues.length === 0;
  }
  flatten(mapper = (issue) => issue.message) {
    const fieldErrors = {};
    const formErrors = [];
    for (const sub of this.issues) {
      if (sub.path.length > 0) {
        const firstEl = sub.path[0];
        fieldErrors[firstEl] = fieldErrors[firstEl] || [];
        fieldErrors[firstEl].push(mapper(sub));
      } else {
        formErrors.push(mapper(sub));
      }
    }
    return { formErrors, fieldErrors };
  }
  get formErrors() {
    return this.flatten();
  }
};
ZodError.create = (issues) => {
  const error = new ZodError(issues);
  return error;
};

// node_modules/zod/v3/locales/en.js
var errorMap = (issue, _ctx) => {
  let message;
  switch (issue.code) {
    case ZodIssueCode.invalid_type:
      if (issue.received === ZodParsedType.undefined) {
        message = "Required";
      } else {
        message = `Expected ${issue.expected}, received ${issue.received}`;
      }
      break;
    case ZodIssueCode.invalid_literal:
      message = `Invalid literal value, expected ${JSON.stringify(issue.expected, util.jsonStringifyReplacer)}`;
      break;
    case ZodIssueCode.unrecognized_keys:
      message = `Unrecognized key(s) in object: ${util.joinValues(issue.keys, ", ")}`;
      break;
    case ZodIssueCode.invalid_union:
      message = `Invalid input`;
      break;
    case ZodIssueCode.invalid_union_discriminator:
      message = `Invalid discriminator value. Expected ${util.joinValues(issue.options)}`;
      break;
    case ZodIssueCode.invalid_enum_value:
      message = `Invalid enum value. Expected ${util.joinValues(issue.options)}, received '${issue.received}'`;
      break;
    case ZodIssueCode.invalid_arguments:
      message = `Invalid function arguments`;
      break;
    case ZodIssueCode.invalid_return_type:
      message = `Invalid function return type`;
      break;
    case ZodIssueCode.invalid_date:
      message = `Invalid date`;
      break;
    case ZodIssueCode.invalid_string:
      if (typeof issue.validation === "object") {
        if ("includes" in issue.validation) {
          message = `Invalid input: must include "${issue.validation.includes}"`;
          if (typeof issue.validation.position === "number") {
            message = `${message} at one or more positions greater than or equal to ${issue.validation.position}`;
          }
        } else if ("startsWith" in issue.validation) {
          message = `Invalid input: must start with "${issue.validation.startsWith}"`;
        } else if ("endsWith" in issue.validation) {
          message = `Invalid input: must end with "${issue.validation.endsWith}"`;
        } else {
          util.assertNever(issue.validation);
        }
      } else if (issue.validation !== "regex") {
        message = `Invalid ${issue.validation}`;
      } else {
        message = "Invalid";
      }
      break;
    case ZodIssueCode.too_small:
      if (issue.type === "array")
        message = `Array must contain ${issue.exact ? "exactly" : issue.inclusive ? `at least` : `more than`} ${issue.minimum} element(s)`;
      else if (issue.type === "string")
        message = `String must contain ${issue.exact ? "exactly" : issue.inclusive ? `at least` : `over`} ${issue.minimum} character(s)`;
      else if (issue.type === "number")
        message = `Number must be ${issue.exact ? `exactly equal to ` : issue.inclusive ? `greater than or equal to ` : `greater than `}${issue.minimum}`;
      else if (issue.type === "bigint")
        message = `Number must be ${issue.exact ? `exactly equal to ` : issue.inclusive ? `greater than or equal to ` : `greater than `}${issue.minimum}`;
      else if (issue.type === "date")
        message = `Date must be ${issue.exact ? `exactly equal to ` : issue.inclusive ? `greater than or equal to ` : `greater than `}${new Date(Number(issue.minimum))}`;
      else
        message = "Invalid input";
      break;
    case ZodIssueCode.too_big:
      if (issue.type === "array")
        message = `Array must contain ${issue.exact ? `exactly` : issue.inclusive ? `at most` : `less than`} ${issue.maximum} element(s)`;
      else if (issue.type === "string")
        message = `String must contain ${issue.exact ? `exactly` : issue.inclusive ? `at most` : `under`} ${issue.maximum} character(s)`;
      else if (issue.type === "number")
        message = `Number must be ${issue.exact ? `exactly` : issue.inclusive ? `less than or equal to` : `less than`} ${issue.maximum}`;
      else if (issue.type === "bigint")
        message = `BigInt must be ${issue.exact ? `exactly` : issue.inclusive ? `less than or equal to` : `less than`} ${issue.maximum}`;
      else if (issue.type === "date")
        message = `Date must be ${issue.exact ? `exactly` : issue.inclusive ? `smaller than or equal to` : `smaller than`} ${new Date(Number(issue.maximum))}`;
      else
        message = "Invalid input";
      break;
    case ZodIssueCode.custom:
      message = `Invalid input`;
      break;
    case ZodIssueCode.invalid_intersection_types:
      message = `Intersection results could not be merged`;
      break;
    case ZodIssueCode.not_multiple_of:
      message = `Number must be a multiple of ${issue.multipleOf}`;
      break;
    case ZodIssueCode.not_finite:
      message = "Number must be finite";
      break;
    default:
      message = _ctx.defaultError;
      util.assertNever(issue);
  }
  return { message };
};
var en_default = errorMap;

// node_modules/zod/v3/errors.js
var overrideErrorMap = en_default;
function setErrorMap(map) {
  overrideErrorMap = map;
}
function getErrorMap() {
  return overrideErrorMap;
}

// node_modules/zod/v3/helpers/parseUtil.js
var makeIssue = (params) => {
  const { data, path, errorMaps, issueData } = params;
  const fullPath = [...path, ...issueData.path || []];
  const fullIssue = {
    ...issueData,
    path: fullPath
  };
  if (issueData.message !== void 0) {
    return {
      ...issueData,
      path: fullPath,
      message: issueData.message
    };
  }
  let errorMessage = "";
  const maps = errorMaps.filter((m) => !!m).slice().reverse();
  for (const map of maps) {
    errorMessage = map(fullIssue, { data, defaultError: errorMessage }).message;
  }
  return {
    ...issueData,
    path: fullPath,
    message: errorMessage
  };
};
var EMPTY_PATH = [];
function addIssueToContext(ctx, issueData) {
  const overrideMap = getErrorMap();
  const issue = makeIssue({
    issueData,
    data: ctx.data,
    path: ctx.path,
    errorMaps: [
      ctx.common.contextualErrorMap,
      // contextual error map is first priority
      ctx.schemaErrorMap,
      // then schema-bound map if available
      overrideMap,
      // then global override map
      overrideMap === en_default ? void 0 : en_default
      // then global default map
    ].filter((x) => !!x)
  });
  ctx.common.issues.push(issue);
}
var ParseStatus = class _ParseStatus {
  constructor() {
    this.value = "valid";
  }
  dirty() {
    if (this.value === "valid")
      this.value = "dirty";
  }
  abort() {
    if (this.value !== "aborted")
      this.value = "aborted";
  }
  static mergeArray(status, results) {
    const arrayValue = [];
    for (const s of results) {
      if (s.status === "aborted")
        return INVALID;
      if (s.status === "dirty")
        status.dirty();
      arrayValue.push(s.value);
    }
    return { status: status.value, value: arrayValue };
  }
  static async mergeObjectAsync(status, pairs) {
    const syncPairs = [];
    for (const pair of pairs) {
      const key = await pair.key;
      const value = await pair.value;
      syncPairs.push({
        key,
        value
      });
    }
    return _ParseStatus.mergeObjectSync(status, syncPairs);
  }
  static mergeObjectSync(status, pairs) {
    const finalObject = {};
    for (const pair of pairs) {
      const { key, value } = pair;
      if (key.status === "aborted")
        return INVALID;
      if (value.status === "aborted")
        return INVALID;
      if (key.status === "dirty")
        status.dirty();
      if (value.status === "dirty")
        status.dirty();
      if (key.value !== "__proto__" && (typeof value.value !== "undefined" || pair.alwaysSet)) {
        finalObject[key.value] = value.value;
      }
    }
    return { status: status.value, value: finalObject };
  }
};
var INVALID = Object.freeze({
  status: "aborted"
});
var DIRTY = (value) => ({ status: "dirty", value });
var OK = (value) => ({ status: "valid", value });
var isAborted = (x) => x.status === "aborted";
var isDirty = (x) => x.status === "dirty";
var isValid = (x) => x.status === "valid";
var isAsync = (x) => typeof Promise !== "undefined" && x instanceof Promise;

// node_modules/zod/v3/helpers/errorUtil.js
var errorUtil;
(function(errorUtil2) {
  errorUtil2.errToObj = (message) => typeof message === "string" ? { message } : message || {};
  errorUtil2.toString = (message) => typeof message === "string" ? message : message?.message;
})(errorUtil || (errorUtil = {}));

// node_modules/zod/v3/types.js
var ParseInputLazyPath = class {
  constructor(parent, value, path, key) {
    this._cachedPath = [];
    this.parent = parent;
    this.data = value;
    this._path = path;
    this._key = key;
  }
  get path() {
    if (!this._cachedPath.length) {
      if (Array.isArray(this._key)) {
        this._cachedPath.push(...this._path, ...this._key);
      } else {
        this._cachedPath.push(...this._path, this._key);
      }
    }
    return this._cachedPath;
  }
};
var handleResult = (ctx, result) => {
  if (isValid(result)) {
    return { success: true, data: result.value };
  } else {
    if (!ctx.common.issues.length) {
      throw new Error("Validation failed but no issues detected.");
    }
    return {
      success: false,
      get error() {
        if (this._error)
          return this._error;
        const error = new ZodError(ctx.common.issues);
        this._error = error;
        return this._error;
      }
    };
  }
};
function processCreateParams(params) {
  if (!params)
    return {};
  const { errorMap: errorMap2, invalid_type_error, required_error, description } = params;
  if (errorMap2 && (invalid_type_error || required_error)) {
    throw new Error(`Can't use "invalid_type_error" or "required_error" in conjunction with custom error map.`);
  }
  if (errorMap2)
    return { errorMap: errorMap2, description };
  const customMap = (iss, ctx) => {
    const { message } = params;
    if (iss.code === "invalid_enum_value") {
      return { message: message ?? ctx.defaultError };
    }
    if (typeof ctx.data === "undefined") {
      return { message: message ?? required_error ?? ctx.defaultError };
    }
    if (iss.code !== "invalid_type")
      return { message: ctx.defaultError };
    return { message: message ?? invalid_type_error ?? ctx.defaultError };
  };
  return { errorMap: customMap, description };
}
var ZodType = class {
  get description() {
    return this._def.description;
  }
  _getType(input) {
    return getParsedType(input.data);
  }
  _getOrReturnCtx(input, ctx) {
    return ctx || {
      common: input.parent.common,
      data: input.data,
      parsedType: getParsedType(input.data),
      schemaErrorMap: this._def.errorMap,
      path: input.path,
      parent: input.parent
    };
  }
  _processInputParams(input) {
    return {
      status: new ParseStatus(),
      ctx: {
        common: input.parent.common,
        data: input.data,
        parsedType: getParsedType(input.data),
        schemaErrorMap: this._def.errorMap,
        path: input.path,
        parent: input.parent
      }
    };
  }
  _parseSync(input) {
    const result = this._parse(input);
    if (isAsync(result)) {
      throw new Error("Synchronous parse encountered promise.");
    }
    return result;
  }
  _parseAsync(input) {
    const result = this._parse(input);
    return Promise.resolve(result);
  }
  parse(data, params) {
    const result = this.safeParse(data, params);
    if (result.success)
      return result.data;
    throw result.error;
  }
  safeParse(data, params) {
    const ctx = {
      common: {
        issues: [],
        async: params?.async ?? false,
        contextualErrorMap: params?.errorMap
      },
      path: params?.path || [],
      schemaErrorMap: this._def.errorMap,
      parent: null,
      data,
      parsedType: getParsedType(data)
    };
    const result = this._parseSync({ data, path: ctx.path, parent: ctx });
    return handleResult(ctx, result);
  }
  "~validate"(data) {
    const ctx = {
      common: {
        issues: [],
        async: !!this["~standard"].async
      },
      path: [],
      schemaErrorMap: this._def.errorMap,
      parent: null,
      data,
      parsedType: getParsedType(data)
    };
    if (!this["~standard"].async) {
      try {
        const result = this._parseSync({ data, path: [], parent: ctx });
        return isValid(result) ? {
          value: result.value
        } : {
          issues: ctx.common.issues
        };
      } catch (err) {
        if (err?.message?.toLowerCase()?.includes("encountered")) {
          this["~standard"].async = true;
        }
        ctx.common = {
          issues: [],
          async: true
        };
      }
    }
    return this._parseAsync({ data, path: [], parent: ctx }).then((result) => isValid(result) ? {
      value: result.value
    } : {
      issues: ctx.common.issues
    });
  }
  async parseAsync(data, params) {
    const result = await this.safeParseAsync(data, params);
    if (result.success)
      return result.data;
    throw result.error;
  }
  async safeParseAsync(data, params) {
    const ctx = {
      common: {
        issues: [],
        contextualErrorMap: params?.errorMap,
        async: true
      },
      path: params?.path || [],
      schemaErrorMap: this._def.errorMap,
      parent: null,
      data,
      parsedType: getParsedType(data)
    };
    const maybeAsyncResult = this._parse({ data, path: ctx.path, parent: ctx });
    const result = await (isAsync(maybeAsyncResult) ? maybeAsyncResult : Promise.resolve(maybeAsyncResult));
    return handleResult(ctx, result);
  }
  refine(check, message) {
    const getIssueProperties = (val) => {
      if (typeof message === "string" || typeof message === "undefined") {
        return { message };
      } else if (typeof message === "function") {
        return message(val);
      } else {
        return message;
      }
    };
    return this._refinement((val, ctx) => {
      const result = check(val);
      const setError = () => ctx.addIssue({
        code: ZodIssueCode.custom,
        ...getIssueProperties(val)
      });
      if (typeof Promise !== "undefined" && result instanceof Promise) {
        return result.then((data) => {
          if (!data) {
            setError();
            return false;
          } else {
            return true;
          }
        });
      }
      if (!result) {
        setError();
        return false;
      } else {
        return true;
      }
    });
  }
  refinement(check, refinementData) {
    return this._refinement((val, ctx) => {
      if (!check(val)) {
        ctx.addIssue(typeof refinementData === "function" ? refinementData(val, ctx) : refinementData);
        return false;
      } else {
        return true;
      }
    });
  }
  _refinement(refinement) {
    return new ZodEffects({
      schema: this,
      typeName: ZodFirstPartyTypeKind.ZodEffects,
      effect: { type: "refinement", refinement }
    });
  }
  superRefine(refinement) {
    return this._refinement(refinement);
  }
  constructor(def) {
    this.spa = this.safeParseAsync;
    this._def = def;
    this.parse = this.parse.bind(this);
    this.safeParse = this.safeParse.bind(this);
    this.parseAsync = this.parseAsync.bind(this);
    this.safeParseAsync = this.safeParseAsync.bind(this);
    this.spa = this.spa.bind(this);
    this.refine = this.refine.bind(this);
    this.refinement = this.refinement.bind(this);
    this.superRefine = this.superRefine.bind(this);
    this.optional = this.optional.bind(this);
    this.nullable = this.nullable.bind(this);
    this.nullish = this.nullish.bind(this);
    this.array = this.array.bind(this);
    this.promise = this.promise.bind(this);
    this.or = this.or.bind(this);
    this.and = this.and.bind(this);
    this.transform = this.transform.bind(this);
    this.brand = this.brand.bind(this);
    this.default = this.default.bind(this);
    this.catch = this.catch.bind(this);
    this.describe = this.describe.bind(this);
    this.pipe = this.pipe.bind(this);
    this.readonly = this.readonly.bind(this);
    this.isNullable = this.isNullable.bind(this);
    this.isOptional = this.isOptional.bind(this);
    this["~standard"] = {
      version: 1,
      vendor: "zod",
      validate: (data) => this["~validate"](data)
    };
  }
  optional() {
    return ZodOptional.create(this, this._def);
  }
  nullable() {
    return ZodNullable.create(this, this._def);
  }
  nullish() {
    return this.nullable().optional();
  }
  array() {
    return ZodArray.create(this);
  }
  promise() {
    return ZodPromise.create(this, this._def);
  }
  or(option) {
    return ZodUnion.create([this, option], this._def);
  }
  and(incoming) {
    return ZodIntersection.create(this, incoming, this._def);
  }
  transform(transform) {
    return new ZodEffects({
      ...processCreateParams(this._def),
      schema: this,
      typeName: ZodFirstPartyTypeKind.ZodEffects,
      effect: { type: "transform", transform }
    });
  }
  default(def) {
    const defaultValueFunc = typeof def === "function" ? def : () => def;
    return new ZodDefault({
      ...processCreateParams(this._def),
      innerType: this,
      defaultValue: defaultValueFunc,
      typeName: ZodFirstPartyTypeKind.ZodDefault
    });
  }
  brand() {
    return new ZodBranded({
      typeName: ZodFirstPartyTypeKind.ZodBranded,
      type: this,
      ...processCreateParams(this._def)
    });
  }
  catch(def) {
    const catchValueFunc = typeof def === "function" ? def : () => def;
    return new ZodCatch({
      ...processCreateParams(this._def),
      innerType: this,
      catchValue: catchValueFunc,
      typeName: ZodFirstPartyTypeKind.ZodCatch
    });
  }
  describe(description) {
    const This = this.constructor;
    return new This({
      ...this._def,
      description
    });
  }
  pipe(target) {
    return ZodPipeline.create(this, target);
  }
  readonly() {
    return ZodReadonly.create(this);
  }
  isOptional() {
    return this.safeParse(void 0).success;
  }
  isNullable() {
    return this.safeParse(null).success;
  }
};
var cuidRegex = /^c[^\s-]{8,}$/i;
var cuid2Regex = /^[0-9a-z]+$/;
var ulidRegex = /^[0-9A-HJKMNP-TV-Z]{26}$/i;
var uuidRegex = /^[0-9a-fA-F]{8}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{12}$/i;
var nanoidRegex = /^[a-z0-9_-]{21}$/i;
var jwtRegex = /^[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_]*$/;
var durationRegex = /^[-+]?P(?!$)(?:(?:[-+]?\d+Y)|(?:[-+]?\d+[.,]\d+Y$))?(?:(?:[-+]?\d+M)|(?:[-+]?\d+[.,]\d+M$))?(?:(?:[-+]?\d+W)|(?:[-+]?\d+[.,]\d+W$))?(?:(?:[-+]?\d+D)|(?:[-+]?\d+[.,]\d+D$))?(?:T(?=[\d+-])(?:(?:[-+]?\d+H)|(?:[-+]?\d+[.,]\d+H$))?(?:(?:[-+]?\d+M)|(?:[-+]?\d+[.,]\d+M$))?(?:[-+]?\d+(?:[.,]\d+)?S)?)??$/;
var emailRegex = /^(?!\.)(?!.*\.\.)([A-Z0-9_'+\-\.]*)[A-Z0-9_+-]@([A-Z0-9][A-Z0-9\-]*\.)+[A-Z]{2,}$/i;
var _emojiRegex = `^(\\p{Extended_Pictographic}|\\p{Emoji_Component})+$`;
var emojiRegex;
var ipv4Regex = /^(?:(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\.){3}(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])$/;
var ipv4CidrRegex = /^(?:(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\.){3}(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\/(3[0-2]|[12]?[0-9])$/;
var ipv6Regex = /^(([0-9a-fA-F]{1,4}:){7,7}[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,7}:|([0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,5}(:[0-9a-fA-F]{1,4}){1,2}|([0-9a-fA-F]{1,4}:){1,4}(:[0-9a-fA-F]{1,4}){1,3}|([0-9a-fA-F]{1,4}:){1,3}(:[0-9a-fA-F]{1,4}){1,4}|([0-9a-fA-F]{1,4}:){1,2}(:[0-9a-fA-F]{1,4}){1,5}|[0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,6})|:((:[0-9a-fA-F]{1,4}){1,7}|:)|fe80:(:[0-9a-fA-F]{0,4}){0,4}%[0-9a-zA-Z]{1,}|::(ffff(:0{1,4}){0,1}:){0,1}((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])|([0-9a-fA-F]{1,4}:){1,4}:((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9]))$/;
var ipv6CidrRegex = /^(([0-9a-fA-F]{1,4}:){7,7}[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,7}:|([0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,5}(:[0-9a-fA-F]{1,4}){1,2}|([0-9a-fA-F]{1,4}:){1,4}(:[0-9a-fA-F]{1,4}){1,3}|([0-9a-fA-F]{1,4}:){1,3}(:[0-9a-fA-F]{1,4}){1,4}|([0-9a-fA-F]{1,4}:){1,2}(:[0-9a-fA-F]{1,4}){1,5}|[0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,6})|:((:[0-9a-fA-F]{1,4}){1,7}|:)|fe80:(:[0-9a-fA-F]{0,4}){0,4}%[0-9a-zA-Z]{1,}|::(ffff(:0{1,4}){0,1}:){0,1}((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])|([0-9a-fA-F]{1,4}:){1,4}:((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9]))\/(12[0-8]|1[01][0-9]|[1-9]?[0-9])$/;
var base64Regex = /^([0-9a-zA-Z+/]{4})*(([0-9a-zA-Z+/]{2}==)|([0-9a-zA-Z+/]{3}=))?$/;
var base64urlRegex = /^([0-9a-zA-Z-_]{4})*(([0-9a-zA-Z-_]{2}(==)?)|([0-9a-zA-Z-_]{3}(=)?))?$/;
var dateRegexSource = `((\\d\\d[2468][048]|\\d\\d[13579][26]|\\d\\d0[48]|[02468][048]00|[13579][26]00)-02-29|\\d{4}-((0[13578]|1[02])-(0[1-9]|[12]\\d|3[01])|(0[469]|11)-(0[1-9]|[12]\\d|30)|(02)-(0[1-9]|1\\d|2[0-8])))`;
var dateRegex = new RegExp(`^${dateRegexSource}$`);
function timeRegexSource(args) {
  let secondsRegexSource = `[0-5]\\d`;
  if (args.precision) {
    secondsRegexSource = `${secondsRegexSource}\\.\\d{${args.precision}}`;
  } else if (args.precision == null) {
    secondsRegexSource = `${secondsRegexSource}(\\.\\d+)?`;
  }
  const secondsQuantifier = args.precision ? "+" : "?";
  return `([01]\\d|2[0-3]):[0-5]\\d(:${secondsRegexSource})${secondsQuantifier}`;
}
function timeRegex(args) {
  return new RegExp(`^${timeRegexSource(args)}$`);
}
function datetimeRegex(args) {
  let regex = `${dateRegexSource}T${timeRegexSource(args)}`;
  const opts = [];
  opts.push(args.local ? `Z?` : `Z`);
  if (args.offset)
    opts.push(`([+-]\\d{2}:?\\d{2})`);
  regex = `${regex}(${opts.join("|")})`;
  return new RegExp(`^${regex}$`);
}
function isValidIP(ip, version) {
  if ((version === "v4" || !version) && ipv4Regex.test(ip)) {
    return true;
  }
  if ((version === "v6" || !version) && ipv6Regex.test(ip)) {
    return true;
  }
  return false;
}
function isValidJWT(jwt, alg) {
  if (!jwtRegex.test(jwt))
    return false;
  try {
    const [header] = jwt.split(".");
    if (!header)
      return false;
    const base64 = header.replace(/-/g, "+").replace(/_/g, "/").padEnd(header.length + (4 - header.length % 4) % 4, "=");
    const decoded = JSON.parse(atob(base64));
    if (typeof decoded !== "object" || decoded === null)
      return false;
    if ("typ" in decoded && decoded?.typ !== "JWT")
      return false;
    if (!decoded.alg)
      return false;
    if (alg && decoded.alg !== alg)
      return false;
    return true;
  } catch {
    return false;
  }
}
function isValidCidr(ip, version) {
  if ((version === "v4" || !version) && ipv4CidrRegex.test(ip)) {
    return true;
  }
  if ((version === "v6" || !version) && ipv6CidrRegex.test(ip)) {
    return true;
  }
  return false;
}
var ZodString = class _ZodString extends ZodType {
  _parse(input) {
    if (this._def.coerce) {
      input.data = String(input.data);
    }
    const parsedType = this._getType(input);
    if (parsedType !== ZodParsedType.string) {
      const ctx2 = this._getOrReturnCtx(input);
      addIssueToContext(ctx2, {
        code: ZodIssueCode.invalid_type,
        expected: ZodParsedType.string,
        received: ctx2.parsedType
      });
      return INVALID;
    }
    const status = new ParseStatus();
    let ctx = void 0;
    for (const check of this._def.checks) {
      if (check.kind === "min") {
        if (input.data.length < check.value) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            code: ZodIssueCode.too_small,
            minimum: check.value,
            type: "string",
            inclusive: true,
            exact: false,
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "max") {
        if (input.data.length > check.value) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            code: ZodIssueCode.too_big,
            maximum: check.value,
            type: "string",
            inclusive: true,
            exact: false,
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "length") {
        const tooBig = input.data.length > check.value;
        const tooSmall = input.data.length < check.value;
        if (tooBig || tooSmall) {
          ctx = this._getOrReturnCtx(input, ctx);
          if (tooBig) {
            addIssueToContext(ctx, {
              code: ZodIssueCode.too_big,
              maximum: check.value,
              type: "string",
              inclusive: true,
              exact: true,
              message: check.message
            });
          } else if (tooSmall) {
            addIssueToContext(ctx, {
              code: ZodIssueCode.too_small,
              minimum: check.value,
              type: "string",
              inclusive: true,
              exact: true,
              message: check.message
            });
          }
          status.dirty();
        }
      } else if (check.kind === "email") {
        if (!emailRegex.test(input.data)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            validation: "email",
            code: ZodIssueCode.invalid_string,
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "emoji") {
        if (!emojiRegex) {
          emojiRegex = new RegExp(_emojiRegex, "u");
        }
        if (!emojiRegex.test(input.data)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            validation: "emoji",
            code: ZodIssueCode.invalid_string,
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "uuid") {
        if (!uuidRegex.test(input.data)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            validation: "uuid",
            code: ZodIssueCode.invalid_string,
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "nanoid") {
        if (!nanoidRegex.test(input.data)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            validation: "nanoid",
            code: ZodIssueCode.invalid_string,
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "cuid") {
        if (!cuidRegex.test(input.data)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            validation: "cuid",
            code: ZodIssueCode.invalid_string,
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "cuid2") {
        if (!cuid2Regex.test(input.data)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            validation: "cuid2",
            code: ZodIssueCode.invalid_string,
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "ulid") {
        if (!ulidRegex.test(input.data)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            validation: "ulid",
            code: ZodIssueCode.invalid_string,
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "url") {
        try {
          new URL(input.data);
        } catch {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            validation: "url",
            code: ZodIssueCode.invalid_string,
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "regex") {
        check.regex.lastIndex = 0;
        const testResult = check.regex.test(input.data);
        if (!testResult) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            validation: "regex",
            code: ZodIssueCode.invalid_string,
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "trim") {
        input.data = input.data.trim();
      } else if (check.kind === "includes") {
        if (!input.data.includes(check.value, check.position)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            code: ZodIssueCode.invalid_string,
            validation: { includes: check.value, position: check.position },
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "toLowerCase") {
        input.data = input.data.toLowerCase();
      } else if (check.kind === "toUpperCase") {
        input.data = input.data.toUpperCase();
      } else if (check.kind === "startsWith") {
        if (!input.data.startsWith(check.value)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            code: ZodIssueCode.invalid_string,
            validation: { startsWith: check.value },
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "endsWith") {
        if (!input.data.endsWith(check.value)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            code: ZodIssueCode.invalid_string,
            validation: { endsWith: check.value },
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "datetime") {
        const regex = datetimeRegex(check);
        if (!regex.test(input.data)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            code: ZodIssueCode.invalid_string,
            validation: "datetime",
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "date") {
        const regex = dateRegex;
        if (!regex.test(input.data)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            code: ZodIssueCode.invalid_string,
            validation: "date",
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "time") {
        const regex = timeRegex(check);
        if (!regex.test(input.data)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            code: ZodIssueCode.invalid_string,
            validation: "time",
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "duration") {
        if (!durationRegex.test(input.data)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            validation: "duration",
            code: ZodIssueCode.invalid_string,
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "ip") {
        if (!isValidIP(input.data, check.version)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            validation: "ip",
            code: ZodIssueCode.invalid_string,
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "jwt") {
        if (!isValidJWT(input.data, check.alg)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            validation: "jwt",
            code: ZodIssueCode.invalid_string,
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "cidr") {
        if (!isValidCidr(input.data, check.version)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            validation: "cidr",
            code: ZodIssueCode.invalid_string,
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "base64") {
        if (!base64Regex.test(input.data)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            validation: "base64",
            code: ZodIssueCode.invalid_string,
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "base64url") {
        if (!base64urlRegex.test(input.data)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            validation: "base64url",
            code: ZodIssueCode.invalid_string,
            message: check.message
          });
          status.dirty();
        }
      } else {
        util.assertNever(check);
      }
    }
    return { status: status.value, value: input.data };
  }
  _regex(regex, validation, message) {
    return this.refinement((data) => regex.test(data), {
      validation,
      code: ZodIssueCode.invalid_string,
      ...errorUtil.errToObj(message)
    });
  }
  _addCheck(check) {
    return new _ZodString({
      ...this._def,
      checks: [...this._def.checks, check]
    });
  }
  email(message) {
    return this._addCheck({ kind: "email", ...errorUtil.errToObj(message) });
  }
  url(message) {
    return this._addCheck({ kind: "url", ...errorUtil.errToObj(message) });
  }
  emoji(message) {
    return this._addCheck({ kind: "emoji", ...errorUtil.errToObj(message) });
  }
  uuid(message) {
    return this._addCheck({ kind: "uuid", ...errorUtil.errToObj(message) });
  }
  nanoid(message) {
    return this._addCheck({ kind: "nanoid", ...errorUtil.errToObj(message) });
  }
  cuid(message) {
    return this._addCheck({ kind: "cuid", ...errorUtil.errToObj(message) });
  }
  cuid2(message) {
    return this._addCheck({ kind: "cuid2", ...errorUtil.errToObj(message) });
  }
  ulid(message) {
    return this._addCheck({ kind: "ulid", ...errorUtil.errToObj(message) });
  }
  base64(message) {
    return this._addCheck({ kind: "base64", ...errorUtil.errToObj(message) });
  }
  base64url(message) {
    return this._addCheck({
      kind: "base64url",
      ...errorUtil.errToObj(message)
    });
  }
  jwt(options) {
    return this._addCheck({ kind: "jwt", ...errorUtil.errToObj(options) });
  }
  ip(options) {
    return this._addCheck({ kind: "ip", ...errorUtil.errToObj(options) });
  }
  cidr(options) {
    return this._addCheck({ kind: "cidr", ...errorUtil.errToObj(options) });
  }
  datetime(options) {
    if (typeof options === "string") {
      return this._addCheck({
        kind: "datetime",
        precision: null,
        offset: false,
        local: false,
        message: options
      });
    }
    return this._addCheck({
      kind: "datetime",
      precision: typeof options?.precision === "undefined" ? null : options?.precision,
      offset: options?.offset ?? false,
      local: options?.local ?? false,
      ...errorUtil.errToObj(options?.message)
    });
  }
  date(message) {
    return this._addCheck({ kind: "date", message });
  }
  time(options) {
    if (typeof options === "string") {
      return this._addCheck({
        kind: "time",
        precision: null,
        message: options
      });
    }
    return this._addCheck({
      kind: "time",
      precision: typeof options?.precision === "undefined" ? null : options?.precision,
      ...errorUtil.errToObj(options?.message)
    });
  }
  duration(message) {
    return this._addCheck({ kind: "duration", ...errorUtil.errToObj(message) });
  }
  regex(regex, message) {
    return this._addCheck({
      kind: "regex",
      regex,
      ...errorUtil.errToObj(message)
    });
  }
  includes(value, options) {
    return this._addCheck({
      kind: "includes",
      value,
      position: options?.position,
      ...errorUtil.errToObj(options?.message)
    });
  }
  startsWith(value, message) {
    return this._addCheck({
      kind: "startsWith",
      value,
      ...errorUtil.errToObj(message)
    });
  }
  endsWith(value, message) {
    return this._addCheck({
      kind: "endsWith",
      value,
      ...errorUtil.errToObj(message)
    });
  }
  min(minLength, message) {
    return this._addCheck({
      kind: "min",
      value: minLength,
      ...errorUtil.errToObj(message)
    });
  }
  max(maxLength, message) {
    return this._addCheck({
      kind: "max",
      value: maxLength,
      ...errorUtil.errToObj(message)
    });
  }
  length(len, message) {
    return this._addCheck({
      kind: "length",
      value: len,
      ...errorUtil.errToObj(message)
    });
  }
  /**
   * Equivalent to `.min(1)`
   */
  nonempty(message) {
    return this.min(1, errorUtil.errToObj(message));
  }
  trim() {
    return new _ZodString({
      ...this._def,
      checks: [...this._def.checks, { kind: "trim" }]
    });
  }
  toLowerCase() {
    return new _ZodString({
      ...this._def,
      checks: [...this._def.checks, { kind: "toLowerCase" }]
    });
  }
  toUpperCase() {
    return new _ZodString({
      ...this._def,
      checks: [...this._def.checks, { kind: "toUpperCase" }]
    });
  }
  get isDatetime() {
    return !!this._def.checks.find((ch) => ch.kind === "datetime");
  }
  get isDate() {
    return !!this._def.checks.find((ch) => ch.kind === "date");
  }
  get isTime() {
    return !!this._def.checks.find((ch) => ch.kind === "time");
  }
  get isDuration() {
    return !!this._def.checks.find((ch) => ch.kind === "duration");
  }
  get isEmail() {
    return !!this._def.checks.find((ch) => ch.kind === "email");
  }
  get isURL() {
    return !!this._def.checks.find((ch) => ch.kind === "url");
  }
  get isEmoji() {
    return !!this._def.checks.find((ch) => ch.kind === "emoji");
  }
  get isUUID() {
    return !!this._def.checks.find((ch) => ch.kind === "uuid");
  }
  get isNANOID() {
    return !!this._def.checks.find((ch) => ch.kind === "nanoid");
  }
  get isCUID() {
    return !!this._def.checks.find((ch) => ch.kind === "cuid");
  }
  get isCUID2() {
    return !!this._def.checks.find((ch) => ch.kind === "cuid2");
  }
  get isULID() {
    return !!this._def.checks.find((ch) => ch.kind === "ulid");
  }
  get isIP() {
    return !!this._def.checks.find((ch) => ch.kind === "ip");
  }
  get isCIDR() {
    return !!this._def.checks.find((ch) => ch.kind === "cidr");
  }
  get isBase64() {
    return !!this._def.checks.find((ch) => ch.kind === "base64");
  }
  get isBase64url() {
    return !!this._def.checks.find((ch) => ch.kind === "base64url");
  }
  get minLength() {
    let min = null;
    for (const ch of this._def.checks) {
      if (ch.kind === "min") {
        if (min === null || ch.value > min)
          min = ch.value;
      }
    }
    return min;
  }
  get maxLength() {
    let max = null;
    for (const ch of this._def.checks) {
      if (ch.kind === "max") {
        if (max === null || ch.value < max)
          max = ch.value;
      }
    }
    return max;
  }
};
ZodString.create = (params) => {
  return new ZodString({
    checks: [],
    typeName: ZodFirstPartyTypeKind.ZodString,
    coerce: params?.coerce ?? false,
    ...processCreateParams(params)
  });
};
function floatSafeRemainder(val, step) {
  const valDecCount = (val.toString().split(".")[1] || "").length;
  const stepDecCount = (step.toString().split(".")[1] || "").length;
  const decCount = valDecCount > stepDecCount ? valDecCount : stepDecCount;
  const valInt = Number.parseInt(val.toFixed(decCount).replace(".", ""));
  const stepInt = Number.parseInt(step.toFixed(decCount).replace(".", ""));
  return valInt % stepInt / 10 ** decCount;
}
var ZodNumber = class _ZodNumber extends ZodType {
  constructor() {
    super(...arguments);
    this.min = this.gte;
    this.max = this.lte;
    this.step = this.multipleOf;
  }
  _parse(input) {
    if (this._def.coerce) {
      input.data = Number(input.data);
    }
    const parsedType = this._getType(input);
    if (parsedType !== ZodParsedType.number) {
      const ctx2 = this._getOrReturnCtx(input);
      addIssueToContext(ctx2, {
        code: ZodIssueCode.invalid_type,
        expected: ZodParsedType.number,
        received: ctx2.parsedType
      });
      return INVALID;
    }
    let ctx = void 0;
    const status = new ParseStatus();
    for (const check of this._def.checks) {
      if (check.kind === "int") {
        if (!util.isInteger(input.data)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            code: ZodIssueCode.invalid_type,
            expected: "integer",
            received: "float",
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "min") {
        const tooSmall = check.inclusive ? input.data < check.value : input.data <= check.value;
        if (tooSmall) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            code: ZodIssueCode.too_small,
            minimum: check.value,
            type: "number",
            inclusive: check.inclusive,
            exact: false,
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "max") {
        const tooBig = check.inclusive ? input.data > check.value : input.data >= check.value;
        if (tooBig) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            code: ZodIssueCode.too_big,
            maximum: check.value,
            type: "number",
            inclusive: check.inclusive,
            exact: false,
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "multipleOf") {
        if (floatSafeRemainder(input.data, check.value) !== 0) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            code: ZodIssueCode.not_multiple_of,
            multipleOf: check.value,
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "finite") {
        if (!Number.isFinite(input.data)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            code: ZodIssueCode.not_finite,
            message: check.message
          });
          status.dirty();
        }
      } else {
        util.assertNever(check);
      }
    }
    return { status: status.value, value: input.data };
  }
  gte(value, message) {
    return this.setLimit("min", value, true, errorUtil.toString(message));
  }
  gt(value, message) {
    return this.setLimit("min", value, false, errorUtil.toString(message));
  }
  lte(value, message) {
    return this.setLimit("max", value, true, errorUtil.toString(message));
  }
  lt(value, message) {
    return this.setLimit("max", value, false, errorUtil.toString(message));
  }
  setLimit(kind, value, inclusive, message) {
    return new _ZodNumber({
      ...this._def,
      checks: [
        ...this._def.checks,
        {
          kind,
          value,
          inclusive,
          message: errorUtil.toString(message)
        }
      ]
    });
  }
  _addCheck(check) {
    return new _ZodNumber({
      ...this._def,
      checks: [...this._def.checks, check]
    });
  }
  int(message) {
    return this._addCheck({
      kind: "int",
      message: errorUtil.toString(message)
    });
  }
  positive(message) {
    return this._addCheck({
      kind: "min",
      value: 0,
      inclusive: false,
      message: errorUtil.toString(message)
    });
  }
  negative(message) {
    return this._addCheck({
      kind: "max",
      value: 0,
      inclusive: false,
      message: errorUtil.toString(message)
    });
  }
  nonpositive(message) {
    return this._addCheck({
      kind: "max",
      value: 0,
      inclusive: true,
      message: errorUtil.toString(message)
    });
  }
  nonnegative(message) {
    return this._addCheck({
      kind: "min",
      value: 0,
      inclusive: true,
      message: errorUtil.toString(message)
    });
  }
  multipleOf(value, message) {
    return this._addCheck({
      kind: "multipleOf",
      value,
      message: errorUtil.toString(message)
    });
  }
  finite(message) {
    return this._addCheck({
      kind: "finite",
      message: errorUtil.toString(message)
    });
  }
  safe(message) {
    return this._addCheck({
      kind: "min",
      inclusive: true,
      value: Number.MIN_SAFE_INTEGER,
      message: errorUtil.toString(message)
    })._addCheck({
      kind: "max",
      inclusive: true,
      value: Number.MAX_SAFE_INTEGER,
      message: errorUtil.toString(message)
    });
  }
  get minValue() {
    let min = null;
    for (const ch of this._def.checks) {
      if (ch.kind === "min") {
        if (min === null || ch.value > min)
          min = ch.value;
      }
    }
    return min;
  }
  get maxValue() {
    let max = null;
    for (const ch of this._def.checks) {
      if (ch.kind === "max") {
        if (max === null || ch.value < max)
          max = ch.value;
      }
    }
    return max;
  }
  get isInt() {
    return !!this._def.checks.find((ch) => ch.kind === "int" || ch.kind === "multipleOf" && util.isInteger(ch.value));
  }
  get isFinite() {
    let max = null;
    let min = null;
    for (const ch of this._def.checks) {
      if (ch.kind === "finite" || ch.kind === "int" || ch.kind === "multipleOf") {
        return true;
      } else if (ch.kind === "min") {
        if (min === null || ch.value > min)
          min = ch.value;
      } else if (ch.kind === "max") {
        if (max === null || ch.value < max)
          max = ch.value;
      }
    }
    return Number.isFinite(min) && Number.isFinite(max);
  }
};
ZodNumber.create = (params) => {
  return new ZodNumber({
    checks: [],
    typeName: ZodFirstPartyTypeKind.ZodNumber,
    coerce: params?.coerce || false,
    ...processCreateParams(params)
  });
};
var ZodBigInt = class _ZodBigInt extends ZodType {
  constructor() {
    super(...arguments);
    this.min = this.gte;
    this.max = this.lte;
  }
  _parse(input) {
    if (this._def.coerce) {
      try {
        input.data = BigInt(input.data);
      } catch {
        return this._getInvalidInput(input);
      }
    }
    const parsedType = this._getType(input);
    if (parsedType !== ZodParsedType.bigint) {
      return this._getInvalidInput(input);
    }
    let ctx = void 0;
    const status = new ParseStatus();
    for (const check of this._def.checks) {
      if (check.kind === "min") {
        const tooSmall = check.inclusive ? input.data < check.value : input.data <= check.value;
        if (tooSmall) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            code: ZodIssueCode.too_small,
            type: "bigint",
            minimum: check.value,
            inclusive: check.inclusive,
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "max") {
        const tooBig = check.inclusive ? input.data > check.value : input.data >= check.value;
        if (tooBig) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            code: ZodIssueCode.too_big,
            type: "bigint",
            maximum: check.value,
            inclusive: check.inclusive,
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "multipleOf") {
        if (input.data % check.value !== BigInt(0)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            code: ZodIssueCode.not_multiple_of,
            multipleOf: check.value,
            message: check.message
          });
          status.dirty();
        }
      } else {
        util.assertNever(check);
      }
    }
    return { status: status.value, value: input.data };
  }
  _getInvalidInput(input) {
    const ctx = this._getOrReturnCtx(input);
    addIssueToContext(ctx, {
      code: ZodIssueCode.invalid_type,
      expected: ZodParsedType.bigint,
      received: ctx.parsedType
    });
    return INVALID;
  }
  gte(value, message) {
    return this.setLimit("min", value, true, errorUtil.toString(message));
  }
  gt(value, message) {
    return this.setLimit("min", value, false, errorUtil.toString(message));
  }
  lte(value, message) {
    return this.setLimit("max", value, true, errorUtil.toString(message));
  }
  lt(value, message) {
    return this.setLimit("max", value, false, errorUtil.toString(message));
  }
  setLimit(kind, value, inclusive, message) {
    return new _ZodBigInt({
      ...this._def,
      checks: [
        ...this._def.checks,
        {
          kind,
          value,
          inclusive,
          message: errorUtil.toString(message)
        }
      ]
    });
  }
  _addCheck(check) {
    return new _ZodBigInt({
      ...this._def,
      checks: [...this._def.checks, check]
    });
  }
  positive(message) {
    return this._addCheck({
      kind: "min",
      value: BigInt(0),
      inclusive: false,
      message: errorUtil.toString(message)
    });
  }
  negative(message) {
    return this._addCheck({
      kind: "max",
      value: BigInt(0),
      inclusive: false,
      message: errorUtil.toString(message)
    });
  }
  nonpositive(message) {
    return this._addCheck({
      kind: "max",
      value: BigInt(0),
      inclusive: true,
      message: errorUtil.toString(message)
    });
  }
  nonnegative(message) {
    return this._addCheck({
      kind: "min",
      value: BigInt(0),
      inclusive: true,
      message: errorUtil.toString(message)
    });
  }
  multipleOf(value, message) {
    return this._addCheck({
      kind: "multipleOf",
      value,
      message: errorUtil.toString(message)
    });
  }
  get minValue() {
    let min = null;
    for (const ch of this._def.checks) {
      if (ch.kind === "min") {
        if (min === null || ch.value > min)
          min = ch.value;
      }
    }
    return min;
  }
  get maxValue() {
    let max = null;
    for (const ch of this._def.checks) {
      if (ch.kind === "max") {
        if (max === null || ch.value < max)
          max = ch.value;
      }
    }
    return max;
  }
};
ZodBigInt.create = (params) => {
  return new ZodBigInt({
    checks: [],
    typeName: ZodFirstPartyTypeKind.ZodBigInt,
    coerce: params?.coerce ?? false,
    ...processCreateParams(params)
  });
};
var ZodBoolean = class extends ZodType {
  _parse(input) {
    if (this._def.coerce) {
      input.data = Boolean(input.data);
    }
    const parsedType = this._getType(input);
    if (parsedType !== ZodParsedType.boolean) {
      const ctx = this._getOrReturnCtx(input);
      addIssueToContext(ctx, {
        code: ZodIssueCode.invalid_type,
        expected: ZodParsedType.boolean,
        received: ctx.parsedType
      });
      return INVALID;
    }
    return OK(input.data);
  }
};
ZodBoolean.create = (params) => {
  return new ZodBoolean({
    typeName: ZodFirstPartyTypeKind.ZodBoolean,
    coerce: params?.coerce || false,
    ...processCreateParams(params)
  });
};
var ZodDate = class _ZodDate extends ZodType {
  _parse(input) {
    if (this._def.coerce) {
      input.data = new Date(input.data);
    }
    const parsedType = this._getType(input);
    if (parsedType !== ZodParsedType.date) {
      const ctx2 = this._getOrReturnCtx(input);
      addIssueToContext(ctx2, {
        code: ZodIssueCode.invalid_type,
        expected: ZodParsedType.date,
        received: ctx2.parsedType
      });
      return INVALID;
    }
    if (Number.isNaN(input.data.getTime())) {
      const ctx2 = this._getOrReturnCtx(input);
      addIssueToContext(ctx2, {
        code: ZodIssueCode.invalid_date
      });
      return INVALID;
    }
    const status = new ParseStatus();
    let ctx = void 0;
    for (const check of this._def.checks) {
      if (check.kind === "min") {
        if (input.data.getTime() < check.value) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            code: ZodIssueCode.too_small,
            message: check.message,
            inclusive: true,
            exact: false,
            minimum: check.value,
            type: "date"
          });
          status.dirty();
        }
      } else if (check.kind === "max") {
        if (input.data.getTime() > check.value) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            code: ZodIssueCode.too_big,
            message: check.message,
            inclusive: true,
            exact: false,
            maximum: check.value,
            type: "date"
          });
          status.dirty();
        }
      } else {
        util.assertNever(check);
      }
    }
    return {
      status: status.value,
      value: new Date(input.data.getTime())
    };
  }
  _addCheck(check) {
    return new _ZodDate({
      ...this._def,
      checks: [...this._def.checks, check]
    });
  }
  min(minDate, message) {
    return this._addCheck({
      kind: "min",
      value: minDate.getTime(),
      message: errorUtil.toString(message)
    });
  }
  max(maxDate, message) {
    return this._addCheck({
      kind: "max",
      value: maxDate.getTime(),
      message: errorUtil.toString(message)
    });
  }
  get minDate() {
    let min = null;
    for (const ch of this._def.checks) {
      if (ch.kind === "min") {
        if (min === null || ch.value > min)
          min = ch.value;
      }
    }
    return min != null ? new Date(min) : null;
  }
  get maxDate() {
    let max = null;
    for (const ch of this._def.checks) {
      if (ch.kind === "max") {
        if (max === null || ch.value < max)
          max = ch.value;
      }
    }
    return max != null ? new Date(max) : null;
  }
};
ZodDate.create = (params) => {
  return new ZodDate({
    checks: [],
    coerce: params?.coerce || false,
    typeName: ZodFirstPartyTypeKind.ZodDate,
    ...processCreateParams(params)
  });
};
var ZodSymbol = class extends ZodType {
  _parse(input) {
    const parsedType = this._getType(input);
    if (parsedType !== ZodParsedType.symbol) {
      const ctx = this._getOrReturnCtx(input);
      addIssueToContext(ctx, {
        code: ZodIssueCode.invalid_type,
        expected: ZodParsedType.symbol,
        received: ctx.parsedType
      });
      return INVALID;
    }
    return OK(input.data);
  }
};
ZodSymbol.create = (params) => {
  return new ZodSymbol({
    typeName: ZodFirstPartyTypeKind.ZodSymbol,
    ...processCreateParams(params)
  });
};
var ZodUndefined = class extends ZodType {
  _parse(input) {
    const parsedType = this._getType(input);
    if (parsedType !== ZodParsedType.undefined) {
      const ctx = this._getOrReturnCtx(input);
      addIssueToContext(ctx, {
        code: ZodIssueCode.invalid_type,
        expected: ZodParsedType.undefined,
        received: ctx.parsedType
      });
      return INVALID;
    }
    return OK(input.data);
  }
};
ZodUndefined.create = (params) => {
  return new ZodUndefined({
    typeName: ZodFirstPartyTypeKind.ZodUndefined,
    ...processCreateParams(params)
  });
};
var ZodNull = class extends ZodType {
  _parse(input) {
    const parsedType = this._getType(input);
    if (parsedType !== ZodParsedType.null) {
      const ctx = this._getOrReturnCtx(input);
      addIssueToContext(ctx, {
        code: ZodIssueCode.invalid_type,
        expected: ZodParsedType.null,
        received: ctx.parsedType
      });
      return INVALID;
    }
    return OK(input.data);
  }
};
ZodNull.create = (params) => {
  return new ZodNull({
    typeName: ZodFirstPartyTypeKind.ZodNull,
    ...processCreateParams(params)
  });
};
var ZodAny = class extends ZodType {
  constructor() {
    super(...arguments);
    this._any = true;
  }
  _parse(input) {
    return OK(input.data);
  }
};
ZodAny.create = (params) => {
  return new ZodAny({
    typeName: ZodFirstPartyTypeKind.ZodAny,
    ...processCreateParams(params)
  });
};
var ZodUnknown = class extends ZodType {
  constructor() {
    super(...arguments);
    this._unknown = true;
  }
  _parse(input) {
    return OK(input.data);
  }
};
ZodUnknown.create = (params) => {
  return new ZodUnknown({
    typeName: ZodFirstPartyTypeKind.ZodUnknown,
    ...processCreateParams(params)
  });
};
var ZodNever = class extends ZodType {
  _parse(input) {
    const ctx = this._getOrReturnCtx(input);
    addIssueToContext(ctx, {
      code: ZodIssueCode.invalid_type,
      expected: ZodParsedType.never,
      received: ctx.parsedType
    });
    return INVALID;
  }
};
ZodNever.create = (params) => {
  return new ZodNever({
    typeName: ZodFirstPartyTypeKind.ZodNever,
    ...processCreateParams(params)
  });
};
var ZodVoid = class extends ZodType {
  _parse(input) {
    const parsedType = this._getType(input);
    if (parsedType !== ZodParsedType.undefined) {
      const ctx = this._getOrReturnCtx(input);
      addIssueToContext(ctx, {
        code: ZodIssueCode.invalid_type,
        expected: ZodParsedType.void,
        received: ctx.parsedType
      });
      return INVALID;
    }
    return OK(input.data);
  }
};
ZodVoid.create = (params) => {
  return new ZodVoid({
    typeName: ZodFirstPartyTypeKind.ZodVoid,
    ...processCreateParams(params)
  });
};
var ZodArray = class _ZodArray extends ZodType {
  _parse(input) {
    const { ctx, status } = this._processInputParams(input);
    const def = this._def;
    if (ctx.parsedType !== ZodParsedType.array) {
      addIssueToContext(ctx, {
        code: ZodIssueCode.invalid_type,
        expected: ZodParsedType.array,
        received: ctx.parsedType
      });
      return INVALID;
    }
    if (def.exactLength !== null) {
      const tooBig = ctx.data.length > def.exactLength.value;
      const tooSmall = ctx.data.length < def.exactLength.value;
      if (tooBig || tooSmall) {
        addIssueToContext(ctx, {
          code: tooBig ? ZodIssueCode.too_big : ZodIssueCode.too_small,
          minimum: tooSmall ? def.exactLength.value : void 0,
          maximum: tooBig ? def.exactLength.value : void 0,
          type: "array",
          inclusive: true,
          exact: true,
          message: def.exactLength.message
        });
        status.dirty();
      }
    }
    if (def.minLength !== null) {
      if (ctx.data.length < def.minLength.value) {
        addIssueToContext(ctx, {
          code: ZodIssueCode.too_small,
          minimum: def.minLength.value,
          type: "array",
          inclusive: true,
          exact: false,
          message: def.minLength.message
        });
        status.dirty();
      }
    }
    if (def.maxLength !== null) {
      if (ctx.data.length > def.maxLength.value) {
        addIssueToContext(ctx, {
          code: ZodIssueCode.too_big,
          maximum: def.maxLength.value,
          type: "array",
          inclusive: true,
          exact: false,
          message: def.maxLength.message
        });
        status.dirty();
      }
    }
    if (ctx.common.async) {
      return Promise.all([...ctx.data].map((item, i) => {
        return def.type._parseAsync(new ParseInputLazyPath(ctx, item, ctx.path, i));
      })).then((result2) => {
        return ParseStatus.mergeArray(status, result2);
      });
    }
    const result = [...ctx.data].map((item, i) => {
      return def.type._parseSync(new ParseInputLazyPath(ctx, item, ctx.path, i));
    });
    return ParseStatus.mergeArray(status, result);
  }
  get element() {
    return this._def.type;
  }
  min(minLength, message) {
    return new _ZodArray({
      ...this._def,
      minLength: { value: minLength, message: errorUtil.toString(message) }
    });
  }
  max(maxLength, message) {
    return new _ZodArray({
      ...this._def,
      maxLength: { value: maxLength, message: errorUtil.toString(message) }
    });
  }
  length(len, message) {
    return new _ZodArray({
      ...this._def,
      exactLength: { value: len, message: errorUtil.toString(message) }
    });
  }
  nonempty(message) {
    return this.min(1, message);
  }
};
ZodArray.create = (schema, params) => {
  return new ZodArray({
    type: schema,
    minLength: null,
    maxLength: null,
    exactLength: null,
    typeName: ZodFirstPartyTypeKind.ZodArray,
    ...processCreateParams(params)
  });
};
function deepPartialify(schema) {
  if (schema instanceof ZodObject) {
    const newShape = {};
    for (const key in schema.shape) {
      const fieldSchema2 = schema.shape[key];
      newShape[key] = ZodOptional.create(deepPartialify(fieldSchema2));
    }
    return new ZodObject({
      ...schema._def,
      shape: () => newShape
    });
  } else if (schema instanceof ZodArray) {
    return new ZodArray({
      ...schema._def,
      type: deepPartialify(schema.element)
    });
  } else if (schema instanceof ZodOptional) {
    return ZodOptional.create(deepPartialify(schema.unwrap()));
  } else if (schema instanceof ZodNullable) {
    return ZodNullable.create(deepPartialify(schema.unwrap()));
  } else if (schema instanceof ZodTuple) {
    return ZodTuple.create(schema.items.map((item) => deepPartialify(item)));
  } else {
    return schema;
  }
}
var ZodObject = class _ZodObject extends ZodType {
  constructor() {
    super(...arguments);
    this._cached = null;
    this.nonstrict = this.passthrough;
    this.augment = this.extend;
  }
  _getCached() {
    if (this._cached !== null)
      return this._cached;
    const shape = this._def.shape();
    const keys = util.objectKeys(shape);
    this._cached = { shape, keys };
    return this._cached;
  }
  _parse(input) {
    const parsedType = this._getType(input);
    if (parsedType !== ZodParsedType.object) {
      const ctx2 = this._getOrReturnCtx(input);
      addIssueToContext(ctx2, {
        code: ZodIssueCode.invalid_type,
        expected: ZodParsedType.object,
        received: ctx2.parsedType
      });
      return INVALID;
    }
    const { status, ctx } = this._processInputParams(input);
    const { shape, keys: shapeKeys } = this._getCached();
    const extraKeys = [];
    if (!(this._def.catchall instanceof ZodNever && this._def.unknownKeys === "strip")) {
      for (const key in ctx.data) {
        if (!shapeKeys.includes(key)) {
          extraKeys.push(key);
        }
      }
    }
    const pairs = [];
    for (const key of shapeKeys) {
      const keyValidator = shape[key];
      const value = ctx.data[key];
      pairs.push({
        key: { status: "valid", value: key },
        value: keyValidator._parse(new ParseInputLazyPath(ctx, value, ctx.path, key)),
        alwaysSet: key in ctx.data
      });
    }
    if (this._def.catchall instanceof ZodNever) {
      const unknownKeys = this._def.unknownKeys;
      if (unknownKeys === "passthrough") {
        for (const key of extraKeys) {
          pairs.push({
            key: { status: "valid", value: key },
            value: { status: "valid", value: ctx.data[key] }
          });
        }
      } else if (unknownKeys === "strict") {
        if (extraKeys.length > 0) {
          addIssueToContext(ctx, {
            code: ZodIssueCode.unrecognized_keys,
            keys: extraKeys
          });
          status.dirty();
        }
      } else if (unknownKeys === "strip") {
      } else {
        throw new Error(`Internal ZodObject error: invalid unknownKeys value.`);
      }
    } else {
      const catchall = this._def.catchall;
      for (const key of extraKeys) {
        const value = ctx.data[key];
        pairs.push({
          key: { status: "valid", value: key },
          value: catchall._parse(
            new ParseInputLazyPath(ctx, value, ctx.path, key)
            //, ctx.child(key), value, getParsedType(value)
          ),
          alwaysSet: key in ctx.data
        });
      }
    }
    if (ctx.common.async) {
      return Promise.resolve().then(async () => {
        const syncPairs = [];
        for (const pair of pairs) {
          const key = await pair.key;
          const value = await pair.value;
          syncPairs.push({
            key,
            value,
            alwaysSet: pair.alwaysSet
          });
        }
        return syncPairs;
      }).then((syncPairs) => {
        return ParseStatus.mergeObjectSync(status, syncPairs);
      });
    } else {
      return ParseStatus.mergeObjectSync(status, pairs);
    }
  }
  get shape() {
    return this._def.shape();
  }
  strict(message) {
    errorUtil.errToObj;
    return new _ZodObject({
      ...this._def,
      unknownKeys: "strict",
      ...message !== void 0 ? {
        errorMap: (issue, ctx) => {
          const defaultError = this._def.errorMap?.(issue, ctx).message ?? ctx.defaultError;
          if (issue.code === "unrecognized_keys")
            return {
              message: errorUtil.errToObj(message).message ?? defaultError
            };
          return {
            message: defaultError
          };
        }
      } : {}
    });
  }
  strip() {
    return new _ZodObject({
      ...this._def,
      unknownKeys: "strip"
    });
  }
  passthrough() {
    return new _ZodObject({
      ...this._def,
      unknownKeys: "passthrough"
    });
  }
  // const AugmentFactory =
  //   <Def extends ZodObjectDef>(def: Def) =>
  //   <Augmentation extends ZodRawShape>(
  //     augmentation: Augmentation
  //   ): ZodObject<
  //     extendShape<ReturnType<Def["shape"]>, Augmentation>,
  //     Def["unknownKeys"],
  //     Def["catchall"]
  //   > => {
  //     return new ZodObject({
  //       ...def,
  //       shape: () => ({
  //         ...def.shape(),
  //         ...augmentation,
  //       }),
  //     }) as any;
  //   };
  extend(augmentation) {
    return new _ZodObject({
      ...this._def,
      shape: () => ({
        ...this._def.shape(),
        ...augmentation
      })
    });
  }
  /**
   * Prior to zod@1.0.12 there was a bug in the
   * inferred type of merged objects. Please
   * upgrade if you are experiencing issues.
   */
  merge(merging) {
    const merged = new _ZodObject({
      unknownKeys: merging._def.unknownKeys,
      catchall: merging._def.catchall,
      shape: () => ({
        ...this._def.shape(),
        ...merging._def.shape()
      }),
      typeName: ZodFirstPartyTypeKind.ZodObject
    });
    return merged;
  }
  // merge<
  //   Incoming extends AnyZodObject,
  //   Augmentation extends Incoming["shape"],
  //   NewOutput extends {
  //     [k in keyof Augmentation | keyof Output]: k extends keyof Augmentation
  //       ? Augmentation[k]["_output"]
  //       : k extends keyof Output
  //       ? Output[k]
  //       : never;
  //   },
  //   NewInput extends {
  //     [k in keyof Augmentation | keyof Input]: k extends keyof Augmentation
  //       ? Augmentation[k]["_input"]
  //       : k extends keyof Input
  //       ? Input[k]
  //       : never;
  //   }
  // >(
  //   merging: Incoming
  // ): ZodObject<
  //   extendShape<T, ReturnType<Incoming["_def"]["shape"]>>,
  //   Incoming["_def"]["unknownKeys"],
  //   Incoming["_def"]["catchall"],
  //   NewOutput,
  //   NewInput
  // > {
  //   const merged: any = new ZodObject({
  //     unknownKeys: merging._def.unknownKeys,
  //     catchall: merging._def.catchall,
  //     shape: () =>
  //       objectUtil.mergeShapes(this._def.shape(), merging._def.shape()),
  //     typeName: ZodFirstPartyTypeKind.ZodObject,
  //   }) as any;
  //   return merged;
  // }
  setKey(key, schema) {
    return this.augment({ [key]: schema });
  }
  // merge<Incoming extends AnyZodObject>(
  //   merging: Incoming
  // ): //ZodObject<T & Incoming["_shape"], UnknownKeys, Catchall> = (merging) => {
  // ZodObject<
  //   extendShape<T, ReturnType<Incoming["_def"]["shape"]>>,
  //   Incoming["_def"]["unknownKeys"],
  //   Incoming["_def"]["catchall"]
  // > {
  //   // const mergedShape = objectUtil.mergeShapes(
  //   //   this._def.shape(),
  //   //   merging._def.shape()
  //   // );
  //   const merged: any = new ZodObject({
  //     unknownKeys: merging._def.unknownKeys,
  //     catchall: merging._def.catchall,
  //     shape: () =>
  //       objectUtil.mergeShapes(this._def.shape(), merging._def.shape()),
  //     typeName: ZodFirstPartyTypeKind.ZodObject,
  //   }) as any;
  //   return merged;
  // }
  catchall(index) {
    return new _ZodObject({
      ...this._def,
      catchall: index
    });
  }
  pick(mask) {
    const shape = {};
    for (const key of util.objectKeys(mask)) {
      if (mask[key] && this.shape[key]) {
        shape[key] = this.shape[key];
      }
    }
    return new _ZodObject({
      ...this._def,
      shape: () => shape
    });
  }
  omit(mask) {
    const shape = {};
    for (const key of util.objectKeys(this.shape)) {
      if (!mask[key]) {
        shape[key] = this.shape[key];
      }
    }
    return new _ZodObject({
      ...this._def,
      shape: () => shape
    });
  }
  /**
   * @deprecated
   */
  deepPartial() {
    return deepPartialify(this);
  }
  partial(mask) {
    const newShape = {};
    for (const key of util.objectKeys(this.shape)) {
      const fieldSchema2 = this.shape[key];
      if (mask && !mask[key]) {
        newShape[key] = fieldSchema2;
      } else {
        newShape[key] = fieldSchema2.optional();
      }
    }
    return new _ZodObject({
      ...this._def,
      shape: () => newShape
    });
  }
  required(mask) {
    const newShape = {};
    for (const key of util.objectKeys(this.shape)) {
      if (mask && !mask[key]) {
        newShape[key] = this.shape[key];
      } else {
        const fieldSchema2 = this.shape[key];
        let newField = fieldSchema2;
        while (newField instanceof ZodOptional) {
          newField = newField._def.innerType;
        }
        newShape[key] = newField;
      }
    }
    return new _ZodObject({
      ...this._def,
      shape: () => newShape
    });
  }
  keyof() {
    return createZodEnum(util.objectKeys(this.shape));
  }
};
ZodObject.create = (shape, params) => {
  return new ZodObject({
    shape: () => shape,
    unknownKeys: "strip",
    catchall: ZodNever.create(),
    typeName: ZodFirstPartyTypeKind.ZodObject,
    ...processCreateParams(params)
  });
};
ZodObject.strictCreate = (shape, params) => {
  return new ZodObject({
    shape: () => shape,
    unknownKeys: "strict",
    catchall: ZodNever.create(),
    typeName: ZodFirstPartyTypeKind.ZodObject,
    ...processCreateParams(params)
  });
};
ZodObject.lazycreate = (shape, params) => {
  return new ZodObject({
    shape,
    unknownKeys: "strip",
    catchall: ZodNever.create(),
    typeName: ZodFirstPartyTypeKind.ZodObject,
    ...processCreateParams(params)
  });
};
var ZodUnion = class extends ZodType {
  _parse(input) {
    const { ctx } = this._processInputParams(input);
    const options = this._def.options;
    function handleResults(results) {
      for (const result of results) {
        if (result.result.status === "valid") {
          return result.result;
        }
      }
      for (const result of results) {
        if (result.result.status === "dirty") {
          ctx.common.issues.push(...result.ctx.common.issues);
          return result.result;
        }
      }
      const unionErrors = results.map((result) => new ZodError(result.ctx.common.issues));
      addIssueToContext(ctx, {
        code: ZodIssueCode.invalid_union,
        unionErrors
      });
      return INVALID;
    }
    if (ctx.common.async) {
      return Promise.all(options.map(async (option) => {
        const childCtx = {
          ...ctx,
          common: {
            ...ctx.common,
            issues: []
          },
          parent: null
        };
        return {
          result: await option._parseAsync({
            data: ctx.data,
            path: ctx.path,
            parent: childCtx
          }),
          ctx: childCtx
        };
      })).then(handleResults);
    } else {
      let dirty = void 0;
      const issues = [];
      for (const option of options) {
        const childCtx = {
          ...ctx,
          common: {
            ...ctx.common,
            issues: []
          },
          parent: null
        };
        const result = option._parseSync({
          data: ctx.data,
          path: ctx.path,
          parent: childCtx
        });
        if (result.status === "valid") {
          return result;
        } else if (result.status === "dirty" && !dirty) {
          dirty = { result, ctx: childCtx };
        }
        if (childCtx.common.issues.length) {
          issues.push(childCtx.common.issues);
        }
      }
      if (dirty) {
        ctx.common.issues.push(...dirty.ctx.common.issues);
        return dirty.result;
      }
      const unionErrors = issues.map((issues2) => new ZodError(issues2));
      addIssueToContext(ctx, {
        code: ZodIssueCode.invalid_union,
        unionErrors
      });
      return INVALID;
    }
  }
  get options() {
    return this._def.options;
  }
};
ZodUnion.create = (types, params) => {
  return new ZodUnion({
    options: types,
    typeName: ZodFirstPartyTypeKind.ZodUnion,
    ...processCreateParams(params)
  });
};
var getDiscriminator = (type) => {
  if (type instanceof ZodLazy) {
    return getDiscriminator(type.schema);
  } else if (type instanceof ZodEffects) {
    return getDiscriminator(type.innerType());
  } else if (type instanceof ZodLiteral) {
    return [type.value];
  } else if (type instanceof ZodEnum) {
    return type.options;
  } else if (type instanceof ZodNativeEnum) {
    return util.objectValues(type.enum);
  } else if (type instanceof ZodDefault) {
    return getDiscriminator(type._def.innerType);
  } else if (type instanceof ZodUndefined) {
    return [void 0];
  } else if (type instanceof ZodNull) {
    return [null];
  } else if (type instanceof ZodOptional) {
    return [void 0, ...getDiscriminator(type.unwrap())];
  } else if (type instanceof ZodNullable) {
    return [null, ...getDiscriminator(type.unwrap())];
  } else if (type instanceof ZodBranded) {
    return getDiscriminator(type.unwrap());
  } else if (type instanceof ZodReadonly) {
    return getDiscriminator(type.unwrap());
  } else if (type instanceof ZodCatch) {
    return getDiscriminator(type._def.innerType);
  } else {
    return [];
  }
};
var ZodDiscriminatedUnion = class _ZodDiscriminatedUnion extends ZodType {
  _parse(input) {
    const { ctx } = this._processInputParams(input);
    if (ctx.parsedType !== ZodParsedType.object) {
      addIssueToContext(ctx, {
        code: ZodIssueCode.invalid_type,
        expected: ZodParsedType.object,
        received: ctx.parsedType
      });
      return INVALID;
    }
    const discriminator = this.discriminator;
    const discriminatorValue = ctx.data[discriminator];
    const option = this.optionsMap.get(discriminatorValue);
    if (!option) {
      addIssueToContext(ctx, {
        code: ZodIssueCode.invalid_union_discriminator,
        options: Array.from(this.optionsMap.keys()),
        path: [discriminator]
      });
      return INVALID;
    }
    if (ctx.common.async) {
      return option._parseAsync({
        data: ctx.data,
        path: ctx.path,
        parent: ctx
      });
    } else {
      return option._parseSync({
        data: ctx.data,
        path: ctx.path,
        parent: ctx
      });
    }
  }
  get discriminator() {
    return this._def.discriminator;
  }
  get options() {
    return this._def.options;
  }
  get optionsMap() {
    return this._def.optionsMap;
  }
  /**
   * The constructor of the discriminated union schema. Its behaviour is very similar to that of the normal z.union() constructor.
   * However, it only allows a union of objects, all of which need to share a discriminator property. This property must
   * have a different value for each object in the union.
   * @param discriminator the name of the discriminator property
   * @param types an array of object schemas
   * @param params
   */
  static create(discriminator, options, params) {
    const optionsMap = /* @__PURE__ */ new Map();
    for (const type of options) {
      const discriminatorValues = getDiscriminator(type.shape[discriminator]);
      if (!discriminatorValues.length) {
        throw new Error(`A discriminator value for key \`${discriminator}\` could not be extracted from all schema options`);
      }
      for (const value of discriminatorValues) {
        if (optionsMap.has(value)) {
          throw new Error(`Discriminator property ${String(discriminator)} has duplicate value ${String(value)}`);
        }
        optionsMap.set(value, type);
      }
    }
    return new _ZodDiscriminatedUnion({
      typeName: ZodFirstPartyTypeKind.ZodDiscriminatedUnion,
      discriminator,
      options,
      optionsMap,
      ...processCreateParams(params)
    });
  }
};
function mergeValues(a, b) {
  const aType = getParsedType(a);
  const bType = getParsedType(b);
  if (a === b) {
    return { valid: true, data: a };
  } else if (aType === ZodParsedType.object && bType === ZodParsedType.object) {
    const bKeys = util.objectKeys(b);
    const sharedKeys = util.objectKeys(a).filter((key) => bKeys.indexOf(key) !== -1);
    const newObj = { ...a, ...b };
    for (const key of sharedKeys) {
      const sharedValue = mergeValues(a[key], b[key]);
      if (!sharedValue.valid) {
        return { valid: false };
      }
      newObj[key] = sharedValue.data;
    }
    return { valid: true, data: newObj };
  } else if (aType === ZodParsedType.array && bType === ZodParsedType.array) {
    if (a.length !== b.length) {
      return { valid: false };
    }
    const newArray = [];
    for (let index = 0; index < a.length; index++) {
      const itemA = a[index];
      const itemB = b[index];
      const sharedValue = mergeValues(itemA, itemB);
      if (!sharedValue.valid) {
        return { valid: false };
      }
      newArray.push(sharedValue.data);
    }
    return { valid: true, data: newArray };
  } else if (aType === ZodParsedType.date && bType === ZodParsedType.date && +a === +b) {
    return { valid: true, data: a };
  } else {
    return { valid: false };
  }
}
var ZodIntersection = class extends ZodType {
  _parse(input) {
    const { status, ctx } = this._processInputParams(input);
    const handleParsed = (parsedLeft, parsedRight) => {
      if (isAborted(parsedLeft) || isAborted(parsedRight)) {
        return INVALID;
      }
      const merged = mergeValues(parsedLeft.value, parsedRight.value);
      if (!merged.valid) {
        addIssueToContext(ctx, {
          code: ZodIssueCode.invalid_intersection_types
        });
        return INVALID;
      }
      if (isDirty(parsedLeft) || isDirty(parsedRight)) {
        status.dirty();
      }
      return { status: status.value, value: merged.data };
    };
    if (ctx.common.async) {
      return Promise.all([
        this._def.left._parseAsync({
          data: ctx.data,
          path: ctx.path,
          parent: ctx
        }),
        this._def.right._parseAsync({
          data: ctx.data,
          path: ctx.path,
          parent: ctx
        })
      ]).then(([left, right]) => handleParsed(left, right));
    } else {
      return handleParsed(this._def.left._parseSync({
        data: ctx.data,
        path: ctx.path,
        parent: ctx
      }), this._def.right._parseSync({
        data: ctx.data,
        path: ctx.path,
        parent: ctx
      }));
    }
  }
};
ZodIntersection.create = (left, right, params) => {
  return new ZodIntersection({
    left,
    right,
    typeName: ZodFirstPartyTypeKind.ZodIntersection,
    ...processCreateParams(params)
  });
};
var ZodTuple = class _ZodTuple extends ZodType {
  _parse(input) {
    const { status, ctx } = this._processInputParams(input);
    if (ctx.parsedType !== ZodParsedType.array) {
      addIssueToContext(ctx, {
        code: ZodIssueCode.invalid_type,
        expected: ZodParsedType.array,
        received: ctx.parsedType
      });
      return INVALID;
    }
    if (ctx.data.length < this._def.items.length) {
      addIssueToContext(ctx, {
        code: ZodIssueCode.too_small,
        minimum: this._def.items.length,
        inclusive: true,
        exact: false,
        type: "array"
      });
      return INVALID;
    }
    const rest = this._def.rest;
    if (!rest && ctx.data.length > this._def.items.length) {
      addIssueToContext(ctx, {
        code: ZodIssueCode.too_big,
        maximum: this._def.items.length,
        inclusive: true,
        exact: false,
        type: "array"
      });
      status.dirty();
    }
    const items = [...ctx.data].map((item, itemIndex) => {
      const schema = this._def.items[itemIndex] || this._def.rest;
      if (!schema)
        return null;
      return schema._parse(new ParseInputLazyPath(ctx, item, ctx.path, itemIndex));
    }).filter((x) => !!x);
    if (ctx.common.async) {
      return Promise.all(items).then((results) => {
        return ParseStatus.mergeArray(status, results);
      });
    } else {
      return ParseStatus.mergeArray(status, items);
    }
  }
  get items() {
    return this._def.items;
  }
  rest(rest) {
    return new _ZodTuple({
      ...this._def,
      rest
    });
  }
};
ZodTuple.create = (schemas, params) => {
  if (!Array.isArray(schemas)) {
    throw new Error("You must pass an array of schemas to z.tuple([ ... ])");
  }
  return new ZodTuple({
    items: schemas,
    typeName: ZodFirstPartyTypeKind.ZodTuple,
    rest: null,
    ...processCreateParams(params)
  });
};
var ZodRecord = class _ZodRecord extends ZodType {
  get keySchema() {
    return this._def.keyType;
  }
  get valueSchema() {
    return this._def.valueType;
  }
  _parse(input) {
    const { status, ctx } = this._processInputParams(input);
    if (ctx.parsedType !== ZodParsedType.object) {
      addIssueToContext(ctx, {
        code: ZodIssueCode.invalid_type,
        expected: ZodParsedType.object,
        received: ctx.parsedType
      });
      return INVALID;
    }
    const pairs = [];
    const keyType = this._def.keyType;
    const valueType = this._def.valueType;
    for (const key in ctx.data) {
      pairs.push({
        key: keyType._parse(new ParseInputLazyPath(ctx, key, ctx.path, key)),
        value: valueType._parse(new ParseInputLazyPath(ctx, ctx.data[key], ctx.path, key)),
        alwaysSet: key in ctx.data
      });
    }
    if (ctx.common.async) {
      return ParseStatus.mergeObjectAsync(status, pairs);
    } else {
      return ParseStatus.mergeObjectSync(status, pairs);
    }
  }
  get element() {
    return this._def.valueType;
  }
  static create(first, second, third) {
    if (second instanceof ZodType) {
      return new _ZodRecord({
        keyType: first,
        valueType: second,
        typeName: ZodFirstPartyTypeKind.ZodRecord,
        ...processCreateParams(third)
      });
    }
    return new _ZodRecord({
      keyType: ZodString.create(),
      valueType: first,
      typeName: ZodFirstPartyTypeKind.ZodRecord,
      ...processCreateParams(second)
    });
  }
};
var ZodMap = class extends ZodType {
  get keySchema() {
    return this._def.keyType;
  }
  get valueSchema() {
    return this._def.valueType;
  }
  _parse(input) {
    const { status, ctx } = this._processInputParams(input);
    if (ctx.parsedType !== ZodParsedType.map) {
      addIssueToContext(ctx, {
        code: ZodIssueCode.invalid_type,
        expected: ZodParsedType.map,
        received: ctx.parsedType
      });
      return INVALID;
    }
    const keyType = this._def.keyType;
    const valueType = this._def.valueType;
    const pairs = [...ctx.data.entries()].map(([key, value], index) => {
      return {
        key: keyType._parse(new ParseInputLazyPath(ctx, key, ctx.path, [index, "key"])),
        value: valueType._parse(new ParseInputLazyPath(ctx, value, ctx.path, [index, "value"]))
      };
    });
    if (ctx.common.async) {
      const finalMap = /* @__PURE__ */ new Map();
      return Promise.resolve().then(async () => {
        for (const pair of pairs) {
          const key = await pair.key;
          const value = await pair.value;
          if (key.status === "aborted" || value.status === "aborted") {
            return INVALID;
          }
          if (key.status === "dirty" || value.status === "dirty") {
            status.dirty();
          }
          finalMap.set(key.value, value.value);
        }
        return { status: status.value, value: finalMap };
      });
    } else {
      const finalMap = /* @__PURE__ */ new Map();
      for (const pair of pairs) {
        const key = pair.key;
        const value = pair.value;
        if (key.status === "aborted" || value.status === "aborted") {
          return INVALID;
        }
        if (key.status === "dirty" || value.status === "dirty") {
          status.dirty();
        }
        finalMap.set(key.value, value.value);
      }
      return { status: status.value, value: finalMap };
    }
  }
};
ZodMap.create = (keyType, valueType, params) => {
  return new ZodMap({
    valueType,
    keyType,
    typeName: ZodFirstPartyTypeKind.ZodMap,
    ...processCreateParams(params)
  });
};
var ZodSet = class _ZodSet extends ZodType {
  _parse(input) {
    const { status, ctx } = this._processInputParams(input);
    if (ctx.parsedType !== ZodParsedType.set) {
      addIssueToContext(ctx, {
        code: ZodIssueCode.invalid_type,
        expected: ZodParsedType.set,
        received: ctx.parsedType
      });
      return INVALID;
    }
    const def = this._def;
    if (def.minSize !== null) {
      if (ctx.data.size < def.minSize.value) {
        addIssueToContext(ctx, {
          code: ZodIssueCode.too_small,
          minimum: def.minSize.value,
          type: "set",
          inclusive: true,
          exact: false,
          message: def.minSize.message
        });
        status.dirty();
      }
    }
    if (def.maxSize !== null) {
      if (ctx.data.size > def.maxSize.value) {
        addIssueToContext(ctx, {
          code: ZodIssueCode.too_big,
          maximum: def.maxSize.value,
          type: "set",
          inclusive: true,
          exact: false,
          message: def.maxSize.message
        });
        status.dirty();
      }
    }
    const valueType = this._def.valueType;
    function finalizeSet(elements2) {
      const parsedSet = /* @__PURE__ */ new Set();
      for (const element of elements2) {
        if (element.status === "aborted")
          return INVALID;
        if (element.status === "dirty")
          status.dirty();
        parsedSet.add(element.value);
      }
      return { status: status.value, value: parsedSet };
    }
    const elements = [...ctx.data.values()].map((item, i) => valueType._parse(new ParseInputLazyPath(ctx, item, ctx.path, i)));
    if (ctx.common.async) {
      return Promise.all(elements).then((elements2) => finalizeSet(elements2));
    } else {
      return finalizeSet(elements);
    }
  }
  min(minSize, message) {
    return new _ZodSet({
      ...this._def,
      minSize: { value: minSize, message: errorUtil.toString(message) }
    });
  }
  max(maxSize, message) {
    return new _ZodSet({
      ...this._def,
      maxSize: { value: maxSize, message: errorUtil.toString(message) }
    });
  }
  size(size, message) {
    return this.min(size, message).max(size, message);
  }
  nonempty(message) {
    return this.min(1, message);
  }
};
ZodSet.create = (valueType, params) => {
  return new ZodSet({
    valueType,
    minSize: null,
    maxSize: null,
    typeName: ZodFirstPartyTypeKind.ZodSet,
    ...processCreateParams(params)
  });
};
var ZodFunction = class _ZodFunction extends ZodType {
  constructor() {
    super(...arguments);
    this.validate = this.implement;
  }
  _parse(input) {
    const { ctx } = this._processInputParams(input);
    if (ctx.parsedType !== ZodParsedType.function) {
      addIssueToContext(ctx, {
        code: ZodIssueCode.invalid_type,
        expected: ZodParsedType.function,
        received: ctx.parsedType
      });
      return INVALID;
    }
    function makeArgsIssue(args, error) {
      return makeIssue({
        data: args,
        path: ctx.path,
        errorMaps: [ctx.common.contextualErrorMap, ctx.schemaErrorMap, getErrorMap(), en_default].filter((x) => !!x),
        issueData: {
          code: ZodIssueCode.invalid_arguments,
          argumentsError: error
        }
      });
    }
    function makeReturnsIssue(returns, error) {
      return makeIssue({
        data: returns,
        path: ctx.path,
        errorMaps: [ctx.common.contextualErrorMap, ctx.schemaErrorMap, getErrorMap(), en_default].filter((x) => !!x),
        issueData: {
          code: ZodIssueCode.invalid_return_type,
          returnTypeError: error
        }
      });
    }
    const params = { errorMap: ctx.common.contextualErrorMap };
    const fn = ctx.data;
    if (this._def.returns instanceof ZodPromise) {
      const me = this;
      return OK(async function(...args) {
        const error = new ZodError([]);
        const parsedArgs = await me._def.args.parseAsync(args, params).catch((e) => {
          error.addIssue(makeArgsIssue(args, e));
          throw error;
        });
        const result = await Reflect.apply(fn, this, parsedArgs);
        const parsedReturns = await me._def.returns._def.type.parseAsync(result, params).catch((e) => {
          error.addIssue(makeReturnsIssue(result, e));
          throw error;
        });
        return parsedReturns;
      });
    } else {
      const me = this;
      return OK(function(...args) {
        const parsedArgs = me._def.args.safeParse(args, params);
        if (!parsedArgs.success) {
          throw new ZodError([makeArgsIssue(args, parsedArgs.error)]);
        }
        const result = Reflect.apply(fn, this, parsedArgs.data);
        const parsedReturns = me._def.returns.safeParse(result, params);
        if (!parsedReturns.success) {
          throw new ZodError([makeReturnsIssue(result, parsedReturns.error)]);
        }
        return parsedReturns.data;
      });
    }
  }
  parameters() {
    return this._def.args;
  }
  returnType() {
    return this._def.returns;
  }
  args(...items) {
    return new _ZodFunction({
      ...this._def,
      args: ZodTuple.create(items).rest(ZodUnknown.create())
    });
  }
  returns(returnType) {
    return new _ZodFunction({
      ...this._def,
      returns: returnType
    });
  }
  implement(func) {
    const validatedFunc = this.parse(func);
    return validatedFunc;
  }
  strictImplement(func) {
    const validatedFunc = this.parse(func);
    return validatedFunc;
  }
  static create(args, returns, params) {
    return new _ZodFunction({
      args: args ? args : ZodTuple.create([]).rest(ZodUnknown.create()),
      returns: returns || ZodUnknown.create(),
      typeName: ZodFirstPartyTypeKind.ZodFunction,
      ...processCreateParams(params)
    });
  }
};
var ZodLazy = class extends ZodType {
  get schema() {
    return this._def.getter();
  }
  _parse(input) {
    const { ctx } = this._processInputParams(input);
    const lazySchema = this._def.getter();
    return lazySchema._parse({ data: ctx.data, path: ctx.path, parent: ctx });
  }
};
ZodLazy.create = (getter, params) => {
  return new ZodLazy({
    getter,
    typeName: ZodFirstPartyTypeKind.ZodLazy,
    ...processCreateParams(params)
  });
};
var ZodLiteral = class extends ZodType {
  _parse(input) {
    if (input.data !== this._def.value) {
      const ctx = this._getOrReturnCtx(input);
      addIssueToContext(ctx, {
        received: ctx.data,
        code: ZodIssueCode.invalid_literal,
        expected: this._def.value
      });
      return INVALID;
    }
    return { status: "valid", value: input.data };
  }
  get value() {
    return this._def.value;
  }
};
ZodLiteral.create = (value, params) => {
  return new ZodLiteral({
    value,
    typeName: ZodFirstPartyTypeKind.ZodLiteral,
    ...processCreateParams(params)
  });
};
function createZodEnum(values, params) {
  return new ZodEnum({
    values,
    typeName: ZodFirstPartyTypeKind.ZodEnum,
    ...processCreateParams(params)
  });
}
var ZodEnum = class _ZodEnum extends ZodType {
  _parse(input) {
    if (typeof input.data !== "string") {
      const ctx = this._getOrReturnCtx(input);
      const expectedValues = this._def.values;
      addIssueToContext(ctx, {
        expected: util.joinValues(expectedValues),
        received: ctx.parsedType,
        code: ZodIssueCode.invalid_type
      });
      return INVALID;
    }
    if (!this._cache) {
      this._cache = new Set(this._def.values);
    }
    if (!this._cache.has(input.data)) {
      const ctx = this._getOrReturnCtx(input);
      const expectedValues = this._def.values;
      addIssueToContext(ctx, {
        received: ctx.data,
        code: ZodIssueCode.invalid_enum_value,
        options: expectedValues
      });
      return INVALID;
    }
    return OK(input.data);
  }
  get options() {
    return this._def.values;
  }
  get enum() {
    const enumValues = {};
    for (const val of this._def.values) {
      enumValues[val] = val;
    }
    return enumValues;
  }
  get Values() {
    const enumValues = {};
    for (const val of this._def.values) {
      enumValues[val] = val;
    }
    return enumValues;
  }
  get Enum() {
    const enumValues = {};
    for (const val of this._def.values) {
      enumValues[val] = val;
    }
    return enumValues;
  }
  extract(values, newDef = this._def) {
    return _ZodEnum.create(values, {
      ...this._def,
      ...newDef
    });
  }
  exclude(values, newDef = this._def) {
    return _ZodEnum.create(this.options.filter((opt) => !values.includes(opt)), {
      ...this._def,
      ...newDef
    });
  }
};
ZodEnum.create = createZodEnum;
var ZodNativeEnum = class extends ZodType {
  _parse(input) {
    const nativeEnumValues = util.getValidEnumValues(this._def.values);
    const ctx = this._getOrReturnCtx(input);
    if (ctx.parsedType !== ZodParsedType.string && ctx.parsedType !== ZodParsedType.number) {
      const expectedValues = util.objectValues(nativeEnumValues);
      addIssueToContext(ctx, {
        expected: util.joinValues(expectedValues),
        received: ctx.parsedType,
        code: ZodIssueCode.invalid_type
      });
      return INVALID;
    }
    if (!this._cache) {
      this._cache = new Set(util.getValidEnumValues(this._def.values));
    }
    if (!this._cache.has(input.data)) {
      const expectedValues = util.objectValues(nativeEnumValues);
      addIssueToContext(ctx, {
        received: ctx.data,
        code: ZodIssueCode.invalid_enum_value,
        options: expectedValues
      });
      return INVALID;
    }
    return OK(input.data);
  }
  get enum() {
    return this._def.values;
  }
};
ZodNativeEnum.create = (values, params) => {
  return new ZodNativeEnum({
    values,
    typeName: ZodFirstPartyTypeKind.ZodNativeEnum,
    ...processCreateParams(params)
  });
};
var ZodPromise = class extends ZodType {
  unwrap() {
    return this._def.type;
  }
  _parse(input) {
    const { ctx } = this._processInputParams(input);
    if (ctx.parsedType !== ZodParsedType.promise && ctx.common.async === false) {
      addIssueToContext(ctx, {
        code: ZodIssueCode.invalid_type,
        expected: ZodParsedType.promise,
        received: ctx.parsedType
      });
      return INVALID;
    }
    const promisified = ctx.parsedType === ZodParsedType.promise ? ctx.data : Promise.resolve(ctx.data);
    return OK(promisified.then((data) => {
      return this._def.type.parseAsync(data, {
        path: ctx.path,
        errorMap: ctx.common.contextualErrorMap
      });
    }));
  }
};
ZodPromise.create = (schema, params) => {
  return new ZodPromise({
    type: schema,
    typeName: ZodFirstPartyTypeKind.ZodPromise,
    ...processCreateParams(params)
  });
};
var ZodEffects = class extends ZodType {
  innerType() {
    return this._def.schema;
  }
  sourceType() {
    return this._def.schema._def.typeName === ZodFirstPartyTypeKind.ZodEffects ? this._def.schema.sourceType() : this._def.schema;
  }
  _parse(input) {
    const { status, ctx } = this._processInputParams(input);
    const effect = this._def.effect || null;
    const checkCtx = {
      addIssue: (arg) => {
        addIssueToContext(ctx, arg);
        if (arg.fatal) {
          status.abort();
        } else {
          status.dirty();
        }
      },
      get path() {
        return ctx.path;
      }
    };
    checkCtx.addIssue = checkCtx.addIssue.bind(checkCtx);
    if (effect.type === "preprocess") {
      const processed = effect.transform(ctx.data, checkCtx);
      if (ctx.common.async) {
        return Promise.resolve(processed).then(async (processed2) => {
          if (status.value === "aborted")
            return INVALID;
          const result = await this._def.schema._parseAsync({
            data: processed2,
            path: ctx.path,
            parent: ctx
          });
          if (result.status === "aborted")
            return INVALID;
          if (result.status === "dirty")
            return DIRTY(result.value);
          if (status.value === "dirty")
            return DIRTY(result.value);
          return result;
        });
      } else {
        if (status.value === "aborted")
          return INVALID;
        const result = this._def.schema._parseSync({
          data: processed,
          path: ctx.path,
          parent: ctx
        });
        if (result.status === "aborted")
          return INVALID;
        if (result.status === "dirty")
          return DIRTY(result.value);
        if (status.value === "dirty")
          return DIRTY(result.value);
        return result;
      }
    }
    if (effect.type === "refinement") {
      const executeRefinement = (acc) => {
        const result = effect.refinement(acc, checkCtx);
        if (ctx.common.async) {
          return Promise.resolve(result);
        }
        if (result instanceof Promise) {
          throw new Error("Async refinement encountered during synchronous parse operation. Use .parseAsync instead.");
        }
        return acc;
      };
      if (ctx.common.async === false) {
        const inner = this._def.schema._parseSync({
          data: ctx.data,
          path: ctx.path,
          parent: ctx
        });
        if (inner.status === "aborted")
          return INVALID;
        if (inner.status === "dirty")
          status.dirty();
        executeRefinement(inner.value);
        return { status: status.value, value: inner.value };
      } else {
        return this._def.schema._parseAsync({ data: ctx.data, path: ctx.path, parent: ctx }).then((inner) => {
          if (inner.status === "aborted")
            return INVALID;
          if (inner.status === "dirty")
            status.dirty();
          return executeRefinement(inner.value).then(() => {
            return { status: status.value, value: inner.value };
          });
        });
      }
    }
    if (effect.type === "transform") {
      if (ctx.common.async === false) {
        const base = this._def.schema._parseSync({
          data: ctx.data,
          path: ctx.path,
          parent: ctx
        });
        if (!isValid(base))
          return INVALID;
        const result = effect.transform(base.value, checkCtx);
        if (result instanceof Promise) {
          throw new Error(`Asynchronous transform encountered during synchronous parse operation. Use .parseAsync instead.`);
        }
        return { status: status.value, value: result };
      } else {
        return this._def.schema._parseAsync({ data: ctx.data, path: ctx.path, parent: ctx }).then((base) => {
          if (!isValid(base))
            return INVALID;
          return Promise.resolve(effect.transform(base.value, checkCtx)).then((result) => ({
            status: status.value,
            value: result
          }));
        });
      }
    }
    util.assertNever(effect);
  }
};
ZodEffects.create = (schema, effect, params) => {
  return new ZodEffects({
    schema,
    typeName: ZodFirstPartyTypeKind.ZodEffects,
    effect,
    ...processCreateParams(params)
  });
};
ZodEffects.createWithPreprocess = (preprocess, schema, params) => {
  return new ZodEffects({
    schema,
    effect: { type: "preprocess", transform: preprocess },
    typeName: ZodFirstPartyTypeKind.ZodEffects,
    ...processCreateParams(params)
  });
};
var ZodOptional = class extends ZodType {
  _parse(input) {
    const parsedType = this._getType(input);
    if (parsedType === ZodParsedType.undefined) {
      return OK(void 0);
    }
    return this._def.innerType._parse(input);
  }
  unwrap() {
    return this._def.innerType;
  }
};
ZodOptional.create = (type, params) => {
  return new ZodOptional({
    innerType: type,
    typeName: ZodFirstPartyTypeKind.ZodOptional,
    ...processCreateParams(params)
  });
};
var ZodNullable = class extends ZodType {
  _parse(input) {
    const parsedType = this._getType(input);
    if (parsedType === ZodParsedType.null) {
      return OK(null);
    }
    return this._def.innerType._parse(input);
  }
  unwrap() {
    return this._def.innerType;
  }
};
ZodNullable.create = (type, params) => {
  return new ZodNullable({
    innerType: type,
    typeName: ZodFirstPartyTypeKind.ZodNullable,
    ...processCreateParams(params)
  });
};
var ZodDefault = class extends ZodType {
  _parse(input) {
    const { ctx } = this._processInputParams(input);
    let data = ctx.data;
    if (ctx.parsedType === ZodParsedType.undefined) {
      data = this._def.defaultValue();
    }
    return this._def.innerType._parse({
      data,
      path: ctx.path,
      parent: ctx
    });
  }
  removeDefault() {
    return this._def.innerType;
  }
};
ZodDefault.create = (type, params) => {
  return new ZodDefault({
    innerType: type,
    typeName: ZodFirstPartyTypeKind.ZodDefault,
    defaultValue: typeof params.default === "function" ? params.default : () => params.default,
    ...processCreateParams(params)
  });
};
var ZodCatch = class extends ZodType {
  _parse(input) {
    const { ctx } = this._processInputParams(input);
    const newCtx = {
      ...ctx,
      common: {
        ...ctx.common,
        issues: []
      }
    };
    const result = this._def.innerType._parse({
      data: newCtx.data,
      path: newCtx.path,
      parent: {
        ...newCtx
      }
    });
    if (isAsync(result)) {
      return result.then((result2) => {
        return {
          status: "valid",
          value: result2.status === "valid" ? result2.value : this._def.catchValue({
            get error() {
              return new ZodError(newCtx.common.issues);
            },
            input: newCtx.data
          })
        };
      });
    } else {
      return {
        status: "valid",
        value: result.status === "valid" ? result.value : this._def.catchValue({
          get error() {
            return new ZodError(newCtx.common.issues);
          },
          input: newCtx.data
        })
      };
    }
  }
  removeCatch() {
    return this._def.innerType;
  }
};
ZodCatch.create = (type, params) => {
  return new ZodCatch({
    innerType: type,
    typeName: ZodFirstPartyTypeKind.ZodCatch,
    catchValue: typeof params.catch === "function" ? params.catch : () => params.catch,
    ...processCreateParams(params)
  });
};
var ZodNaN = class extends ZodType {
  _parse(input) {
    const parsedType = this._getType(input);
    if (parsedType !== ZodParsedType.nan) {
      const ctx = this._getOrReturnCtx(input);
      addIssueToContext(ctx, {
        code: ZodIssueCode.invalid_type,
        expected: ZodParsedType.nan,
        received: ctx.parsedType
      });
      return INVALID;
    }
    return { status: "valid", value: input.data };
  }
};
ZodNaN.create = (params) => {
  return new ZodNaN({
    typeName: ZodFirstPartyTypeKind.ZodNaN,
    ...processCreateParams(params)
  });
};
var BRAND = /* @__PURE__ */ Symbol("zod_brand");
var ZodBranded = class extends ZodType {
  _parse(input) {
    const { ctx } = this._processInputParams(input);
    const data = ctx.data;
    return this._def.type._parse({
      data,
      path: ctx.path,
      parent: ctx
    });
  }
  unwrap() {
    return this._def.type;
  }
};
var ZodPipeline = class _ZodPipeline extends ZodType {
  _parse(input) {
    const { status, ctx } = this._processInputParams(input);
    if (ctx.common.async) {
      const handleAsync = async () => {
        const inResult = await this._def.in._parseAsync({
          data: ctx.data,
          path: ctx.path,
          parent: ctx
        });
        if (inResult.status === "aborted")
          return INVALID;
        if (inResult.status === "dirty") {
          status.dirty();
          return DIRTY(inResult.value);
        } else {
          return this._def.out._parseAsync({
            data: inResult.value,
            path: ctx.path,
            parent: ctx
          });
        }
      };
      return handleAsync();
    } else {
      const inResult = this._def.in._parseSync({
        data: ctx.data,
        path: ctx.path,
        parent: ctx
      });
      if (inResult.status === "aborted")
        return INVALID;
      if (inResult.status === "dirty") {
        status.dirty();
        return {
          status: "dirty",
          value: inResult.value
        };
      } else {
        return this._def.out._parseSync({
          data: inResult.value,
          path: ctx.path,
          parent: ctx
        });
      }
    }
  }
  static create(a, b) {
    return new _ZodPipeline({
      in: a,
      out: b,
      typeName: ZodFirstPartyTypeKind.ZodPipeline
    });
  }
};
var ZodReadonly = class extends ZodType {
  _parse(input) {
    const result = this._def.innerType._parse(input);
    const freeze = (data) => {
      if (isValid(data)) {
        data.value = Object.freeze(data.value);
      }
      return data;
    };
    return isAsync(result) ? result.then((data) => freeze(data)) : freeze(result);
  }
  unwrap() {
    return this._def.innerType;
  }
};
ZodReadonly.create = (type, params) => {
  return new ZodReadonly({
    innerType: type,
    typeName: ZodFirstPartyTypeKind.ZodReadonly,
    ...processCreateParams(params)
  });
};
function cleanParams(params, data) {
  const p = typeof params === "function" ? params(data) : typeof params === "string" ? { message: params } : params;
  const p2 = typeof p === "string" ? { message: p } : p;
  return p2;
}
function custom(check, _params = {}, fatal) {
  if (check)
    return ZodAny.create().superRefine((data, ctx) => {
      const r = check(data);
      if (r instanceof Promise) {
        return r.then((r2) => {
          if (!r2) {
            const params = cleanParams(_params, data);
            const _fatal = params.fatal ?? fatal ?? true;
            ctx.addIssue({ code: "custom", ...params, fatal: _fatal });
          }
        });
      }
      if (!r) {
        const params = cleanParams(_params, data);
        const _fatal = params.fatal ?? fatal ?? true;
        ctx.addIssue({ code: "custom", ...params, fatal: _fatal });
      }
      return;
    });
  return ZodAny.create();
}
var late = {
  object: ZodObject.lazycreate
};
var ZodFirstPartyTypeKind;
(function(ZodFirstPartyTypeKind2) {
  ZodFirstPartyTypeKind2["ZodString"] = "ZodString";
  ZodFirstPartyTypeKind2["ZodNumber"] = "ZodNumber";
  ZodFirstPartyTypeKind2["ZodNaN"] = "ZodNaN";
  ZodFirstPartyTypeKind2["ZodBigInt"] = "ZodBigInt";
  ZodFirstPartyTypeKind2["ZodBoolean"] = "ZodBoolean";
  ZodFirstPartyTypeKind2["ZodDate"] = "ZodDate";
  ZodFirstPartyTypeKind2["ZodSymbol"] = "ZodSymbol";
  ZodFirstPartyTypeKind2["ZodUndefined"] = "ZodUndefined";
  ZodFirstPartyTypeKind2["ZodNull"] = "ZodNull";
  ZodFirstPartyTypeKind2["ZodAny"] = "ZodAny";
  ZodFirstPartyTypeKind2["ZodUnknown"] = "ZodUnknown";
  ZodFirstPartyTypeKind2["ZodNever"] = "ZodNever";
  ZodFirstPartyTypeKind2["ZodVoid"] = "ZodVoid";
  ZodFirstPartyTypeKind2["ZodArray"] = "ZodArray";
  ZodFirstPartyTypeKind2["ZodObject"] = "ZodObject";
  ZodFirstPartyTypeKind2["ZodUnion"] = "ZodUnion";
  ZodFirstPartyTypeKind2["ZodDiscriminatedUnion"] = "ZodDiscriminatedUnion";
  ZodFirstPartyTypeKind2["ZodIntersection"] = "ZodIntersection";
  ZodFirstPartyTypeKind2["ZodTuple"] = "ZodTuple";
  ZodFirstPartyTypeKind2["ZodRecord"] = "ZodRecord";
  ZodFirstPartyTypeKind2["ZodMap"] = "ZodMap";
  ZodFirstPartyTypeKind2["ZodSet"] = "ZodSet";
  ZodFirstPartyTypeKind2["ZodFunction"] = "ZodFunction";
  ZodFirstPartyTypeKind2["ZodLazy"] = "ZodLazy";
  ZodFirstPartyTypeKind2["ZodLiteral"] = "ZodLiteral";
  ZodFirstPartyTypeKind2["ZodEnum"] = "ZodEnum";
  ZodFirstPartyTypeKind2["ZodEffects"] = "ZodEffects";
  ZodFirstPartyTypeKind2["ZodNativeEnum"] = "ZodNativeEnum";
  ZodFirstPartyTypeKind2["ZodOptional"] = "ZodOptional";
  ZodFirstPartyTypeKind2["ZodNullable"] = "ZodNullable";
  ZodFirstPartyTypeKind2["ZodDefault"] = "ZodDefault";
  ZodFirstPartyTypeKind2["ZodCatch"] = "ZodCatch";
  ZodFirstPartyTypeKind2["ZodPromise"] = "ZodPromise";
  ZodFirstPartyTypeKind2["ZodBranded"] = "ZodBranded";
  ZodFirstPartyTypeKind2["ZodPipeline"] = "ZodPipeline";
  ZodFirstPartyTypeKind2["ZodReadonly"] = "ZodReadonly";
})(ZodFirstPartyTypeKind || (ZodFirstPartyTypeKind = {}));
var instanceOfType = (cls, params = {
  message: `Input not instance of ${cls.name}`
}) => custom((data) => data instanceof cls, params);
var stringType = ZodString.create;
var numberType = ZodNumber.create;
var nanType = ZodNaN.create;
var bigIntType = ZodBigInt.create;
var booleanType = ZodBoolean.create;
var dateType = ZodDate.create;
var symbolType = ZodSymbol.create;
var undefinedType = ZodUndefined.create;
var nullType = ZodNull.create;
var anyType = ZodAny.create;
var unknownType = ZodUnknown.create;
var neverType = ZodNever.create;
var voidType = ZodVoid.create;
var arrayType = ZodArray.create;
var objectType = ZodObject.create;
var strictObjectType = ZodObject.strictCreate;
var unionType = ZodUnion.create;
var discriminatedUnionType = ZodDiscriminatedUnion.create;
var intersectionType = ZodIntersection.create;
var tupleType = ZodTuple.create;
var recordType = ZodRecord.create;
var mapType = ZodMap.create;
var setType = ZodSet.create;
var functionType = ZodFunction.create;
var lazyType = ZodLazy.create;
var literalType = ZodLiteral.create;
var enumType = ZodEnum.create;
var nativeEnumType = ZodNativeEnum.create;
var promiseType = ZodPromise.create;
var effectsType = ZodEffects.create;
var optionalType = ZodOptional.create;
var nullableType = ZodNullable.create;
var preprocessType = ZodEffects.createWithPreprocess;
var pipelineType = ZodPipeline.create;
var ostring = () => stringType().optional();
var onumber = () => numberType().optional();
var oboolean = () => booleanType().optional();
var coerce = {
  string: ((arg) => ZodString.create({ ...arg, coerce: true })),
  number: ((arg) => ZodNumber.create({ ...arg, coerce: true })),
  boolean: ((arg) => ZodBoolean.create({
    ...arg,
    coerce: true
  })),
  bigint: ((arg) => ZodBigInt.create({ ...arg, coerce: true })),
  date: ((arg) => ZodDate.create({ ...arg, coerce: true }))
};
var NEVER = INVALID;

// node_modules/zod/index.js
var zod_default = external_exports;

// src/types/common.ts
var booleanSchema = external_exports.union([external_exports.literal(0), external_exports.literal(1)]);
var audioChannelSchema = external_exports.union([external_exports.literal("mono"), external_exports.literal("stereo")]);
var audioChannelCountSchema = external_exports.union([external_exports.literal(1), external_exports.literal(2)]);
var h264ProfileSchema = external_exports.union([external_exports.literal("high"), external_exports.literal("main"), external_exports.literal("baseline")]);
var flashStorageTypeSchema = external_exports.literal("FLASH");
var sdCardStorageTypeSchema = external_exports.literal("SD_DISK");
var storageTypeSchema = external_exports.union([sdCardStorageTypeSchema, flashStorageTypeSchema]);
var networkCameraListSchema = external_exports.array(
  external_exports.object({
    name: external_exports.string(),
    ip: external_exports.string()
  })
);
var keyboardShortcutSchema = external_exports.string().nullable();
var keyboardShortcutsSchema = external_exports.record(keyboardShortcutSchema);
var bitrateModeSchema = external_exports.union([external_exports.literal("VBR"), external_exports.literal("MBR"), external_exports.literal("ABR")]);
var bitrateVapixParamsSchema = external_exports.object({
  bitrateMode: bitrateModeSchema,
  maximumBitRate: external_exports.number(),
  retentionTime: external_exports.number(),
  bitRateLimit: external_exports.number()
});
var fileSchema = typeof File !== "undefined" ? external_exports.instanceof(File) : external_exports.custom((val) => {
  return val !== null && typeof val === "object" && "name" in val && "size" in val && "type" in val;
});

// src/types/CamStreamerAPI/streamCommonTypes.ts
var streamCommonSchema = external_exports.object({
  streamId: external_exports.string(),
  enabled: external_exports.boolean(),
  active: external_exports.boolean(),
  title: external_exports.string(),
  callApi: external_exports.boolean(),
  trigger: external_exports.discriminatedUnion("type", [
    external_exports.object({
      type: external_exports.literal("manual"),
      port: external_exports.number().optional()
    }),
    external_exports.object({
      type: external_exports.literal("onetime"),
      startTime: external_exports.number(),
      stopTime: external_exports.number(),
      everActivated: external_exports.boolean(),
      prepareAheadS: external_exports.number().int().optional()
    }),
    external_exports.object({
      type: external_exports.literal("recurrent"),
      schedule: external_exports.array(
        external_exports.object({
          start: external_exports.object({
            day: external_exports.number().int().min(0).max(6),
            timeS: external_exports.number().int().min(0).max(86400)
          }),
          stop: external_exports.object({
            day: external_exports.number().int().min(0).max(6),
            timeS: external_exports.number().int().min(0).max(86400)
          }),
          isActive: external_exports.boolean()
        })
      ),
      prepareAheadS: external_exports.number().int().optional()
    })
  ]),
  video: external_exports.object({
    output: external_exports.discriminatedUnion("type", [
      external_exports.object({
        type: external_exports.literal("video"),
        url: external_exports.string().nullable(),
        parameters: external_exports.string(),
        saveToSdCard: external_exports.object({
          ruleId: external_exports.string(),
          configurationId: external_exports.string()
        }).optional()
      }),
      external_exports.object({
        type: external_exports.literal("images"),
        url: external_exports.string().nullable(),
        imageIntervalS: external_exports.number()
      }),
      external_exports.object({
        type: external_exports.literal("none"),
        saveToSdCard: external_exports.object({
          ruleId: external_exports.string(),
          configurationId: external_exports.string()
        })
      })
    ]),
    input: external_exports.discriminatedUnion("type", [
      external_exports.object({
        type: external_exports.literal("RTSP_URL"),
        url: external_exports.string(),
        internalVapixParameters: external_exports.string()
      }),
      external_exports.object({
        type: external_exports.literal("CSw"),
        internalVapixParameters: external_exports.string()
      }),
      external_exports.object({
        type: external_exports.literal("CRS"),
        internalVapixParameters: external_exports.string(),
        userVapixParameters: external_exports.string()
      })
    ]),
    delayS: external_exports.number().int().nonnegative().optional()
  }),
  audio: external_exports.discriminatedUnion("source", [
    external_exports.object({
      source: external_exports.literal("none")
    }),
    external_exports.object({
      source: external_exports.literal("microphone"),
      audioChannelNbr: external_exports.number().int(),
      forceStereo: external_exports.boolean()
    }),
    external_exports.object({
      source: external_exports.literal("file"),
      name: external_exports.string(),
      path: external_exports.string(),
      forceStereo: external_exports.boolean(),
      loadAsNone: external_exports.boolean().optional()
      // file settings are valid but should load as 'none'
    }),
    external_exports.object({
      source: external_exports.literal("url"),
      name: external_exports.string(),
      url: external_exports.string(),
      avSyncMsec: external_exports.number().int(),
      forceStereo: external_exports.boolean()
    })
  ]),
  status: external_exports.object({
    led: external_exports.boolean(),
    port: external_exports.number().optional()
  })
});
var internalVapixParametersSchema = bitrateVapixParamsSchema.extend({
  camera: external_exports.string(),
  resolution: external_exports.string(),
  fps: external_exports.number().int(),
  compression: external_exports.number().int(),
  govLength: external_exports.number().int(),
  // =  videokeyframeinterval
  videoCodec: external_exports.union([external_exports.literal("h264"), external_exports.literal("h265"), external_exports.literal("av1")]),
  h264Profile: h264ProfileSchema.optional(),
  audio: booleanSchema,
  nbrOfChannels: external_exports.union([external_exports.literal(1), external_exports.literal(2)]).optional(),
  // 1 = mono, 2 = stereo
  overlays: external_exports.union([external_exports.literal("all"), external_exports.literal("text"), external_exports.literal("image"), external_exports.literal("application"), external_exports.literal("off")]).optional()
  // IMPORTANT - used only for FW > 10.6 --- OR camera settings selected -> should not be added to vapix params
});

// src/types/CamStreamerAPI/facebookSchema.ts
var timelinePostSchema = zod_default.object({
  postLocation: zod_default.literal("timeline"),
  streamPrivacy: zod_default.union([zod_default.literal("public"), zod_default.literal("friends"), zod_default.literal("only_me")])
});
var pagePostSchema = zod_default.object({
  postLocation: zod_default.literal("page"),
  page: zod_default.string()
});
var facebookSchema = streamCommonSchema.extend({
  platform: zod_default.literal("facebook"),
  description: zod_default.string().optional(),
  deleteAfterEnd: zod_default.boolean(),
  countdown: zod_default.boolean(),
  post: zod_default.discriminatedUnion("postLocation", [timelinePostSchema, pagePostSchema])
});

// src/types/CamStreamerAPI/windySchema.ts
var windySchema = streamCommonSchema.extend({
  platform: zod_default.literal("windy"),
  locationLat: zod_default.number(),
  locationLon: zod_default.number(),
  locationName: zod_default.string(),
  locationAddress: zod_default.string(),
  mapZoom: zod_default.number(),
  direction: zod_default.enum(["N", "NE", "E", "SE", "S", "SW", "W", "NW"]).nullable(),
  position: zod_default.union([zod_default.literal("fix"), zod_default.literal("rotating"), zod_default.literal("controllable")]),
  webPageUrl: zod_default.string()
});

// src/types/CamStreamerAPI/youtubeSchema.ts
var youtubeSchema = streamCommonSchema.extend({
  platform: zod_default.literal("youtube"),
  description: zod_default.string().optional(),
  playlists: zod_default.array(zod_default.string()),
  tags: zod_default.array(zod_default.string()),
  notificationEmails: zod_default.array(zod_default.string().email()),
  streamPrivacy: zod_default.union([zod_default.literal("public"), zod_default.literal("unlisted"), zod_default.literal("private")]),
  latency: zod_default.union([zod_default.literal("normal"), zod_default.literal("low"), zod_default.literal("ultra_low")]),
  afterEndStatus: zod_default.union([zod_default.literal("no_change"), zod_default.literal("public"), zod_default.literal("unlisted"), zod_default.literal("private")]),
  dvr: zod_default.boolean(),
  hasWatchdogs: zod_default.boolean(),
  countdown: zod_default.boolean().optional(),
  streamingProtocol: zod_default.union([zod_default.literal("RTMP"), zod_default.literal("RTMPS"), zod_default.literal("HLS")])
});

// src/types/CamStreamerAPI/streamsSchema.ts
var streamPlatforms = {
  da_cast: "da_cast",
  dailymotion: "dailymotion",
  facebook_rtmp: "facebook_rtmp",
  game_changer: "game_changer",
  hls_pull: "hls_pull",
  hls_push: "hls_push",
  ibm: "ibm",
  mpeg_dvb: "mpeg_dvb",
  microsoft_azure: "microsoft_azure",
  microsoft_stream: "microsoft_stream",
  rtmp: "rtmp",
  sd_card: "sd_card",
  srt: "srt",
  twitch: "twitch",
  vimeo: "vimeo",
  wowza: "wowza",
  youtube_rtmp: "youtube_rtmp",
  windy: "windy",
  youtube: "youtube",
  facebook: "facebook"
};
var daCastSchema = streamCommonSchema.extend({
  platform: zod_default.literal(streamPlatforms.da_cast)
});
var dailymotionSchema = streamCommonSchema.extend({
  platform: zod_default.literal(streamPlatforms.dailymotion)
});
var facebookRtmpSchema = streamCommonSchema.extend({
  platform: zod_default.literal(streamPlatforms.facebook_rtmp)
});
var gameChangerSchema = streamCommonSchema.extend({
  platform: zod_default.literal(streamPlatforms.game_changer)
});
var hlsPullSchema = streamCommonSchema.extend({
  platform: zod_default.literal(streamPlatforms.hls_pull)
});
var hlsPushSchema = streamCommonSchema.extend({
  platform: zod_default.literal(streamPlatforms.hls_push)
});
var ibmSchema = streamCommonSchema.extend({
  platform: zod_default.literal(streamPlatforms.ibm)
});
var mpegDvbSchema = streamCommonSchema.extend({
  platform: zod_default.literal(streamPlatforms.mpeg_dvb)
});
var microsoftAzureSchema = streamCommonSchema.extend({
  platform: zod_default.literal(streamPlatforms.microsoft_azure)
});
var microsoftStreamSchema = streamCommonSchema.extend({
  platform: zod_default.literal(streamPlatforms.microsoft_stream)
});
var rtmpSchema = streamCommonSchema.extend({
  platform: zod_default.literal(streamPlatforms.rtmp)
});
var sdCardSchema = streamCommonSchema.extend({
  platform: zod_default.literal(streamPlatforms.sd_card)
});
var srtSchema = streamCommonSchema.extend({
  platform: zod_default.literal(streamPlatforms.srt)
});
var twitchSchema = streamCommonSchema.extend({
  platform: zod_default.literal(streamPlatforms.twitch)
});
var vimeoSchema = streamCommonSchema.extend({
  platform: zod_default.literal(streamPlatforms.vimeo)
});
var wowzaSchema = streamCommonSchema.extend({
  platform: zod_default.literal(streamPlatforms.wowza)
});
var youtubeRtmpSchema = streamCommonSchema.extend({
  platform: zod_default.literal(streamPlatforms.youtube_rtmp)
});

// src/types/CamStreamerAPI/CamStreamerAPI.ts
var streamSchema = external_exports.discriminatedUnion("platform", [
  facebookSchema,
  facebookRtmpSchema,
  mpegDvbSchema,
  rtmpSchema,
  sdCardSchema,
  windySchema,
  youtubeSchema,
  vimeoSchema,
  twitchSchema,
  srtSchema,
  daCastSchema,
  hlsPullSchema,
  hlsPushSchema,
  wowzaSchema,
  dailymotionSchema,
  ibmSchema,
  microsoftAzureSchema,
  microsoftStreamSchema,
  gameChangerSchema,
  youtubeRtmpSchema
]);
var streamListSchema = external_exports.object({ streamList: external_exports.array(streamSchema) });
var isFacebookStream = (stream) => {
  return stream.platform === streamPlatforms.facebook;
};
var isFacebookRtmpStream = (stream) => {
  return stream.platform === streamPlatforms.facebook_rtmp;
};
var isMpegDvbStream = (stream) => {
  return stream.platform === streamPlatforms.mpeg_dvb;
};
var isRtmpStream = (stream) => {
  return stream.platform === streamPlatforms.rtmp;
};
var isSdCardStream = (stream) => {
  return stream.platform === streamPlatforms.sd_card;
};
var isWindyStream = (stream) => {
  return stream.platform === streamPlatforms.windy;
};
var isYouTubeStream = (stream) => {
  return stream.platform === streamPlatforms.youtube;
};
var isVimeoStream = (stream) => {
  return stream.platform === streamPlatforms.vimeo;
};
var isTwitchStream = (stream) => {
  return stream.platform === streamPlatforms.twitch;
};
var isSrtStream = (stream) => {
  return stream.platform === streamPlatforms.srt;
};
var isDaCastStream = (stream) => {
  return stream.platform === streamPlatforms.da_cast;
};
var isHlsPullStream = (stream) => {
  return stream.platform === streamPlatforms.hls_pull;
};
var isHlsPushStream = (stream) => {
  return stream.platform === streamPlatforms.hls_push;
};
var isWowzaStream = (stream) => {
  return stream.platform === streamPlatforms.wowza;
};
var isDailymotionStream = (stream) => {
  return stream.platform === streamPlatforms.dailymotion;
};
var isIbmStream = (stream) => {
  return stream.platform === streamPlatforms.ibm;
};
var isMicrosoftAzureStream = (stream) => {
  return stream.platform === streamPlatforms.microsoft_azure;
};
var isMicrosoftStream = (stream) => {
  return stream.platform === streamPlatforms.microsoft_stream;
};
var isGameChangerStream = (stream) => {
  return stream.platform === streamPlatforms.game_changer;
};
var isYoutubeRtmpStream = (stream) => {
  return stream.platform === streamPlatforms.youtube_rtmp;
};
var AudioType = /* @__PURE__ */ ((AudioType2) => {
  AudioType2[AudioType2["MP3"] = 0] = "MP3";
  AudioType2[AudioType2["AAC"] = 1] = "AAC";
  return AudioType2;
})(AudioType || {});
var audioFileStorageTypeSchema = external_exports.union([external_exports.literal("flash"), external_exports.literal("SD0"), external_exports.literal("url")]);
var storageListSchema = external_exports.array(
  external_exports.discriminatedUnion("type", [
    external_exports.object({
      type: external_exports.literal("flash"),
      flash: external_exports.string()
    }),
    external_exports.object({
      type: external_exports.literal("SD0"),
      SD0: external_exports.string()
    })
  ])
);
var audioFileSchema = external_exports.object({
  name: external_exports.string(),
  path: external_exports.string(),
  storage: audioFileStorageTypeSchema
});
var audioFileListSchema = external_exports.array(audioFileSchema);
var audioUrlSchema = external_exports.object({
  fileUrl: external_exports.string(),
  name: external_exports.string(),
  storage: external_exports.literal("url")
});
var audioLocalSchema = external_exports.object({
  file: fileSchema,
  name: external_exports.string(),
  storage: external_exports.enum(["flash", "SD0"])
});
var streamStatsSchema = external_exports.object({
  net_stats: external_exports.string(),
  stream_bytes_time_ms: external_exports.number().nonnegative(),
  stream_bytes: external_exports.number().nonnegative(),
  start_count: external_exports.number().nonnegative(),
  is_streaming: external_exports.literal(0).or(external_exports.literal(1))
});
var srtStreamStatisticsSchema = external_exports.object({
  msTimeStamp: external_exports.number().nonnegative(),
  pktSentTotal: external_exports.number().nonnegative(),
  byteSentTotal: external_exports.number().nonnegative(),
  pktRetransTotal: external_exports.number().nonnegative(),
  byteRetransTotal: external_exports.number().nonnegative(),
  pktSndDropTotal: external_exports.number().nonnegative(),
  byteSndDropTotal: external_exports.number().nonnegative(),
  mbpsSendRate: external_exports.number().nonnegative(),
  mbpsBandwidth: external_exports.number().nonnegative(),
  mbpsMaxBW: external_exports.number().nonnegative(),
  msRTT: external_exports.number().nonnegative(),
  msSndBuf: external_exports.number().nonnegative()
});
var diagnosticsParamsSchema = external_exports.object({
  camerainfo: booleanType().optional(),
  checkserver: booleanType().optional(),
  checkservertime: booleanType().optional(),
  speedtest: booleanType().optional(),
  pingtest: booleanType().optional(),
  videoHostPort: external_exports.string().optional(),
  audioHostPort: external_exports.string().optional()
});
var diagnosticsSchema = external_exports.object({
  status: external_exports.number(),
  message: external_exports.string(),
  data: external_exports.object({
    audioHostPort: external_exports.object({
      code: external_exports.number(),
      message: external_exports.string()
    }).optional(),
    cameraInfo: external_exports.object({
      uptime: external_exports.string(),
      availableRAM: external_exports.number(),
      availableInternal: external_exports.number()
    }).optional(),
    checkServer: external_exports.object({
      state: external_exports.string(),
      message: external_exports.string()
    }).optional(),
    checkServerTime: external_exports.object({
      code: external_exports.number(),
      message: external_exports.string()
    }).optional(),
    videoHostPort: external_exports.object({
      code: external_exports.number(),
      message: external_exports.string()
    }).optional(),
    speedTest: external_exports.object({
      code: external_exports.string(),
      data: external_exports.array(external_exports.object({ timestamp: external_exports.number(), speed: external_exports.number() }))
    }).optional(),
    pingTest: external_exports.object({
      output: external_exports.string()
    }).optional()
  })
});

// src/types/CamStreamerAPI/oldStreamSchema.ts
var oldStringStreamSchema = external_exports.object({
  enabled: external_exports.string(),
  active: external_exports.string(),
  audioSource: external_exports.string(),
  avSyncMsec: external_exports.string(),
  internalVapixParameters: external_exports.string(),
  userVapixParameters: external_exports.string(),
  outputParameters: external_exports.string(),
  outputType: external_exports.string(),
  mediaServerUrl: external_exports.string(),
  inputType: external_exports.string(),
  inputUrl: external_exports.string().default(""),
  forceStereo: external_exports.string(),
  streamDelay: external_exports.string(),
  statusLed: external_exports.string(),
  statusPort: external_exports.string(),
  callApi: external_exports.string(),
  trigger: external_exports.string(),
  schedule: external_exports.string(),
  prepareAhead: external_exports.string(),
  startTime: external_exports.string(),
  stopTime: external_exports.string()
});
var oldStringStreamSchemaWithId = oldStringStreamSchema.extend({
  streamId: external_exports.string()
});
var oldStreamSchema = external_exports.object({
  enabled: external_exports.union([external_exports.literal(0), external_exports.literal(1)]),
  active: external_exports.union([external_exports.literal(0), external_exports.literal(1)]),
  audioSource: external_exports.string(),
  avSyncMsec: external_exports.number().int(),
  internalVapixParameters: external_exports.string(),
  userVapixParameters: external_exports.string(),
  outputParameters: external_exports.string(),
  outputType: external_exports.union([external_exports.literal("video"), external_exports.literal("images"), external_exports.literal("none")]),
  mediaServerUrl: external_exports.string(),
  inputType: external_exports.union([external_exports.literal("CSw"), external_exports.literal("CRS"), external_exports.literal("RTSP_URL")]),
  inputUrl: external_exports.string(),
  forceStereo: external_exports.union([external_exports.literal(0), external_exports.literal(1)]),
  streamDelay: external_exports.number().nullable(),
  statusLed: external_exports.number(),
  statusPort: external_exports.string(),
  callApi: external_exports.number().int(),
  trigger: external_exports.string(),
  schedule: external_exports.string(),
  prepareAhead: external_exports.number().int(),
  startTime: external_exports.number().nullable(),
  stopTime: external_exports.number().nullable()
});

// src/internal/BasicAPI.ts
var BasicAPI = class {
  constructor(client) {
    this.client = client;
  }
  client;
  getClient(proxyParams) {
    return proxyParams ? new ProxyClient(this.client, proxyParams) : this.client;
  }
  async _getJson(path, parameters, options) {
    const agent = this.getClient(options?.proxyParams);
    const res = await agent.get({ path, parameters, timeout: options?.timeout });
    if (res.ok) {
      return await res.json();
    } else {
      throw new ErrorWithResponse(res);
    }
  }
  async _getText(path, parameters, options) {
    const agent = this.getClient(options?.proxyParams);
    const res = await agent.get({ path, parameters, timeout: options?.timeout });
    if (res.ok) {
      return await res.text();
    } else {
      throw new ErrorWithResponse(res);
    }
  }
  async _getBlob(path, parameters, options) {
    const agent = this.getClient(options?.proxyParams);
    const res = await agent.get({ path, parameters, timeout: options?.timeout });
    if (res.ok) {
      return await this.parseBlobResponse(res);
    } else {
      throw new ErrorWithResponse(res);
    }
  }
  async parseBlobResponse(response) {
    try {
      return await response.blob();
    } catch (err) {
      throw new ParsingBlobError(err);
    }
  }
  async _post(path, data, parameters, options, headers) {
    const agent = this.getClient(options?.proxyParams);
    const res = await agent.post({ path, data, parameters, headers, timeout: options?.timeout });
    if (res.ok) {
      return await res.json();
    } else {
      throw new ErrorWithResponse(res);
    }
  }
  async _postJsonEncoded(path, data, parameters, options) {
    const agent = this.getClient(options?.proxyParams);
    const jsonData = JSON.stringify(data);
    const res = await agent.post({
      path,
      data: jsonData,
      parameters,
      headers: { "Content-Type": "application/json" },
      timeout: options?.timeout
    });
    if (!res.ok) {
      throw new ErrorWithResponse(res);
    }
    return res;
  }
  async _postUrlEncoded(path, data, options) {
    const encodedData = paramToUrl(data);
    const agent = this.getClient(options?.proxyParams);
    const res = await agent.post({
      path,
      data: encodedData,
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      timeout: options?.timeout
    });
    if (!res.ok) {
      throw new ErrorWithResponse(res);
    }
    return res;
  }
};

// src/CamStreamerAPI.ts
var BASE_PATH = "/local/camstreamer";
var CamStreamerAPI = class extends BasicAPI {
  static getProxyPath = () => `${BASE_PATH}/proxy.cgi`;
  static getWsEventsPath = () => `${BASE_PATH}/events`;
  async checkAPIAvailable(options) {
    await this._getJson(`${BASE_PATH}/api_check.cgi`, void 0, options);
  }
  async checkCameraTime(options) {
    const res = await this._getJson(`${BASE_PATH}/camera_time.cgi`, void 0, options);
    return external_exports.boolean().parse(res.data?.state);
  }
  async wsAuthorization(options) {
    const res = await this._getJson(`${BASE_PATH}/ws_authorization.cgi`, void 0, options);
    if (res.status !== 200) {
      throw new WsAuthorizationError(res.message);
    }
    return external_exports.string().parse(res.data);
  }
  async getUtcTime(options) {
    const res = await this._getJson(`${BASE_PATH}/get_utc_time.cgi`, void 0, options);
    if (res.status !== 200) {
      throw new UtcTimeFetchError(res.message);
    }
    return external_exports.number().parse(res.data);
  }
  async getMaxFps(source = 0, options) {
    return await this._getJson(`${BASE_PATH}/get_max_framerate.cgi`, { video_source: source.toString() }, options);
  }
  async isCSPassValid(pass, options) {
    const res = await this._getJson(`${BASE_PATH}/check_pass.cgi`, { pass }, options);
    if (res.status !== 200) {
      throw new Error(res.message);
    }
    return res.data === "1";
  }
  async getCamStreamerAppLog(options) {
    return await this._getText(`${BASE_PATH}/view_log.cgi`, void 0, options);
  }
  //   ----------------------------------------
  //                   Streams
  //   ----------------------------------------
  async getStreamList(options) {
    const res = await this._getJson(`${BASE_PATH}/stream_list.cgi`, { action: "get" }, options);
    if (res.status !== 200) {
      throw new Error(res.message);
    }
    const oldStreamListRecord = external_exports.record(external_exports.string(), oldStringStreamSchema).safeParse(res.data);
    if (oldStreamListRecord.success) {
      const data = Object.entries(oldStreamListRecord.data).map(([streamId, streamData]) => ({
        streamId,
        ...parseCameraStreamResponse(streamData)
      }));
      throw new MigrationError([], data, [], []);
    }
    const newStreamData = [];
    const unknownStreamData = [];
    const oldStreamData = [];
    const invalidStreamData = [];
    for (const streamData of res.data.streamList) {
      if (streamData.platform !== void 0 && !Object.values(streamPlatforms).includes(streamData.platform)) {
        unknownStreamData.push(streamData);
        continue;
      }
      const newStreamParse = streamSchema.safeParse(streamData);
      if (newStreamParse.success) {
        newStreamData.push(newStreamParse.data);
        continue;
      }
      const oldStreamParse = oldStringStreamSchemaWithId.safeParse(streamData);
      if (oldStreamParse.success) {
        oldStreamData.push({
          streamId: oldStreamParse.data.streamId,
          ...parseCameraStreamResponse(oldStreamParse.data)
        });
        continue;
      }
      invalidStreamData.push(streamData);
    }
    if (oldStreamData.length > 0 || invalidStreamData.length > 0) {
      throw new MigrationError(newStreamData, oldStreamData, invalidStreamData, unknownStreamData);
    }
    return [...newStreamData, ...unknownStreamData];
  }
  // Allow unknown streams in the list
  async setStreamList(streamList, options) {
    await this._postJsonEncoded(
      `${BASE_PATH}/stream_list.cgi`,
      { streamList },
      {
        action: "set"
      },
      options
    );
  }
  /**
   * @throws {MigrationError} If some stream entries failed to parse.
   */
  async getStream(streamId, options) {
    const res = await this._getJson(
      `${BASE_PATH}/stream_list.cgi`,
      { action: "get", stream_id: streamId },
      options
    );
    if (res.status !== 200) {
      throw new Error(res.message);
    }
    const newStream = streamSchema.safeParse(res.data);
    if (newStream.success) {
      return newStream.data;
    }
    const oldStream = oldStringStreamSchema.passthrough().parse(res.data);
    throw new MigrationError([], [{ streamId, ...parseCameraStreamResponse(oldStream) }], [], []);
  }
  async setStream(streamId, streamData, options) {
    await this._postJsonEncoded(
      `${BASE_PATH}/stream_list.cgi`,
      streamData,
      {
        action: "set",
        stream_id: streamId
      },
      options
    );
  }
  async getStreamNetworkStatistics(streamId, options) {
    const res = await this._getJson(`${BASE_PATH}/get_streamstat.cgi`, { stream_id: streamId }, options);
    return streamStatsSchema.parse(res.data);
  }
  async getSrtStreamStatistics(streamId, options) {
    const res = await this._getJson(`${BASE_PATH}/srt_statistics.cgi`, { stream_id: streamId }, options);
    return srtStreamStatisticsSchema.parse(res.data);
  }
  async setStreamEnabled(streamId, enabled, options) {
    await this._postUrlEncoded(
      `${BASE_PATH}/set_stream_enabled.cgi`,
      { stream_id: streamId, enabled: enabled ? 1 : 0 },
      options
    );
  }
  async setStreamActive(streamId, active, options) {
    await this._postUrlEncoded(
      `${BASE_PATH}/set_stream_active.cgi`,
      { stream_id: streamId, active: active ? 1 : 0 },
      options
    );
  }
  async deleteStream(streamId, options) {
    const streamList = await this.getStreamList(options);
    const filteredList = streamList.filter((stream) => !("streamId" in stream) || stream.streamId !== streamId);
    if (filteredList.length === streamList.length) {
      return;
    }
    await this.setStreamList(filteredList, options);
  }
  //   ----------------------------------------
  //                 Audio Files
  //   ----------------------------------------
  async listFiles(options) {
    const res = await this._getJson(`${BASE_PATH}/upload_audio.cgi`, { action: "list" }, options);
    return audioFileListSchema.parse(res.data);
  }
  async uploadFile(formData, storage, options) {
    await this._post(
      `${BASE_PATH}/upload_audio.cgi`,
      formData,
      {
        action: "upload",
        storage
      },
      options
    );
  }
  async removeFile(fileParams, options) {
    await this._postUrlEncoded(`${BASE_PATH}/upload_audio.cgi`, { action: "remove", ...fileParams }, options);
  }
  async getFileStorage(options) {
    const res = await this._getJson(`${BASE_PATH}/upload_audio.cgi`, { action: "get_storage" }, options);
    return storageListSchema.parse(res.data);
  }
  async getFileFromCamera(path, options) {
    return await this._getBlob(`${BASE_PATH}/audio.cgi`, { path }, options);
  }
  //   ----------------------------------------
  //                   Report
  //   ----------------------------------------
  downloadReport(options) {
    return this._getText(`${BASE_PATH}/report.cgi`, void 0, options);
  }
  //   ----------------------------------------
  //                   Diagnostics
  //   ----------------------------------------
  async getDiagnostics(params, options) {
    const convertedParams = {
      camerainfo: params.camerainfo ? "1" : "0",
      checkserver: params.checkserver ? "1" : "0",
      checkservertime: params.checkservertime ? "1" : "0",
      speedtest: params.speedtest ? "1" : "0",
      pingtest: params.pingtest ? "1" : "0",
      videoHostPort: params.videoHostPort,
      audioHostPort: params.audioHostPort
    };
    const res = await this._getJson(`${BASE_PATH}/diagnostics.cgi`, convertedParams, options);
    return diagnosticsSchema.parse(res);
  }
};
var parseCameraStreamResponse = (cameraStreamData) => {
  return {
    enabled: parseInt(cameraStreamData.enabled),
    active: parseInt(cameraStreamData.active),
    audioSource: cameraStreamData.audioSource,
    avSyncMsec: parseInt(cameraStreamData.avSyncMsec),
    internalVapixParameters: cameraStreamData.internalVapixParameters,
    userVapixParameters: cameraStreamData.userVapixParameters,
    outputParameters: cameraStreamData.outputParameters,
    outputType: cameraStreamData.outputType,
    mediaServerUrl: cameraStreamData.mediaServerUrl,
    inputType: cameraStreamData.inputType,
    inputUrl: cameraStreamData.inputUrl,
    forceStereo: parseInt(cameraStreamData.forceStereo),
    streamDelay: isNaN(parseInt(cameraStreamData.streamDelay)) ? null : parseInt(cameraStreamData.streamDelay),
    statusLed: parseInt(cameraStreamData.statusLed),
    statusPort: cameraStreamData.statusPort,
    callApi: parseInt(cameraStreamData.callApi),
    trigger: cameraStreamData.trigger,
    schedule: cameraStreamData.schedule,
    prepareAhead: parseInt(cameraStreamData.prepareAhead),
    startTime: isNaN(parseInt(cameraStreamData.startTime)) ? null : parseInt(cameraStreamData.startTime),
    stopTime: isNaN(parseInt(cameraStreamData.stopTime)) ? null : parseInt(cameraStreamData.stopTime)
  };
};

// src/internal/WsEvents.ts
var WsEvents = class {
  constructor(validate2, ws) {
    this.validate = validate2;
    this.ws = ws;
    this.ws.onMessage = (e) => this.onMessage(e);
  }
  validate;
  ws;
  _isDestroyed = false;
  listeners = {};
  get isDestroyed() {
    return this._isDestroyed;
  }
  resendInitData() {
    const request = {
      command: "sendInitData"
    };
    this.ws.send(JSON.stringify(request));
  }
  addListener(type, listener, id) {
    const typeList = this.listeners[type];
    if (typeList === void 0) {
      this.listeners[type] = { [id]: listener };
      return;
    }
    typeList[id] = listener;
  }
  removeListener(type, id) {
    const typeList = this.listeners[type];
    if (typeList) {
      delete typeList[id];
      if (Object.keys(typeList).length === 0) {
        delete this.listeners[type];
      }
    }
  }
  removeAllListenersForId(id) {
    for (const type in this.listeners) {
      this.removeListener(type, id);
    }
  }
  onMessage(incomeData) {
    if (this.isDestroyed) {
      return;
    }
    try {
      const eventData = JSON.parse(incomeData.toString());
      const data = this.validate(eventData);
      if (isInitEvent(data)) {
        this.processMessage(data.data, true);
        return;
      }
      this.processMessage(data, false);
    } catch (error) {
      console.error("Error parsing event data:", incomeData.toString(), error);
    }
  }
  processMessage(event, isInit) {
    const listeners = this.listeners[event.type];
    const list = Object.values(listeners ?? {});
    list.forEach((listener) => listener(event, isInit));
  }
  destroy() {
    this._isDestroyed = true;
    this.ws.onMessage = () => {
    };
    this.ws.onOpen = () => Promise.reject(new Error("Websocket is destroyed"));
    this.ws.destroy();
    this.listeners = {};
  }
};
var isInitEvent = (event) => {
  return event.type === "init";
};

// src/types/ws/CamStreamerEvents.ts
var csEventsDataSchema = external_exports.discriminatedUnion("type", [
  external_exports.object({ type: external_exports.literal("authorization"), state: external_exports.string() }),
  external_exports.object({
    type: external_exports.literal("StreamState"),
    streamId: external_exports.string(),
    isStreaming: external_exports.boolean(),
    active: external_exports.boolean(),
    enabled: external_exports.boolean()
  }),
  external_exports.object({
    type: external_exports.literal("CS_API_SUCCESS"),
    apiCall: external_exports.string(),
    message: external_exports.string(),
    streamId: external_exports.string()
  }),
  external_exports.object({
    type: external_exports.literal("CS_API_ERROR"),
    apiCall: external_exports.string(),
    message: external_exports.string(),
    streamId: external_exports.string(),
    code: external_exports.string()
  }),
  external_exports.object({
    type: external_exports.literal("PortChanged"),
    port: external_exports.number(),
    value: external_exports.boolean()
  })
]);
var csEventsSchema = external_exports.discriminatedUnion("type", [
  external_exports.object({ type: external_exports.literal("init"), data: csEventsDataSchema }),
  ...csEventsDataSchema.options
]);

// src/ws/CamStreamerEvents.ts
var CamStreamerEvents = class extends WsEvents {
  constructor(ws, getAuthToken) {
    super((data) => csEventsSchema.parse(data), ws);
    this.getAuthToken = getAuthToken;
    this.ws.onOpen = this.sendInitMsg;
  }
  getAuthToken;
  sendInitMsg = async () => {
    try {
      const token = await this.getAuthToken();
      this.ws.send(JSON.stringify({ authorization: token }));
    } catch (error) {
      console.error("Error on open:", error);
      this.ws.reconnect();
    }
  };
};

// src/types/CamOverlayAPI/serviceCommonTypes.ts
var serviceNames = {
  accuweather: "accuweather",
  infoticker: "infoticker",
  customGraphics: "customGraphics",
  ptzCompass: "ptzCompass",
  images: "images",
  ptz: "ptz",
  pip: "pip",
  screenSharing: "screenSharing",
  web_camera: "web_camera",
  scoreBoard: "scoreBoard",
  baseballScoreBoard: "baseballScoreBoard",
  myBallBaseballWidgets: "myBallBaseballWidgets",
  scoreOverview: "scoreOverview",
  htmlOverlay: "htmlOverlay"
};
var coordinateSystemSchema = external_exports.union([
  external_exports.literal("top_left"),
  external_exports.literal("top"),
  external_exports.literal("top_right"),
  external_exports.literal("left"),
  external_exports.literal("center"),
  external_exports.literal("right"),
  external_exports.literal("bottom_left"),
  external_exports.literal("bottom"),
  external_exports.literal("bottom_right")
]);
var languageSchema = external_exports.union([
  external_exports.literal("en-us"),
  external_exports.literal("fr-fr"),
  external_exports.literal("ja-jp"),
  external_exports.literal("pt-pt"),
  external_exports.literal("es-es"),
  external_exports.literal("de-de"),
  external_exports.literal("ko-kr"),
  external_exports.literal("zh-hk"),
  external_exports.literal("zh-cn"),
  external_exports.literal("nl-nl"),
  external_exports.literal("cs-cz"),
  external_exports.literal("ru-ru"),
  external_exports.literal("sv-se")
]);
var fontSchema = external_exports.union([
  external_exports.literal("classic"),
  external_exports.literal("digital"),
  external_exports.custom((val) => {
    return typeof val === "string";
  })
]);
var weatherUnitSchema = external_exports.union([external_exports.literal("Metric"), external_exports.literal("Imperial")]);
var serviceCommonSchema = external_exports.object({
  id: external_exports.number().nonnegative(),
  enabled: external_exports.union([external_exports.literal(0), external_exports.literal(1)]),
  automationType: external_exports.union([
    external_exports.literal("time"),
    external_exports.literal("manual"),
    external_exports.literal("schedule"),
    external_exports.custom((val) => {
      return typeof val === "string" ? /^input\d+$/.test(val) : false;
    })
  ]).default("manual"),
  invertInput: external_exports.boolean().optional(),
  cameraList: external_exports.array(external_exports.number()).default([0]),
  camera: external_exports.number().nonnegative().optional(),
  // Deprecated, may still exist in old versions of CO
  schedule: external_exports.string().optional(),
  customName: external_exports.string().default(""),
  zIndex: external_exports.number().optional(),
  width: external_exports.number().nonnegative(),
  height: external_exports.number().nonnegative()
});
var sharingSchema = serviceCommonSchema.extend({
  pos_x: external_exports.number().nonnegative(),
  pos_y: external_exports.number().nonnegative(),
  coordSystem: coordinateSystemSchema,
  screenSize: external_exports.number().positive(),
  fps: external_exports.number()
});
var overlaySchema = external_exports.object({
  active: external_exports.boolean(),
  coordSystem: coordinateSystemSchema,
  pos_x: external_exports.number(),
  pos_y: external_exports.number(),
  imgPath: external_exports.string(),
  imgName: external_exports.string(),
  duration: external_exports.number(),
  scale: external_exports.number(),
  fps: external_exports.number().optional()
});

// src/types/CamOverlayAPI/infotickerSchema.ts
var infoTickerSchema = serviceCommonSchema.extend({
  name: external_exports.literal(serviceNames.infoticker),
  showClock: external_exports.union([external_exports.literal(0), external_exports.literal(1)]),
  clockType: external_exports.union([external_exports.literal("12h"), external_exports.literal("24h")]),
  textColor: external_exports.string(),
  bgColor: external_exports.string(),
  weatherLocation: external_exports.string(),
  // Location key
  weatherLocationName: external_exports.string(),
  // Title from location api
  weatherLang: languageSchema,
  weatherUnits: weatherUnitSchema,
  numberOfLines: external_exports.number().positive(),
  switchingTime: external_exports.number().nonnegative(),
  crawlLeft: external_exports.boolean(),
  crawlSpeed: external_exports.number(),
  coordSystem: external_exports.union([external_exports.literal("top"), external_exports.literal("bottom")]),
  pos_y: external_exports.number(),
  // In percentage
  font: fontSchema,
  fontSize: external_exports.number().nonnegative(),
  sourceType: external_exports.union([external_exports.literal("text"), external_exports.literal("url")]),
  source: external_exports.string()
});

// src/types/CamOverlayAPI/accuweatherSchema.ts
var accuweatherSchema = serviceCommonSchema.extend({
  name: external_exports.literal(serviceNames.accuweather),
  location: external_exports.string(),
  // Location key
  locationName: external_exports.string(),
  // Title from location api
  title: external_exports.string(),
  // Title from user
  bgStartColor: external_exports.union([
    external_exports.literal("237,143,73,0.93"),
    external_exports.literal("0,0,0,0.75"),
    external_exports.literal("31,32,73,0.9"),
    external_exports.literal("76,94,127,0.95")
  ]),
  bgEndColor: external_exports.union([
    external_exports.literal("234,181,89,0.93"),
    external_exports.literal("0,0,0,0.75"),
    external_exports.literal("73,96,213,0.9"),
    external_exports.literal("140,150,168,0.95")
  ]),
  clockType: external_exports.union([external_exports.literal("12h"), external_exports.literal("24h")]),
  // 12h|24h format
  lang: languageSchema,
  font: fontSchema,
  units: weatherUnitSchema,
  pos_x: external_exports.number(),
  pos_y: external_exports.number(),
  coordSystem: coordinateSystemSchema,
  layout: external_exports.union([
    external_exports.literal("0"),
    external_exports.literal("1"),
    external_exports.literal("2"),
    external_exports.literal("3"),
    external_exports.literal("4"),
    external_exports.literal("5"),
    external_exports.literal("6"),
    external_exports.literal("7"),
    external_exports.literal("8"),
    external_exports.literal("9"),
    external_exports.literal("10"),
    external_exports.literal("11"),
    external_exports.literal("12"),
    external_exports.literal("13")
  ]),
  scale: external_exports.number().nonnegative()
});

// src/types/CamOverlayAPI/ptzCompassSchema.ts
var ptzCompassSchema = serviceCommonSchema.extend({
  name: external_exports.literal(serviceNames.ptzCompass),
  pos_x: external_exports.number(),
  pos_y: external_exports.number(),
  coordSystem: coordinateSystemSchema,
  scale: external_exports.number().nonnegative(),
  type: external_exports.union([external_exports.literal("compass"), external_exports.literal("map"), external_exports.literal("image")]),
  image: external_exports.union([external_exports.string().url(), external_exports.literal("")]),
  // file:///usr/local/packages/camoverlay/localdata/user_images/vodnik-1.png
  northPan: external_exports.number(),
  // Pan in degrees
  cameraPosX: external_exports.number(),
  // Used only if type is 'map' or 'image'
  cameraPosY: external_exports.number(),
  colorScheme: external_exports.enum(["black", "white", "orange"]),
  generalLng: external_exports.number().optional(),
  generalLat: external_exports.number().optional(),
  generalZoom: external_exports.number().nonnegative().optional(),
  generalMapType: external_exports.string().optional(),
  generalIframeWidth: external_exports.number().optional(),
  generalIframeHeight: external_exports.number().optional(),
  generalAddress: external_exports.string().optional(),
  showDegrees: external_exports.boolean().default(false)
});

// src/types/CamOverlayAPI/imagesSchema.ts
var imagesSchema = serviceCommonSchema.extend({
  name: external_exports.literal(serviceNames.images),
  overlayList: external_exports.array(overlaySchema)
});

// src/types/CamOverlayAPI/ptzSchema.ts
var ptzSchema = serviceCommonSchema.extend({
  name: external_exports.literal(serviceNames.ptz),
  ptz_positions: external_exports.record(
    external_exports.string(),
    external_exports.object({
      overlayList: external_exports.array(overlaySchema.omit({ active: true, fps: true })),
      loop: external_exports.boolean()
    })
  )
});

// src/types/CamOverlayAPI/pipSchema.ts
var pipSchema = serviceCommonSchema.extend({
  name: external_exports.literal(serviceNames.pip),
  coordSystem: coordinateSystemSchema,
  pos_x: external_exports.number(),
  pos_y: external_exports.number(),
  fps: external_exports.number(),
  compression: external_exports.number().nonnegative(),
  screenSize: external_exports.number().nonnegative(),
  source_type: external_exports.union([external_exports.literal("axis_camera"), external_exports.literal("mjpeg_url")]),
  mjpeg_url: external_exports.union([external_exports.string().url(), external_exports.literal("")]),
  camera_ip: external_exports.union([external_exports.string().ip(), external_exports.literal("")]),
  camera_port: external_exports.number().nonnegative(),
  camera_user: external_exports.string(),
  camera_pass: external_exports.string(),
  camera_width: external_exports.number().nonnegative(),
  camera_height: external_exports.number().nonnegative(),
  camera_view_area: external_exports.string(),
  camera_overlay_params: external_exports.union([
    external_exports.literal("overlays=off"),
    external_exports.literal("overlays=all"),
    external_exports.literal("overlays=text"),
    external_exports.literal("overlays=image"),
    external_exports.literal("overlays=application")
  ]),
  rotate: external_exports.union([external_exports.literal(0), external_exports.literal(90), external_exports.literal(180), external_exports.literal(270)]).default(0),
  dewarping: external_exports.object({
    enabled: external_exports.boolean(),
    rectangle: external_exports.array(external_exports.tuple([external_exports.number(), external_exports.number()])),
    aspectRatioCorrection: external_exports.number()
  }),
  borderColor: external_exports.string(),
  borderWidth: external_exports.number(),
  scale: external_exports.number()
});

// src/types/CamOverlayAPI/customGraphicsSchema.ts
var mappingZonesCommonSchema = external_exports.object({
  name: external_exports.string(),
  pos_x: external_exports.number(),
  pos_y: external_exports.number(),
  text: external_exports.array(
    external_exports.object({
      source: external_exports.string(),
      active: external_exports.boolean()
    })
  ).optional(),
  wrapText: external_exports.boolean(),
  textLines: external_exports.number().positive(),
  textWidth: external_exports.number().nonnegative(),
  textAlign: external_exports.union([external_exports.literal("A_LEFT"), external_exports.literal("A_CENTER"), external_exports.literal("A_RIGHT")]),
  textVerticalAlign: external_exports.union([external_exports.literal("VA_TOP"), external_exports.literal("VA_CENTER"), external_exports.literal("VA_BOTTOM")]),
  textColor: external_exports.string(),
  font: fontSchema,
  fontSize: external_exports.number().nonnegative(),
  switchingTime: external_exports.number().nonnegative()
});
var mappingZonesCountdownSettingsSchema = external_exports.object({
  startDate: external_exports.number().nonnegative(),
  targetDate: external_exports.number().nonnegative(),
  countdown: external_exports.boolean(),
  countup: external_exports.boolean(),
  displayDay: external_exports.boolean(),
  displayHour: external_exports.boolean(),
  displayMinute: external_exports.boolean(),
  displaySeconds: external_exports.boolean(),
  idleText: external_exports.string(),
  hideZeros: external_exports.boolean(),
  delimiter: external_exports.union([external_exports.literal("colon"), external_exports.literal("letters")]),
  suffixSeconds: external_exports.string(),
  suffixMinute: external_exports.string(),
  suffixHour: external_exports.string(),
  suffixDay: external_exports.string(),
  loop: external_exports.boolean(),
  loopPeriod: external_exports.number().nonnegative(),
  waitingPeriod: external_exports.number().nonnegative()
});
var mappingZonePlainSchema = mappingZonesCommonSchema.extend({
  type: external_exports.literal("plain")
});
var mappingZoneCountdownSchema = mappingZonesCommonSchema.extend({
  type: external_exports.literal("countdown"),
  settings: mappingZonesCountdownSettingsSchema
});
var mappingZoneSchema = external_exports.discriminatedUnion("type", [mappingZonePlainSchema, mappingZoneCountdownSchema]);
var customGraphicsSchema = serviceCommonSchema.extend({
  name: external_exports.literal(serviceNames.customGraphics),
  pos_x: external_exports.number(),
  pos_y: external_exports.number(),
  coordSystem: coordinateSystemSchema,
  clockFormat: external_exports.union([external_exports.literal("12h"), external_exports.literal("24h")]),
  background: external_exports.enum(["custom", "image"]),
  image: external_exports.string(),
  customAreaColor: external_exports.string(),
  customAreaWidth: external_exports.number().nonnegative(),
  customAreaHeight: external_exports.number().nonnegative(),
  customAreaCorners: external_exports.union([external_exports.literal("sharp"), external_exports.literal("rounded")]),
  mappingZones: external_exports.array(mappingZoneSchema)
});
var fieldSchema = external_exports.object({
  field_name: external_exports.string(),
  text: external_exports.string(),
  color: external_exports.string().optional()
});

// src/types/CamOverlayAPI/screenSharingSchema.ts
var screenSharingSchema = sharingSchema.extend({
  name: external_exports.literal(serviceNames.screenSharing)
});

// src/types/CamOverlayAPI/webCameraSharingSchema.ts
var webCameraSharingSchema = sharingSchema.extend({
  name: external_exports.literal(serviceNames.web_camera)
});

// src/types/CamOverlayAPI/scoreBoardSchema.ts
var sportFontSchema = external_exports.union([
  external_exports.literal("classic"),
  external_exports.custom((val) => {
    return typeof val === "string";
  })
]);
var scoreBoardSchema = external_exports.object({
  id: external_exports.number().nonnegative(),
  enabled: external_exports.union([external_exports.literal(0), external_exports.literal(1)]),
  schedule: external_exports.string().optional(),
  cameraList: external_exports.array(external_exports.number()),
  zIndex: external_exports.number().nonnegative(),
  name: external_exports.literal(serviceNames.scoreBoard),
  pos_x: external_exports.number(),
  pos_y: external_exports.number(),
  coordSystem: coordinateSystemSchema,
  width: external_exports.number(),
  height: external_exports.number(),
  scale: external_exports.number(),
  teamHomeShortname: external_exports.string(),
  teamGuestShortname: external_exports.string(),
  teamHomeBackgroundColor: external_exports.string(),
  teamGuestBackgroundColor: external_exports.string(),
  teamHomeTextColor: external_exports.string(),
  teamGuestTextColor: external_exports.string(),
  teamHomeImgPath: external_exports.string(),
  teamGuestImgPath: external_exports.string(),
  teamHomeCurrentScore: external_exports.number(),
  teamGuestCurrentScore: external_exports.number(),
  baseTimeTimestamp: external_exports.number(),
  baseTimePlaytime: external_exports.number(),
  currentPeriodPlaytime: external_exports.number(),
  timeIsRunning: external_exports.boolean(),
  currentPeriodLength: external_exports.number(),
  currentPeriod: external_exports.number(),
  font: sportFontSchema.default("classic")
});
var baseballScoreBoardSchema = external_exports.object({
  id: external_exports.number().nonnegative(),
  enabled: external_exports.union([external_exports.literal(0), external_exports.literal(1)]),
  schedule: external_exports.string().optional(),
  cameraList: external_exports.array(external_exports.number()),
  zIndex: external_exports.number().nonnegative(),
  name: external_exports.literal(serviceNames.baseballScoreBoard),
  pos_x: external_exports.number(),
  pos_y: external_exports.number(),
  coordSystem: coordinateSystemSchema,
  width: external_exports.number(),
  height: external_exports.number(),
  scale: external_exports.number(),
  matchFinished: external_exports.boolean(),
  bases: external_exports.tuple([external_exports.boolean(), external_exports.boolean(), external_exports.boolean()]),
  homeInning: external_exports.boolean(),
  inning: external_exports.number().nonnegative(),
  outs: external_exports.number().nonnegative(),
  balls: external_exports.number().nonnegative(),
  strikes: external_exports.number().nonnegative(),
  baseTimeTimestamp: external_exports.number(),
  baseTimePlaytime: external_exports.number(),
  timeIsRunning: external_exports.boolean(),
  teamHomeShortname: external_exports.string(),
  teamGuestShortname: external_exports.string(),
  teamHomeBackgroundColor: external_exports.string(),
  teamGuestBackgroundColor: external_exports.string(),
  teamHomeTextColor: external_exports.string(),
  teamGuestTextColor: external_exports.string(),
  teamHomeCurrentScore: external_exports.number(),
  teamGuestCurrentScore: external_exports.number(),
  footerImgPath: external_exports.string().optional(),
  footerText: external_exports.string().optional(),
  footerBackgroundColor: external_exports.string().optional(),
  footerTextColor: external_exports.string().optional(),
  font: sportFontSchema.default("classic")
});
var baseballScoreBoardAutomaticSchema = external_exports.object({
  id: external_exports.number().nonnegative(),
  enabled: external_exports.union([external_exports.literal(0), external_exports.literal(1)]),
  schedule: external_exports.string().optional(),
  cameraList: external_exports.array(external_exports.number()),
  zIndex: external_exports.number().nonnegative(),
  name: external_exports.literal(serviceNames.myBallBaseballWidgets),
  width: external_exports.number(),
  height: external_exports.number(),
  scale: external_exports.number(),
  matchDetailLink: external_exports.string(),
  matchListLink: external_exports.string(),
  mirrored: external_exports.boolean(),
  pregameWidgetText: external_exports.string(),
  teamHomeBackgroundColor: external_exports.string(),
  teamGuestBackgroundColor: external_exports.string(),
  teamHomeTextColor: external_exports.string(),
  teamGuestTextColor: external_exports.string(),
  homeLogoPath: external_exports.string(),
  guestLogoPath: external_exports.string(),
  footerImgPath: external_exports.string().optional(),
  footerText: external_exports.string().optional(),
  footerBackgroundColor: external_exports.string().optional(),
  footerTextColor: external_exports.string().optional(),
  font: sportFontSchema.default("classic")
});
var scoreOverviewSchema = external_exports.object({
  id: external_exports.number().nonnegative(),
  enabled: external_exports.union([external_exports.literal(0), external_exports.literal(1)]),
  cameraList: external_exports.array(external_exports.number()),
  zIndex: external_exports.number().nonnegative(),
  name: external_exports.literal(serviceNames.scoreOverview),
  pos_x: external_exports.number(),
  pos_y: external_exports.number(),
  coordSystem: coordinateSystemSchema,
  width: external_exports.number(),
  height: external_exports.number(),
  scale: external_exports.number(),
  teamHomeName: external_exports.string(),
  teamGuestName: external_exports.string(),
  teamHomeBackgroundColor: external_exports.string(),
  teamGuestBackgroundColor: external_exports.string(),
  teamHomeTextColor: external_exports.string(),
  teamGuestTextColor: external_exports.string(),
  teamHomeImgPath: external_exports.string(),
  teamGuestImgPath: external_exports.string(),
  teamHomeCurrentScore: external_exports.number(),
  teamGuestCurrentScore: external_exports.number(),
  scoreVisible: external_exports.boolean(),
  description: external_exports.string(),
  textFont: sportFontSchema.default("classic"),
  scoreFont: external_exports.literal("classic")
  // Supposed to always be 'classic'
});

// src/types/CamOverlayAPI/htmlOverlaySchema.ts
var htmlOverlaySchema = serviceCommonSchema.extend({
  name: external_exports.literal(serviceNames.htmlOverlay),
  pos_x: external_exports.number().nonnegative(),
  pos_y: external_exports.number().nonnegative(),
  coordSystem: coordinateSystemSchema,
  url: external_exports.string().url().or(external_exports.literal("")).default(""),
  pageWidth: external_exports.number().nonnegative(),
  pageHeight: external_exports.number().nonnegative(),
  fps: external_exports.number().nonnegative(),
  scale: external_exports.number(),
  cropEnabled: external_exports.boolean(),
  cropLeft: external_exports.number().nonnegative(),
  cropTop: external_exports.number().nonnegative(),
  cropWidth: external_exports.number().nonnegative(),
  cropHeight: external_exports.number().nonnegative()
});

// src/types/CamOverlayAPI/CamOverlayAPI.ts
var wsResponseSchema = external_exports.object({
  status: external_exports.number(),
  message: external_exports.string()
});
var servicesSchema = external_exports.discriminatedUnion("name", [
  infoTickerSchema,
  accuweatherSchema,
  ptzCompassSchema,
  imagesSchema,
  ptzSchema,
  pipSchema,
  customGraphicsSchema,
  screenSharingSchema,
  webCameraSharingSchema,
  scoreBoardSchema,
  baseballScoreBoardSchema,
  baseballScoreBoardAutomaticSchema,
  scoreOverviewSchema,
  htmlOverlaySchema
]);
var serviceListSchema = external_exports.object({
  services: external_exports.array(servicesSchema)
});
var isAccuweather = (service) => service.name === "accuweather";
var isCustomGraphics = (service) => service.name === "customGraphics";
var isImages = (service) => service.name === "images";
var isInfoticker = (service) => service.name === "infoticker";
var isPip = (service) => service.name === "pip";
var isPtzCompass = (service) => service.name === "ptzCompass";
var isPtz = (service) => service.name === "ptz";
var isScreenSharing = (service) => service.name === "screenSharing";
var isWebCameraSharing = (service) => service.name === "web_camera";
var isScoreBoard = (service) => service.name === "scoreBoard";
var isBaseballScoreBoard = (service) => service.name === "baseballScoreBoard";
var isBaseballScoreBoardAutomatic = (service) => service.name === "myBallBaseballWidgets";
var isScoreOverview = (service) => service.name === "scoreOverview";
var isHtmlOverlay = (service) => service.name === "htmlOverlay";
var ImageType = /* @__PURE__ */ ((ImageType2) => {
  ImageType2[ImageType2["PNG"] = 0] = "PNG";
  ImageType2[ImageType2["JPEG"] = 1] = "JPEG";
  return ImageType2;
})(ImageType || {});
var imageFileStorageTypeSchema = external_exports.union([
  external_exports.literal("flash"),
  external_exports.literal("SD0"),
  external_exports.literal("ftp"),
  external_exports.literal("samba"),
  external_exports.literal("url")
]);
var fontFileStorageTypeSchema = external_exports.union([external_exports.literal("flash"), external_exports.literal("SD0")]);
var imageFilestorageDataListSchema = external_exports.array(
  external_exports.object({
    type: imageFileStorageTypeSchema,
    state: external_exports.string()
  })
);
var fontStorageDataListSchema = external_exports.array(
  external_exports.object({
    type: fontFileStorageTypeSchema,
    state: external_exports.string()
  })
);
var getStorageDataListSchema = (fileType) => {
  return fileType === "image" ? imageFilestorageDataListSchema : fontStorageDataListSchema;
};
var imageStorageResponseSchema = external_exports.object({
  code: external_exports.number(),
  list: imageFilestorageDataListSchema
});
var fontStorageResponseSchema = external_exports.object({
  code: external_exports.number(),
  list: fontStorageDataListSchema
});
var getStorageResponseSchema = (fileType) => {
  return fileType === "image" ? imageStorageResponseSchema : fontStorageResponseSchema;
};
var imageFileSchema = external_exports.object({
  name: external_exports.string(),
  path: external_exports.string().url(),
  storage: imageFileStorageTypeSchema
});
var fontFileSchema = external_exports.object({
  name: external_exports.string(),
  path: external_exports.string().url(),
  storage: fontFileStorageTypeSchema
});
var getFileSchema = (fileType) => {
  return fileType === "image" ? imageFileSchema : fontFileSchema;
};
var imageFileListSchema = external_exports.array(imageFileSchema);
var fontFileListSchema = external_exports.array(fontFileSchema);
var getFileListSchema = (fileType) => {
  return fileType === "image" ? imageFileListSchema : fontFileListSchema;
};
var imageFileDataSchema = external_exports.object({
  code: external_exports.number(),
  list: imageFileListSchema
});
var fontFileDataSchema = external_exports.object({
  code: external_exports.number(),
  list: fontFileListSchema
});
var getFileDataSchema = (fileType) => {
  return fileType === "image" ? imageFileDataSchema : fontFileDataSchema;
};

// src/CamOverlayAPI.ts
var BASE_PATH2 = "/local/camoverlay/api";
var CamOverlayAPI = class _CamOverlayAPI extends BasicAPI {
  static getBasePath = () => BASE_PATH2;
  static getProxyPath = () => `${BASE_PATH2}/proxy.cgi`;
  static getFilePreviewPath = (path) => `${BASE_PATH2}/image.cgi?path=${encodeURIComponent(path)}`;
  async checkAPIAvailable(options) {
    await this._getJson(`${BASE_PATH2}/api_check.cgi`, void 0, options);
  }
  async checkCameraTime(options) {
    const res = await this._getJson(`${BASE_PATH2}/camera_time.cgi`, void 0, options);
    return external_exports.boolean().parse(res.state);
  }
  async getNetworkCameraList(options) {
    const res = await this._getJson(`${BASE_PATH2}/network_camera_list.cgi`, void 0, options);
    return networkCameraListSchema.parse(res.camera_list);
  }
  async wsAuthorization(options) {
    const res = await this._getJson(`${BASE_PATH2}/ws_authorization.cgi`, void 0, options);
    return wsResponseSchema.parse(res).message;
  }
  async getMjpegStreamImage(mjpegUrl, options) {
    return await this._getBlob(
      `${BASE_PATH2}/fetch_mjpeg_image.cgi`,
      { mjpeg_url: decodeURIComponent(mjpegUrl) },
      options
    );
  }
  //   ----------------------------------------
  //            files - fonts, images
  //   ----------------------------------------
  async listFiles(fileType, options) {
    const res = await this._getJson(`${BASE_PATH2}/upload_${fileType}.cgi`, { action: "list" }, options);
    return getFileListSchema(fileType).parse(res.list);
  }
  async uploadFile(fileType, formData, storage, options) {
    await this._post(
      `${BASE_PATH2}/upload_${fileType}.cgi`,
      formData,
      {
        action: "upload",
        storage
      },
      options
    );
  }
  async removeFile(fileType, fileParams, options) {
    await this._postUrlEncoded(
      `${BASE_PATH2}/upload_${fileType}.cgi`,
      {
        action: "remove",
        ...fileParams
      },
      options
    );
  }
  async getFileStorage(fileType, options) {
    const res = await this._getJson(
      `${BASE_PATH2}/upload_${fileType}.cgi`,
      { action: "get_storage" },
      options
    );
    if (res.code !== 200) {
      throw new StorageDataFetchError(res);
    }
    return getStorageDataListSchema(fileType).parse(res.list);
  }
  async getFilePreviewFromCamera(path, options) {
    return await this._getBlob(_CamOverlayAPI.getFilePreviewPath(path), void 0, options);
  }
  //   ----------------------------------------
  //             CamOverlay services
  //   ----------------------------------------
  async updateInfoticker(serviceId, text, options) {
    await this._getJson(`${BASE_PATH2}/infoticker.cgi`, { service_id: serviceId, text }, options);
  }
  async setEnabled(serviceId, enabled, options) {
    await this._post(`${BASE_PATH2}/enabled.cgi`, "", { [`id_${serviceId}`]: enabled ? 1 : 0 }, options);
  }
  async isEnabled(serviceId, options) {
    const agent = this.getClient(options?.proxyParams);
    const res = await agent.get({
      path: `${BASE_PATH2}/services.cgi`,
      parameters: { action: "get" },
      timeout: options?.timeout
    });
    if (res.ok) {
      const data = JSON.parse(await res.text());
      for (const service of data.services) {
        if (service.id === serviceId) {
          return service.enabled === 1;
        }
      }
      throw new ServiceNotFoundError();
    } else {
      throw new ErrorWithResponse(res);
    }
  }
  async getSingleService(serviceId, options) {
    const res = await this._getJson(
      `${BASE_PATH2}/services.cgi`,
      {
        action: "get",
        service_id: serviceId
      },
      options
    );
    return servicesSchema.parse(res);
  }
  async getServices(options) {
    const res = await this._getJson(`${BASE_PATH2}/services.cgi`, { action: "get" }, options);
    const services = serviceListSchema.parse(res).services;
    return services;
  }
  async updateSingleService(service, options) {
    await this._postJsonEncoded(
      `${BASE_PATH2}/services.cgi`,
      service,
      {
        action: "set",
        service_id: service.id
      },
      options
    );
  }
  async updateServices(services, options) {
    await this._postJsonEncoded(
      `${BASE_PATH2}/services.cgi`,
      { services },
      {
        action: "set"
      },
      options
    );
  }
  //   ----------------------------------------
  //               Custom Graphics
  //   ----------------------------------------
  updateCGText(serviceId, fields, options) {
    const params = {};
    for (const field of fields) {
      const name = field.field_name;
      params[name] = field.text;
      if (field.color !== void 0) {
        params[`${name}_color`] = field.color;
      }
    }
    return this.promiseCGUpdate(serviceId, "update_text", params, void 0, void 0, options);
  }
  updateCGImagePos(serviceId, coordinates = "", x = 0, y = 0, options) {
    const params = {
      coord_system: coordinates,
      pos_x: x,
      pos_y: y
    };
    return this.promiseCGUpdate(serviceId, "update_image", params, void 0, void 0, options);
  }
  updateCGImage(serviceId, path, coordinates = "", x = 0, y = 0, options) {
    const params = {
      coord_system: coordinates,
      pos_x: x,
      pos_y: y,
      image: path
    };
    return this.promiseCGUpdate(serviceId, "update_image", params, void 0, void 0, options);
  }
  updateCGImageFromData(serviceId, imageType, imageData, coordinates = "", x = 0, y = 0, options) {
    const contentType = imageType === 0 /* PNG */ ? "image/png" : "image/jpeg";
    const params = {
      coord_system: coordinates,
      pos_x: x,
      pos_y: y
    };
    return this.promiseCGUpdate(serviceId, "update_image", params, contentType, imageData, options);
  }
  //   ----------------------------------------
  //                   Report
  //   ----------------------------------------
  downloadReport(options) {
    return this._getText(`${BASE_PATH2}/report.cgi`, void 0, options);
  }
  //   ----------------------------------------
  //                   Private
  //   ----------------------------------------
  async promiseCGUpdate(serviceId, action, params = {}, contentType, data, options) {
    const path = `${BASE_PATH2}/customGraphics.cgi`;
    let headers = {};
    if (contentType !== void 0 && data !== void 0) {
      headers = { "Content-Type": contentType };
    }
    const agent = this.getClient(options?.proxyParams);
    const res = await agent.post({
      path,
      data: data ?? "",
      parameters: {
        action,
        service_id: serviceId.toString(),
        ...params
      },
      headers,
      timeout: options?.timeout
    });
    if (!res.ok) {
      throw new ErrorWithResponse(res);
    }
  }
};

// src/types/ws/CamOverlayEvents.ts
var coEventsDataSchema = external_exports.discriminatedUnion("type", [
  external_exports.object({ type: external_exports.literal("authorization"), state: external_exports.string() }),
  external_exports.object({
    type: external_exports.literal("ServiceStart"),
    serviceId: external_exports.number()
  }),
  external_exports.object({
    type: external_exports.literal("ServiceStop"),
    serviceId: external_exports.number()
  })
]);
var coEventsSchema = external_exports.discriminatedUnion("type", [
  external_exports.object({ type: external_exports.literal("init"), data: coEventsDataSchema }),
  ...coEventsDataSchema.options
]);

// src/ws/CamOverlayEvents.ts
var CamOverlayEvents = class extends WsEvents {
  constructor(ws, getAuthToken) {
    super((data) => coEventsSchema.parse(data), ws);
    this.getAuthToken = getAuthToken;
    this.ws.onOpen = this.sendInitMsg;
  }
  getAuthToken;
  sendInitMsg = async () => {
    try {
      const token = await this.getAuthToken();
      this.ws.send(JSON.stringify({ authorization: token }));
    } catch (error) {
      console.error("Error on open:", error);
      this.ws.reconnect();
    }
  };
};

// src/internal/transformers.ts
var toCamelCase = (o) => mapKeys(o, camelCase);
var toCamelCaseDeep = (o) => {
  return mapKeysDeep(o, camelCase);
};
var splitWords = (input) => {
  if (!input) {
    return [];
  }
  return input.replace(/([A-Z]+)([A-Z][a-z])/g, "$1 $2").replace(/([a-z0-9])([A-Z])/g, "$1 $2").replace(/[^a-zA-Z0-9]+/g, " ").trim().split(/\s+/).map((w) => w.toLowerCase()).filter((w) => w.length > 0);
};
var camelCase = (key) => {
  const words = splitWords(key);
  if (words.length === 0) {
    return "";
  }
  const [first, ...rest] = words;
  return first + rest.map((w) => w[0].toUpperCase() + w.slice(1)).join("");
};
var isPlainObject = (value) => {
  if (value === null || typeof value !== "object") {
    return false;
  }
  const proto = Object.getPrototypeOf(value);
  return proto === null || proto === Object.prototype;
};
var mapKeys = (obj, cb) => {
  const result = {};
  for (const key of Object.keys(obj)) {
    result[cb(key)] = obj[key];
  }
  return result;
};
var mapKeysDeep = (obj, cb) => {
  if (Array.isArray(obj)) {
    return obj.map((item) => mapKeysDeep(item, cb));
  }
  if (!isPlainObject(obj)) {
    return obj;
  }
  const result = {};
  for (const key of Object.keys(obj)) {
    result[cb(key)] = mapKeysDeep(obj[key], cb);
  }
  return result;
};

// src/types/CamSwitcherAPI.ts
var channelTypeSchema = external_exports.union([external_exports.literal("audio"), external_exports.literal("video"), external_exports.literal("av")]);
var playlistPlayTypeSchema = external_exports.union([
  external_exports.literal("PLAY_ALL"),
  external_exports.literal("PLAY_ALL_LOOP"),
  external_exports.literal("PLAY_ALL_SHUFFLED"),
  external_exports.literal("PLAY_ALL_LOOP_SHUFFLED"),
  external_exports.literal("PLAY_ONE_RANDOM")
]);
var storageInfoListSchema = external_exports.array(
  external_exports.object({
    storage: storageTypeSchema,
    writable: external_exports.boolean(),
    size: external_exports.number(),
    available: external_exports.number()
  })
);
var outputInfoSchema = external_exports.object({
  rtsp_url: external_exports.string(),
  ws: external_exports.string(),
  ws_initial_message: external_exports.string()
}).transform(toCamelCase);
var audioPushInfoSchema = external_exports.object({
  ws: external_exports.string(),
  ws_initial_message: external_exports.string()
}).transform(toCamelCase);
var streamSaveSchema = external_exports.object({
  niceName: external_exports.string(),
  ip: external_exports.string(),
  mdnsName: external_exports.string(),
  port: external_exports.number(),
  enabled: external_exports.boolean(),
  auth: external_exports.string(),
  query: external_exports.string(),
  channel: channelTypeSchema,
  keyboard: keyboardShortcutsSchema,
  sortIndexOverview: external_exports.number().optional(),
  viewNumber: external_exports.number()
});
var streamSaveLoadSchema = external_exports.record(external_exports.string(), streamSaveSchema.partial());
var clipSaveSchema = external_exports.object({
  niceName: external_exports.string(),
  channel: channelTypeSchema,
  keyboard: keyboardShortcutsSchema,
  sortIndexOverview: external_exports.number()
});
var clipSaveLoadSchema = external_exports.record(external_exports.string(), clipSaveSchema.partial());
var playlistStreamSaveSchema = external_exports.object({
  stream_name: external_exports.string(),
  clip_name: external_exports.string(),
  tracker_name: external_exports.string(),
  storage: storageTypeSchema
}).partial();
var playlistSaveSchema = external_exports.object({
  channel: channelTypeSchema,
  isFavourite: external_exports.boolean(),
  keyboard: keyboardShortcutsSchema,
  niceName: external_exports.string(),
  sortIndexFavourite: external_exports.number().optional(),
  sortIndexOverview: external_exports.number().optional(),
  play_type: playlistPlayTypeSchema,
  default: external_exports.boolean().optional(),
  stream_list: external_exports.array(
    external_exports.object({
      id: external_exports.string(),
      isTimeoutCustom: external_exports.boolean(),
      ptz_preset_pos_name: external_exports.string(),
      repeat: external_exports.number(),
      timeout: external_exports.number(),
      video: playlistStreamSaveSchema,
      audio: playlistStreamSaveSchema.optional()
    })
  )
});
var playlistSaveLoadSchema = external_exports.record(external_exports.string(), playlistSaveSchema.partial());
var trackerSaveSchema = external_exports.object({
  id: external_exports.string(),
  name: external_exports.string(),
  previewId: external_exports.string(),
  duration: external_exports.number(),
  keyboard: keyboardShortcutsSchema,
  channel: channelTypeSchema,
  sortIndexOverview: external_exports.number(),
  width: external_exports.number(),
  height: external_exports.number(),
  fps: external_exports.number(),
  motion_history_frames: external_exports.number(),
  include_zone: external_exports.array(external_exports.array(external_exports.number()).length(2)),
  include_node_ids: external_exports.array(external_exports.string()),
  camera_list: external_exports.array(
    external_exports.object({
      id: external_exports.string(),
      name: external_exports.string(),
      overview: external_exports.boolean(),
      zone: external_exports.array(external_exports.number()).length(4),
      playlist_name: external_exports.string(),
      ptz_preset_pos_no: external_exports.number()
    })
  ),
  viewNumber: external_exports.number(),
  camera_view_number: external_exports.number()
});
var trackerSaveLoadSchema = external_exports.record(external_exports.string(), trackerSaveSchema.partial());
var playlistQueueSchema = external_exports.object({
  playlist_queue_list: external_exports.array(external_exports.string())
}).transform(toCamelCaseDeep);
var clipListSchema = external_exports.object({
  clip_list: external_exports.record(
    external_exports.string(),
    external_exports.object({
      storage: storageTypeSchema,
      duration: external_exports.number(),
      stream_list: external_exports.array(
        external_exports.union([
          external_exports.object({
            type: external_exports.literal("video"),
            width: external_exports.number(),
            height: external_exports.number(),
            sample_rate: external_exports.number(),
            h264_profile: h264ProfileSchema,
            h264_level: external_exports.literal("4.1"),
            gop: external_exports.number(),
            // govLength
            fps: external_exports.number(),
            bitrate: external_exports.number()
          }),
          external_exports.object({
            type: external_exports.literal("audio"),
            sample_rate: external_exports.number(),
            channel_count: audioChannelCountSchema
          })
        ])
      )
    })
  )
});
var cameraOptionsSchema = bitrateVapixParamsSchema.extend({
  resolution: external_exports.string(),
  h264Profile: h264ProfileSchema,
  fps: external_exports.number(),
  compression: external_exports.number().min(0).max(100),
  govLength: external_exports.number(),
  bitrateVapixParams: external_exports.string().nullable(),
  audioSampleRate: external_exports.number(),
  audioChannelCount: audioChannelCountSchema,
  keyboard: external_exports.object({
    fromSource: keyboardShortcutSchema,
    none: keyboardShortcutSchema
  })
}).partial();
var globalAudioSettingsTypeSchema = external_exports.union([external_exports.literal("fromSource"), external_exports.literal("source")]);
var globalAudioSettingsSchema = external_exports.object({
  type: globalAudioSettingsTypeSchema,
  source: external_exports.string(),
  storage: external_exports.string().optional()
});
var secondaryAudioSettingsSchema = external_exports.object({
  type: external_exports.union([external_exports.literal("CLIP"), external_exports.literal("STREAM"), external_exports.literal("NONE")]),
  streamName: external_exports.string().optional(),
  clipName: external_exports.string().optional(),
  storage: storageTypeSchema,
  secondaryAudioLevel: external_exports.number(),
  masterAudioLevel: external_exports.number()
});
var clipFilesListSchema = external_exports.object({
  status: external_exports.number(),
  message: external_exports.string(),
  data: external_exports.object({
    files: external_exports.array(external_exports.string())
  })
});

// src/types/VapixAPI.ts
var applicationSchema = external_exports.object({
  Name: external_exports.string(),
  NiceName: external_exports.string(),
  Vendor: external_exports.string(),
  Version: external_exports.string(),
  ApplicationID: external_exports.string().optional(),
  License: external_exports.string(),
  Status: external_exports.string(),
  ConfigurationPage: external_exports.string().optional(),
  VendorHomePage: external_exports.string().optional(),
  LicenseName: external_exports.string().optional()
});
var applicationListSchema = external_exports.array(
  applicationSchema.extend({
    appId: external_exports.union([
      external_exports.literal("CamStreamer"),
      external_exports.literal("CamSwitcher"),
      external_exports.literal("CamOverlay"),
      external_exports.literal("CamScripter"),
      external_exports.literal("PlaneTracker"),
      external_exports.literal("Ndihxplugin"),
      external_exports.literal("SportTracker"),
      external_exports.literal("CamOverlayHtmlplugin")
    ]).nullable()
  })
);
var APP_IDS = [
  "CamStreamer",
  "CamSwitcher",
  "CamOverlay",
  "CamScripter",
  "PlaneTracker",
  "Ndihxplugin"
];
var ALL_APP_IDS = [...APP_IDS, "SportTracker", "CamOverlayHtmlplugin"];
var guardTourSchema = external_exports.object({
  id: external_exports.string(),
  camNbr: external_exports.unknown(),
  name: external_exports.string(),
  randomEnabled: external_exports.unknown(),
  running: external_exports.string(),
  timeBetweenSequences: external_exports.unknown(),
  tour: external_exports.array(
    external_exports.object({
      moveSpeed: external_exports.unknown(),
      position: external_exports.unknown(),
      presetNbr: external_exports.unknown(),
      waitTime: external_exports.unknown(),
      waitTimeViewType: external_exports.unknown()
    })
  )
});
var audioSampleRatesSchema = external_exports.object({
  sample_rate: external_exports.number(),
  bit_rates: external_exports.array(external_exports.number())
}).transform(toCamelCaseDeep);
var sdCardWatchedStatuses = ["OK", "connected", "disconnected"];
var sdCardInfoSchema = external_exports.object({
  status: external_exports.enum(sdCardWatchedStatuses),
  totalSize: external_exports.number(),
  freeSize: external_exports.number()
});
var ptzOverviewSchema = external_exports.record(external_exports.number(), external_exports.array(external_exports.object({ id: external_exports.number(), name: external_exports.string() })));
var cameraPTZItemDataSchema = external_exports.object({
  pan: external_exports.number().optional(),
  tilt: external_exports.number().optional(),
  zoom: external_exports.number().optional()
});
var cameraPTZItemSchema = external_exports.object({
  name: external_exports.string(),
  id: external_exports.number(),
  data: cameraPTZItemDataSchema
});
var audioDeviceSignalingChannelTypeSchema = external_exports.object({
  id: external_exports.string(),
  gain: external_exports.number(),
  mute: external_exports.boolean()
});
var audioDeviceSignalingTypeSchema = external_exports.object({
  id: external_exports.string(),
  powerType: external_exports.string().optional(),
  channels: external_exports.array(audioDeviceSignalingChannelTypeSchema)
});
var audioDeviceConnectionTypeSchema = external_exports.object({
  id: external_exports.string(),
  signalingTypeSelected: external_exports.string(),
  signalingTypes: external_exports.array(audioDeviceSignalingTypeSchema)
});
var audioDeviceInputOutputSchema = external_exports.object({
  id: external_exports.string(),
  name: external_exports.string(),
  enabled: external_exports.boolean(),
  connectionTypes: external_exports.array(audioDeviceConnectionTypeSchema),
  connectionTypeSelected: external_exports.string()
});
var audioDeviceSchema = external_exports.object({
  id: external_exports.string(),
  name: external_exports.string(),
  inputs: external_exports.array(audioDeviceInputOutputSchema),
  outputs: external_exports.array(audioDeviceInputOutputSchema)
});
var audioDeviceFromRequestSchema = external_exports.object({
  id: external_exports.string(),
  name: external_exports.string(),
  inputs: external_exports.array(audioDeviceInputOutputSchema).optional(),
  outputs: external_exports.array(audioDeviceInputOutputSchema).optional()
});
var audioDeviceRequestSchema = external_exports.object({
  data: external_exports.object({ devices: external_exports.array(audioDeviceFromRequestSchema) })
});
var maxFpsResponseSchema = external_exports.object({
  data: external_exports.array(
    external_exports.object({
      channel: external_exports.number(),
      captureMode: external_exports.array(
        external_exports.object({
          enabled: external_exports.boolean(),
          maxFPS: external_exports.number().optional()
        })
      )
    })
  ).optional()
});
var timeInfoSchema = external_exports.object({
  dateTime: external_exports.string(),
  dstEnabled: external_exports.boolean(),
  localDateTime: external_exports.string(),
  posixTimeZone: external_exports.string(),
  timeZone: external_exports.string().optional()
  // may not be defined in some cases
});
var dateTimeinfoSchema = external_exports.object({
  data: timeInfoSchema
});
var allDateTimeInfoSchema = external_exports.object({
  data: timeInfoSchema.extend({
    maxYearSupported: external_exports.number().optional(),
    // may not be defined in some cases
    timeZones: external_exports.array(external_exports.string())
  })
});
var timeZoneSchema = external_exports.discriminatedUnion("status", [
  external_exports.object({
    status: external_exports.literal("success"),
    data: external_exports.object({
      activeTimeZone: external_exports.string()
    })
  }),
  external_exports.object({
    status: external_exports.literal("error"),
    error: external_exports.object({
      message: external_exports.string()
    })
  })
]);
var audioSampleRatesResponseSchema = external_exports.object({
  data: external_exports.object({
    encoders: external_exports.object({
      aac: external_exports.array(audioSampleRatesSchema),
      AAC: external_exports.array(audioSampleRatesSchema)
    }).partial()
  })
});
var portStatusSchema = external_exports.object({
  port: external_exports.string(),
  state: external_exports.enum(["open", "closed"]),
  configurable: external_exports.boolean(),
  readonly: external_exports.boolean().optional(),
  usage: external_exports.string(),
  direction: external_exports.enum(["input", "output"]),
  name: external_exports.string(),
  normalState: external_exports.enum(["open", "closed"])
});
var getPortsResponseSchema = external_exports.object({
  apiVersion: external_exports.string(),
  context: external_exports.string(),
  method: external_exports.literal("getPorts"),
  data: external_exports.object({
    numberOfPorts: external_exports.number(),
    items: external_exports.array(portStatusSchema).optional()
  })
});
var portSetSchema = external_exports.object({
  port: external_exports.string(),
  state: external_exports.enum(["open", "closed"]),
  usage: external_exports.string().optional(),
  direction: external_exports.enum(["input", "output"]).optional(),
  name: external_exports.string().optional(),
  normalState: external_exports.enum(["open", "closed"]).optional()
});
var portSequenceStateSchema = external_exports.object({
  state: external_exports.enum(["open", "closed"]),
  time: external_exports.number().min(0).max(65535)
});
var recordingConfigItemSchema = external_exports.object({
  diskid: external_exports.string(),
  eventid: external_exports.string(),
  options: external_exports.record(external_exports.string()),
  profile: external_exports.string()
});

// node_modules/fast-xml-parser/src/util.js
var nameStartChar = ":A-Za-z_\\u00C0-\\u00D6\\u00D8-\\u00F6\\u00F8-\\u02FF\\u0370-\\u037D\\u037F-\\u1FFF\\u200C-\\u200D\\u2070-\\u218F\\u2C00-\\u2FEF\\u3001-\\uD7FF\\uF900-\\uFDCF\\uFDF0-\\uFFFD";
var nameChar = nameStartChar + "\\-.\\d\\u00B7\\u0300-\\u036F\\u203F-\\u2040";
var nameRegexp = "[" + nameStartChar + "][" + nameChar + "]*";
var regexName = new RegExp("^" + nameRegexp + "$");
function getAllMatches(string, regex) {
  const matches = [];
  let match = regex.exec(string);
  while (match) {
    const allmatches = [];
    allmatches.startIndex = regex.lastIndex - match[0].length;
    const len = match.length;
    for (let index = 0; index < len; index++) {
      allmatches.push(match[index]);
    }
    matches.push(allmatches);
    match = regex.exec(string);
  }
  return matches;
}
var isName = function(string) {
  const match = regexName.exec(string);
  return !(match === null || typeof match === "undefined");
};
function isExist(v) {
  return typeof v !== "undefined";
}
var DANGEROUS_PROPERTY_NAMES = [
  // '__proto__',
  // 'constructor',
  // 'prototype',
  "hasOwnProperty",
  "toString",
  "valueOf",
  "__defineGetter__",
  "__defineSetter__",
  "__lookupGetter__",
  "__lookupSetter__"
];
var criticalProperties = ["__proto__", "constructor", "prototype"];

// node_modules/fast-xml-parser/src/validator.js
var defaultOptions = {
  allowBooleanAttributes: false,
  //A tag can have attributes without any value
  unpairedTags: []
};
function validate(xmlData, options) {
  options = Object.assign({}, defaultOptions, options);
  const tags = [];
  let tagFound = false;
  let reachedRoot = false;
  if (xmlData[0] === "\uFEFF") {
    xmlData = xmlData.substr(1);
  }
  for (let i = 0; i < xmlData.length; i++) {
    if (xmlData[i] === "<" && xmlData[i + 1] === "?") {
      i += 2;
      i = readPI(xmlData, i);
      if (i.err) return i;
    } else if (xmlData[i] === "<") {
      let tagStartPos = i;
      i++;
      if (xmlData[i] === "!") {
        i = readCommentAndCDATA(xmlData, i);
        continue;
      } else {
        let closingTag = false;
        if (xmlData[i] === "/") {
          closingTag = true;
          i++;
        }
        let tagName = "";
        for (; i < xmlData.length && xmlData[i] !== ">" && xmlData[i] !== " " && xmlData[i] !== "	" && xmlData[i] !== "\n" && xmlData[i] !== "\r"; i++) {
          tagName += xmlData[i];
        }
        tagName = tagName.trim();
        if (tagName[tagName.length - 1] === "/") {
          tagName = tagName.substring(0, tagName.length - 1);
          i--;
        }
        if (!validateTagName(tagName)) {
          let msg;
          if (tagName.trim().length === 0) {
            msg = "Invalid space after '<'.";
          } else {
            msg = "Tag '" + tagName + "' is an invalid name.";
          }
          return getErrorObject("InvalidTag", msg, getLineNumberForPosition(xmlData, i));
        }
        const result = readAttributeStr(xmlData, i);
        if (result === false) {
          return getErrorObject("InvalidAttr", "Attributes for '" + tagName + "' have open quote.", getLineNumberForPosition(xmlData, i));
        }
        let attrStr = result.value;
        i = result.index;
        if (attrStr[attrStr.length - 1] === "/") {
          const attrStrStart = i - attrStr.length;
          attrStr = attrStr.substring(0, attrStr.length - 1);
          const isValid2 = validateAttributeString(attrStr, options);
          if (isValid2 === true) {
            tagFound = true;
          } else {
            return getErrorObject(isValid2.err.code, isValid2.err.msg, getLineNumberForPosition(xmlData, attrStrStart + isValid2.err.line));
          }
        } else if (closingTag) {
          if (!result.tagClosed) {
            return getErrorObject("InvalidTag", "Closing tag '" + tagName + "' doesn't have proper closing.", getLineNumberForPosition(xmlData, i));
          } else if (attrStr.trim().length > 0) {
            return getErrorObject("InvalidTag", "Closing tag '" + tagName + "' can't have attributes or invalid starting.", getLineNumberForPosition(xmlData, tagStartPos));
          } else if (tags.length === 0) {
            return getErrorObject("InvalidTag", "Closing tag '" + tagName + "' has not been opened.", getLineNumberForPosition(xmlData, tagStartPos));
          } else {
            const otg = tags.pop();
            if (tagName !== otg.tagName) {
              let openPos = getLineNumberForPosition(xmlData, otg.tagStartPos);
              return getErrorObject(
                "InvalidTag",
                "Expected closing tag '" + otg.tagName + "' (opened in line " + openPos.line + ", col " + openPos.col + ") instead of closing tag '" + tagName + "'.",
                getLineNumberForPosition(xmlData, tagStartPos)
              );
            }
            if (tags.length == 0) {
              reachedRoot = true;
            }
          }
        } else {
          const isValid2 = validateAttributeString(attrStr, options);
          if (isValid2 !== true) {
            return getErrorObject(isValid2.err.code, isValid2.err.msg, getLineNumberForPosition(xmlData, i - attrStr.length + isValid2.err.line));
          }
          if (reachedRoot === true) {
            return getErrorObject("InvalidXml", "Multiple possible root nodes found.", getLineNumberForPosition(xmlData, i));
          } else if (options.unpairedTags.indexOf(tagName) !== -1) {
          } else {
            tags.push({ tagName, tagStartPos });
          }
          tagFound = true;
        }
        for (i++; i < xmlData.length; i++) {
          if (xmlData[i] === "<") {
            if (xmlData[i + 1] === "!") {
              i++;
              i = readCommentAndCDATA(xmlData, i);
              continue;
            } else if (xmlData[i + 1] === "?") {
              i = readPI(xmlData, ++i);
              if (i.err) return i;
            } else {
              break;
            }
          } else if (xmlData[i] === "&") {
            const afterAmp = validateAmpersand(xmlData, i);
            if (afterAmp == -1)
              return getErrorObject("InvalidChar", "char '&' is not expected.", getLineNumberForPosition(xmlData, i));
            i = afterAmp;
          } else {
            if (reachedRoot === true && !isWhiteSpace(xmlData[i])) {
              return getErrorObject("InvalidXml", "Extra text at the end", getLineNumberForPosition(xmlData, i));
            }
          }
        }
        if (xmlData[i] === "<") {
          i--;
        }
      }
    } else {
      if (isWhiteSpace(xmlData[i])) {
        continue;
      }
      return getErrorObject("InvalidChar", "char '" + xmlData[i] + "' is not expected.", getLineNumberForPosition(xmlData, i));
    }
  }
  if (!tagFound) {
    return getErrorObject("InvalidXml", "Start tag expected.", 1);
  } else if (tags.length == 1) {
    return getErrorObject("InvalidTag", "Unclosed tag '" + tags[0].tagName + "'.", getLineNumberForPosition(xmlData, tags[0].tagStartPos));
  } else if (tags.length > 0) {
    return getErrorObject("InvalidXml", "Invalid '" + JSON.stringify(tags.map((t) => t.tagName), null, 4).replace(/\r?\n/g, "") + "' found.", { line: 1, col: 1 });
  }
  return true;
}
function isWhiteSpace(char) {
  return char === " " || char === "	" || char === "\n" || char === "\r";
}
function readPI(xmlData, i) {
  const start = i;
  for (; i < xmlData.length; i++) {
    if (xmlData[i] == "?" || xmlData[i] == " ") {
      const tagname = xmlData.substr(start, i - start);
      if (i > 5 && tagname === "xml") {
        return getErrorObject("InvalidXml", "XML declaration allowed only at the start of the document.", getLineNumberForPosition(xmlData, i));
      } else if (xmlData[i] == "?" && xmlData[i + 1] == ">") {
        i++;
        break;
      } else {
        continue;
      }
    }
  }
  return i;
}
function readCommentAndCDATA(xmlData, i) {
  if (xmlData.length > i + 5 && xmlData[i + 1] === "-" && xmlData[i + 2] === "-") {
    for (i += 3; i < xmlData.length; i++) {
      if (xmlData[i] === "-" && xmlData[i + 1] === "-" && xmlData[i + 2] === ">") {
        i += 2;
        break;
      }
    }
  } else if (xmlData.length > i + 8 && xmlData[i + 1] === "D" && xmlData[i + 2] === "O" && xmlData[i + 3] === "C" && xmlData[i + 4] === "T" && xmlData[i + 5] === "Y" && xmlData[i + 6] === "P" && xmlData[i + 7] === "E") {
    let angleBracketsCount = 1;
    for (i += 8; i < xmlData.length; i++) {
      if (xmlData[i] === "<") {
        angleBracketsCount++;
      } else if (xmlData[i] === ">") {
        angleBracketsCount--;
        if (angleBracketsCount === 0) {
          break;
        }
      }
    }
  } else if (xmlData.length > i + 9 && xmlData[i + 1] === "[" && xmlData[i + 2] === "C" && xmlData[i + 3] === "D" && xmlData[i + 4] === "A" && xmlData[i + 5] === "T" && xmlData[i + 6] === "A" && xmlData[i + 7] === "[") {
    for (i += 8; i < xmlData.length; i++) {
      if (xmlData[i] === "]" && xmlData[i + 1] === "]" && xmlData[i + 2] === ">") {
        i += 2;
        break;
      }
    }
  }
  return i;
}
var doubleQuote = '"';
var singleQuote = "'";
function readAttributeStr(xmlData, i) {
  let attrStr = "";
  let startChar = "";
  let tagClosed = false;
  for (; i < xmlData.length; i++) {
    if (xmlData[i] === doubleQuote || xmlData[i] === singleQuote) {
      if (startChar === "") {
        startChar = xmlData[i];
      } else if (startChar !== xmlData[i]) {
      } else {
        startChar = "";
      }
    } else if (xmlData[i] === ">") {
      if (startChar === "") {
        tagClosed = true;
        break;
      }
    }
    attrStr += xmlData[i];
  }
  if (startChar !== "") {
    return false;
  }
  return {
    value: attrStr,
    index: i,
    tagClosed
  };
}
var validAttrStrRegxp = new RegExp(`(\\s*)([^\\s=]+)(\\s*=)?(\\s*(['"])(([\\s\\S])*?)\\5)?`, "g");
function validateAttributeString(attrStr, options) {
  const matches = getAllMatches(attrStr, validAttrStrRegxp);
  const attrNames = {};
  for (let i = 0; i < matches.length; i++) {
    if (matches[i][1].length === 0) {
      return getErrorObject("InvalidAttr", "Attribute '" + matches[i][2] + "' has no space in starting.", getPositionFromMatch(matches[i]));
    } else if (matches[i][3] !== void 0 && matches[i][4] === void 0) {
      return getErrorObject("InvalidAttr", "Attribute '" + matches[i][2] + "' is without value.", getPositionFromMatch(matches[i]));
    } else if (matches[i][3] === void 0 && !options.allowBooleanAttributes) {
      return getErrorObject("InvalidAttr", "boolean attribute '" + matches[i][2] + "' is not allowed.", getPositionFromMatch(matches[i]));
    }
    const attrName = matches[i][2];
    if (!validateAttrName(attrName)) {
      return getErrorObject("InvalidAttr", "Attribute '" + attrName + "' is an invalid name.", getPositionFromMatch(matches[i]));
    }
    if (!Object.prototype.hasOwnProperty.call(attrNames, attrName)) {
      attrNames[attrName] = 1;
    } else {
      return getErrorObject("InvalidAttr", "Attribute '" + attrName + "' is repeated.", getPositionFromMatch(matches[i]));
    }
  }
  return true;
}
function validateNumberAmpersand(xmlData, i) {
  let re = /\d/;
  if (xmlData[i] === "x") {
    i++;
    re = /[\da-fA-F]/;
  }
  for (; i < xmlData.length; i++) {
    if (xmlData[i] === ";")
      return i;
    if (!xmlData[i].match(re))
      break;
  }
  return -1;
}
function validateAmpersand(xmlData, i) {
  i++;
  if (xmlData[i] === ";")
    return -1;
  if (xmlData[i] === "#") {
    i++;
    return validateNumberAmpersand(xmlData, i);
  }
  let count = 0;
  for (; i < xmlData.length; i++, count++) {
    if (xmlData[i].match(/\w/) && count < 20)
      continue;
    if (xmlData[i] === ";")
      break;
    return -1;
  }
  return i;
}
function getErrorObject(code, message, lineNumber) {
  return {
    err: {
      code,
      msg: message,
      line: lineNumber.line || lineNumber,
      col: lineNumber.col
    }
  };
}
function validateAttrName(attrName) {
  return isName(attrName);
}
function validateTagName(tagname) {
  return isName(tagname);
}
function getLineNumberForPosition(xmlData, index) {
  const lines = xmlData.substring(0, index).split(/\r?\n/);
  return {
    line: lines.length,
    // column number is last line's length + 1, because column numbering starts at 1:
    col: lines[lines.length - 1].length + 1
  };
}
function getPositionFromMatch(match) {
  return match.startIndex + match[1].length;
}

// node_modules/@nodable/entities/src/entities.js
var BASIC_LATIN = {
  amp: "&",
  AMP: "&",
  lt: "<",
  LT: "<",
  gt: ">",
  GT: ">",
  quot: '"',
  QUOT: '"',
  apos: "'",
  lsquo: "\u2018",
  rsquo: "\u2019",
  ldquo: "\u201C",
  rdquo: "\u201D",
  lsquor: "\u201A",
  rsquor: "\u2019",
  ldquor: "\u201E",
  bdquo: "\u201E",
  comma: ",",
  period: ".",
  colon: ":",
  semi: ";",
  excl: "!",
  quest: "?",
  num: "#",
  dollar: "$",
  percent: "%",
  amp: "&",
  ast: "*",
  commat: "@",
  lowbar: "_",
  verbar: "|",
  vert: "|",
  sol: "/",
  bsol: "\\",
  lbrace: "{",
  rbrace: "}",
  lbrack: "[",
  rbrack: "]",
  lpar: "(",
  rpar: ")",
  nbsp: "\xA0",
  iexcl: "\xA1",
  cent: "\xA2",
  pound: "\xA3",
  curren: "\xA4",
  yen: "\xA5",
  brvbar: "\xA6",
  sect: "\xA7",
  uml: "\xA8",
  copy: "\xA9",
  COPY: "\xA9",
  ordf: "\xAA",
  laquo: "\xAB",
  not: "\xAC",
  shy: "\xAD",
  reg: "\xAE",
  REG: "\xAE",
  macr: "\xAF",
  deg: "\xB0",
  plusmn: "\xB1",
  sup2: "\xB2",
  sup3: "\xB3",
  acute: "\xB4",
  micro: "\xB5",
  para: "\xB6",
  middot: "\xB7",
  cedil: "\xB8",
  sup1: "\xB9",
  ordm: "\xBA",
  raquo: "\xBB",
  frac14: "\xBC",
  frac12: "\xBD",
  half: "\xBD",
  frac34: "\xBE",
  iquest: "\xBF",
  times: "\xD7",
  div: "\xF7",
  divide: "\xF7"
};
var LATIN_ACCENTS = {
  Agrave: "\xC0",
  agrave: "\xE0",
  Aacute: "\xC1",
  aacute: "\xE1",
  Acirc: "\xC2",
  acirc: "\xE2",
  Atilde: "\xC3",
  atilde: "\xE3",
  Auml: "\xC4",
  auml: "\xE4",
  Aring: "\xC5",
  aring: "\xE5",
  AElig: "\xC6",
  aelig: "\xE6",
  Ccedil: "\xC7",
  ccedil: "\xE7",
  Egrave: "\xC8",
  egrave: "\xE8",
  Eacute: "\xC9",
  eacute: "\xE9",
  Ecirc: "\xCA",
  ecirc: "\xEA",
  Euml: "\xCB",
  euml: "\xEB",
  Igrave: "\xCC",
  igrave: "\xEC",
  Iacute: "\xCD",
  iacute: "\xED",
  Icirc: "\xCE",
  icirc: "\xEE",
  Iuml: "\xCF",
  iuml: "\xEF",
  ETH: "\xD0",
  eth: "\xF0",
  Ntilde: "\xD1",
  ntilde: "\xF1",
  Ograve: "\xD2",
  ograve: "\xF2",
  Oacute: "\xD3",
  oacute: "\xF3",
  Ocirc: "\xD4",
  ocirc: "\xF4",
  Otilde: "\xD5",
  otilde: "\xF5",
  Ouml: "\xD6",
  ouml: "\xF6",
  Oslash: "\xD8",
  oslash: "\xF8",
  Ugrave: "\xD9",
  ugrave: "\xF9",
  Uacute: "\xDA",
  uacute: "\xFA",
  Ucirc: "\xDB",
  ucirc: "\xFB",
  Uuml: "\xDC",
  uuml: "\xFC",
  Yacute: "\xDD",
  yacute: "\xFD",
  THORN: "\xDE",
  thorn: "\xFE",
  szlig: "\xDF",
  yuml: "\xFF",
  Yuml: "\u0178"
};
var LATIN_EXTENDED = {
  Amacr: "\u0100",
  amacr: "\u0101",
  Abreve: "\u0102",
  abreve: "\u0103",
  Aogon: "\u0104",
  aogon: "\u0105",
  Cacute: "\u0106",
  cacute: "\u0107",
  Ccirc: "\u0108",
  ccirc: "\u0109",
  Cdot: "\u010A",
  cdot: "\u010B",
  Ccaron: "\u010C",
  ccaron: "\u010D",
  Dcaron: "\u010E",
  dcaron: "\u010F",
  Dstrok: "\u0110",
  dstrok: "\u0111",
  Emacr: "\u0112",
  emacr: "\u0113",
  Ecaron: "\u011A",
  ecaron: "\u011B",
  Edot: "\u0116",
  edot: "\u0117",
  Eogon: "\u0118",
  eogon: "\u0119",
  Gcirc: "\u011C",
  gcirc: "\u011D",
  Gbreve: "\u011E",
  gbreve: "\u011F",
  Gdot: "\u0120",
  gdot: "\u0121",
  Gcedil: "\u0122",
  Hcirc: "\u0124",
  hcirc: "\u0125",
  Hstrok: "\u0126",
  hstrok: "\u0127",
  Itilde: "\u0128",
  itilde: "\u0129",
  Imacr: "\u012A",
  imacr: "\u012B",
  Iogon: "\u012E",
  iogon: "\u012F",
  Idot: "\u0130",
  IJlig: "\u0132",
  ijlig: "\u0133",
  Jcirc: "\u0134",
  jcirc: "\u0135",
  Kcedil: "\u0136",
  kcedil: "\u0137",
  kgreen: "\u0138",
  Lacute: "\u0139",
  lacute: "\u013A",
  Lcedil: "\u013B",
  lcedil: "\u013C",
  Lcaron: "\u013D",
  lcaron: "\u013E",
  Lmidot: "\u013F",
  lmidot: "\u0140",
  Lstrok: "\u0141",
  lstrok: "\u0142",
  Nacute: "\u0143",
  nacute: "\u0144",
  Ncaron: "\u0147",
  ncaron: "\u0148",
  Ncedil: "\u0145",
  ncedil: "\u0146",
  ENG: "\u014A",
  eng: "\u014B",
  Omacr: "\u014C",
  omacr: "\u014D",
  Odblac: "\u0150",
  odblac: "\u0151",
  OElig: "\u0152",
  oelig: "\u0153",
  Racute: "\u0154",
  racute: "\u0155",
  Rcaron: "\u0158",
  rcaron: "\u0159",
  Rcedil: "\u0156",
  rcedil: "\u0157",
  Sacute: "\u015A",
  sacute: "\u015B",
  Scirc: "\u015C",
  scirc: "\u015D",
  Scedil: "\u015E",
  scedil: "\u015F",
  Scaron: "\u0160",
  scaron: "\u0161",
  Tcedil: "\u0162",
  tcedil: "\u0163",
  Tcaron: "\u0164",
  tcaron: "\u0165",
  Tstrok: "\u0166",
  tstrok: "\u0167",
  Utilde: "\u0168",
  utilde: "\u0169",
  Umacr: "\u016A",
  umacr: "\u016B",
  Ubreve: "\u016C",
  ubreve: "\u016D",
  Uring: "\u016E",
  uring: "\u016F",
  Udblac: "\u0170",
  udblac: "\u0171",
  Uogon: "\u0172",
  uogon: "\u0173",
  Wcirc: "\u0174",
  wcirc: "\u0175",
  Ycirc: "\u0176",
  ycirc: "\u0177",
  Zacute: "\u0179",
  zacute: "\u017A",
  Zdot: "\u017B",
  zdot: "\u017C",
  Zcaron: "\u017D",
  zcaron: "\u017E"
};
var GREEK = {
  Alpha: "\u0391",
  alpha: "\u03B1",
  Beta: "\u0392",
  beta: "\u03B2",
  Gamma: "\u0393",
  gamma: "\u03B3",
  Delta: "\u0394",
  delta: "\u03B4",
  Epsilon: "\u0395",
  epsilon: "\u03B5",
  epsiv: "\u03F5",
  varepsilon: "\u03F5",
  Zeta: "\u0396",
  zeta: "\u03B6",
  Eta: "\u0397",
  eta: "\u03B7",
  Theta: "\u0398",
  theta: "\u03B8",
  thetasym: "\u03D1",
  vartheta: "\u03D1",
  Iota: "\u0399",
  iota: "\u03B9",
  Kappa: "\u039A",
  kappa: "\u03BA",
  kappav: "\u03F0",
  varkappa: "\u03F0",
  Lambda: "\u039B",
  lambda: "\u03BB",
  Mu: "\u039C",
  mu: "\u03BC",
  Nu: "\u039D",
  nu: "\u03BD",
  Xi: "\u039E",
  xi: "\u03BE",
  Omicron: "\u039F",
  omicron: "\u03BF",
  Pi: "\u03A0",
  pi: "\u03C0",
  piv: "\u03D6",
  varpi: "\u03D6",
  Rho: "\u03A1",
  rho: "\u03C1",
  rhov: "\u03F1",
  varrho: "\u03F1",
  Sigma: "\u03A3",
  sigma: "\u03C3",
  sigmaf: "\u03C2",
  sigmav: "\u03C2",
  varsigma: "\u03C2",
  Tau: "\u03A4",
  tau: "\u03C4",
  Upsilon: "\u03A5",
  upsilon: "\u03C5",
  upsi: "\u03C5",
  Upsi: "\u03D2",
  upsih: "\u03D2",
  Phi: "\u03A6",
  phi: "\u03C6",
  phiv: "\u03D5",
  varphi: "\u03D5",
  Chi: "\u03A7",
  chi: "\u03C7",
  Psi: "\u03A8",
  psi: "\u03C8",
  Omega: "\u03A9",
  omega: "\u03C9",
  ohm: "\u03A9",
  Gammad: "\u03DC",
  gammad: "\u03DD",
  digamma: "\u03DD"
};
var CYRILLIC = {
  Afr: "\u{1D504}",
  afr: "\u{1D51E}",
  Acy: "\u0410",
  acy: "\u0430",
  Bcy: "\u0411",
  bcy: "\u0431",
  Vcy: "\u0412",
  vcy: "\u0432",
  Gcy: "\u0413",
  gcy: "\u0433",
  Dcy: "\u0414",
  dcy: "\u0434",
  IEcy: "\u0415",
  iecy: "\u0435",
  IOcy: "\u0401",
  iocy: "\u0451",
  ZHcy: "\u0416",
  zhcy: "\u0436",
  Zcy: "\u0417",
  zcy: "\u0437",
  Icy: "\u0418",
  icy: "\u0438",
  Jcy: "\u0419",
  jcy: "\u0439",
  Kcy: "\u041A",
  kcy: "\u043A",
  Lcy: "\u041B",
  lcy: "\u043B",
  Mcy: "\u041C",
  mcy: "\u043C",
  Ncy: "\u041D",
  ncy: "\u043D",
  Ocy: "\u041E",
  ocy: "\u043E",
  Pcy: "\u041F",
  pcy: "\u043F",
  Rcy: "\u0420",
  rcy: "\u0440",
  Scy: "\u0421",
  scy: "\u0441",
  Tcy: "\u0422",
  tcy: "\u0442",
  Ucy: "\u0423",
  ucy: "\u0443",
  Fcy: "\u0424",
  fcy: "\u0444",
  KHcy: "\u0425",
  khcy: "\u0445",
  TScy: "\u0426",
  tscy: "\u0446",
  CHcy: "\u0427",
  chcy: "\u0447",
  SHcy: "\u0428",
  shcy: "\u0448",
  SHCHcy: "\u0429",
  shchcy: "\u0449",
  HARDcy: "\u042A",
  hardcy: "\u044A",
  Ycy: "\u042B",
  ycy: "\u044B",
  SOFTcy: "\u042C",
  softcy: "\u044C",
  Ecy: "\u042D",
  ecy: "\u044D",
  YUcy: "\u042E",
  yucy: "\u044E",
  YAcy: "\u042F",
  yacy: "\u044F",
  DJcy: "\u0402",
  djcy: "\u0452",
  GJcy: "\u0403",
  gjcy: "\u0453",
  Jukcy: "\u0404",
  jukcy: "\u0454",
  DScy: "\u0405",
  dscy: "\u0455",
  Iukcy: "\u0406",
  iukcy: "\u0456",
  YIcy: "\u0407",
  yicy: "\u0457",
  Jsercy: "\u0408",
  jsercy: "\u0458",
  LJcy: "\u0409",
  ljcy: "\u0459",
  NJcy: "\u040A",
  njcy: "\u045A",
  TSHcy: "\u040B",
  tshcy: "\u045B",
  KJcy: "\u040C",
  kjcy: "\u045C",
  Ubrcy: "\u040E",
  ubrcy: "\u045E",
  DZcy: "\u040F",
  dzcy: "\u045F"
};
var MATH = {
  plus: "+",
  minus: "\u2212",
  mnplus: "\u2213",
  mp: "\u2213",
  pm: "\xB1",
  times: "\xD7",
  div: "\xF7",
  divide: "\xF7",
  sdot: "\u22C5",
  star: "\u2606",
  starf: "\u2605",
  bigstar: "\u2605",
  lowast: "\u2217",
  ast: "*",
  midast: "*",
  compfn: "\u2218",
  smallcircle: "\u2218",
  bullet: "\u2022",
  bull: "\u2022",
  nbsp: "\xA0",
  hellip: "\u2026",
  mldr: "\u2026",
  prime: "\u2032",
  Prime: "\u2033",
  tprime: "\u2034",
  bprime: "\u2035",
  backprime: "\u2035",
  minus: "\u2212",
  minusd: "\u2238",
  dotminus: "\u2238",
  plusdo: "\u2214",
  dotplus: "\u2214",
  plusmn: "\xB1",
  minusplus: "\u2213",
  mnplus: "\u2213",
  mp: "\u2213",
  setminus: "\u2216",
  smallsetminus: "\u2216",
  Backslash: "\u2216",
  setmn: "\u2216",
  ssetmn: "\u2216",
  lowbar: "_",
  verbar: "|",
  vert: "|",
  VerticalLine: "|",
  colon: ":",
  Colon: "\u2237",
  Proportion: "\u2237",
  ratio: "\u2236",
  equals: "=",
  ne: "\u2260",
  nequiv: "\u2262",
  equiv: "\u2261",
  Congruent: "\u2261",
  sim: "\u223C",
  thicksim: "\u223C",
  thksim: "\u223C",
  sime: "\u2243",
  simeq: "\u2243",
  TildeEqual: "\u2243",
  asymp: "\u2248",
  approx: "\u2248",
  thickapprox: "\u2248",
  thkap: "\u2248",
  TildeTilde: "\u2248",
  ncong: "\u2247",
  cong: "\u2245",
  TildeFullEqual: "\u2245",
  asympeq: "\u224D",
  CupCap: "\u224D",
  bump: "\u224E",
  Bumpeq: "\u224E",
  HumpDownHump: "\u224E",
  bumpe: "\u224F",
  bumpeq: "\u224F",
  HumpEqual: "\u224F",
  dotminus: "\u2238",
  minusd: "\u2238",
  plusdo: "\u2214",
  dotplus: "\u2214",
  le: "\u2264",
  LessEqual: "\u2264",
  ge: "\u2265",
  GreaterEqual: "\u2265",
  lesseqgtr: "\u22DA",
  lesseqqgtr: "\u2A8B",
  greater: ">",
  less: "<"
};
var MATH_ADVANCED = {
  alefsym: "\u2135",
  aleph: "\u2135",
  beth: "\u2136",
  gimel: "\u2137",
  daleth: "\u2138",
  forall: "\u2200",
  ForAll: "\u2200",
  part: "\u2202",
  PartialD: "\u2202",
  exist: "\u2203",
  Exists: "\u2203",
  nexist: "\u2204",
  nexists: "\u2204",
  empty: "\u2205",
  emptyset: "\u2205",
  emptyv: "\u2205",
  varnothing: "\u2205",
  nabla: "\u2207",
  Del: "\u2207",
  isin: "\u2208",
  isinv: "\u2208",
  in: "\u2208",
  Element: "\u2208",
  notin: "\u2209",
  notinva: "\u2209",
  ni: "\u220B",
  niv: "\u220B",
  SuchThat: "\u220B",
  ReverseElement: "\u220B",
  notni: "\u220C",
  notniva: "\u220C",
  prod: "\u220F",
  Product: "\u220F",
  coprod: "\u2210",
  Coproduct: "\u2210",
  sum: "\u2211",
  Sum: "\u2211",
  minus: "\u2212",
  mp: "\u2213",
  plusdo: "\u2214",
  dotplus: "\u2214",
  setminus: "\u2216",
  lowast: "\u2217",
  radic: "\u221A",
  Sqrt: "\u221A",
  prop: "\u221D",
  propto: "\u221D",
  Proportional: "\u221D",
  varpropto: "\u221D",
  infin: "\u221E",
  infintie: "\u29DD",
  ang: "\u2220",
  angle: "\u2220",
  angmsd: "\u2221",
  measuredangle: "\u2221",
  angsph: "\u2222",
  mid: "\u2223",
  VerticalBar: "\u2223",
  nmid: "\u2224",
  nsmid: "\u2224",
  npar: "\u2226",
  parallel: "\u2225",
  spar: "\u2225",
  nparallel: "\u2226",
  nspar: "\u2226",
  and: "\u2227",
  wedge: "\u2227",
  or: "\u2228",
  vee: "\u2228",
  cap: "\u2229",
  cup: "\u222A",
  int: "\u222B",
  Integral: "\u222B",
  conint: "\u222E",
  ContourIntegral: "\u222E",
  Conint: "\u222F",
  DoubleContourIntegral: "\u222F",
  Cconint: "\u2230",
  there4: "\u2234",
  therefore: "\u2234",
  Therefore: "\u2234",
  becaus: "\u2235",
  because: "\u2235",
  Because: "\u2235",
  ratio: "\u2236",
  Proportion: "\u2237",
  minusd: "\u2238",
  dotminus: "\u2238",
  mDDot: "\u223A",
  homtht: "\u223B",
  sim: "\u223C",
  bsimg: "\u223D",
  backsim: "\u223D",
  ac: "\u223E",
  mstpos: "\u223E",
  acd: "\u223F",
  VerticalTilde: "\u2240",
  wr: "\u2240",
  wreath: "\u2240",
  nsime: "\u2244",
  nsimeq: "\u2244",
  nsimeq: "\u2244",
  ncong: "\u2247",
  simne: "\u2246",
  ncongdot: "\u2A6D\u0338",
  ngsim: "\u2275",
  nsim: "\u2241",
  napprox: "\u2249",
  nap: "\u2249",
  ngeq: "\u2271",
  nge: "\u2271",
  nleq: "\u2270",
  nle: "\u2270",
  ngtr: "\u226F",
  ngt: "\u226F",
  nless: "\u226E",
  nlt: "\u226E",
  nprec: "\u2280",
  npr: "\u2280",
  nsucc: "\u2281",
  nsc: "\u2281"
};
var ARROWS = {
  larr: "\u2190",
  leftarrow: "\u2190",
  LeftArrow: "\u2190",
  uarr: "\u2191",
  uparrow: "\u2191",
  UpArrow: "\u2191",
  rarr: "\u2192",
  rightarrow: "\u2192",
  RightArrow: "\u2192",
  darr: "\u2193",
  downarrow: "\u2193",
  DownArrow: "\u2193",
  harr: "\u2194",
  leftrightarrow: "\u2194",
  LeftRightArrow: "\u2194",
  varr: "\u2195",
  updownarrow: "\u2195",
  UpDownArrow: "\u2195",
  nwarr: "\u2196",
  nwarrow: "\u2196",
  UpperLeftArrow: "\u2196",
  nearr: "\u2197",
  nearrow: "\u2197",
  UpperRightArrow: "\u2197",
  searr: "\u2198",
  searrow: "\u2198",
  LowerRightArrow: "\u2198",
  swarr: "\u2199",
  swarrow: "\u2199",
  LowerLeftArrow: "\u2199",
  lArr: "\u21D0",
  Leftarrow: "\u21D0",
  uArr: "\u21D1",
  Uparrow: "\u21D1",
  rArr: "\u21D2",
  Rightarrow: "\u21D2",
  dArr: "\u21D3",
  Downarrow: "\u21D3",
  hArr: "\u21D4",
  Leftrightarrow: "\u21D4",
  iff: "\u21D4",
  vArr: "\u21D5",
  Updownarrow: "\u21D5",
  lAarr: "\u21DA",
  Lleftarrow: "\u21DA",
  rAarr: "\u21DB",
  Rrightarrow: "\u21DB",
  lrarr: "\u21C6",
  leftrightarrows: "\u21C6",
  rlarr: "\u21C4",
  rightleftarrows: "\u21C4",
  lrhar: "\u21CB",
  leftrightharpoons: "\u21CB",
  ReverseEquilibrium: "\u21CB",
  rlhar: "\u21CC",
  rightleftharpoons: "\u21CC",
  Equilibrium: "\u21CC",
  udarr: "\u21C5",
  UpArrowDownArrow: "\u21C5",
  duarr: "\u21F5",
  DownArrowUpArrow: "\u21F5",
  llarr: "\u21C7",
  leftleftarrows: "\u21C7",
  rrarr: "\u21C9",
  rightrightarrows: "\u21C9",
  ddarr: "\u21CA",
  downdownarrows: "\u21CA",
  har: "\u21BD",
  lhard: "\u21BD",
  leftharpoondown: "\u21BD",
  lharu: "\u21BC",
  leftharpoonup: "\u21BC",
  rhard: "\u21C1",
  rightharpoondown: "\u21C1",
  rharu: "\u21C0",
  rightharpoonup: "\u21C0",
  lsh: "\u21B0",
  Lsh: "\u21B0",
  rsh: "\u21B1",
  Rsh: "\u21B1",
  ldsh: "\u21B2",
  rdsh: "\u21B3",
  hookleftarrow: "\u21A9",
  hookrightarrow: "\u21AA",
  mapstoleft: "\u21A4",
  mapstoup: "\u21A5",
  map: "\u21A6",
  mapsto: "\u21A6",
  mapstodown: "\u21A7",
  crarr: "\u21B5",
  nwarrow: "\u2196",
  nearrow: "\u2197",
  searrow: "\u2198",
  swarrow: "\u2199",
  nleftarrow: "\u219A",
  nleftrightarrow: "\u21AE",
  nrightarrow: "\u219B",
  nrarr: "\u219B",
  larrtl: "\u21A2",
  rarrtl: "\u21A3",
  leftarrowtail: "\u21A2",
  rightarrowtail: "\u21A3",
  twoheadleftarrow: "\u219E",
  twoheadrightarrow: "\u21A0",
  Larr: "\u219E",
  Rarr: "\u21A0",
  larrhk: "\u21A9",
  rarrhk: "\u21AA",
  larrlp: "\u21AB",
  looparrowleft: "\u21AB",
  rarrlp: "\u21AC",
  looparrowright: "\u21AC",
  harrw: "\u21AD",
  leftrightsquigarrow: "\u21AD",
  nrarrw: "\u219D\u0338",
  rarrw: "\u219D",
  rightsquigarrow: "\u219D",
  larrbfs: "\u291F",
  rarrbfs: "\u2920",
  nvHarr: "\u2904",
  nvlArr: "\u2902",
  nvrArr: "\u2903",
  larrfs: "\u291D",
  rarrfs: "\u291E",
  Map: "\u2905",
  larrsim: "\u2973",
  rarrsim: "\u2974",
  harrcir: "\u2948",
  Uarrocir: "\u2949",
  lurdshar: "\u294A",
  ldrdhar: "\u2967",
  ldrushar: "\u294B",
  rdldhar: "\u2969",
  lrhard: "\u296D",
  rlhar: "\u21CC",
  uharr: "\u21BE",
  uharl: "\u21BF",
  dharr: "\u21C2",
  dharl: "\u21C3",
  Uarr: "\u219F",
  Darr: "\u21A1",
  zigrarr: "\u21DD",
  nwArr: "\u21D6",
  neArr: "\u21D7",
  seArr: "\u21D8",
  swArr: "\u21D9",
  nharr: "\u21AE",
  nhArr: "\u21CE",
  nlarr: "\u219A",
  nlArr: "\u21CD",
  nrarr: "\u219B",
  nrArr: "\u21CF",
  larrb: "\u21E4",
  LeftArrowBar: "\u21E4",
  rarrb: "\u21E5",
  RightArrowBar: "\u21E5"
};
var SHAPES = {
  square: "\u25A1",
  Square: "\u25A1",
  squ: "\u25A1",
  squf: "\u25AA",
  squarf: "\u25AA",
  blacksquar: "\u25AA",
  blacksquare: "\u25AA",
  FilledVerySmallSquare: "\u25AA",
  blk34: "\u2593",
  blk12: "\u2592",
  blk14: "\u2591",
  block: "\u2588",
  srect: "\u25AD",
  rect: "\u25AD",
  sdot: "\u22C5",
  sdotb: "\u22A1",
  dotsquare: "\u22A1",
  triangle: "\u25B5",
  tri: "\u25B5",
  trine: "\u25B5",
  utri: "\u25B5",
  triangledown: "\u25BF",
  dtri: "\u25BF",
  tridown: "\u25BF",
  triangleleft: "\u25C3",
  ltri: "\u25C3",
  triangleright: "\u25B9",
  rtri: "\u25B9",
  blacktriangle: "\u25B4",
  utrif: "\u25B4",
  blacktriangledown: "\u25BE",
  dtrif: "\u25BE",
  blacktriangleleft: "\u25C2",
  ltrif: "\u25C2",
  blacktriangleright: "\u25B8",
  rtrif: "\u25B8",
  loz: "\u25CA",
  lozenge: "\u25CA",
  blacklozenge: "\u29EB",
  lozf: "\u29EB",
  bigcirc: "\u25EF",
  xcirc: "\u25EF",
  circ: "\u02C6",
  Circle: "\u25CB",
  cir: "\u25CB",
  o: "\u25CB",
  bullet: "\u2022",
  bull: "\u2022",
  hellip: "\u2026",
  mldr: "\u2026",
  nldr: "\u2025",
  boxh: "\u2500",
  HorizontalLine: "\u2500",
  boxv: "\u2502",
  boxdr: "\u250C",
  boxdl: "\u2510",
  boxur: "\u2514",
  boxul: "\u2518",
  boxvr: "\u251C",
  boxvl: "\u2524",
  boxhd: "\u252C",
  boxhu: "\u2534",
  boxvh: "\u253C",
  boxH: "\u2550",
  boxV: "\u2551",
  boxdR: "\u2552",
  boxDr: "\u2553",
  boxDR: "\u2554",
  boxDl: "\u2555",
  boxdL: "\u2556",
  boxDL: "\u2557",
  boxuR: "\u2558",
  boxUr: "\u2559",
  boxUR: "\u255A",
  boxUl: "\u255C",
  boxuL: "\u255B",
  boxUL: "\u255D",
  boxvR: "\u255E",
  boxVr: "\u255F",
  boxVR: "\u2560",
  boxVl: "\u2562",
  boxvL: "\u2561",
  boxVL: "\u2563",
  boxHd: "\u2564",
  boxhD: "\u2565",
  boxHD: "\u2566",
  boxHu: "\u2567",
  boxhU: "\u2568",
  boxHU: "\u2569",
  boxvH: "\u256A",
  boxVh: "\u256B",
  boxVH: "\u256C"
};
var PUNCTUATION = {
  excl: "!",
  iexcl: "\xA1",
  brvbar: "\xA6",
  sect: "\xA7",
  uml: "\xA8",
  copy: "\xA9",
  ordf: "\xAA",
  laquo: "\xAB",
  not: "\xAC",
  shy: "\xAD",
  reg: "\xAE",
  macr: "\xAF",
  deg: "\xB0",
  plusmn: "\xB1",
  sup2: "\xB2",
  sup3: "\xB3",
  acute: "\xB4",
  micro: "\xB5",
  para: "\xB6",
  middot: "\xB7",
  cedil: "\xB8",
  sup1: "\xB9",
  ordm: "\xBA",
  raquo: "\xBB",
  frac14: "\xBC",
  frac12: "\xBD",
  frac34: "\xBE",
  iquest: "\xBF",
  nbsp: "\xA0",
  comma: ",",
  period: ".",
  colon: ":",
  semi: ";",
  vert: "|",
  Verbar: "\u2016",
  verbar: "|",
  dblac: "\u02DD",
  circ: "\u02C6",
  caron: "\u02C7",
  breve: "\u02D8",
  dot: "\u02D9",
  ring: "\u02DA",
  ogon: "\u02DB",
  tilde: "\u02DC",
  DiacriticalGrave: "`",
  DiacriticalAcute: "\xB4",
  DiacriticalTilde: "\u02DC",
  DiacriticalDot: "\u02D9",
  DiacriticalDoubleAcute: "\u02DD",
  grave: "`",
  acute: "\xB4"
};
var CURRENCY = {
  cent: "\xA2",
  pound: "\xA3",
  curren: "\xA4",
  yen: "\xA5",
  euro: "\u20AC",
  dollar: "$",
  euro: "\u20AC",
  fnof: "\u0192",
  inr: "\u20B9",
  af: "\u060B",
  birr: "\u1265\u122D",
  peso: "\u20B1",
  rub: "\u20BD",
  won: "\u20A9",
  yuan: "\xA5",
  cedil: "\xB8"
};
var FRACTIONS = {
  frac12: "\xBD",
  half: "\xBD",
  frac13: "\u2153",
  frac14: "\xBC",
  frac15: "\u2155",
  frac16: "\u2159",
  frac18: "\u215B",
  frac23: "\u2154",
  frac25: "\u2156",
  frac34: "\xBE",
  frac35: "\u2157",
  frac38: "\u215C",
  frac45: "\u2158",
  frac56: "\u215A",
  frac58: "\u215D",
  frac78: "\u215E",
  frasl: "\u2044"
};
var MISC_SYMBOLS = {
  trade: "\u2122",
  TRADE: "\u2122",
  telrec: "\u2315",
  target: "\u2316",
  ulcorn: "\u231C",
  ulcorner: "\u231C",
  urcorn: "\u231D",
  urcorner: "\u231D",
  dlcorn: "\u231E",
  llcorner: "\u231E",
  drcorn: "\u231F",
  lrcorner: "\u231F",
  intercal: "\u22BA",
  intcal: "\u22BA",
  oplus: "\u2295",
  CirclePlus: "\u2295",
  ominus: "\u2296",
  CircleMinus: "\u2296",
  otimes: "\u2297",
  CircleTimes: "\u2297",
  osol: "\u2298",
  odot: "\u2299",
  CircleDot: "\u2299",
  oast: "\u229B",
  circledast: "\u229B",
  odash: "\u229D",
  circleddash: "\u229D",
  ocirc: "\u229A",
  circledcirc: "\u229A",
  boxplus: "\u229E",
  plusb: "\u229E",
  boxminus: "\u229F",
  minusb: "\u229F",
  boxtimes: "\u22A0",
  timesb: "\u22A0",
  boxdot: "\u22A1",
  sdotb: "\u22A1",
  veebar: "\u22BB",
  vee: "\u2228",
  barvee: "\u22BD",
  and: "\u2227",
  wedge: "\u2227",
  Cap: "\u22D2",
  Cup: "\u22D3",
  Fork: "\u22D4",
  pitchfork: "\u22D4",
  epar: "\u22D5",
  ltlarr: "\u2976",
  nvap: "\u224D\u20D2",
  nvsim: "\u223C\u20D2",
  nvge: "\u2265\u20D2",
  nvle: "\u2264\u20D2",
  nvlt: "<\u20D2",
  nvgt: ">\u20D2",
  nvltrie: "\u22B4\u20D2",
  nvrtrie: "\u22B5\u20D2",
  Vdash: "\u22A9",
  dashv: "\u22A3",
  vDash: "\u22A8",
  Vdash: "\u22A9",
  Vvdash: "\u22AA",
  nvdash: "\u22AC",
  nvDash: "\u22AD",
  nVdash: "\u22AE",
  nVDash: "\u22AF"
};
var ALL_ENTITIES = {
  ...BASIC_LATIN,
  ...LATIN_ACCENTS,
  ...LATIN_EXTENDED,
  ...GREEK,
  ...CYRILLIC,
  ...MATH,
  ...MATH_ADVANCED,
  ...ARROWS,
  ...SHAPES,
  ...PUNCTUATION,
  ...CURRENCY,
  ...FRACTIONS,
  ...MISC_SYMBOLS
};
var XML = {
  amp: "&",
  apos: "'",
  gt: ">",
  lt: "<",
  quot: '"'
};
var COMMON_HTML = {
  nbsp: "\xA0",
  copy: "\xA9",
  reg: "\xAE",
  trade: "\u2122",
  mdash: "\u2014",
  ndash: "\u2013",
  hellip: "\u2026",
  laquo: "\xAB",
  raquo: "\xBB",
  lsquo: "\u2018",
  rsquo: "\u2019",
  ldquo: "\u201C",
  rdquo: "\u201D",
  bull: "\u2022",
  para: "\xB6",
  sect: "\xA7",
  deg: "\xB0",
  frac12: "\xBD",
  frac14: "\xBC",
  frac34: "\xBE"
};

// node_modules/@nodable/entities/src/EntityDecoder.js
var SPECIAL_CHARS = new Set("!?\\\\/[]$%{}^&*()<>|+");
function validateEntityName(name) {
  if (name[0] === "#") {
    throw new Error(`[EntityReplacer] Invalid character '#' in entity name: "${name}"`);
  }
  for (const ch of name) {
    if (SPECIAL_CHARS.has(ch)) {
      throw new Error(`[EntityReplacer] Invalid character '${ch}' in entity name: "${name}"`);
    }
  }
  return name;
}
function mergeEntityMaps(...maps) {
  const out = /* @__PURE__ */ Object.create(null);
  for (const map of maps) {
    if (!map) continue;
    for (const key of Object.keys(map)) {
      const raw = map[key];
      if (typeof raw === "string") {
        out[key] = raw;
      } else if (raw && typeof raw === "object" && raw.val !== void 0) {
        const val = raw.val;
        if (typeof val === "string") {
          out[key] = val;
        }
      }
    }
  }
  return out;
}
var LIMIT_TIER_EXTERNAL = "external";
var LIMIT_TIER_BASE = "base";
var LIMIT_TIER_ALL = "all";
function parseLimitTiers(raw) {
  if (!raw || raw === LIMIT_TIER_EXTERNAL) return /* @__PURE__ */ new Set([LIMIT_TIER_EXTERNAL]);
  if (raw === LIMIT_TIER_ALL) return /* @__PURE__ */ new Set([LIMIT_TIER_ALL]);
  if (raw === LIMIT_TIER_BASE) return /* @__PURE__ */ new Set([LIMIT_TIER_BASE]);
  if (Array.isArray(raw)) return new Set(raw);
  return /* @__PURE__ */ new Set([LIMIT_TIER_EXTERNAL]);
}
var NCR_LEVEL = Object.freeze({ allow: 0, leave: 1, remove: 2, throw: 3 });
var XML10_ALLOWED_C0 = /* @__PURE__ */ new Set([9, 10, 13]);
function parseNCRConfig(ncr) {
  if (!ncr) {
    return { xmlVersion: 1, onLevel: NCR_LEVEL.allow, nullLevel: NCR_LEVEL.remove };
  }
  const xmlVersion = ncr.xmlVersion === 1.1 ? 1.1 : 1;
  const onLevel = NCR_LEVEL[ncr.onNCR] ?? NCR_LEVEL.allow;
  const nullLevel = NCR_LEVEL[ncr.nullNCR] ?? NCR_LEVEL.remove;
  const clampedNull = Math.max(nullLevel, NCR_LEVEL.remove);
  return { xmlVersion, onLevel, nullLevel: clampedNull };
}
var EntityDecoder = class {
  /**
   * @param {object} [options]
   * @param {object|null}  [options.namedEntities]        — extra named entities merged into base map
   * @param {object}  [options.limit]                 — security limits
   * @param {number}       [options.limit.maxTotalExpansions=0]  — 0 = unlimited
   * @param {number}       [options.limit.maxExpandedLength=0]   — 0 = unlimited
   * @param {'external'|'base'|'all'|string[]} [options.limit.applyLimitsTo='external']
   *   Which entity tiers count against the security limits:
   *   - 'external' (default) — only input/runtime + persistent external entities
   *   - 'base'               — only DEFAULT_XML_ENTITIES + namedEntities
   *   - 'all'                — every entity regardless of tier
   *   - string[]             — explicit combination, e.g. ['external', 'base']
   * @param {((resolved: string, original: string) => string)|null} [options.postCheck=null]
   * @param {string[]} [options.remove=[]] — entity names (e.g. ['nbsp', '#13']) to delete (replace with empty string)
   * @param {string[]} [options.leave=[]]  — entity names to keep as literal (unchanged in output)
   * @param {object}   [options.ncr]       — Numeric Character Reference controls
   * @param {1.0|1.1}  [options.ncr.xmlVersion=1.0]
   *   XML version governing which codepoint ranges are restricted:
   *   - 1.0 — C0 controls U+0001–U+001F (except U+0009/000A/000D) are prohibited
   *   - 1.1 — C0 controls are allowed when written as NCRs; C1 (U+007F–U+009F) decoded as-is
   * @param {'allow'|'leave'|'remove'|'throw'} [options.ncr.onNCR='allow']
   *   Base action for numeric references. Severity order: allow < leave < remove < throw.
   *   For codepoint ranges that carry a minimum level (surrogates → remove, XML 1.0 C0 → remove),
   *   the effective action is max(onNCR, rangeMinimum).
   * @param {'remove'|'throw'} [options.ncr.nullNCR='remove']
   *   Action for U+0000 (null). 'allow' and 'leave' are clamped to 'remove' since null is never safe.
   */
  constructor(options = {}) {
    this._limit = options.limit || {};
    this._maxTotalExpansions = this._limit.maxTotalExpansions || 0;
    this._maxExpandedLength = this._limit.maxExpandedLength || 0;
    this._postCheck = typeof options.postCheck === "function" ? options.postCheck : (r) => r;
    this._limitTiers = parseLimitTiers(this._limit.applyLimitsTo ?? LIMIT_TIER_EXTERNAL);
    this._numericAllowed = options.numericAllowed ?? true;
    this._baseMap = mergeEntityMaps(XML, options.namedEntities || null);
    this._externalMap = /* @__PURE__ */ Object.create(null);
    this._inputMap = /* @__PURE__ */ Object.create(null);
    this._totalExpansions = 0;
    this._expandedLength = 0;
    this._removeSet = new Set(options.remove && Array.isArray(options.remove) ? options.remove : []);
    this._leaveSet = new Set(options.leave && Array.isArray(options.leave) ? options.leave : []);
    const ncrCfg = parseNCRConfig(options.ncr);
    this._ncrXmlVersion = ncrCfg.xmlVersion;
    this._ncrOnLevel = ncrCfg.onLevel;
    this._ncrNullLevel = ncrCfg.nullLevel;
  }
  // -------------------------------------------------------------------------
  // Persistent external entity registration
  // -------------------------------------------------------------------------
  /**
   * Replace the full set of persistent external entities.
   * All keys are validated — throws on invalid characters.
   * @param {Record<string, string | { regex?: RegExp, val: string }>} map
   */
  setExternalEntities(map) {
    if (map) {
      for (const key of Object.keys(map)) {
        validateEntityName(key);
      }
    }
    this._externalMap = mergeEntityMaps(map);
  }
  /**
   * Add a single persistent external entity.
   * @param {string} key
   * @param {string} value
   */
  addExternalEntity(key, value) {
    validateEntityName(key);
    if (typeof value === "string" && value.indexOf("&") === -1) {
      this._externalMap[key] = value;
    }
  }
  // -------------------------------------------------------------------------
  // Input / runtime entity registration (per document)
  // -------------------------------------------------------------------------
  /**
   * Inject DOCTYPE entities for the current document.
   * Also resets per-document expansion counters.
   * @param {Record<string, string | { regx?: RegExp, regex?: RegExp, val: string }>} map
   */
  addInputEntities(map) {
    this._totalExpansions = 0;
    this._expandedLength = 0;
    this._inputMap = mergeEntityMaps(map);
  }
  // -------------------------------------------------------------------------
  // Per-document reset
  // -------------------------------------------------------------------------
  /**
   * Wipe input/runtime entities and reset counters.
   * Call this before processing each new document.
   * @returns {this}
   */
  reset() {
    this._inputMap = /* @__PURE__ */ Object.create(null);
    this._totalExpansions = 0;
    this._expandedLength = 0;
    return this;
  }
  // -------------------------------------------------------------------------
  // XML version (can be set after construction, e.g. once parser reads <?xml?>)
  // -------------------------------------------------------------------------
  /**
   * Update the XML version used for NCR classification.
   * Call this as soon as the document's `<?xml version="...">` declaration is parsed.
   * @param {1.0|1.1|number} version
   */
  setXmlVersion(version) {
    this._ncrXmlVersion = version === 1.1 ? 1.1 : 1;
  }
  // -------------------------------------------------------------------------
  // Primary API
  // -------------------------------------------------------------------------
  /**
   * Replace all entity references in `str` in a single pass.
   *
   * @param {string} str
   * @returns {string}
   */
  decode(str) {
    if (typeof str !== "string" || str.length === 0) return str;
    const original = str;
    const chunks = [];
    const len = str.length;
    let last = 0;
    let i = 0;
    const limitExpansions = this._maxTotalExpansions > 0;
    const limitLength = this._maxExpandedLength > 0;
    const checkLimits = limitExpansions || limitLength;
    while (i < len) {
      if (str.charCodeAt(i) !== 38) {
        i++;
        continue;
      }
      let j = i + 1;
      while (j < len && str.charCodeAt(j) !== 59 && j - i <= 32) j++;
      if (j >= len || str.charCodeAt(j) !== 59) {
        i++;
        continue;
      }
      const token = str.slice(i + 1, j);
      if (token.length === 0) {
        i++;
        continue;
      }
      let replacement;
      let tier;
      if (this._removeSet.has(token)) {
        replacement = "";
        if (tier === void 0) {
          tier = LIMIT_TIER_EXTERNAL;
        }
      } else if (this._leaveSet.has(token)) {
        i++;
        continue;
      } else if (token.charCodeAt(0) === 35) {
        const ncrResult = this._resolveNCR(token);
        if (ncrResult === void 0) {
          i++;
          continue;
        }
        replacement = ncrResult;
        tier = LIMIT_TIER_BASE;
      } else {
        const resolved = this._resolveName(token);
        replacement = resolved?.value;
        tier = resolved?.tier;
      }
      if (replacement === void 0) {
        i++;
        continue;
      }
      if (i > last) chunks.push(str.slice(last, i));
      chunks.push(replacement);
      last = j + 1;
      i = last;
      if (checkLimits && this._tierCounts(tier)) {
        if (limitExpansions) {
          this._totalExpansions++;
          if (this._totalExpansions > this._maxTotalExpansions) {
            throw new Error(
              `[EntityReplacer] Entity expansion count limit exceeded: ${this._totalExpansions} > ${this._maxTotalExpansions}`
            );
          }
        }
        if (limitLength) {
          const delta = replacement.length - (token.length + 2);
          if (delta > 0) {
            this._expandedLength += delta;
            if (this._expandedLength > this._maxExpandedLength) {
              throw new Error(
                `[EntityReplacer] Expanded content length limit exceeded: ${this._expandedLength} > ${this._maxExpandedLength}`
              );
            }
          }
        }
      }
    }
    if (last < len) chunks.push(str.slice(last));
    const result = chunks.length === 0 ? str : chunks.join("");
    return this._postCheck(result, original);
  }
  // -------------------------------------------------------------------------
  // Private: limit tier check
  // -------------------------------------------------------------------------
  /**
   * Returns true if a resolved entity of the given tier should count
   * against the expansion/length limits.
   * @param {string} tier  — LIMIT_TIER_EXTERNAL | LIMIT_TIER_BASE
   * @returns {boolean}
   */
  _tierCounts(tier) {
    if (this._limitTiers.has(LIMIT_TIER_ALL)) return true;
    return this._limitTiers.has(tier);
  }
  // -------------------------------------------------------------------------
  // Private: entity resolution
  // -------------------------------------------------------------------------
  /**
   * Resolve a named entity token (without & and ;).
   * Priority: inputMap > externalMap > baseMap
   * Returns the resolved value tagged with its limit tier.
   *
   * @param {string} name
   * @returns {{ value: string, tier: string }|undefined}
   */
  _resolveName(name) {
    if (name in this._inputMap) return { value: this._inputMap[name], tier: LIMIT_TIER_EXTERNAL };
    if (name in this._externalMap) return { value: this._externalMap[name], tier: LIMIT_TIER_EXTERNAL };
    if (name in this._baseMap) return { value: this._baseMap[name], tier: LIMIT_TIER_BASE };
    return void 0;
  }
  /**
   * Classify a codepoint and return the minimum action level that must be applied.
   * Returns -1 when no minimum is imposed (normal allow path).
   *
   * Ranges checked (in priority order):
   *   1. U+0000            — null, governed by nullNCR (always ≥ remove)
   *   2. U+D800–U+DFFF     — surrogates, always prohibited (min: remove)
   *   3. U+0001–U+001F \ {0x09,0x0A,0x0D}  — XML 1.0 restricted C0 (min: remove)
   *      (skipped in XML 1.1 — C0 controls are allowed when written as NCRs)
   *
   * @param {number} cp  — codepoint
   * @returns {number}   — minimum NCR_LEVEL value, or -1 for no restriction
   */
  _classifyNCR(cp) {
    if (cp === 0) return this._ncrNullLevel;
    if (cp >= 55296 && cp <= 57343) return NCR_LEVEL.remove;
    if (this._ncrXmlVersion === 1) {
      if (cp >= 1 && cp <= 31 && !XML10_ALLOWED_C0.has(cp)) return NCR_LEVEL.remove;
    }
    return -1;
  }
  /**
   * Execute a resolved NCR action.
   *
   * @param {number} action   — NCR_LEVEL value
   * @param {string} token    — raw token (e.g. '#38') for error messages
   * @param {number} cp       — codepoint, used only for error messages
   * @returns {string|undefined}
   *   - decoded character string  → 'allow'
   *   - ''                        → 'remove'
   *   - undefined                 → 'leave' (caller must skip past '&' only)
   *   - throws Error              → 'throw'
   */
  _applyNCRAction(action, token, cp) {
    switch (action) {
      case NCR_LEVEL.allow:
        return String.fromCodePoint(cp);
      case NCR_LEVEL.remove:
        return "";
      case NCR_LEVEL.leave:
        return void 0;
      // signal: keep literal
      case NCR_LEVEL.throw:
        throw new Error(
          `[EntityDecoder] Prohibited numeric character reference &${token}; (U+${cp.toString(16).toUpperCase().padStart(4, "0")})`
        );
      default:
        return String.fromCodePoint(cp);
    }
  }
  /**
   * Full NCR resolution pipeline for a numeric token.
   *
   * Steps:
   *   1. Parse the codepoint (decimal or hex).
   *   2. Validate the raw codepoint range (NaN, <0, >0x10FFFF).
   *   3. If numericAllowed is false and no minimum restriction applies → leave as-is.
   *   4. Classify the codepoint to find the minimum required action level.
   *   5. Resolve effective action = max(onNCR, minimum).
   *   6. Apply and return.
   *
   * @param {string} token  — e.g. '#38', '#x26', '#X26'
   * @returns {string|undefined}
   *   - string (incl. '')  — replacement ('' = remove)
   *   - undefined          — leave original &token; as-is
   */
  _resolveNCR(token) {
    const second = token.charCodeAt(1);
    let cp;
    if (second === 120 || second === 88) {
      cp = parseInt(token.slice(2), 16);
    } else {
      cp = parseInt(token.slice(1), 10);
    }
    if (Number.isNaN(cp) || cp < 0 || cp > 1114111) return void 0;
    const minimum = this._classifyNCR(cp);
    if (!this._numericAllowed && minimum < NCR_LEVEL.remove) return void 0;
    const effective = minimum === -1 ? this._ncrOnLevel : Math.max(this._ncrOnLevel, minimum);
    return this._applyNCRAction(effective, token, cp);
  }
};

// node_modules/fast-xml-parser/src/xmlparser/OptionsBuilder.js
var defaultOnDangerousProperty = (name) => {
  if (DANGEROUS_PROPERTY_NAMES.includes(name)) {
    return "__" + name;
  }
  return name;
};
var defaultOptions2 = {
  preserveOrder: false,
  attributeNamePrefix: "@_",
  attributesGroupName: false,
  textNodeName: "#text",
  ignoreAttributes: true,
  removeNSPrefix: false,
  // remove NS from tag name or attribute name if true
  allowBooleanAttributes: false,
  //a tag can have attributes without any value
  //ignoreRootElement : false,
  parseTagValue: true,
  parseAttributeValue: false,
  trimValues: true,
  //Trim string values of tag and attributes
  cdataPropName: false,
  numberParseOptions: {
    hex: true,
    leadingZeros: true,
    eNotation: true
  },
  tagValueProcessor: function(tagName, val) {
    return val;
  },
  attributeValueProcessor: function(attrName, val) {
    return val;
  },
  stopNodes: [],
  //nested tags will not be parsed even for errors
  alwaysCreateTextNode: false,
  isArray: () => false,
  commentPropName: false,
  unpairedTags: [],
  processEntities: true,
  htmlEntities: false,
  entityDecoder: null,
  ignoreDeclaration: false,
  ignorePiTags: false,
  transformTagName: false,
  transformAttributeName: false,
  updateTag: function(tagName, jPath, attrs) {
    return tagName;
  },
  // skipEmptyListItem: false
  captureMetaData: false,
  maxNestedTags: 100,
  strictReservedNames: true,
  jPath: true,
  // if true, pass jPath string to callbacks; if false, pass matcher instance
  onDangerousProperty: defaultOnDangerousProperty
};
function validatePropertyName(propertyName, optionName) {
  if (typeof propertyName !== "string") {
    return;
  }
  const normalized = propertyName.toLowerCase();
  if (DANGEROUS_PROPERTY_NAMES.some((dangerous) => normalized === dangerous.toLowerCase())) {
    throw new Error(
      `[SECURITY] Invalid ${optionName}: "${propertyName}" is a reserved JavaScript keyword that could cause prototype pollution`
    );
  }
  if (criticalProperties.some((dangerous) => normalized === dangerous.toLowerCase())) {
    throw new Error(
      `[SECURITY] Invalid ${optionName}: "${propertyName}" is a reserved JavaScript keyword that could cause prototype pollution`
    );
  }
}
function normalizeProcessEntities(value, htmlEntities) {
  if (typeof value === "boolean") {
    return {
      enabled: value,
      // true or false
      maxEntitySize: 1e4,
      maxExpansionDepth: 1e4,
      maxTotalExpansions: Infinity,
      maxExpandedLength: 1e5,
      maxEntityCount: 1e3,
      allowedTags: null,
      tagFilter: null,
      appliesTo: "all"
    };
  }
  if (typeof value === "object" && value !== null) {
    return {
      enabled: value.enabled !== false,
      maxEntitySize: Math.max(1, value.maxEntitySize ?? 1e4),
      maxExpansionDepth: Math.max(1, value.maxExpansionDepth ?? 1e4),
      maxTotalExpansions: Math.max(1, value.maxTotalExpansions ?? Infinity),
      maxExpandedLength: Math.max(1, value.maxExpandedLength ?? 1e5),
      maxEntityCount: Math.max(1, value.maxEntityCount ?? 1e3),
      allowedTags: value.allowedTags ?? null,
      tagFilter: value.tagFilter ?? null,
      appliesTo: value.appliesTo ?? "all"
    };
  }
  return normalizeProcessEntities(true);
}
var buildOptions = function(options) {
  const built = Object.assign({}, defaultOptions2, options);
  const propertyNameOptions = [
    { value: built.attributeNamePrefix, name: "attributeNamePrefix" },
    { value: built.attributesGroupName, name: "attributesGroupName" },
    { value: built.textNodeName, name: "textNodeName" },
    { value: built.cdataPropName, name: "cdataPropName" },
    { value: built.commentPropName, name: "commentPropName" }
  ];
  for (const { value, name } of propertyNameOptions) {
    if (value) {
      validatePropertyName(value, name);
    }
  }
  if (built.onDangerousProperty === null) {
    built.onDangerousProperty = defaultOnDangerousProperty;
  }
  built.processEntities = normalizeProcessEntities(built.processEntities, built.htmlEntities);
  built.unpairedTagsSet = new Set(built.unpairedTags);
  if (built.stopNodes && Array.isArray(built.stopNodes)) {
    built.stopNodes = built.stopNodes.map((node) => {
      if (typeof node === "string" && node.startsWith("*.")) {
        return ".." + node.substring(2);
      }
      return node;
    });
  }
  return built;
};

// node_modules/fast-xml-parser/src/xmlparser/xmlNode.js
var METADATA_SYMBOL;
if (typeof Symbol !== "function") {
  METADATA_SYMBOL = "@@xmlMetadata";
} else {
  METADATA_SYMBOL = /* @__PURE__ */ Symbol("XML Node Metadata");
}
var XmlNode = class {
  constructor(tagname) {
    this.tagname = tagname;
    this.child = [];
    this[":@"] = /* @__PURE__ */ Object.create(null);
  }
  add(key, val) {
    if (key === "__proto__") key = "#__proto__";
    this.child.push({ [key]: val });
  }
  addChild(node, startIndex) {
    if (node.tagname === "__proto__") node.tagname = "#__proto__";
    if (node[":@"] && Object.keys(node[":@"]).length > 0) {
      this.child.push({ [node.tagname]: node.child, [":@"]: node[":@"] });
    } else {
      this.child.push({ [node.tagname]: node.child });
    }
    if (startIndex !== void 0) {
      this.child[this.child.length - 1][METADATA_SYMBOL] = { startIndex };
    }
  }
  /** symbol used for metadata */
  static getMetaDataSymbol() {
    return METADATA_SYMBOL;
  }
};

// node_modules/fast-xml-parser/src/xmlparser/DocTypeReader.js
var DocTypeReader = class {
  constructor(options) {
    this.suppressValidationErr = !options;
    this.options = options;
  }
  readDocType(xmlData, i) {
    const entities = /* @__PURE__ */ Object.create(null);
    let entityCount = 0;
    if (xmlData[i + 3] === "O" && xmlData[i + 4] === "C" && xmlData[i + 5] === "T" && xmlData[i + 6] === "Y" && xmlData[i + 7] === "P" && xmlData[i + 8] === "E") {
      i = i + 9;
      let angleBracketsCount = 1;
      let hasBody = false, comment = false;
      let exp = "";
      for (; i < xmlData.length; i++) {
        if (xmlData[i] === "<" && !comment) {
          if (hasBody && hasSeq(xmlData, "!ENTITY", i)) {
            i += 7;
            let entityName, val;
            [entityName, val, i] = this.readEntityExp(xmlData, i + 1, this.suppressValidationErr);
            if (val.indexOf("&") === -1) {
              if (this.options.enabled !== false && this.options.maxEntityCount != null && entityCount >= this.options.maxEntityCount) {
                throw new Error(
                  `Entity count (${entityCount + 1}) exceeds maximum allowed (${this.options.maxEntityCount})`
                );
              }
              entities[entityName] = val;
              entityCount++;
            }
          } else if (hasBody && hasSeq(xmlData, "!ELEMENT", i)) {
            i += 8;
            const { index } = this.readElementExp(xmlData, i + 1);
            i = index;
          } else if (hasBody && hasSeq(xmlData, "!ATTLIST", i)) {
            i += 8;
          } else if (hasBody && hasSeq(xmlData, "!NOTATION", i)) {
            i += 9;
            const { index } = this.readNotationExp(xmlData, i + 1, this.suppressValidationErr);
            i = index;
          } else if (hasSeq(xmlData, "!--", i)) comment = true;
          else throw new Error(`Invalid DOCTYPE`);
          angleBracketsCount++;
          exp = "";
        } else if (xmlData[i] === ">") {
          if (comment) {
            if (xmlData[i - 1] === "-" && xmlData[i - 2] === "-") {
              comment = false;
              angleBracketsCount--;
            }
          } else {
            angleBracketsCount--;
          }
          if (angleBracketsCount === 0) {
            break;
          }
        } else if (xmlData[i] === "[") {
          hasBody = true;
        } else {
          exp += xmlData[i];
        }
      }
      if (angleBracketsCount !== 0) {
        throw new Error(`Unclosed DOCTYPE`);
      }
    } else {
      throw new Error(`Invalid Tag instead of DOCTYPE`);
    }
    return { entities, i };
  }
  readEntityExp(xmlData, i) {
    i = skipWhitespace(xmlData, i);
    const startIndex = i;
    while (i < xmlData.length && !/\s/.test(xmlData[i]) && xmlData[i] !== '"' && xmlData[i] !== "'") {
      i++;
    }
    let entityName = xmlData.substring(startIndex, i);
    validateEntityName2(entityName);
    i = skipWhitespace(xmlData, i);
    if (!this.suppressValidationErr) {
      if (xmlData.substring(i, i + 6).toUpperCase() === "SYSTEM") {
        throw new Error("External entities are not supported");
      } else if (xmlData[i] === "%") {
        throw new Error("Parameter entities are not supported");
      }
    }
    let entityValue = "";
    [i, entityValue] = this.readIdentifierVal(xmlData, i, "entity");
    if (this.options.enabled !== false && this.options.maxEntitySize != null && entityValue.length > this.options.maxEntitySize) {
      throw new Error(
        `Entity "${entityName}" size (${entityValue.length}) exceeds maximum allowed size (${this.options.maxEntitySize})`
      );
    }
    i--;
    return [entityName, entityValue, i];
  }
  readNotationExp(xmlData, i) {
    i = skipWhitespace(xmlData, i);
    const startIndex = i;
    while (i < xmlData.length && !/\s/.test(xmlData[i])) {
      i++;
    }
    let notationName = xmlData.substring(startIndex, i);
    !this.suppressValidationErr && validateEntityName2(notationName);
    i = skipWhitespace(xmlData, i);
    const identifierType = xmlData.substring(i, i + 6).toUpperCase();
    if (!this.suppressValidationErr && identifierType !== "SYSTEM" && identifierType !== "PUBLIC") {
      throw new Error(`Expected SYSTEM or PUBLIC, found "${identifierType}"`);
    }
    i += identifierType.length;
    i = skipWhitespace(xmlData, i);
    let publicIdentifier = null;
    let systemIdentifier = null;
    if (identifierType === "PUBLIC") {
      [i, publicIdentifier] = this.readIdentifierVal(xmlData, i, "publicIdentifier");
      i = skipWhitespace(xmlData, i);
      if (xmlData[i] === '"' || xmlData[i] === "'") {
        [i, systemIdentifier] = this.readIdentifierVal(xmlData, i, "systemIdentifier");
      }
    } else if (identifierType === "SYSTEM") {
      [i, systemIdentifier] = this.readIdentifierVal(xmlData, i, "systemIdentifier");
      if (!this.suppressValidationErr && !systemIdentifier) {
        throw new Error("Missing mandatory system identifier for SYSTEM notation");
      }
    }
    return { notationName, publicIdentifier, systemIdentifier, index: --i };
  }
  readIdentifierVal(xmlData, i, type) {
    let identifierVal = "";
    const startChar = xmlData[i];
    if (startChar !== '"' && startChar !== "'") {
      throw new Error(`Expected quoted string, found "${startChar}"`);
    }
    i++;
    const startIndex = i;
    while (i < xmlData.length && xmlData[i] !== startChar) {
      i++;
    }
    identifierVal = xmlData.substring(startIndex, i);
    if (xmlData[i] !== startChar) {
      throw new Error(`Unterminated ${type} value`);
    }
    i++;
    return [i, identifierVal];
  }
  readElementExp(xmlData, i) {
    i = skipWhitespace(xmlData, i);
    const startIndex = i;
    while (i < xmlData.length && !/\s/.test(xmlData[i])) {
      i++;
    }
    let elementName = xmlData.substring(startIndex, i);
    if (!this.suppressValidationErr && !isName(elementName)) {
      throw new Error(`Invalid element name: "${elementName}"`);
    }
    i = skipWhitespace(xmlData, i);
    let contentModel = "";
    if (xmlData[i] === "E" && hasSeq(xmlData, "MPTY", i)) i += 4;
    else if (xmlData[i] === "A" && hasSeq(xmlData, "NY", i)) i += 2;
    else if (xmlData[i] === "(") {
      i++;
      const startIndex2 = i;
      while (i < xmlData.length && xmlData[i] !== ")") {
        i++;
      }
      contentModel = xmlData.substring(startIndex2, i);
      if (xmlData[i] !== ")") {
        throw new Error("Unterminated content model");
      }
    } else if (!this.suppressValidationErr) {
      throw new Error(`Invalid Element Expression, found "${xmlData[i]}"`);
    }
    return {
      elementName,
      contentModel: contentModel.trim(),
      index: i
    };
  }
  readAttlistExp(xmlData, i) {
    i = skipWhitespace(xmlData, i);
    let startIndex = i;
    while (i < xmlData.length && !/\s/.test(xmlData[i])) {
      i++;
    }
    let elementName = xmlData.substring(startIndex, i);
    validateEntityName2(elementName);
    i = skipWhitespace(xmlData, i);
    startIndex = i;
    while (i < xmlData.length && !/\s/.test(xmlData[i])) {
      i++;
    }
    let attributeName = xmlData.substring(startIndex, i);
    if (!validateEntityName2(attributeName)) {
      throw new Error(`Invalid attribute name: "${attributeName}"`);
    }
    i = skipWhitespace(xmlData, i);
    let attributeType = "";
    if (xmlData.substring(i, i + 8).toUpperCase() === "NOTATION") {
      attributeType = "NOTATION";
      i += 8;
      i = skipWhitespace(xmlData, i);
      if (xmlData[i] !== "(") {
        throw new Error(`Expected '(', found "${xmlData[i]}"`);
      }
      i++;
      let allowedNotations = [];
      while (i < xmlData.length && xmlData[i] !== ")") {
        const startIndex2 = i;
        while (i < xmlData.length && xmlData[i] !== "|" && xmlData[i] !== ")") {
          i++;
        }
        let notation = xmlData.substring(startIndex2, i);
        notation = notation.trim();
        if (!validateEntityName2(notation)) {
          throw new Error(`Invalid notation name: "${notation}"`);
        }
        allowedNotations.push(notation);
        if (xmlData[i] === "|") {
          i++;
          i = skipWhitespace(xmlData, i);
        }
      }
      if (xmlData[i] !== ")") {
        throw new Error("Unterminated list of notations");
      }
      i++;
      attributeType += " (" + allowedNotations.join("|") + ")";
    } else {
      const startIndex2 = i;
      while (i < xmlData.length && !/\s/.test(xmlData[i])) {
        i++;
      }
      attributeType += xmlData.substring(startIndex2, i);
      const validTypes = ["CDATA", "ID", "IDREF", "IDREFS", "ENTITY", "ENTITIES", "NMTOKEN", "NMTOKENS"];
      if (!this.suppressValidationErr && !validTypes.includes(attributeType.toUpperCase())) {
        throw new Error(`Invalid attribute type: "${attributeType}"`);
      }
    }
    i = skipWhitespace(xmlData, i);
    let defaultValue = "";
    if (xmlData.substring(i, i + 8).toUpperCase() === "#REQUIRED") {
      defaultValue = "#REQUIRED";
      i += 8;
    } else if (xmlData.substring(i, i + 7).toUpperCase() === "#IMPLIED") {
      defaultValue = "#IMPLIED";
      i += 7;
    } else {
      [i, defaultValue] = this.readIdentifierVal(xmlData, i, "ATTLIST");
    }
    return {
      elementName,
      attributeName,
      attributeType,
      defaultValue,
      index: i
    };
  }
};
var skipWhitespace = (data, index) => {
  while (index < data.length && /\s/.test(data[index])) {
    index++;
  }
  return index;
};
function hasSeq(data, seq, i) {
  for (let j = 0; j < seq.length; j++) {
    if (seq[j] !== data[i + j + 1]) return false;
  }
  return true;
}
function validateEntityName2(name) {
  if (isName(name))
    return name;
  else
    throw new Error(`Invalid entity name ${name}`);
}

// node_modules/strnum/strnum.js
var hexRegex = /^[-+]?0x[a-fA-F0-9]+$/;
var numRegex = /^([\-\+])?(0*)([0-9]*(\.[0-9]*)?)$/;
var consider = {
  hex: true,
  // oct: false,
  leadingZeros: true,
  decimalPoint: ".",
  eNotation: true,
  //skipLike: /regex/,
  infinity: "original"
  // "null", "infinity" (Infinity type), "string" ("Infinity" (the string literal))
};
function toNumber(str, options = {}) {
  options = Object.assign({}, consider, options);
  if (!str || typeof str !== "string") return str;
  let trimmedStr = str.trim();
  if (trimmedStr.length === 0) return str;
  else if (options.skipLike !== void 0 && options.skipLike.test(trimmedStr)) return str;
  else if (trimmedStr === "0") return 0;
  else if (options.hex && hexRegex.test(trimmedStr)) {
    return parse_int(trimmedStr, 16);
  } else if (!isFinite(trimmedStr)) {
    return handleInfinity(str, Number(trimmedStr), options);
  } else if (trimmedStr.includes("e") || trimmedStr.includes("E")) {
    return resolveEnotation(str, trimmedStr, options);
  } else {
    const match = numRegex.exec(trimmedStr);
    if (match) {
      const sign = match[1] || "";
      const leadingZeros = match[2];
      let numTrimmedByZeros = trimZeros(match[3]);
      const decimalAdjacentToLeadingZeros = sign ? (
        // 0., -00., 000.
        str[leadingZeros.length + 1] === "."
      ) : str[leadingZeros.length] === ".";
      if (!options.leadingZeros && (leadingZeros.length > 1 || leadingZeros.length === 1 && !decimalAdjacentToLeadingZeros)) {
        return str;
      } else {
        const num = Number(trimmedStr);
        const parsedStr = String(num);
        if (num === 0) return num;
        if (parsedStr.search(/[eE]/) !== -1) {
          if (options.eNotation) return num;
          else return str;
        } else if (trimmedStr.indexOf(".") !== -1) {
          if (parsedStr === "0") return num;
          else if (parsedStr === numTrimmedByZeros) return num;
          else if (parsedStr === `${sign}${numTrimmedByZeros}`) return num;
          else return str;
        }
        let n = leadingZeros ? numTrimmedByZeros : trimmedStr;
        if (leadingZeros) {
          return n === parsedStr || sign + n === parsedStr ? num : str;
        } else {
          return n === parsedStr || n === sign + parsedStr ? num : str;
        }
      }
    } else {
      return str;
    }
  }
}
var eNotationRegx = /^([-+])?(0*)(\d*(\.\d*)?[eE][-\+]?\d+)$/;
function resolveEnotation(str, trimmedStr, options) {
  if (!options.eNotation) return str;
  const notation = trimmedStr.match(eNotationRegx);
  if (notation) {
    let sign = notation[1] || "";
    const eChar = notation[3].indexOf("e") === -1 ? "E" : "e";
    const leadingZeros = notation[2];
    const eAdjacentToLeadingZeros = sign ? (
      // 0E.
      str[leadingZeros.length + 1] === eChar
    ) : str[leadingZeros.length] === eChar;
    if (leadingZeros.length > 1 && eAdjacentToLeadingZeros) return str;
    else if (leadingZeros.length === 1 && (notation[3].startsWith(`.${eChar}`) || notation[3][0] === eChar)) {
      return Number(trimmedStr);
    } else if (leadingZeros.length > 0) {
      if (options.leadingZeros && !eAdjacentToLeadingZeros) {
        trimmedStr = (notation[1] || "") + notation[3];
        return Number(trimmedStr);
      } else return str;
    } else {
      return Number(trimmedStr);
    }
  } else {
    return str;
  }
}
function trimZeros(numStr) {
  if (numStr && numStr.indexOf(".") !== -1) {
    numStr = numStr.replace(/0+$/, "");
    if (numStr === ".") numStr = "0";
    else if (numStr[0] === ".") numStr = "0" + numStr;
    else if (numStr[numStr.length - 1] === ".") numStr = numStr.substring(0, numStr.length - 1);
    return numStr;
  }
  return numStr;
}
function parse_int(numStr, base) {
  if (parseInt) return parseInt(numStr, base);
  else if (Number.parseInt) return Number.parseInt(numStr, base);
  else if (window && window.parseInt) return window.parseInt(numStr, base);
  else throw new Error("parseInt, Number.parseInt, window.parseInt are not supported");
}
function handleInfinity(str, num, options) {
  const isPositive = num === Infinity;
  switch (options.infinity.toLowerCase()) {
    case "null":
      return null;
    case "infinity":
      return num;
    // Return Infinity or -Infinity
    case "string":
      return isPositive ? "Infinity" : "-Infinity";
    case "original":
    default:
      return str;
  }
}

// node_modules/fast-xml-parser/src/ignoreAttributes.js
function getIgnoreAttributesFn(ignoreAttributes) {
  if (typeof ignoreAttributes === "function") {
    return ignoreAttributes;
  }
  if (Array.isArray(ignoreAttributes)) {
    return (attrName) => {
      for (const pattern of ignoreAttributes) {
        if (typeof pattern === "string" && attrName === pattern) {
          return true;
        }
        if (pattern instanceof RegExp && pattern.test(attrName)) {
          return true;
        }
      }
    };
  }
  return () => false;
}

// node_modules/path-expression-matcher/src/Expression.js
var Expression = class {
  /**
   * Create a new Expression
   * @param {string} pattern - Pattern string (e.g., "root.users.user", "..user[id]")
   * @param {Object} options - Configuration options
   * @param {string} options.separator - Path separator (default: '.')
   */
  constructor(pattern, options = {}, data) {
    this.pattern = pattern;
    this.separator = options.separator || ".";
    this.segments = this._parse(pattern);
    this.data = data;
    this._hasDeepWildcard = this.segments.some((seg) => seg.type === "deep-wildcard");
    this._hasAttributeCondition = this.segments.some((seg) => seg.attrName !== void 0);
    this._hasPositionSelector = this.segments.some((seg) => seg.position !== void 0);
  }
  /**
   * Parse pattern string into segments
   * @private
   * @param {string} pattern - Pattern to parse
   * @returns {Array} Array of segment objects
   */
  _parse(pattern) {
    const segments = [];
    let i = 0;
    let currentPart = "";
    while (i < pattern.length) {
      if (pattern[i] === this.separator) {
        if (i + 1 < pattern.length && pattern[i + 1] === this.separator) {
          if (currentPart.trim()) {
            segments.push(this._parseSegment(currentPart.trim()));
            currentPart = "";
          }
          segments.push({ type: "deep-wildcard" });
          i += 2;
        } else {
          if (currentPart.trim()) {
            segments.push(this._parseSegment(currentPart.trim()));
          }
          currentPart = "";
          i++;
        }
      } else {
        currentPart += pattern[i];
        i++;
      }
    }
    if (currentPart.trim()) {
      segments.push(this._parseSegment(currentPart.trim()));
    }
    return segments;
  }
  /**
   * Parse a single segment
   * @private
   * @param {string} part - Segment string (e.g., "user", "ns::user", "user[id]", "ns::user:first")
   * @returns {Object} Segment object
   */
  _parseSegment(part) {
    const segment = { type: "tag" };
    let bracketContent = null;
    let withoutBrackets = part;
    const bracketMatch = part.match(/^([^\[]+)(\[[^\]]*\])(.*)$/);
    if (bracketMatch) {
      withoutBrackets = bracketMatch[1] + bracketMatch[3];
      if (bracketMatch[2]) {
        const content = bracketMatch[2].slice(1, -1);
        if (content) {
          bracketContent = content;
        }
      }
    }
    let namespace = void 0;
    let tagAndPosition = withoutBrackets;
    if (withoutBrackets.includes("::")) {
      const nsIndex = withoutBrackets.indexOf("::");
      namespace = withoutBrackets.substring(0, nsIndex).trim();
      tagAndPosition = withoutBrackets.substring(nsIndex + 2).trim();
      if (!namespace) {
        throw new Error(`Invalid namespace in pattern: ${part}`);
      }
    }
    let tag = void 0;
    let positionMatch = null;
    if (tagAndPosition.includes(":")) {
      const colonIndex = tagAndPosition.lastIndexOf(":");
      const tagPart = tagAndPosition.substring(0, colonIndex).trim();
      const posPart = tagAndPosition.substring(colonIndex + 1).trim();
      const isPositionKeyword = ["first", "last", "odd", "even"].includes(posPart) || /^nth\(\d+\)$/.test(posPart);
      if (isPositionKeyword) {
        tag = tagPart;
        positionMatch = posPart;
      } else {
        tag = tagAndPosition;
      }
    } else {
      tag = tagAndPosition;
    }
    if (!tag) {
      throw new Error(`Invalid segment pattern: ${part}`);
    }
    segment.tag = tag;
    if (namespace) {
      segment.namespace = namespace;
    }
    if (bracketContent) {
      if (bracketContent.includes("=")) {
        const eqIndex = bracketContent.indexOf("=");
        segment.attrName = bracketContent.substring(0, eqIndex).trim();
        segment.attrValue = bracketContent.substring(eqIndex + 1).trim();
      } else {
        segment.attrName = bracketContent.trim();
      }
    }
    if (positionMatch) {
      const nthMatch = positionMatch.match(/^nth\((\d+)\)$/);
      if (nthMatch) {
        segment.position = "nth";
        segment.positionValue = parseInt(nthMatch[1], 10);
      } else {
        segment.position = positionMatch;
      }
    }
    return segment;
  }
  /**
   * Get the number of segments
   * @returns {number}
   */
  get length() {
    return this.segments.length;
  }
  /**
   * Check if expression contains deep wildcard
   * @returns {boolean}
   */
  hasDeepWildcard() {
    return this._hasDeepWildcard;
  }
  /**
   * Check if expression has attribute conditions
   * @returns {boolean}
   */
  hasAttributeCondition() {
    return this._hasAttributeCondition;
  }
  /**
   * Check if expression has position selectors
   * @returns {boolean}
   */
  hasPositionSelector() {
    return this._hasPositionSelector;
  }
  /**
   * Get string representation
   * @returns {string}
   */
  toString() {
    return this.pattern;
  }
};

// node_modules/path-expression-matcher/src/ExpressionSet.js
var ExpressionSet = class {
  constructor() {
    this._byDepthAndTag = /* @__PURE__ */ new Map();
    this._wildcardByDepth = /* @__PURE__ */ new Map();
    this._deepWildcards = [];
    this._patterns = /* @__PURE__ */ new Set();
    this._sealed = false;
  }
  /**
   * Add an Expression to the set.
   * Duplicate patterns (same pattern string) are silently ignored.
   *
   * @param {import('./Expression.js').default} expression - A pre-constructed Expression instance
   * @returns {this} for chaining
   * @throws {TypeError} if called after seal()
   *
   * @example
   * set.add(new Expression('root.users.user'));
   * set.add(new Expression('..script'));
   */
  add(expression) {
    if (this._sealed) {
      throw new TypeError(
        "ExpressionSet is sealed. Create a new ExpressionSet to add more expressions."
      );
    }
    if (this._patterns.has(expression.pattern)) return this;
    this._patterns.add(expression.pattern);
    if (expression.hasDeepWildcard()) {
      this._deepWildcards.push(expression);
      return this;
    }
    const depth = expression.length;
    const lastSeg = expression.segments[expression.segments.length - 1];
    const tag = lastSeg?.tag;
    if (!tag || tag === "*") {
      if (!this._wildcardByDepth.has(depth)) this._wildcardByDepth.set(depth, []);
      this._wildcardByDepth.get(depth).push(expression);
    } else {
      const key = `${depth}:${tag}`;
      if (!this._byDepthAndTag.has(key)) this._byDepthAndTag.set(key, []);
      this._byDepthAndTag.get(key).push(expression);
    }
    return this;
  }
  /**
   * Add multiple expressions at once.
   *
   * @param {import('./Expression.js').default[]} expressions - Array of Expression instances
   * @returns {this} for chaining
   *
   * @example
   * set.addAll([
   *   new Expression('root.users.user'),
   *   new Expression('root.config.setting'),
   * ]);
   */
  addAll(expressions) {
    for (const expr of expressions) this.add(expr);
    return this;
  }
  /**
   * Check whether a pattern string is already present in the set.
   *
   * @param {import('./Expression.js').default} expression
   * @returns {boolean}
   */
  has(expression) {
    return this._patterns.has(expression.pattern);
  }
  /**
   * Number of expressions in the set.
   * @type {number}
   */
  get size() {
    return this._patterns.size;
  }
  /**
   * Seal the set against further modifications.
   * Useful to prevent accidental mutations after config is built.
   * Calling add() or addAll() on a sealed set throws a TypeError.
   *
   * @returns {this}
   */
  seal() {
    this._sealed = true;
    return this;
  }
  /**
   * Whether the set has been sealed.
   * @type {boolean}
   */
  get isSealed() {
    return this._sealed;
  }
  /**
   * Test whether the matcher's current path matches any expression in the set.
   *
   * Evaluation order (cheapest → most expensive):
   *  1. Exact depth + tag bucket  — O(1) lookup, typically 0–2 expressions
   *  2. Depth-only wildcard bucket — O(1) lookup, rare
   *  3. Deep-wildcard list         — always checked, but usually small
   *
   * @param {import('./Matcher.js').default} matcher - Matcher instance (or readOnly view)
   * @returns {boolean} true if any expression matches the current path
   *
   * @example
   * if (stopNodes.matchesAny(matcher)) {
   *   // handle stop node
   * }
   */
  matchesAny(matcher) {
    return this.findMatch(matcher) !== null;
  }
  /**
  * Find and return the first Expression that matches the matcher's current path.
  *
  * Uses the same evaluation order as matchesAny (cheapest → most expensive):
  *  1. Exact depth + tag bucket
  *  2. Depth-only wildcard bucket
  *  3. Deep-wildcard list
  *
  * @param {import('./Matcher.js').default} matcher - Matcher instance (or readOnly view)
  * @returns {import('./Expression.js').default | null} the first matching Expression, or null
  *
  * @example
  * const expr = stopNodes.findMatch(matcher);
  * if (expr) {
  *   // access expr.config, expr.pattern, etc.
  * }
  */
  findMatch(matcher) {
    const depth = matcher.getDepth();
    const tag = matcher.getCurrentTag();
    const exactKey = `${depth}:${tag}`;
    const exactBucket = this._byDepthAndTag.get(exactKey);
    if (exactBucket) {
      for (let i = 0; i < exactBucket.length; i++) {
        if (matcher.matches(exactBucket[i])) return exactBucket[i];
      }
    }
    const wildcardBucket = this._wildcardByDepth.get(depth);
    if (wildcardBucket) {
      for (let i = 0; i < wildcardBucket.length; i++) {
        if (matcher.matches(wildcardBucket[i])) return wildcardBucket[i];
      }
    }
    for (let i = 0; i < this._deepWildcards.length; i++) {
      if (matcher.matches(this._deepWildcards[i])) return this._deepWildcards[i];
    }
    return null;
  }
};

// node_modules/path-expression-matcher/src/Matcher.js
var MatcherView = class {
  /**
   * @param {Matcher} matcher - The parent Matcher instance to read from.
   */
  constructor(matcher) {
    this._matcher = matcher;
  }
  /**
   * Get the path separator used by the parent matcher.
   * @returns {string}
   */
  get separator() {
    return this._matcher.separator;
  }
  /**
   * Get current tag name.
   * @returns {string|undefined}
   */
  getCurrentTag() {
    const path = this._matcher.path;
    return path.length > 0 ? path[path.length - 1].tag : void 0;
  }
  /**
   * Get current namespace.
   * @returns {string|undefined}
   */
  getCurrentNamespace() {
    const path = this._matcher.path;
    return path.length > 0 ? path[path.length - 1].namespace : void 0;
  }
  /**
   * Get current node's attribute value.
   * @param {string} attrName
   * @returns {*}
   */
  getAttrValue(attrName) {
    const path = this._matcher.path;
    if (path.length === 0) return void 0;
    return path[path.length - 1].values?.[attrName];
  }
  /**
   * Check if current node has an attribute.
   * @param {string} attrName
   * @returns {boolean}
   */
  hasAttr(attrName) {
    const path = this._matcher.path;
    if (path.length === 0) return false;
    const current = path[path.length - 1];
    return current.values !== void 0 && attrName in current.values;
  }
  /**
   * Get current node's sibling position (child index in parent).
   * @returns {number}
   */
  getPosition() {
    const path = this._matcher.path;
    if (path.length === 0) return -1;
    return path[path.length - 1].position ?? 0;
  }
  /**
   * Get current node's repeat counter (occurrence count of this tag name).
   * @returns {number}
   */
  getCounter() {
    const path = this._matcher.path;
    if (path.length === 0) return -1;
    return path[path.length - 1].counter ?? 0;
  }
  /**
   * Get current node's sibling index (alias for getPosition).
   * @returns {number}
   * @deprecated Use getPosition() or getCounter() instead
   */
  getIndex() {
    return this.getPosition();
  }
  /**
   * Get current path depth.
   * @returns {number}
   */
  getDepth() {
    return this._matcher.path.length;
  }
  /**
   * Get path as string.
   * @param {string} [separator] - Optional separator (uses default if not provided)
   * @param {boolean} [includeNamespace=true]
   * @returns {string}
   */
  toString(separator, includeNamespace = true) {
    return this._matcher.toString(separator, includeNamespace);
  }
  /**
   * Get path as array of tag names.
   * @returns {string[]}
   */
  toArray() {
    return this._matcher.path.map((n) => n.tag);
  }
  /**
   * Match current path against an Expression.
   * @param {Expression} expression
   * @returns {boolean}
   */
  matches(expression) {
    return this._matcher.matches(expression);
  }
  /**
   * Match any expression in the given set against the current path.
   * @param {ExpressionSet} exprSet
   * @returns {boolean}
   */
  matchesAny(exprSet) {
    return exprSet.matchesAny(this._matcher);
  }
};
var Matcher = class {
  /**
   * Create a new Matcher.
   * @param {Object} [options={}]
   * @param {string} [options.separator='.'] - Default path separator
   */
  constructor(options = {}) {
    this.separator = options.separator || ".";
    this.path = [];
    this.siblingStacks = [];
    this._pathStringCache = null;
    this._view = new MatcherView(this);
  }
  /**
   * Push a new tag onto the path.
   * @param {string} tagName
   * @param {Object|null} [attrValues=null]
   * @param {string|null} [namespace=null]
   */
  push(tagName, attrValues = null, namespace = null) {
    this._pathStringCache = null;
    if (this.path.length > 0) {
      this.path[this.path.length - 1].values = void 0;
    }
    const currentLevel = this.path.length;
    if (!this.siblingStacks[currentLevel]) {
      this.siblingStacks[currentLevel] = /* @__PURE__ */ new Map();
    }
    const siblings = this.siblingStacks[currentLevel];
    const siblingKey = namespace ? `${namespace}:${tagName}` : tagName;
    const counter = siblings.get(siblingKey) || 0;
    let position = 0;
    for (const count of siblings.values()) {
      position += count;
    }
    siblings.set(siblingKey, counter + 1);
    const node = {
      tag: tagName,
      position,
      counter
    };
    if (namespace !== null && namespace !== void 0) {
      node.namespace = namespace;
    }
    if (attrValues !== null && attrValues !== void 0) {
      node.values = attrValues;
    }
    this.path.push(node);
  }
  /**
   * Pop the last tag from the path.
   * @returns {Object|undefined} The popped node
   */
  pop() {
    if (this.path.length === 0) return void 0;
    this._pathStringCache = null;
    const node = this.path.pop();
    if (this.siblingStacks.length > this.path.length + 1) {
      this.siblingStacks.length = this.path.length + 1;
    }
    return node;
  }
  /**
   * Update current node's attribute values.
   * Useful when attributes are parsed after push.
   * @param {Object} attrValues
   */
  updateCurrent(attrValues) {
    if (this.path.length > 0) {
      const current = this.path[this.path.length - 1];
      if (attrValues !== null && attrValues !== void 0) {
        current.values = attrValues;
      }
    }
  }
  /**
   * Get current tag name.
   * @returns {string|undefined}
   */
  getCurrentTag() {
    return this.path.length > 0 ? this.path[this.path.length - 1].tag : void 0;
  }
  /**
   * Get current namespace.
   * @returns {string|undefined}
   */
  getCurrentNamespace() {
    return this.path.length > 0 ? this.path[this.path.length - 1].namespace : void 0;
  }
  /**
   * Get current node's attribute value.
   * @param {string} attrName
   * @returns {*}
   */
  getAttrValue(attrName) {
    if (this.path.length === 0) return void 0;
    return this.path[this.path.length - 1].values?.[attrName];
  }
  /**
   * Check if current node has an attribute.
   * @param {string} attrName
   * @returns {boolean}
   */
  hasAttr(attrName) {
    if (this.path.length === 0) return false;
    const current = this.path[this.path.length - 1];
    return current.values !== void 0 && attrName in current.values;
  }
  /**
   * Get current node's sibling position (child index in parent).
   * @returns {number}
   */
  getPosition() {
    if (this.path.length === 0) return -1;
    return this.path[this.path.length - 1].position ?? 0;
  }
  /**
   * Get current node's repeat counter (occurrence count of this tag name).
   * @returns {number}
   */
  getCounter() {
    if (this.path.length === 0) return -1;
    return this.path[this.path.length - 1].counter ?? 0;
  }
  /**
   * Get current node's sibling index (alias for getPosition).
   * @returns {number}
   * @deprecated Use getPosition() or getCounter() instead
   */
  getIndex() {
    return this.getPosition();
  }
  /**
   * Get current path depth.
   * @returns {number}
   */
  getDepth() {
    return this.path.length;
  }
  /**
   * Get path as string.
   * @param {string} [separator] - Optional separator (uses default if not provided)
   * @param {boolean} [includeNamespace=true]
   * @returns {string}
   */
  toString(separator, includeNamespace = true) {
    const sep = separator || this.separator;
    const isDefault = sep === this.separator && includeNamespace === true;
    if (isDefault) {
      if (this._pathStringCache !== null) {
        return this._pathStringCache;
      }
      const result = this.path.map(
        (n) => n.namespace ? `${n.namespace}:${n.tag}` : n.tag
      ).join(sep);
      this._pathStringCache = result;
      return result;
    }
    return this.path.map(
      (n) => includeNamespace && n.namespace ? `${n.namespace}:${n.tag}` : n.tag
    ).join(sep);
  }
  /**
   * Get path as array of tag names.
   * @returns {string[]}
   */
  toArray() {
    return this.path.map((n) => n.tag);
  }
  /**
   * Reset the path to empty.
   */
  reset() {
    this._pathStringCache = null;
    this.path = [];
    this.siblingStacks = [];
  }
  /**
   * Match current path against an Expression.
   * @param {Expression} expression
   * @returns {boolean}
   */
  matches(expression) {
    const segments = expression.segments;
    if (segments.length === 0) {
      return false;
    }
    if (expression.hasDeepWildcard()) {
      return this._matchWithDeepWildcard(segments);
    }
    return this._matchSimple(segments);
  }
  /**
   * @private
   */
  _matchSimple(segments) {
    if (this.path.length !== segments.length) {
      return false;
    }
    for (let i = 0; i < segments.length; i++) {
      if (!this._matchSegment(segments[i], this.path[i], i === this.path.length - 1)) {
        return false;
      }
    }
    return true;
  }
  /**
   * @private
   */
  _matchWithDeepWildcard(segments) {
    let pathIdx = this.path.length - 1;
    let segIdx = segments.length - 1;
    while (segIdx >= 0 && pathIdx >= 0) {
      const segment = segments[segIdx];
      if (segment.type === "deep-wildcard") {
        segIdx--;
        if (segIdx < 0) {
          return true;
        }
        const nextSeg = segments[segIdx];
        let found = false;
        for (let i = pathIdx; i >= 0; i--) {
          if (this._matchSegment(nextSeg, this.path[i], i === this.path.length - 1)) {
            pathIdx = i - 1;
            segIdx--;
            found = true;
            break;
          }
        }
        if (!found) {
          return false;
        }
      } else {
        if (!this._matchSegment(segment, this.path[pathIdx], pathIdx === this.path.length - 1)) {
          return false;
        }
        pathIdx--;
        segIdx--;
      }
    }
    return segIdx < 0;
  }
  /**
   * @private
   */
  _matchSegment(segment, node, isCurrentNode) {
    if (segment.tag !== "*" && segment.tag !== node.tag) {
      return false;
    }
    if (segment.namespace !== void 0) {
      if (segment.namespace !== "*" && segment.namespace !== node.namespace) {
        return false;
      }
    }
    if (segment.attrName !== void 0) {
      if (!isCurrentNode) {
        return false;
      }
      if (!node.values || !(segment.attrName in node.values)) {
        return false;
      }
      if (segment.attrValue !== void 0) {
        if (String(node.values[segment.attrName]) !== String(segment.attrValue)) {
          return false;
        }
      }
    }
    if (segment.position !== void 0) {
      if (!isCurrentNode) {
        return false;
      }
      const counter = node.counter ?? 0;
      if (segment.position === "first" && counter !== 0) {
        return false;
      } else if (segment.position === "odd" && counter % 2 !== 1) {
        return false;
      } else if (segment.position === "even" && counter % 2 !== 0) {
        return false;
      } else if (segment.position === "nth" && counter !== segment.positionValue) {
        return false;
      }
    }
    return true;
  }
  /**
   * Match any expression in the given set against the current path.
   * @param {ExpressionSet} exprSet
   * @returns {boolean}
   */
  matchesAny(exprSet) {
    return exprSet.matchesAny(this);
  }
  /**
   * Create a snapshot of current state.
   * @returns {Object}
   */
  snapshot() {
    return {
      path: this.path.map((node) => ({ ...node })),
      siblingStacks: this.siblingStacks.map((map) => new Map(map))
    };
  }
  /**
   * Restore state from snapshot.
   * @param {Object} snapshot
   */
  restore(snapshot) {
    this._pathStringCache = null;
    this.path = snapshot.path.map((node) => ({ ...node }));
    this.siblingStacks = snapshot.siblingStacks.map((map) => new Map(map));
  }
  /**
   * Return the read-only {@link MatcherView} for this matcher.
   *
   * The same instance is returned on every call — no allocation occurs.
   * It always reflects the current parser state and is safe to pass to
   * user callbacks without risk of accidental mutation.
   *
   * @returns {MatcherView}
   *
   * @example
   * const view = matcher.readOnly();
   * // pass view to callbacks — it stays in sync automatically
   * view.matches(expr);       // ✓
   * view.getCurrentTag();     // ✓
   * // view.push(...)         // ✗ method does not exist — caught by TypeScript
   */
  readOnly() {
    return this._view;
  }
};

// node_modules/fast-xml-parser/src/xmlparser/OrderedObjParser.js
function extractRawAttributes(prefixedAttrs, options) {
  if (!prefixedAttrs) return {};
  const attrs = options.attributesGroupName ? prefixedAttrs[options.attributesGroupName] : prefixedAttrs;
  if (!attrs) return {};
  const rawAttrs = {};
  for (const key in attrs) {
    if (key.startsWith(options.attributeNamePrefix)) {
      const rawName = key.substring(options.attributeNamePrefix.length);
      rawAttrs[rawName] = attrs[key];
    } else {
      rawAttrs[key] = attrs[key];
    }
  }
  return rawAttrs;
}
function extractNamespace(rawTagName) {
  if (!rawTagName || typeof rawTagName !== "string") return void 0;
  const colonIndex = rawTagName.indexOf(":");
  if (colonIndex !== -1 && colonIndex > 0) {
    const ns = rawTagName.substring(0, colonIndex);
    if (ns !== "xmlns") {
      return ns;
    }
  }
  return void 0;
}
var OrderedObjParser = class {
  constructor(options) {
    this.options = options;
    this.currentNode = null;
    this.tagsNodeStack = [];
    this.parseXml = parseXml;
    this.parseTextData = parseTextData;
    this.resolveNameSpace = resolveNameSpace;
    this.buildAttributesMap = buildAttributesMap;
    this.isItStopNode = isItStopNode;
    this.replaceEntitiesValue = replaceEntitiesValue;
    this.readStopNodeData = readStopNodeData;
    this.saveTextToParentTag = saveTextToParentTag;
    this.addChild = addChild;
    this.ignoreAttributesFn = getIgnoreAttributesFn(this.options.ignoreAttributes);
    this.entityExpansionCount = 0;
    this.currentExpandedLength = 0;
    let namedEntities = { ...XML };
    if (this.options.entityDecoder) {
      this.entityDecoder = this.options.entityDecoder;
    } else {
      if (typeof this.options.htmlEntities === "object") namedEntities = this.options.htmlEntities;
      else if (this.options.htmlEntities === true) namedEntities = { ...COMMON_HTML, ...CURRENCY };
      this.entityDecoder = new EntityDecoder({
        namedEntities,
        numericAllowed: this.options.htmlEntities,
        limit: {
          maxTotalExpansions: this.options.processEntities.maxTotalExpansions,
          maxExpandedLength: this.options.processEntities.maxExpandedLength,
          applyLimitsTo: this.options.processEntities.appliesTo
        }
        //postCheck: resolved => resolved
      });
    }
    this.matcher = new Matcher();
    this.readonlyMatcher = this.matcher.readOnly();
    this.isCurrentNodeStopNode = false;
    this.stopNodeExpressionsSet = new ExpressionSet();
    const stopNodesOpts = this.options.stopNodes;
    if (stopNodesOpts && stopNodesOpts.length > 0) {
      for (let i = 0; i < stopNodesOpts.length; i++) {
        const stopNodeExp = stopNodesOpts[i];
        if (typeof stopNodeExp === "string") {
          this.stopNodeExpressionsSet.add(new Expression(stopNodeExp));
        } else if (stopNodeExp instanceof Expression) {
          this.stopNodeExpressionsSet.add(stopNodeExp);
        }
      }
      this.stopNodeExpressionsSet.seal();
    }
  }
};
function parseTextData(val, tagName, jPath, dontTrim, hasAttributes, isLeafNode, escapeEntities) {
  const options = this.options;
  if (val !== void 0) {
    if (options.trimValues && !dontTrim) {
      val = val.trim();
    }
    if (val.length > 0) {
      if (!escapeEntities) val = this.replaceEntitiesValue(val, tagName, jPath);
      const jPathOrMatcher = options.jPath ? jPath.toString() : jPath;
      const newval = options.tagValueProcessor(tagName, val, jPathOrMatcher, hasAttributes, isLeafNode);
      if (newval === null || newval === void 0) {
        return val;
      } else if (typeof newval !== typeof val || newval !== val) {
        return newval;
      } else if (options.trimValues) {
        return parseValue(val, options.parseTagValue, options.numberParseOptions);
      } else {
        const trimmedVal = val.trim();
        if (trimmedVal === val) {
          return parseValue(val, options.parseTagValue, options.numberParseOptions);
        } else {
          return val;
        }
      }
    }
  }
}
function resolveNameSpace(tagname) {
  if (this.options.removeNSPrefix) {
    const tags = tagname.split(":");
    const prefix = tagname.charAt(0) === "/" ? "/" : "";
    if (tags[0] === "xmlns") {
      return "";
    }
    if (tags.length === 2) {
      tagname = prefix + tags[1];
    }
  }
  return tagname;
}
var attrsRegx = new RegExp(`([^\\s=]+)\\s*(=\\s*(['"])([\\s\\S]*?)\\3)?`, "gm");
function buildAttributesMap(attrStr, jPath, tagName, force = false) {
  const options = this.options;
  if (force === true || options.ignoreAttributes !== true && typeof attrStr === "string") {
    const matches = getAllMatches(attrStr, attrsRegx);
    const len = matches.length;
    const attrs = {};
    const processedVals = new Array(len);
    let hasRawAttrs = false;
    const rawAttrsForMatcher = {};
    for (let i = 0; i < len; i++) {
      const attrName = this.resolveNameSpace(matches[i][1]);
      const oldVal = matches[i][4];
      if (attrName.length && oldVal !== void 0) {
        let val = oldVal;
        if (options.trimValues) val = val.trim();
        val = this.replaceEntitiesValue(val, tagName, this.readonlyMatcher);
        processedVals[i] = val;
        rawAttrsForMatcher[attrName] = val;
        hasRawAttrs = true;
      }
    }
    if (hasRawAttrs && typeof jPath === "object" && jPath.updateCurrent) {
      jPath.updateCurrent(rawAttrsForMatcher);
    }
    const jPathStr = options.jPath ? jPath.toString() : this.readonlyMatcher;
    let hasAttrs = false;
    for (let i = 0; i < len; i++) {
      const attrName = this.resolveNameSpace(matches[i][1]);
      if (this.ignoreAttributesFn(attrName, jPathStr)) continue;
      let aName = options.attributeNamePrefix + attrName;
      if (attrName.length) {
        if (options.transformAttributeName) {
          aName = options.transformAttributeName(aName);
        }
        aName = sanitizeName(aName, options);
        if (matches[i][4] !== void 0) {
          const oldVal = processedVals[i];
          const newVal = options.attributeValueProcessor(attrName, oldVal, jPathStr);
          if (newVal === null || newVal === void 0) {
            attrs[aName] = oldVal;
          } else if (typeof newVal !== typeof oldVal || newVal !== oldVal) {
            attrs[aName] = newVal;
          } else {
            attrs[aName] = parseValue(oldVal, options.parseAttributeValue, options.numberParseOptions);
          }
          hasAttrs = true;
        } else if (options.allowBooleanAttributes) {
          attrs[aName] = true;
          hasAttrs = true;
        }
      }
    }
    if (!hasAttrs) return;
    if (options.attributesGroupName) {
      const attrCollection = {};
      attrCollection[options.attributesGroupName] = attrs;
      return attrCollection;
    }
    return attrs;
  }
}
var parseXml = function(xmlData) {
  xmlData = xmlData.replace(/\r\n?/g, "\n");
  const xmlObj = new XmlNode("!xml");
  let currentNode = xmlObj;
  let textData = "";
  this.matcher.reset();
  this.entityDecoder.reset();
  this.entityExpansionCount = 0;
  this.currentExpandedLength = 0;
  const options = this.options;
  const docTypeReader = new DocTypeReader(options.processEntities);
  const xmlLen = xmlData.length;
  for (let i = 0; i < xmlLen; i++) {
    const ch = xmlData[i];
    if (ch === "<") {
      const c1 = xmlData.charCodeAt(i + 1);
      if (c1 === 47) {
        const closeIndex = findClosingIndex(xmlData, ">", i, "Closing Tag is not closed.");
        let tagName = xmlData.substring(i + 2, closeIndex).trim();
        if (options.removeNSPrefix) {
          const colonIndex = tagName.indexOf(":");
          if (colonIndex !== -1) {
            tagName = tagName.substr(colonIndex + 1);
          }
        }
        tagName = transformTagName(options.transformTagName, tagName, "", options).tagName;
        if (currentNode) {
          textData = this.saveTextToParentTag(textData, currentNode, this.readonlyMatcher);
        }
        const lastTagName = this.matcher.getCurrentTag();
        if (tagName && options.unpairedTagsSet.has(tagName)) {
          throw new Error(`Unpaired tag can not be used as closing tag: </${tagName}>`);
        }
        if (lastTagName && options.unpairedTagsSet.has(lastTagName)) {
          this.matcher.pop();
          this.tagsNodeStack.pop();
        }
        this.matcher.pop();
        this.isCurrentNodeStopNode = false;
        currentNode = this.tagsNodeStack.pop();
        textData = "";
        i = closeIndex;
      } else if (c1 === 63) {
        let tagData = readTagExp(xmlData, i, false, "?>");
        if (!tagData) throw new Error("Pi Tag is not closed.");
        textData = this.saveTextToParentTag(textData, currentNode, this.readonlyMatcher);
        const attsMap = this.buildAttributesMap(tagData.tagExp, this.matcher, tagData.tagName, true);
        if (attsMap) {
          const ver = attsMap[this.options.attributeNamePrefix + "version"];
          this.entityDecoder.setXmlVersion(Number(ver) || 1);
        }
        if (options.ignoreDeclaration && tagData.tagName === "?xml" || options.ignorePiTags) {
        } else {
          const childNode = new XmlNode(tagData.tagName);
          childNode.add(options.textNodeName, "");
          if (tagData.tagName !== tagData.tagExp && tagData.attrExpPresent && options.ignoreAttributes !== true) {
            childNode[":@"] = attsMap;
          }
          this.addChild(currentNode, childNode, this.readonlyMatcher, i);
        }
        i = tagData.closeIndex + 1;
      } else if (c1 === 33 && xmlData.charCodeAt(i + 2) === 45 && xmlData.charCodeAt(i + 3) === 45) {
        const endIndex = findClosingIndex(xmlData, "-->", i + 4, "Comment is not closed.");
        if (options.commentPropName) {
          const comment = xmlData.substring(i + 4, endIndex - 2);
          textData = this.saveTextToParentTag(textData, currentNode, this.readonlyMatcher);
          currentNode.add(options.commentPropName, [{ [options.textNodeName]: comment }]);
        }
        i = endIndex;
      } else if (c1 === 33 && xmlData.charCodeAt(i + 2) === 68) {
        const result = docTypeReader.readDocType(xmlData, i);
        this.entityDecoder.addInputEntities(result.entities);
        i = result.i;
      } else if (c1 === 33 && xmlData.charCodeAt(i + 2) === 91) {
        const closeIndex = findClosingIndex(xmlData, "]]>", i, "CDATA is not closed.") - 2;
        const tagExp = xmlData.substring(i + 9, closeIndex);
        textData = this.saveTextToParentTag(textData, currentNode, this.readonlyMatcher);
        let val = this.parseTextData(tagExp, currentNode.tagname, this.readonlyMatcher, true, false, true, true);
        if (val == void 0) val = "";
        if (options.cdataPropName) {
          currentNode.add(options.cdataPropName, [{ [options.textNodeName]: tagExp }]);
        } else {
          currentNode.add(options.textNodeName, val);
        }
        i = closeIndex + 2;
      } else {
        let result = readTagExp(xmlData, i, options.removeNSPrefix);
        if (!result) {
          const context = xmlData.substring(Math.max(0, i - 50), Math.min(xmlLen, i + 50));
          throw new Error(`readTagExp returned undefined at position ${i}. Context: "${context}"`);
        }
        let tagName = result.tagName;
        const rawTagName = result.rawTagName;
        let tagExp = result.tagExp;
        let attrExpPresent = result.attrExpPresent;
        let closeIndex = result.closeIndex;
        ({ tagName, tagExp } = transformTagName(options.transformTagName, tagName, tagExp, options));
        if (options.strictReservedNames && (tagName === options.commentPropName || tagName === options.cdataPropName || tagName === options.textNodeName || tagName === options.attributesGroupName)) {
          throw new Error(`Invalid tag name: ${tagName}`);
        }
        if (currentNode && textData) {
          if (currentNode.tagname !== "!xml") {
            textData = this.saveTextToParentTag(textData, currentNode, this.readonlyMatcher, false);
          }
        }
        const lastTag = currentNode;
        if (lastTag && options.unpairedTagsSet.has(lastTag.tagname)) {
          currentNode = this.tagsNodeStack.pop();
          this.matcher.pop();
        }
        let isSelfClosing = false;
        if (tagExp.length > 0 && tagExp.lastIndexOf("/") === tagExp.length - 1) {
          isSelfClosing = true;
          if (tagName[tagName.length - 1] === "/") {
            tagName = tagName.substr(0, tagName.length - 1);
            tagExp = tagName;
          } else {
            tagExp = tagExp.substr(0, tagExp.length - 1);
          }
          attrExpPresent = tagName !== tagExp;
        }
        let prefixedAttrs = null;
        let rawAttrs = {};
        let namespace = void 0;
        namespace = extractNamespace(rawTagName);
        if (tagName !== xmlObj.tagname) {
          this.matcher.push(tagName, {}, namespace);
        }
        if (tagName !== tagExp && attrExpPresent) {
          prefixedAttrs = this.buildAttributesMap(tagExp, this.matcher, tagName);
          if (prefixedAttrs) {
            rawAttrs = extractRawAttributes(prefixedAttrs, options);
          }
        }
        if (tagName !== xmlObj.tagname) {
          this.isCurrentNodeStopNode = this.isItStopNode();
        }
        const startIndex = i;
        if (this.isCurrentNodeStopNode) {
          let tagContent = "";
          if (isSelfClosing) {
            i = result.closeIndex;
          } else if (options.unpairedTagsSet.has(tagName)) {
            i = result.closeIndex;
          } else {
            const result2 = this.readStopNodeData(xmlData, rawTagName, closeIndex + 1);
            if (!result2) throw new Error(`Unexpected end of ${rawTagName}`);
            i = result2.i;
            tagContent = result2.tagContent;
          }
          const childNode = new XmlNode(tagName);
          if (prefixedAttrs) {
            childNode[":@"] = prefixedAttrs;
          }
          childNode.add(options.textNodeName, tagContent);
          this.matcher.pop();
          this.isCurrentNodeStopNode = false;
          this.addChild(currentNode, childNode, this.readonlyMatcher, startIndex);
        } else {
          if (isSelfClosing) {
            ({ tagName, tagExp } = transformTagName(options.transformTagName, tagName, tagExp, options));
            const childNode = new XmlNode(tagName);
            if (prefixedAttrs) {
              childNode[":@"] = prefixedAttrs;
            }
            this.addChild(currentNode, childNode, this.readonlyMatcher, startIndex);
            this.matcher.pop();
            this.isCurrentNodeStopNode = false;
          } else if (options.unpairedTagsSet.has(tagName)) {
            const childNode = new XmlNode(tagName);
            if (prefixedAttrs) {
              childNode[":@"] = prefixedAttrs;
            }
            this.addChild(currentNode, childNode, this.readonlyMatcher, startIndex);
            this.matcher.pop();
            this.isCurrentNodeStopNode = false;
            i = result.closeIndex;
            continue;
          } else {
            const childNode = new XmlNode(tagName);
            if (this.tagsNodeStack.length > options.maxNestedTags) {
              throw new Error("Maximum nested tags exceeded");
            }
            this.tagsNodeStack.push(currentNode);
            if (prefixedAttrs) {
              childNode[":@"] = prefixedAttrs;
            }
            this.addChild(currentNode, childNode, this.readonlyMatcher, startIndex);
            currentNode = childNode;
          }
          textData = "";
          i = closeIndex;
        }
      }
    } else {
      textData += xmlData[i];
    }
  }
  return xmlObj.child;
};
function addChild(currentNode, childNode, matcher, startIndex) {
  if (!this.options.captureMetaData) startIndex = void 0;
  const jPathOrMatcher = this.options.jPath ? matcher.toString() : matcher;
  const result = this.options.updateTag(childNode.tagname, jPathOrMatcher, childNode[":@"]);
  if (result === false) {
  } else if (typeof result === "string") {
    childNode.tagname = result;
    currentNode.addChild(childNode, startIndex);
  } else {
    currentNode.addChild(childNode, startIndex);
  }
}
function replaceEntitiesValue(val, tagName, jPath) {
  const entityConfig = this.options.processEntities;
  if (!entityConfig || !entityConfig.enabled) {
    return val;
  }
  if (entityConfig.allowedTags) {
    const jPathOrMatcher = this.options.jPath ? jPath.toString() : jPath;
    const allowed = Array.isArray(entityConfig.allowedTags) ? entityConfig.allowedTags.includes(tagName) : entityConfig.allowedTags(tagName, jPathOrMatcher);
    if (!allowed) {
      return val;
    }
  }
  if (entityConfig.tagFilter) {
    const jPathOrMatcher = this.options.jPath ? jPath.toString() : jPath;
    if (!entityConfig.tagFilter(tagName, jPathOrMatcher)) {
      return val;
    }
  }
  return this.entityDecoder.decode(val);
}
function saveTextToParentTag(textData, parentNode, matcher, isLeafNode) {
  if (textData) {
    if (isLeafNode === void 0) isLeafNode = parentNode.child.length === 0;
    textData = this.parseTextData(
      textData,
      parentNode.tagname,
      matcher,
      false,
      parentNode[":@"] ? Object.keys(parentNode[":@"]).length !== 0 : false,
      isLeafNode
    );
    if (textData !== void 0 && textData !== "")
      parentNode.add(this.options.textNodeName, textData);
    textData = "";
  }
  return textData;
}
function isItStopNode() {
  if (this.stopNodeExpressionsSet.size === 0) return false;
  return this.matcher.matchesAny(this.stopNodeExpressionsSet);
}
function tagExpWithClosingIndex(xmlData, i, closingChar = ">") {
  let attrBoundary = 0;
  const chars = [];
  const len = xmlData.length;
  const closeCode0 = closingChar.charCodeAt(0);
  const closeCode1 = closingChar.length > 1 ? closingChar.charCodeAt(1) : -1;
  for (let index = i; index < len; index++) {
    const code = xmlData.charCodeAt(index);
    if (attrBoundary) {
      if (code === attrBoundary) attrBoundary = 0;
    } else if (code === 34 || code === 39) {
      attrBoundary = code;
    } else if (code === closeCode0) {
      if (closeCode1 !== -1) {
        if (xmlData.charCodeAt(index + 1) === closeCode1) {
          return { data: String.fromCharCode(...chars), index };
        }
      } else {
        return { data: String.fromCharCode(...chars), index };
      }
    } else if (code === 9) {
      chars.push(32);
      continue;
    }
    chars.push(code);
  }
}
function findClosingIndex(xmlData, str, i, errMsg) {
  const closingIndex = xmlData.indexOf(str, i);
  if (closingIndex === -1) {
    throw new Error(errMsg);
  } else {
    return closingIndex + str.length - 1;
  }
}
function findClosingChar(xmlData, char, i, errMsg) {
  const closingIndex = xmlData.indexOf(char, i);
  if (closingIndex === -1) throw new Error(errMsg);
  return closingIndex;
}
function readTagExp(xmlData, i, removeNSPrefix, closingChar = ">") {
  const result = tagExpWithClosingIndex(xmlData, i + 1, closingChar);
  if (!result) return;
  let tagExp = result.data;
  const closeIndex = result.index;
  const separatorIndex = tagExp.search(/\s/);
  let tagName = tagExp;
  let attrExpPresent = true;
  if (separatorIndex !== -1) {
    tagName = tagExp.substring(0, separatorIndex);
    tagExp = tagExp.substring(separatorIndex + 1).trimStart();
  }
  const rawTagName = tagName;
  if (removeNSPrefix) {
    const colonIndex = tagName.indexOf(":");
    if (colonIndex !== -1) {
      tagName = tagName.substr(colonIndex + 1);
      attrExpPresent = tagName !== result.data.substr(colonIndex + 1);
    }
  }
  return {
    tagName,
    tagExp,
    closeIndex,
    attrExpPresent,
    rawTagName
  };
}
function readStopNodeData(xmlData, tagName, i) {
  const startIndex = i;
  let openTagCount = 1;
  const xmllen = xmlData.length;
  for (; i < xmllen; i++) {
    if (xmlData[i] === "<") {
      const c1 = xmlData.charCodeAt(i + 1);
      if (c1 === 47) {
        const closeIndex = findClosingChar(xmlData, ">", i, `${tagName} is not closed`);
        let closeTagName = xmlData.substring(i + 2, closeIndex).trim();
        if (closeTagName === tagName) {
          openTagCount--;
          if (openTagCount === 0) {
            return {
              tagContent: xmlData.substring(startIndex, i),
              i: closeIndex
            };
          }
        }
        i = closeIndex;
      } else if (c1 === 63) {
        const closeIndex = findClosingIndex(xmlData, "?>", i + 1, "StopNode is not closed.");
        i = closeIndex;
      } else if (c1 === 33 && xmlData.charCodeAt(i + 2) === 45 && xmlData.charCodeAt(i + 3) === 45) {
        const closeIndex = findClosingIndex(xmlData, "-->", i + 3, "StopNode is not closed.");
        i = closeIndex;
      } else if (c1 === 33 && xmlData.charCodeAt(i + 2) === 91) {
        const closeIndex = findClosingIndex(xmlData, "]]>", i, "StopNode is not closed.") - 2;
        i = closeIndex;
      } else {
        const tagData = readTagExp(xmlData, i, ">");
        if (tagData) {
          const openTagName = tagData && tagData.tagName;
          if (openTagName === tagName && tagData.tagExp[tagData.tagExp.length - 1] !== "/") {
            openTagCount++;
          }
          i = tagData.closeIndex;
        }
      }
    }
  }
}
function parseValue(val, shouldParse, options) {
  if (shouldParse && typeof val === "string") {
    const newval = val.trim();
    if (newval === "true") return true;
    else if (newval === "false") return false;
    else return toNumber(val, options);
  } else {
    if (isExist(val)) {
      return val;
    } else {
      return "";
    }
  }
}
function transformTagName(fn, tagName, tagExp, options) {
  if (fn) {
    const newTagName = fn(tagName);
    if (tagExp === tagName) {
      tagExp = newTagName;
    }
    tagName = newTagName;
  }
  tagName = sanitizeName(tagName, options);
  return { tagName, tagExp };
}
function sanitizeName(name, options) {
  if (criticalProperties.includes(name)) {
    throw new Error(`[SECURITY] Invalid name: "${name}" is a reserved JavaScript keyword that could cause prototype pollution`);
  } else if (DANGEROUS_PROPERTY_NAMES.includes(name)) {
    return options.onDangerousProperty(name);
  }
  return name;
}

// node_modules/fast-xml-parser/src/xmlparser/node2json.js
var METADATA_SYMBOL2 = XmlNode.getMetaDataSymbol();
function stripAttributePrefix(attrs, prefix) {
  if (!attrs || typeof attrs !== "object") return {};
  if (!prefix) return attrs;
  const rawAttrs = {};
  for (const key in attrs) {
    if (key.startsWith(prefix)) {
      const rawName = key.substring(prefix.length);
      rawAttrs[rawName] = attrs[key];
    } else {
      rawAttrs[key] = attrs[key];
    }
  }
  return rawAttrs;
}
function prettify(node, options, matcher, readonlyMatcher) {
  return compress(node, options, matcher, readonlyMatcher);
}
function compress(arr, options, matcher, readonlyMatcher) {
  let text;
  const compressedObj = {};
  for (let i = 0; i < arr.length; i++) {
    const tagObj = arr[i];
    const property = propName(tagObj);
    if (property !== void 0 && property !== options.textNodeName) {
      const rawAttrs = stripAttributePrefix(
        tagObj[":@"] || {},
        options.attributeNamePrefix
      );
      matcher.push(property, rawAttrs);
    }
    if (property === options.textNodeName) {
      if (text === void 0) text = tagObj[property];
      else text += "" + tagObj[property];
    } else if (property === void 0) {
      continue;
    } else if (tagObj[property]) {
      let val = compress(tagObj[property], options, matcher, readonlyMatcher);
      const isLeaf = isLeafTag(val, options);
      if (tagObj[":@"]) {
        assignAttributes(val, tagObj[":@"], readonlyMatcher, options);
      } else if (Object.keys(val).length === 1 && val[options.textNodeName] !== void 0 && !options.alwaysCreateTextNode) {
        val = val[options.textNodeName];
      } else if (Object.keys(val).length === 0) {
        if (options.alwaysCreateTextNode) val[options.textNodeName] = "";
        else val = "";
      }
      if (tagObj[METADATA_SYMBOL2] !== void 0 && typeof val === "object" && val !== null) {
        val[METADATA_SYMBOL2] = tagObj[METADATA_SYMBOL2];
      }
      if (compressedObj[property] !== void 0 && Object.prototype.hasOwnProperty.call(compressedObj, property)) {
        if (!Array.isArray(compressedObj[property])) {
          compressedObj[property] = [compressedObj[property]];
        }
        compressedObj[property].push(val);
      } else {
        const jPathOrMatcher = options.jPath ? readonlyMatcher.toString() : readonlyMatcher;
        if (options.isArray(property, jPathOrMatcher, isLeaf)) {
          compressedObj[property] = [val];
        } else {
          compressedObj[property] = val;
        }
      }
      if (property !== void 0 && property !== options.textNodeName) {
        matcher.pop();
      }
    }
  }
  if (typeof text === "string") {
    if (text.length > 0) compressedObj[options.textNodeName] = text;
  } else if (text !== void 0) compressedObj[options.textNodeName] = text;
  return compressedObj;
}
function propName(obj) {
  const keys = Object.keys(obj);
  for (let i = 0; i < keys.length; i++) {
    const key = keys[i];
    if (key !== ":@") return key;
  }
}
function assignAttributes(obj, attrMap, readonlyMatcher, options) {
  if (attrMap) {
    const keys = Object.keys(attrMap);
    const len = keys.length;
    for (let i = 0; i < len; i++) {
      const atrrName = keys[i];
      const rawAttrName = atrrName.startsWith(options.attributeNamePrefix) ? atrrName.substring(options.attributeNamePrefix.length) : atrrName;
      const jPathOrMatcher = options.jPath ? readonlyMatcher.toString() + "." + rawAttrName : readonlyMatcher;
      if (options.isArray(atrrName, jPathOrMatcher, true, true)) {
        obj[atrrName] = [attrMap[atrrName]];
      } else {
        obj[atrrName] = attrMap[atrrName];
      }
    }
  }
}
function isLeafTag(obj, options) {
  const { textNodeName } = options;
  const propCount = Object.keys(obj).length;
  if (propCount === 0) {
    return true;
  }
  if (propCount === 1 && (obj[textNodeName] || typeof obj[textNodeName] === "boolean" || obj[textNodeName] === 0)) {
    return true;
  }
  return false;
}

// node_modules/fast-xml-parser/src/xmlparser/XMLParser.js
var XMLParser = class {
  constructor(options) {
    this.externalEntities = {};
    this.options = buildOptions(options);
  }
  /**
   * Parse XML dats to JS object 
   * @param {string|Uint8Array} xmlData 
   * @param {boolean|Object} validationOption 
   */
  parse(xmlData, validationOption) {
    if (typeof xmlData !== "string" && xmlData.toString) {
      xmlData = xmlData.toString();
    } else if (typeof xmlData !== "string") {
      throw new Error("XML data is accepted in String or Bytes[] form.");
    }
    if (validationOption) {
      if (validationOption === true) validationOption = {};
      const result = validate(xmlData, validationOption);
      if (result !== true) {
        throw Error(`${result.err.msg}:${result.err.line}:${result.err.col}`);
      }
    }
    const orderedObjParser = new OrderedObjParser(this.options);
    orderedObjParser.entityDecoder.setExternalEntities(this.externalEntities);
    const orderedResult = orderedObjParser.parseXml(xmlData);
    if (this.options.preserveOrder || orderedResult === void 0) return orderedResult;
    else return prettify(orderedResult, this.options, orderedObjParser.matcher, orderedObjParser.readonlyMatcher);
  }
  /**
   * Add Entity which is not by default supported by this library
   * @param {string} key 
   * @param {string} value 
   */
  addEntity(key, value) {
    if (value.indexOf("&") !== -1) {
      throw new Error("Entity value can't have '&'");
    } else if (key.indexOf("&") !== -1 || key.indexOf(";") !== -1) {
      throw new Error("An entity must be set without '&' and ';'. Eg. use '#xD' for '&#xD;'");
    } else if (value === "&") {
      throw new Error("An entity with value '&' is not permitted");
    } else {
      this.externalEntities[key] = value;
    }
  }
  /**
   * Returns a Symbol that can be used to access the metadata
   * property on a node.
   * 
   * If Symbol is not available in the environment, an ordinary property is used
   * and the name of the property is here returned.
   * 
   * The XMLMetaData property is only present when `captureMetaData`
   * is true in the options.
   */
  static getMetaDataSymbol() {
    return XmlNode.getMetaDataSymbol();
  }
};

// src/VapixAPI.ts
var VapixAPI = class _VapixAPI extends BasicAPI {
  constructor(client, CustomFormData = FormData) {
    super(client);
    this.CustomFormData = CustomFormData;
  }
  CustomFormData;
  async postUrlEncoded(path, parameters, headers, options) {
    const data = paramToUrl(parameters);
    const head = { ...headers, "Content-Type": "application/x-www-form-urlencoded" };
    const agent = this.getClient(options?.proxyParams);
    const res = await agent.post({ path, data, headers: head, timeout: options?.timeout });
    if (!res.ok) {
      throw new ErrorWithResponse(res);
    }
    return res;
  }
  async postJson(path, data, headers, options) {
    const agent = this.getClient(options?.proxyParams);
    const jsonData = JSON.stringify(data);
    const res = await agent.post({
      path,
      data: jsonData,
      headers: { ...headers, "Content-Type": "application/json" },
      timeout: options?.timeout
    });
    if (!res.ok) {
      throw new ErrorWithResponse(res);
    }
    return res;
  }
  async getCameraImage(parameters, options) {
    const agent = this.getClient(options?.proxyParams);
    const res = await agent.get({
      path: "/axis-cgi/jpg/image.cgi",
      parameters,
      timeout: options?.timeout
    });
    if (!res.ok) {
      throw new ErrorWithResponse(res);
    }
    if (res.headers.get("content-type") !== "image/jpeg") {
      throw new Error(`Unexpected content-type: ${res.headers.get("content-type")}`);
    }
    return res;
  }
  async getEventDeclarations(options) {
    const data = '<s:Envelope xmlns:s="http://www.w3.org/2003/05/soap-envelope"><s:Body xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"xmlns:xsd="http://www.w3.org/2001/XMLSchema"><GetEventInstances xmlns="http://www.axis.com/vapix/ws/event1"/></s:Body></s:Envelope>';
    const agent = this.getClient(options?.proxyParams);
    const res = await agent.post({
      path: "/vapix/services",
      data,
      headers: { "Content-Type": "application/soap+xml" }
    });
    if (!res.ok) {
      throw new ErrorWithResponse(res);
    }
    return await res.text();
  }
  async getSupportedAudioSampleRate(options) {
    const path = "/axis-cgi/audio/streamingcapabilities.cgi";
    const jsonData = { apiVersion: "1.0", method: "list" };
    const res = await this._postJsonEncoded(path, jsonData, void 0, options);
    const encoders = audioSampleRatesResponseSchema.parse(await res.json()).data.encoders;
    return encoders.aac ?? encoders.AAC ?? [];
  }
  async performAutofocus(options) {
    try {
      const data = {
        apiVersion: "1",
        method: "performAutofocus",
        params: {
          optics: [
            {
              opticsId: "0"
            }
          ]
        }
      };
      await this._postJsonEncoded("/axis-cgi/opticscontrol.cgi", data, void 0, options);
    } catch (err) {
      await this._postUrlEncoded(
        "/axis-cgi/opticssetup.cgi",
        {
          autofocus: "perform",
          source: "1"
        },
        options
      );
    }
  }
  downloadCameraReport(options) {
    return this._getText("/axis-cgi/serverreport.cgi", { mode: "text" }, options);
  }
  async getSystemLog(options) {
    const res = await this._postUrlEncoded("/axis-cgi/admin/systemlog.cgi", {}, options);
    return res.text();
  }
  async getMaxFps(channel, options) {
    const data = { apiVersion: "1.0", method: "getCaptureModes" };
    const res = await this._postJsonEncoded("/axis-cgi/capturemode.cgi", data, void 0, options);
    const response = maxFpsResponseSchema.parse(await res.json());
    const channels = response.data;
    if (channels === void 0) {
      throw new MaxFPSError("MALFORMED_REPLY");
    }
    const channelData = channels.find((x) => x.channel === channel);
    if (channelData === void 0) {
      throw new MaxFPSError("CHANNEL_NOT_FOUND");
    }
    const captureModes = channelData.captureMode;
    const captureMode = captureModes.find((x) => x.enabled === true);
    if (captureMode === void 0) {
      throw new MaxFPSError("CAPTURE_MODE_NOT_FOUND");
    }
    if (isNullish(captureMode.maxFPS)) {
      throw new MaxFPSError("FPS_NOT_SPECIFIED");
    }
    return external_exports.number().parse(captureMode.maxFPS);
  }
  async getTimezone(options) {
    try {
      const agent = this.getClient(options?.proxyParams);
      const resV2 = await agent.get({ path: "/config/rest/time/v2/timeZone", timeout: options?.timeout });
      if (!resV2.ok) {
        throw new ErrorWithResponse(resV2);
      }
      const json = await resV2.json();
      const data = timeZoneSchema.parse(json);
      if (data.status === "error") {
        throw new TimezoneFetchError(data.error.message);
      }
      return data.data.activeTimeZone;
    } catch (error) {
      console.warn(
        "Failed to fetch time zone data from time API v2:",
        error instanceof Error ? error.message : JSON.stringify(error)
      );
      console.warn("Falling back to deprecated time API v1");
    }
    try {
      const data = await this.getAllDateTimeInfo(options);
      if (data.data.timeZone === void 0) {
        console.warn("Timezone not set up on the camera, using POSIX time zone as fallback");
        return external_exports.string().parse(data.data.posixTimeZone);
      }
      return external_exports.string().parse(data.data.timeZone);
    } catch (error) {
      console.warn("Could not retreive timezone from either API endpoints, reading param.cgi");
      const posixTimezone = (await this.getParameter("Time.POSIXTimeZone", options))["Time.POSIXTimeZone"];
      if (posixTimezone !== void 0) {
        return external_exports.string().parse(posixTimezone);
      } else {
        throw error;
      }
    }
  }
  async getAllDateTimeInfo(options) {
    const data = { apiVersion: "1.0", method: "getAll" };
    const res = await this._postJsonEncoded("/axis-cgi/time.cgi", data, void 0, options);
    return allDateTimeInfoSchema.parse(await res.json());
  }
  /** @deprecated: Use getAllDateTimeInfo instead */
  async getDateTimeInfo(options) {
    const data = { apiVersion: "1.0", method: "getDateTimeInfo" };
    const res = await this._postJsonEncoded("/axis-cgi/time.cgi", data, void 0, options);
    return dateTimeinfoSchema.parse(await res.json());
  }
  async getDevicesSettings(options) {
    const data = { apiVersion: "1.0", method: "getDevicesSettings" };
    const res = await this._postJsonEncoded("/axis-cgi/audiodevicecontrol.cgi", data, void 0, options);
    const result = audioDeviceRequestSchema.parse(await res.json());
    return result.data.devices.map((device) => ({
      ...device,
      inputs: (device.inputs || []).sort((a, b) => a.id.localeCompare(b.id)),
      outputs: (device.outputs || []).sort((a, b) => a.id.localeCompare(b.id))
    }));
  }
  async fetchRemoteDeviceInfo(payload, options) {
    const res = await this._postJsonEncoded("/axis-cgi/basicdeviceinfo.cgi", payload, void 0, options);
    const json = await res.json();
    if (isNullish(json.data)) {
      throw new NoDeviceInfoError();
    }
    return json.data;
  }
  async getHeaders(options) {
    const data = { apiVersion: "1.0", method: "list" };
    const res = await this._postJsonEncoded("/axis-cgi/customhttpheader.cgi", data, void 0, options);
    return external_exports.object({ data: external_exports.record(external_exports.string()) }).parse(await res.json()).data;
  }
  async setHeaders(headers, options) {
    const data = { apiVersion: "1.0", method: "set", params: headers };
    await this._postJsonEncoded("/axis-cgi/customhttpheader.cgi", data, void 0, options);
  }
  //  -------------------------------
  //         SD card management
  //  -------------------------------
  async checkSDCard(options) {
    const res = await this._postUrlEncoded(
      "/axis-cgi/disks/list.cgi",
      {
        diskid: "SD_DISK"
      },
      options
    );
    const xmlText = await res.text();
    const parser = new XMLParser({
      ignoreAttributes: false,
      attributeNamePrefix: "",
      allowBooleanAttributes: true
    });
    const result = parser.parse(xmlText);
    const data = result.root.disks.disk;
    return sdCardInfoSchema.parse({
      totalSize: parseInt(data.totalsize),
      freeSize: parseInt(data.freesize),
      status: sdCardWatchedStatuses.includes(data.status) ? data.status : "disconnected"
    });
  }
  mountSDCard(options) {
    return this._doSDCardMountAction("MOUNT", options);
  }
  unmountSDCard(options) {
    return this._doSDCardMountAction("UNMOUNT", options);
  }
  async _doSDCardMountAction(action, options) {
    const res = await this._postUrlEncoded(
      "/axis-cgi/disks/mount.cgi",
      {
        action,
        diskid: "SD_DISK"
      },
      options
    );
    const textXml = await res.text();
    const parser = new XMLParser({
      ignoreAttributes: false,
      attributeNamePrefix: "",
      allowBooleanAttributes: true
    });
    const result = parser.parse(textXml);
    const job = result.root.job;
    if (job.result !== "OK") {
      throw new SDCardActionError(action, job.description);
    }
    return Number(job.jobid);
  }
  // This is supposed to be called in interval in client code until progress is 100
  async fetchSDCardJobProgress(jobId, options) {
    const res = await this._postUrlEncoded(
      "/disks/job.cgi",
      {
        jobid: String(jobId),
        diskid: "SD_DISK"
      },
      options
    );
    const textXml = await res.text();
    const parser = new XMLParser({
      ignoreAttributes: false,
      attributeNamePrefix: "",
      allowBooleanAttributes: true
    });
    const job = parser.parse(textXml).root.job;
    if (job.result !== "OK") {
      throw new SDCardJobError(job.description);
    }
    return Number(job.progress);
  }
  //  -------------------------------
  //            param.cgi
  //  -------------------------------
  async getParameter(paramNames, options) {
    const response = await this._postUrlEncoded(
      "/axis-cgi/param.cgi",
      {
        action: "list",
        group: arrayToUrl(paramNames)
      },
      options
    );
    return _VapixAPI.parseParameters(await response.text());
  }
  async setParameter(params, options) {
    const res = await this._postUrlEncoded(
      "/axis-cgi/param.cgi",
      {
        ...params,
        action: "update"
      },
      options
    );
    const responseText = await res.text();
    if (responseText.startsWith("# Error")) {
      throw new SettingParameterError(responseText);
    }
  }
  //  -------------------------------
  //           Guard Tours
  //  -------------------------------
  async getGuardTourList(options) {
    const gTourList = new Array();
    const response = await this.getParameter("GuardTour", options);
    for (let i = 0; i < 20; i++) {
      const gTourBaseName = "GuardTour.G" + i;
      if (gTourBaseName + ".CamNbr" in response) {
        const gTour = {
          id: gTourBaseName,
          camNbr: response[gTourBaseName + ".CamNbr"],
          name: response[gTourBaseName + ".Name"] ?? "Guard Tour " + (i + 1),
          randomEnabled: response[gTourBaseName + ".RandomEnabled"],
          running: response[gTourBaseName + ".Running"] ?? "no",
          timeBetweenSequences: response[gTourBaseName + ".TimeBetweenSequences"],
          tour: []
        };
        for (let j = 0; j < 100; j++) {
          const tourBaseName = "GuardTour.G" + i + ".Tour.T" + j;
          if (tourBaseName + ".MoveSpeed" in response) {
            const tour = {
              moveSpeed: response[tourBaseName + ".MoveSpeed"],
              position: response[tourBaseName + ".Position"],
              presetNbr: response[tourBaseName + ".PresetNbr"],
              waitTime: response[tourBaseName + ".WaitTime"],
              waitTimeViewType: response[tourBaseName + ".WaitTimeViewType"]
            };
            gTour.tour.push(tour);
          }
        }
        gTourList.push(gTour);
      } else {
        break;
      }
    }
    return guardTourSchema.parse(gTourList);
  }
  setGuardTourEnabled(guardTourId, enable, options) {
    const params = {};
    params[guardTourId + ".Running"] = enable ? "yes" : "no";
    return this.setParameter(params, options);
  }
  //  -------------------------------
  //             ptz.cgi
  //  -------------------------------
  async getPTZPresetList(channel, options) {
    const res = await this._postUrlEncoded(
      "/axis-cgi/com/ptz.cgi",
      {
        query: "presetposcam",
        camera: channel
      },
      options
    );
    const text = await res.text();
    const lines = text.split(/[\r\n]/);
    const positions = [];
    for (const line of lines) {
      if (line.indexOf("presetposno") !== -1) {
        const delimiterPos = line.indexOf("=");
        if (delimiterPos !== -1) {
          const value = line.substring(delimiterPos + 1);
          positions.push(value);
        }
      }
    }
    return external_exports.array(external_exports.string()).parse(positions);
  }
  async listPTZ(camera, options) {
    const url = `/axis-cgi/com/ptz.cgi`;
    const response = await this._postUrlEncoded(
      url,
      {
        camera,
        query: "presetposcamdata",
        format: "json"
      },
      options
    );
    const text = await response.text();
    if (text === "") {
      throw new PtzNotSupportedError();
    }
    return _VapixAPI.parseCameraPtzResponse(text)[camera] ?? [];
  }
  async listPtzVideoSourceOverview(options) {
    const response = await this._postUrlEncoded(
      "/axis-cgi/com/ptz.cgi",
      {
        query: "presetposall",
        format: "json"
      },
      options
    );
    const text = await response.text();
    if (text === "") {
      throw new PtzNotSupportedError();
    }
    const data = _VapixAPI.parseCameraPtzResponse(text);
    const res = {};
    Object.keys(data).map(Number).forEach((camera) => {
      const item = data[camera];
      if (item !== void 0) {
        res[camera - 1] = item.map(({ data: itemData, ...d }) => d);
      }
    });
    return ptzOverviewSchema.parse(res);
  }
  async goToPreset(channel, presetName, options) {
    await this._postUrlEncoded(
      "/axis-cgi/com/ptz.cgi",
      {
        camera: channel.toString(),
        gotoserverpresetname: presetName
      },
      options
    );
  }
  async getPtzPosition(camera, options) {
    const res = await this._postUrlEncoded(
      "/axis-cgi/com/ptz.cgi",
      {
        query: "position",
        camera: camera.toString()
      },
      options
    );
    const params = _VapixAPI.parseParameters(await res.text());
    return cameraPTZItemDataSchema.parse({
      pan: Number(params.pan),
      tilt: Number(params.tilt),
      zoom: Number(params.zoom)
    });
  }
  //  -------------------------------
  //        portmanagement.cgi
  //  -------------------------------
  async getPorts(options) {
    try {
      const res = await this._postJsonEncoded(
        "/axis-cgi/io/portmanagement.cgi",
        {
          apiVersion: "1.0",
          context: "",
          method: "getPorts"
        },
        void 0,
        options
      );
      const portResponseParsed = getPortsResponseSchema.parse(await res.json());
      return portResponseParsed.data.items ?? [];
    } catch (error) {
      if (error instanceof ErrorWithResponse && error.res.status === 404) {
        console.warn(error, "Error while fetching ports, trying param.cgi directly");
        const ports = await this.getParameter([PORT_PARAMS.inputNbr, PORT_PARAMS.outputNbr]);
        const nbrOfPorts = Number(ports[PORT_PARAMS.inputNbr] ?? 0) + Number(ports[PORT_PARAMS.outputNbr] ?? 0);
        if (nbrOfPorts === 0) {
          return [];
        }
        const items = [];
        for (let i = 0; i < nbrOfPorts; i++) {
          const portDirection = (await this.getParameter([PORT_PARAMS.direction(i)]))[PORT_PARAMS.direction(i)];
          if (portDirection === void 0) {
            continue;
          }
          const info = await this.getParameter([
            PORT_PARAMS.configurable(i),
            PORT_PARAMS.usage(i),
            portDirection === "input" ? PORT_PARAMS.inputState(i) : PORT_PARAMS.outputState(i),
            portDirection === "input" ? PORT_PARAMS.inputName(i) : PORT_PARAMS.outputName(i)
          ]);
          const portState = portDirection === "input" ? info[PORT_PARAMS.inputState(i)] === "open" ? "closed" : "open" : info[PORT_PARAMS.outputState(i)] === "open" ? "closed" : "open";
          items.push({
            port: String(i),
            state: portState,
            configurable: info[PORT_PARAMS.configurable(i)] !== "no",
            usage: info[PORT_PARAMS.usage(i)] ?? "",
            direction: portDirection,
            name: portDirection === "input" ? info[PORT_PARAMS.inputName(i)] ?? "Port " + i : info[PORT_PARAMS.outputName(i)] ?? "Port " + i,
            normalState: portState
          });
        }
        return items;
      } else {
        throw error;
      }
    }
  }
  async setPorts(ports, options) {
    await this._postJsonEncoded(
      "/axis-cgi/io/portmanagement.cgi",
      {
        apiVersion: "1.0",
        context: "",
        method: "setPorts",
        params: { ports }
      },
      void 0,
      options
    );
  }
  async setPortStateSequence(port, sequence, options) {
    await this._postJsonEncoded(
      "/axis-cgi/io/portmanagement.cgi",
      {
        apiVersion: "1.0",
        context: "",
        method: "setStateSequence",
        params: { port, sequence }
      },
      void 0,
      options
    );
  }
  //  -------------------------------
  //             pwdgrp.cgi
  //  -------------------------------
  async addCameraUser(username, pass, sgrp, comment, options) {
    const res = await this._postUrlEncoded(
      "/axis-cgi/pwdgrp.cgi",
      {
        action: "add",
        user: username,
        pwd: pass,
        grp: "users",
        sgrp,
        comment
      },
      options
    );
    await _VapixAPI.checkTextResponseForError(res);
  }
  async getCameraUsers(options) {
    const res = await this._postUrlEncoded(
      "/axis-cgi/pwdgrp.cgi",
      {
        action: "get"
      },
      options
    );
    const responseText = await _VapixAPI.checkTextResponseForError(res);
    const viewersString = responseText.match(/^viewer="([a-z0-9,]*)"/im)?.[1] ?? "";
    return viewersString.split(",");
  }
  async editCameraUser(username, pass, options) {
    const res = await this._postUrlEncoded(
      "/axis-cgi/pwdgrp.cgi",
      {
        action: "update",
        user: username,
        pwd: pass
      },
      options
    );
    await _VapixAPI.checkTextResponseForError(res);
  }
  //  -------------------------------
  //        Continuous recording
  //  -------------------------------
  async getRecordingRuleList(options) {
    const res = await this._getText("/axis-cgi/record/continuous/listconfiguration.cgi", void 0, options);
    const resultNode = _VapixAPI.parseXmlResponse(res, "continuousrecordingconfigurations");
    const configurationNodes = resultNode.getElementsByTagName("continuousrecordingconfiguration");
    const configs = [];
    for (const node of configurationNodes) {
      if (isNullish(node)) {
        continue;
      }
      configs.push({
        profile: node.getAttribute("profile") ?? "",
        diskid: node.getAttribute("diskid") ?? "",
        options: _VapixAPI.parseQueryString(node.getAttribute("options")),
        eventid: node.getAttribute("eventid") ?? ""
      });
    }
    return configs;
  }
  async addRecordingRule(params, options) {
    const res = await this._getText("/axis-cgi/record/continuous/addconfiguration.cgi", params, options);
    const resultNode = _VapixAPI.parseXmlResponse(res, "configure");
    const result = resultNode.getAttribute("result");
    if (result !== "OK") {
      throw new Error(resultNode.getAttribute("errormsg") ?? result ?? "Unknown error");
    }
    return resultNode.getAttribute("profile");
  }
  async removeRecordingRule(profileId, options) {
    const res = await this._getText(
      "/axis-cgi/record/continuous/removeconfiguration.cgi",
      {
        profile: profileId
      },
      options
    );
    const resultNode = _VapixAPI.parseXmlResponse(res, "remove");
    const result = resultNode.getAttribute("result");
    if (result !== "OK") {
      throw new Error(resultNode.getAttribute("errormsg") ?? result ?? "Unknown error");
    }
  }
  async getDiskInfo(diskId = "all", options) {
    const res = await this._getText(
      "/axis-cgi/disks/list.cgi",
      {
        diskid: diskId
      },
      options
    );
    const resultNode = _VapixAPI.parseXmlResponse(res, "disks");
    const disks = resultNode.getElementsByTagName("disk");
    if (isNullish(disks) || disks.length === 0) {
      return false;
    }
    const requiredReadyProps = {
      status: "OK",
      locked: "no",
      readonly: "no"
    };
    for (const disk of disks) {
      let isReady = true;
      for (const name in requiredReadyProps) {
        const value = disk.getAttribute(name);
        isReady = isReady && requiredReadyProps[name] === value;
      }
      if (isReady) {
        return true;
      }
    }
    return false;
  }
  //  -------------------------------
  //          application API
  //  -------------------------------
  async getApplicationList(options) {
    const agent = this.getClient(options?.proxyParams);
    const res = await agent.get({ path: "/axis-cgi/applications/list.cgi", timeout: options?.timeout });
    const xml = await res.text();
    const parser = new XMLParser({
      ignoreAttributes: false,
      attributeNamePrefix: "",
      allowBooleanAttributes: true
    });
    const result = parser.parse(xml);
    let apps = result.reply.application ?? [];
    if (!Array.isArray(apps)) {
      apps = [apps];
    }
    const appList = apps.map((app) => {
      return {
        ...app,
        appId: ALL_APP_IDS.find((id) => id.toLowerCase() === app.Name.toLowerCase()) ?? null
      };
    });
    return applicationListSchema.parse(appList);
  }
  async startApplication(applicationId, options) {
    const agent = this.getClient(options?.proxyParams);
    const res = await agent.get({
      path: "/axis-cgi/applications/control.cgi",
      parameters: {
        package: applicationId.toLowerCase(),
        action: "start"
      },
      timeout: options?.timeout
    });
    const text = (await res.text()).trim().toLowerCase();
    if (text !== "ok" && !(text.startsWith("error:") && text.substring(7) === "6")) {
      throw new ApplicationAPIError("START", text);
    }
  }
  async restartApplication(applicationId, options) {
    const agent = this.getClient(options?.proxyParams);
    const res = await agent.get({
      path: "/axis-cgi/applications/control.cgi",
      parameters: {
        package: applicationId.toLowerCase(),
        action: "restart"
      },
      timeout: options?.timeout
    });
    const text = (await res.text()).trim().toLowerCase();
    if (text !== "ok") {
      throw new ApplicationAPIError("RESTART", text);
    }
  }
  async stopApplication(applicationId, options) {
    const agent = this.getClient(options?.proxyParams);
    const res = await agent.get({
      path: "/axis-cgi/applications/control.cgi",
      parameters: {
        package: applicationId.toLowerCase(),
        action: "stop"
      },
      timeout: options?.timeout
    });
    const text = (await res.text()).trim().toLowerCase();
    if (text !== "ok" && !(text.startsWith("error:") && text.substring(7) === "6")) {
      throw new ApplicationAPIError("STOP", text);
    }
  }
  async installApplication(data, fileName, options) {
    const formData = new this.CustomFormData();
    formData.append("packfil", data, fileName);
    const agent = this.getClient(options?.proxyParams);
    const res = await agent.post({
      path: "/axis-cgi/applications/upload.cgi",
      data: formData,
      headers: {
        contentType: "application/octet-stream"
      },
      timeout: options?.timeout ?? 3e5
      // 5 min
    });
    if (!res.ok) {
      throw new ErrorWithResponse(res);
    }
    const text = await res.text();
    if (text.length > 5) {
      throw new ApplicationAPIError("INSTALL", text);
    }
  }
  //   ----------------------------------------
  //                   Private
  //   ----------------------------------------
  static parseQueryString = (queryString) => {
    const entries = queryString?.split("&").filter((x) => x !== "").map((x) => x.split("=", 2));
    return !isNullish(entries) ? Object.fromEntries(entries) : {};
  };
  static checkTextResponseForError = async (response) => {
    const responseText = await response.text();
    const isError = responseText.match(/Error:([^<]*)/);
    if (!isNullish(isError)) {
      throw new ErrorWithResponse(response);
    }
    return responseText;
  };
  static parseParameters = (response) => {
    const params = {};
    const lines = response.split(/[\r\n]/);
    for (const line of lines) {
      if (line.length === 0 || line.substring(0, 7) === "# Error") {
        continue;
      }
      const delimiterPos = line.indexOf("=");
      if (delimiterPos !== -1) {
        const paramName = line.substring(0, delimiterPos).replace("root.", "");
        const paramValue = line.substring(delimiterPos + 1);
        params[paramName] = paramValue;
      }
    }
    return params;
  };
  static parseCameraPtzResponse = (response) => {
    const json = JSON.parse(response);
    const parsed = {};
    Object.keys(json).forEach((key) => {
      if (!key.startsWith("Camera ")) {
        return;
      }
      const camera = Number(key.replace("Camera ", ""));
      if (json[key].presets !== void 0) {
        parsed[camera] = _VapixAPI.parsePtz(json[key].presets);
      }
    });
    return parsed;
  };
  static parsePtz = (parsed) => {
    const res = [];
    parsed.forEach((value) => {
      const delimiterPos = value.indexOf("=");
      if (delimiterPos === -1) {
        return;
      }
      if (!value.startsWith("presetposno")) {
        return;
      }
      const id = Number(value.substring(11, delimiterPos));
      if (Number.isNaN(id)) {
        return;
      }
      const data = value.substring(delimiterPos + 1).split(":");
      const getValue = (valueName) => {
        for (const d of data) {
          const p = d.split("=");
          if (p[0] === valueName) {
            return Number(p[1]);
          }
        }
        return 0;
      };
      res.push({
        id,
        name: data[0] ?? "Preset " + id,
        data: {
          pan: getValue("pan"),
          tilt: getValue("tilt"),
          zoom: getValue("zoom")
        }
      });
    });
    return res;
  };
  static parseXmlResponse = (xml, nodeName) => {
    const doc = new DOMParser().parseFromString(xml, "text/xml");
    const node = doc.getElementsByTagName(nodeName);
    if (node.length !== 1 || isNullish(node[0])) {
      throw new Error("Invalid XML from camera");
    }
    return node[0];
  };
};

// src/helpers.ts
var jsonParseCameraParam = (param, paramName) => {
  if (param === "") {
    return {};
  }
  try {
    return JSON.parse(param);
  } catch {
    try {
      return JSON.parse(decodeURIComponent(param.replaceAll("\\", "")));
    } catch (e) {
      throw new JsonParseError(paramName, param);
    }
  }
};

// src/CamSwitcherAPI.ts
var BASE_PATH3 = "/local/camswitcher/api";
var CamSwitcherAPI = class extends BasicAPI {
  constructor(client, CustomFormData = FormData) {
    super(client);
    this.CustomFormData = CustomFormData;
    this.vapixAgent = new VapixAPI(client);
  }
  CustomFormData;
  vapixAgent;
  static getProxyPath = () => `${BASE_PATH3}/proxy.cgi`;
  static getWsEventsPath = () => `/local/camswitcher/events`;
  static getClipPreviewPath = (clipId, storage) => `${BASE_PATH3}/clip_preview.cgi?clip_name=${clipId}&storage=${storage}`;
  async checkAPIAvailable(options) {
    await this._getJson(`${BASE_PATH3}/api_check.cgi`, void 0, options);
  }
  async checkCameraTime(options) {
    const res = await this._getJson(`${BASE_PATH3}/camera_time.cgi`, void 0, options);
    return external_exports.boolean().parse(res.data);
  }
  async getNetworkCameraList(options) {
    const res = await this._getJson(`${BASE_PATH3}/network_camera_list.cgi`, void 0, options);
    return networkCameraListSchema.parse(res.data);
  }
  async generateSilence(sampleRate, channels, options) {
    const res = await this._getJson(
      `${BASE_PATH3}/generate_silence.cgi`,
      {
        sample_rate: sampleRate.toString(),
        channels
      },
      options
    );
    if (res.status !== 200) {
      throw new GenerateSilenceError(res.message);
    }
  }
  async getMaxFps(source, options) {
    const res = await this._getJson(
      `${BASE_PATH3}/get_max_framerate.cgi`,
      {
        video_source: source
      },
      options
    );
    return external_exports.number().parse(res.data);
  }
  async getStorageInfo(options) {
    const res = await this._getJson(`${BASE_PATH3}/get_storage.cgi`, void 0, options);
    return storageInfoListSchema.parse(res.data);
  }
  //   ----------------------------------------
  //                 Websockets
  //   ----------------------------------------
  async wsAuthorization(options) {
    const res = await this._getJson(`${BASE_PATH3}/ws_authorization.cgi`, void 0, options);
    return external_exports.string().parse(res.data);
  }
  async getOutputInfo(options) {
    const res = await this._getJson(`${BASE_PATH3}/output_info.cgi`, void 0, options);
    return outputInfoSchema.parse(res.data);
  }
  async getAudioPushInfo(options) {
    const res = await this._getJson(`${BASE_PATH3}/audio_push_info.cgi`, void 0, options);
    return audioPushInfoSchema.parse(res.data);
  }
  //   ----------------------------------------
  //                   Sources
  //   ----------------------------------------
  async getStreamSaveList(options) {
    const res = await this._getJson(`${BASE_PATH3}/streams.cgi`, { action: "get" }, options);
    return streamSaveLoadSchema.parse(res.data);
  }
  async getClipSaveList(options) {
    const res = await this._getJson(`${BASE_PATH3}/clips.cgi`, { action: "get" }, options);
    return clipSaveLoadSchema.parse(res.data);
  }
  async getPlaylistSaveList(options) {
    const res = await this._getJson(`${BASE_PATH3}/playlists.cgi`, { action: "get" }, options);
    return playlistSaveLoadSchema.parse(res.data);
  }
  async getTrackerSaveList(options) {
    const res = await this._getJson(`${BASE_PATH3}/trackers.cgi`, { action: "get" }, options);
    return trackerSaveLoadSchema.parse(res.data);
  }
  async setStreamSaveList(data, options) {
    await this._post(`${BASE_PATH3}/streams.cgi`, JSON.stringify(data), { action: "set" }, options);
  }
  async setClipSaveList(data, options) {
    await this._post(`${BASE_PATH3}/clips.cgi`, JSON.stringify(data), { action: "set" }, options);
  }
  async setPlaylistSaveList(data, options) {
    await this._post(`${BASE_PATH3}/playlists.cgi`, JSON.stringify(data), { action: "set" }, options);
  }
  async setTrackerSaveList(data, options) {
    await this._post(`${BASE_PATH3}/trackers.cgi`, JSON.stringify(data), { action: "set" }, options);
  }
  //   ----------------------------------------
  //                 Playlists
  //   ----------------------------------------
  async playlistSwitch(playlistName, options) {
    await this._getJson(`${BASE_PATH3}/playlist_switch.cgi`, { playlist_name: playlistName }, options);
  }
  async playlistQueuePush(playlistName, options) {
    await this._getJson(`${BASE_PATH3}/playlist_queue_push.cgi`, { playlist_name: playlistName }, options);
  }
  async playlistQueueClear(options) {
    await this._getJson(`${BASE_PATH3}/playlist_queue_clear.cgi`, void 0, options);
  }
  async playlistQueueList(options) {
    const res = await this._getJson(`${BASE_PATH3}/playlist_queue_list.cgi`, void 0, options);
    return playlistQueueSchema.parse(res.data).playlistQueueList;
  }
  async playlistQueuePlayNext(options) {
    await this._getJson(`${BASE_PATH3}/playlist_queue_play_next.cgi`, void 0, options);
  }
  //   ----------------------------------------
  //                   Clips
  //   ----------------------------------------
  async addNewClip(file, clipType, storage, clipId, fileName, options) {
    const path = `${BASE_PATH3}/clip_upload.cgi`;
    const formData = new this.CustomFormData();
    formData.append("clip_name", clipId);
    formData.append("clip_type", clipType);
    formData.append("file", file, fileName);
    const agent = this.getClient(options?.proxyParams);
    const res = await agent.post({
      path,
      data: formData,
      parameters: {
        storage
      },
      timeout: options?.timeout
    });
    const output = await res.json();
    if (output.status !== 200) {
      throw new AddNewClipError(output.message);
    }
  }
  async removeClip(clipId, storage, options) {
    await this._getJson(`${BASE_PATH3}/clip_remove.cgi`, { clip_name: clipId, storage }, options);
  }
  async getClipList(options) {
    const res = await this._getJson(`${BASE_PATH3}/clip_list.cgi`, void 0, options);
    return clipListSchema.parse(res.data).clip_list;
  }
  //   ----------------------------------------
  //               Configuration
  //   ----------------------------------------
  //* ******************   Set
  setCamSwitchOptions(data, cameraFWVersion, options) {
    const bitrateData = {
      bitrateMode: data.bitrateMode,
      maximumBitRate: data.maximumBitRate,
      retentionTime: data.retentionTime,
      bitRateLimit: data.bitRateLimit
    };
    const bitrateVapixParams = parseBitrateOptionsToVapixParams(cameraFWVersion, data.bitrateMode, bitrateData);
    const saveData = {
      video: {
        resolution: data.resolution,
        h264Profile: data.h264Profile,
        fps: data.fps,
        compression: data.compression,
        govLength: data.govLength,
        videoClipQuality: data.maximumBitRate,
        bitrateVapixParams
      },
      audio: {
        sampleRate: data.audioSampleRate,
        channelCount: data.audioChannelCount
      },
      keyboard: data.keyboard
    };
    return this.setParamFromCameraJSON(CSW_PARAM_NAMES.SETTINGS, saveData, options);
  }
  setGlobalAudioSettings(settings, options) {
    let acceptedType = "NONE";
    if (settings.type === "source" && settings.source) {
      if (isClip(settings.source)) {
        acceptedType = "CLIP";
      } else {
        acceptedType = "STREAM";
      }
    }
    const data = {
      type: acceptedType,
      stream_name: settings.source,
      clip_name: settings.source,
      storage: settings.storage
    };
    return this.setParamFromCameraJSON(CSW_PARAM_NAMES.MASTER_AUDIO, data, options);
  }
  setSecondaryAudioSettings(settings, options) {
    const data = {
      type: settings.type,
      stream_name: settings.streamName ?? "",
      clip_name: settings.clipName ?? "",
      storage: settings.storage,
      secondary_audio_level: settings.secondaryAudioLevel,
      master_audio_level: settings.masterAudioLevel
    };
    return this.setParamFromCameraJSON(CSW_PARAM_NAMES.SECONDARY_AUDIO, data, options);
  }
  setDefaultPlaylist(playlistId, options) {
    const value = JSON.stringify({ default_playlist_id: playlistId });
    return this.vapixAgent.setParameter(
      {
        [CSW_PARAM_NAMES.DEFAULT_PLAYLIST]: value
      },
      options
    );
  }
  setPermanentRtspUrlToken(token, options) {
    return this.vapixAgent.setParameter({ [CSW_PARAM_NAMES.RTSP_TOKEN]: token }, options);
  }
  //* ******************   Get
  async getCamSwitchOptions(options) {
    const saveData = await this.getParamFromCameraAndJSONParse(CSW_PARAM_NAMES.SETTINGS, options);
    if (isNullish(saveData.video)) {
      return;
    }
    const settings = {
      audioSampleRate: saveData.audio?.sampleRate,
      audioChannelCount: saveData.audio?.channelCount,
      keyboard: saveData.keyboard,
      fps: saveData.video.fps,
      resolution: saveData.video.resolution,
      h264Profile: saveData.video.h264Profile,
      compression: saveData.video.compression,
      govLength: saveData.video.govLength,
      bitrateVapixParams: saveData.video.bitrateVapixParams
    };
    if (!isNullish(saveData.video.bitrateVapixParams)) {
      const bitrateOptions = parseVapixParamsToBitrateOptions(saveData.video.bitrateVapixParams);
      settings.bitrateMode = bitrateOptions.bitrateMode;
      settings.maximumBitRate = bitrateOptions.maximumBitRate;
      settings.retentionTime = bitrateOptions.retentionTime;
      settings.bitRateLimit = bitrateOptions.bitRateLimit;
    }
    if (!isNullish(saveData.video.bitrateLimit)) {
      settings.maximumBitRate = saveData.video.bitrateLimit;
      settings.bitrateMode = "MBR";
    }
    if (!isNullish(saveData.video.videoClipQuality)) {
      settings.maximumBitRate = saveData.video.videoClipQuality;
    }
    return cameraOptionsSchema.parse(settings);
  }
  async getGlobalAudioSettings(options) {
    const settings = {
      type: "fromSource",
      source: "fromSource"
    };
    const res = await this.getParamFromCameraAndJSONParse(CSW_PARAM_NAMES.MASTER_AUDIO, options);
    if (res.type === "STREAM") {
      settings.type = "source";
      settings.source = res.stream_name;
    } else if (res.type === "CLIP") {
      settings.type = "source";
      settings.source = res.clip_name;
      settings.storage = res.storage;
    }
    return globalAudioSettingsSchema.parse(settings);
  }
  async getSecondaryAudioSettings(options) {
    const res = await this.getParamFromCameraAndJSONParse(CSW_PARAM_NAMES.SECONDARY_AUDIO, options);
    const settings = {
      type: res.type ?? "NONE",
      streamName: res.stream_name,
      clipName: res.clip_name,
      storage: res.storage ?? "SD_DISK",
      secondaryAudioLevel: res.secondary_audio_level ?? 1,
      masterAudioLevel: res.master_audio_level ?? 1
    };
    return secondaryAudioSettingsSchema.parse(settings);
  }
  async getPermanentRtspUrlToken(options) {
    const paramName = CSW_PARAM_NAMES.RTSP_TOKEN;
    const res = await this.vapixAgent.getParameter([paramName], options);
    return external_exports.string().parse(res[paramName] ?? "");
  }
  //   ----------------------------------------
  //                   Report
  //   ----------------------------------------
  downloadReport(options) {
    return this._getText(`${BASE_PATH3}/report.cgi`, void 0, options);
  }
  //   ----------------------------------------
  //                   Private
  //   ----------------------------------------
  setParamFromCameraJSON(paramName, data, options) {
    const params = {};
    params[paramName] = JSON.stringify(data);
    return this.vapixAgent.setParameter(params, options);
  }
  async getParamFromCameraAndJSONParse(paramName, options) {
    const data = await this.vapixAgent.getParameter([paramName], options);
    if (data[paramName] === void 0) {
      throw new ParameterNotFoundError(paramName);
    }
    return jsonParseCameraParam(data[paramName] + "", paramName);
  }
  //   ----------------------------------------
  //                   Data backup
  //   ----------------------------------------
  async getUploadedFileList(clipName, storage, options) {
    const res = await this._getJson(`${BASE_PATH3}/clip_files.cgi`, { clip_name: clipName, storage }, options);
    return clipFilesListSchema.parse(res).data.files;
  }
  async downloadClipFile(fileName, storage, options) {
    return await this._getBlob(`${BASE_PATH3}/clip_download_file.cgi`, { file_name: fileName, storage }, options);
  }
  async uploadClipFiles(files, storage, options) {
    const formData = new FormData();
    for (const file of files) {
      formData.append(file.name, file);
    }
    await this._post(`${BASE_PATH3}/clip_upload_file.cgi`, formData, { storage }, options);
  }
};
var CSW_PARAM_NAMES = {
  SETTINGS: "Camswitcher.Settings",
  MASTER_AUDIO: "Camswitcher.MasterAudio",
  SECONDARY_AUDIO: "Camswitcher.SecondaryAudio",
  RTSP_TOKEN: "Camswitcher.RTSPAccessToken",
  DEFAULT_PLAYLIST: "Camswitcher.DefaultPlaylist"
};

// src/types/ws/CamSwitcherEvents.ts
var cswEventsDataSchema = external_exports.discriminatedUnion("type", [
  external_exports.object({ type: external_exports.literal("authorization"), state: external_exports.string() }),
  external_exports.object({
    type: external_exports.literal("PlaylistSwitch"),
    playlist_name: external_exports.string()
  }),
  external_exports.object({
    type: external_exports.literal("StreamAvailable"),
    stream_name: external_exports.string(),
    state: external_exports.boolean()
  }),
  external_exports.object({
    type: external_exports.literal("StreamSwitchAudio"),
    stream_name: external_exports.string().optional(),
    clip_name: external_exports.string().optional(),
    master_audio: external_exports.boolean()
  }),
  external_exports.object({
    type: external_exports.literal("StreamSwitchVideoError"),
    playlist_name: external_exports.string(),
    playlist_active_stream: external_exports.number(),
    stream_name: external_exports.string().optional(),
    clip_name: external_exports.string().optional(),
    info: external_exports.string()
  }),
  external_exports.object({
    type: external_exports.literal("StreamSwitchAudioError"),
    stream_name: external_exports.string().optional(),
    clip_name: external_exports.string().optional(),
    master_audio: external_exports.boolean()
  }),
  external_exports.object({
    type: external_exports.literal("StreamSwitchVideo"),
    playlist_active_stream: external_exports.number(),
    stream_name: external_exports.string().optional(),
    playlist_name: external_exports.string().optional(),
    clip_name: external_exports.string().optional()
  }),
  external_exports.object({
    type: external_exports.literal("PlaylistQueueChange"),
    queue: external_exports.array(external_exports.string())
  }),
  external_exports.object({
    type: external_exports.literal("ClipUpload"),
    clip_name: external_exports.string().optional()
  }),
  external_exports.object({
    type: external_exports.literal("SwitcherStop"),
    default_playlist_id: external_exports.string().optional()
  }),
  external_exports.object({
    type: external_exports.literal("SwitcherStart"),
    default_playlist_id: external_exports.string().optional()
  }),
  external_exports.object({
    type: external_exports.literal("MediaServerStarted")
  }),
  external_exports.object({
    type: external_exports.literal("ClipRemove"),
    clip_name: external_exports.string()
  })
]);
var cswEventsSchema = external_exports.discriminatedUnion("type", [
  external_exports.object({ type: external_exports.literal("init"), data: cswEventsDataSchema }),
  ...cswEventsDataSchema.options
]);

// src/ws/CamSwitcherEvents.ts
var CamSwitcherEvents = class extends WsEvents {
  constructor(ws, getAuthToken) {
    super((data) => cswEventsSchema.parse(data), ws);
    this.getAuthToken = getAuthToken;
    this.ws.onOpen = this.sendInitMsg;
  }
  getAuthToken;
  sendInitMsg = async () => {
    try {
      const token = await this.getAuthToken();
      this.ws.send(JSON.stringify({ authorization: token }));
    } catch (error) {
      console.error("Error on open:", error);
      this.ws.reconnect();
    }
  };
};

// src/types/PlaneTrackerAPI.ts
var wsAliasResponseSchema = external_exports.object({
  alias: external_exports.string(),
  ws: external_exports.string(),
  ws_initial_message: external_exports.string()
});
var connectionSchema = external_exports.object({
  protocol: external_exports.union([external_exports.literal("http"), external_exports.literal("https"), external_exports.literal("https_insecure")]),
  ip: external_exports.union([external_exports.string().ip(), external_exports.literal("")]),
  port: external_exports.number().positive().lt(65535),
  user: external_exports.string(),
  pass: external_exports.string()
});
var milestoneCameraListSchema = external_exports.object({
  index: external_exports.number(),
  value: external_exports.string(),
  label: external_exports.string()
}).array();
var widgetSchema = external_exports.object({
  enabled: external_exports.boolean().default(true),
  coord: external_exports.union([
    external_exports.literal("top_left"),
    external_exports.literal("top_right"),
    external_exports.literal("bottom_left"),
    external_exports.literal("bottom_right")
  ]),
  posX: external_exports.number().nonnegative(),
  posY: external_exports.number().nonnegative(),
  scale: external_exports.number().positive()
});
var labelOptionsSchema = external_exports.union([
  external_exports.literal("blank"),
  external_exports.literal("registration"),
  external_exports.literal("call_sign"),
  external_exports.literal("flight_number"),
  external_exports.literal("icao")
]);
var identificationLabelSchema = external_exports.object({
  firstRow: labelOptionsSchema,
  secondRow: labelOptionsSchema,
  thirdRow: labelOptionsSchema,
  fourthRow: labelOptionsSchema,
  opacity: external_exports.number().positive()
});
var cameraSettingsSchema = external_exports.object({
  units: external_exports.union([external_exports.literal("metric"), external_exports.literal("imperial")]).default("imperial"),
  adsbSource: external_exports.object({
    enabled: external_exports.boolean().default(true),
    ip: external_exports.union([external_exports.string().ip(), external_exports.literal("")]),
    port: external_exports.number().positive().lt(65535),
    useSystemTime: external_exports.boolean().default(false)
  }).default({ enabled: true, ip: "", port: 30334, useSystemTime: false }),
  dronetagSource: external_exports.object({
    enabled: external_exports.boolean().default(false)
  }).default({ enabled: false }),
  camera: connectionSchema.default({
    protocol: "http",
    ip: "127.0.0.1",
    port: 80,
    user: "root",
    pass: ""
  }),
  cameraCalibrationProcessConfig: external_exports.object({
    nightSkyCalibrationEnabled: external_exports.boolean(),
    scheduleNightSkyCalibrationTimestamp: external_exports.number(),
    nightSkyCalibrationRepeatCount: external_exports.number().int().min(1).max(6).default(1),
    nightSkyCalibrationFocusValue: external_exports.number().int().min(1).max(9999).default(9e3),
    focusCalibrationPoints: external_exports.string().default("")
  }).default({
    nightSkyCalibrationEnabled: false,
    scheduleNightSkyCalibrationTimestamp: 0,
    nightSkyCalibrationRepeatCount: 1,
    nightSkyCalibrationFocusValue: 9e3,
    focusCalibrationPoints: ""
  }),
  cameraConfig: external_exports.object({
    defaultCaptureSizeMeters: external_exports.number().positive().default(120),
    captureSizeExtensionMeters: external_exports.number().positive().default(80)
  }).default({
    defaultCaptureSizeMeters: 120,
    captureSizeExtensionMeters: 80
  }),
  stream: external_exports.object({
    width: external_exports.number().positive(),
    height: external_exports.number().positive()
  }).default({ width: 1920, height: 1080 }),
  imageConfig: external_exports.object({
    dayAperture: external_exports.number().nonnegative().min(0).max(100),
    nightAperture: external_exports.number().nonnegative().min(0).max(100),
    maxGain: external_exports.number().nonnegative().min(0).max(100).default(100)
  }).default({ dayAperture: 50, nightAperture: 0, maxGain: 100 }),
  airportConfig: external_exports.object({
    icao: external_exports.string().default(""),
    centerLat: external_exports.number(),
    centerLon: external_exports.number(),
    radius: external_exports.number().nonnegative().default(1e4)
  }).default({
    icao: "",
    centerLat: 0,
    centerLon: 0,
    radius: 1e4
  }),
  trackingConfig: external_exports.object({
    prioritizeEmergency: external_exports.boolean(),
    trackingZoneWeightIncrease: external_exports.number().int().nonnegative().default(0),
    guardTourEnabled: external_exports.boolean().default(false),
    guardTourId: external_exports.number().int().nonnegative().default(0)
  }).default({ prioritizeEmergency: true, guardTourEnabled: false, guardTourId: 0 }),
  overlayText: external_exports.object({
    displayIcao: external_exports.boolean().optional(),
    displayRegistration: external_exports.boolean().optional(),
    displayFlightNumber: external_exports.boolean().optional(),
    displayCallsign: external_exports.boolean().optional(),
    displayAltitude: external_exports.boolean().optional(),
    displayVelocity: external_exports.boolean().optional(),
    displayDistance: external_exports.boolean().optional(),
    displayFOV: external_exports.boolean().optional(),
    displayPTError: external_exports.boolean().optional(),
    displayPTZSpeed: external_exports.boolean().optional(),
    displayVelocityData: external_exports.boolean().optional(),
    displayAdsbVelocityData: external_exports.boolean().optional(),
    displaySignalQuality: external_exports.boolean().optional(),
    displayAutoTrackingInfo: external_exports.boolean().optional(),
    displayGPSCoords: external_exports.boolean().optional(),
    displayVapixQuery: external_exports.boolean().optional(),
    displayFocus: external_exports.boolean().optional(),
    displayAperture: external_exports.boolean().optional(),
    displayAircraftInfo: external_exports.boolean().optional(),
    displaySunDistance: external_exports.boolean().optional(),
    displayTickTime: external_exports.boolean().optional(),
    displaySystemInfo: external_exports.boolean().optional()
  }).optional(),
  widget: widgetSchema.default({
    enabled: true,
    coord: "top_right",
    posX: 10,
    posY: 10,
    scale: 100
  }),
  airportWidget: widgetSchema.extend({
    showWeather: external_exports.boolean().default(false),
    weatherLocationKey: external_exports.string().default(""),
    weatherLocationName: external_exports.string().default("")
  }).default({
    enabled: true,
    coord: "top_left",
    posX: 10,
    posY: 10,
    scale: 100,
    showWeather: false,
    weatherLocationKey: "",
    weatherLocationName: ""
  }),
  fr24FlightInfoSource: external_exports.object({
    enabled: external_exports.boolean().default(false),
    priority: external_exports.number().int().positive().default(1),
    apiToken: external_exports.string().default(""),
    validateFlights: external_exports.boolean().default(true)
  }).default({
    enabled: false,
    priority: 1,
    apiToken: "",
    validateFlights: true
  }),
  radarcapeFlightInfoSource: external_exports.object({
    enabled: external_exports.boolean().default(false),
    priority: external_exports.number().int().positive().default(2),
    ip: external_exports.union([external_exports.string().ip(), external_exports.literal("")]).default(""),
    port: external_exports.number().positive().lt(65535).default(80)
  }).default({
    enabled: false,
    priority: 2,
    ip: "",
    port: 80
  }),
  identificationLabel: identificationLabelSchema.default({
    firstRow: "registration",
    secondRow: "blank",
    thirdRow: "blank",
    fourthRow: "blank",
    opacity: 30
  }),
  acs: connectionSchema.extend({
    enabled: external_exports.boolean(),
    sourceKey: external_exports.string()
  }).default({
    enabled: false,
    protocol: "https_insecure",
    ip: "",
    port: 29204,
    user: "",
    pass: "",
    sourceKey: ""
  }),
  milestone: connectionSchema.extend({
    enabled: external_exports.boolean(),
    cameraList: external_exports.string().array().default([])
  }).default({
    enabled: false,
    protocol: "https_insecure",
    ip: "",
    port: 443,
    user: "",
    pass: "",
    cameraList: []
  }),
  camstreamerIntegration: external_exports.object({
    adPlacementEnabled: external_exports.boolean(),
    adMinIntervalSec: external_exports.number().int().nonnegative(),
    adShortDurationSec: external_exports.number().int().nonnegative(),
    adLongDurationSec: external_exports.number().int().nonnegative()
  }).default({
    adPlacementEnabled: false,
    adMinIntervalSec: 1800,
    adShortDurationSec: 10,
    adLongDurationSec: 30
  })
});
var serverSettingsSchema = external_exports.object({
  cameraCalibration: external_exports.object({
    posLat: external_exports.number(),
    posLon: external_exports.number(),
    geoidHN: external_exports.number(),
    altitudeAmsl: external_exports.number(),
    rotationEast: external_exports.number(),
    rotationNorth: external_exports.number(),
    rotationUp: external_exports.number(),
    tiltTransformationCoefA: external_exports.number(),
    tiltCameraKnownPoint: external_exports.number(),
    tiltRealKnownPoint: external_exports.number(),
    calibrationParamA: external_exports.number().default(0),
    // internal calibration parameter
    calibrationParamB: external_exports.number().default(0),
    // internal calibration parameter
    calibrationParamC: external_exports.number().default(0),
    // internal calibration parameter
    calibrationParamD: external_exports.number().default(0),
    // internal calibration parameter
    panErrorCorrection: external_exports.array(
      external_exports.object({
        cameraPan: external_exports.number(),
        realPan: external_exports.number()
      })
    ).default([])
  }).default({
    posLat: 50,
    posLon: 14,
    geoidHN: 45,
    altitudeAmsl: 372,
    rotationEast: 0,
    rotationNorth: 0,
    rotationUp: 0,
    tiltTransformationCoefA: 1,
    tiltCameraKnownPoint: 90,
    tiltRealKnownPoint: 90,
    calibrationParamA: 0,
    calibrationParamB: 0,
    calibrationParamC: 0,
    calibrationParamD: 0,
    panErrorCorrection: []
  })
});
var getIcaoSchema = external_exports.object({
  icao: external_exports.string(),
  targetId: external_exports.string()
});
var trackingModeSchema = external_exports.object({
  mode: external_exports.union([external_exports.literal("MANUAL"), external_exports.literal("AUTOMATIC")]).default("AUTOMATIC")
});
var flightInfoSchema = external_exports.object({
  callsign: external_exports.string().optional(),
  flightNumber: external_exports.string().optional(),
  registration: external_exports.string().optional(),
  aircraftType: external_exports.string().optional(),
  airlines: external_exports.string().optional(),
  originAirport: external_exports.object({
    icao: external_exports.string().optional(),
    iata: external_exports.string().optional(),
    city: external_exports.string().optional()
  }).optional(),
  destinationAirport: external_exports.object({
    icao: external_exports.string().optional(),
    iata: external_exports.string().optional(),
    city: external_exports.string().optional()
  }),
  flightImages: external_exports.array(
    external_exports.object({
      src: external_exports.string().optional(),
      photographer: external_exports.string().optional()
    })
  ).optional()
});
var listEntryDomainSchema = external_exports.enum(["adsb", "remoteId"]);
var listEntryIdTypeSchema = external_exports.enum(["icao", "type_icao", "drone_mac", "operator_mac", "category"]);
var listEntrySchema = external_exports.object({
  domain: listEntryDomainSchema,
  idType: listEntryIdTypeSchema,
  idValue: external_exports.string().min(1)
});
var priorityListEntrySchema = listEntrySchema.extend({
  priority: external_exports.number().int().min(1)
});
var whiteListSchema = external_exports.object({
  list: external_exports.array(listEntrySchema).default([])
});
var blackListSchema = external_exports.object({
  list: external_exports.array(listEntrySchema).default([])
});
var priorityListSchema = external_exports.object({
  list: external_exports.array(priorityListEntrySchema).default([])
});
var friendlyListSchema = external_exports.object({
  list: external_exports.array(listEntrySchema).default([])
});
var mapTypeSchema = external_exports.enum(["roadmap", "satellite"]);
var mapInfoSchema = external_exports.object({
  minZoom: external_exports.number().nonnegative(),
  maxZoom: external_exports.number().nonnegative(),
  mapTypes: external_exports.array(mapTypeSchema),
  tileSize: external_exports.number().nonnegative()
});
var domainIdSchema = external_exports.enum(["adsb", "remoteId"]);
var zonePerimeterSchema = external_exports.enum(["none", "outer", "inner"]);
var zonesSchema = external_exports.object({
  zones: external_exports.array(
    external_exports.object({
      enabled: external_exports.boolean().default(true),
      name: external_exports.string().optional(),
      area: external_exports.array(
        external_exports.object({
          lat: external_exports.number(),
          lon: external_exports.number()
        })
      ).nonempty(),
      minAltitudeAmsl: external_exports.number().optional(),
      maxAltitudeAmsl: external_exports.number().optional(),
      minSpeedKmph: external_exports.number().optional(),
      maxSpeedKmph: external_exports.number().optional(),
      flightDirection: external_exports.enum(["all", "arrival", "departure"]).default("all"),
      runwayDirectionDeg: external_exports.number().min(0).max(360).optional(),
      weight: external_exports.number(),
      perimeter: zonePerimeterSchema.default("none"),
      trackingDomains: external_exports.array(domainIdSchema).default(["adsb", "remoteId"])
    })
  ).default([])
});
var categoryIconSchema = external_exports.enum(["small", "large", "heavy", "helicopter", "drone", "operator", "vehicle", "unknown"]);
var categoryDescriptorSchema = external_exports.object({
  categoryId: external_exports.string(),
  uiName: external_exports.string(),
  icon: categoryIconSchema
});
var domainDescriptorSchema = external_exports.object({
  uiName: external_exports.string(),
  icon: categoryIconSchema,
  categoryList: external_exports.array(categoryDescriptorSchema)
});
var domainListSchema = external_exports.record(domainIdSchema, domainDescriptorSchema);
var ADSB_CATEGORY_IDS = {
  A_LIGHT: "A_LIGHT",
  A_SMALL: "A_SMALL",
  A_LARGE: "A_LARGE",
  A_HIGH_VORTEX: "A_HIGH_VORTEX",
  A_HEAVY: "A_HEAVY",
  A_HIGH_PERF: "A_HIGH_PERF",
  A_ROTORCRAFT: "A_ROTORCRAFT",
  B_GLIDER: "B_GLIDER",
  B_LIGHTER_THAN_AIR: "B_LIGHTER_THAN_AIR",
  B_PARACHUTIST: "B_PARACHUTIST",
  B_ULTRALIGHT: "B_ULTRALIGHT",
  B_UAV: "B_UAV",
  B_SPACE: "B_SPACE",
  C_SURFACE_EMERGENCY: "C_SURFACE_EMERGENCY",
  C_SERVICE_VEHICLE: "C_SERVICE_VEHICLE",
  C_POINT_OBSTACLE: "C_POINT_OBSTACLE",
  C_CLUSTER_OBSTACLE: "C_CLUSTER_OBSTACLE",
  C_LINE_OBSTACLE: "C_LINE_OBSTACLE",
  UNKNOWN: "UNKNOWN"
};
var REMOTE_ID_CATEGORY_IDS = {
  DRONE: "DRONE",
  OPERATOR: "OPERATOR"
};

// src/PlaneTrackerAPI.ts
var BASE_PATH4 = "/local/planetracker";
var PlaneTrackerAPI = class extends BasicAPI {
  constructor(client, apiUser) {
    super(client);
    this.apiUser = apiUser;
  }
  apiUser;
  static getProxyPath = () => `${BASE_PATH4}/proxy.cgi`;
  static getWsEventsPath = () => `${BASE_PATH4}/package/ws`;
  async checkAPIAvailable(options) {
    await this._getJson(`${BASE_PATH4}/api_check.cgi`, void 0, options);
  }
  async checkCameraTime(options) {
    const res = await this._getJson(`${BASE_PATH4}/camera_time.cgi`, void 0, options);
    return external_exports.boolean().parse(res.state);
  }
  async serverRunCheck(options) {
    const agent = this.getClient(options?.proxyParams);
    const res = await agent.get({
      path: `${BASE_PATH4}/package/serverRunCheck.cgi`,
      timeout: options?.timeout
    });
    return res.status === 200;
  }
  async getLiveViewAlias(rtspUrl, options) {
    const agent = this.getClient(options?.proxyParams);
    const res = await agent.get({
      path: `${BASE_PATH4}/getLiveViewAlias.cgi`,
      parameters: { rtsp_url: rtspUrl },
      timeout: options?.timeout
    });
    return wsAliasResponseSchema.parse(await res.json());
  }
  //   ----------------------------------------
  //                 Calibration
  //   ----------------------------------------
  async resetPtzCalibration(options) {
    const agent = this.getClient(options?.proxyParams);
    const res = await agent.get({
      path: `${BASE_PATH4}/package/resetPtzCalibration.cgi`,
      parameters: this.apiUser,
      timeout: options?.timeout
    });
    if (!res.ok) {
      throw new ResetCalibrationError("PTZ", res);
    }
  }
  async resetFocusCalibration(options) {
    const agent = this.getClient(options?.proxyParams);
    const res = await agent.get({
      path: `${BASE_PATH4}/package/resetFocusCalibration.cgi`,
      parameters: this.apiUser,
      timeout: options?.timeout
    });
    if (!res.ok) {
      throw new ResetCalibrationError("FOCUS", res);
    }
  }
  async triggerFocusReview(options) {
    const agent = this.getClient(options?.proxyParams);
    const res = await agent.get({
      path: `${BASE_PATH4}/package/triggerFocusReview.cgi`,
      parameters: this.apiUser,
      timeout: options?.timeout
    });
    if (!res.ok) {
      if (res.status === 400) {
        throw new BadRequestError(res);
      }
      if (res.status === 500) {
        throw new ServerError();
      }
    }
  }
  //   ----------------------------------------
  //                   Settings
  //   ----------------------------------------
  async fetchCameraSettings(options) {
    const res = await this._getJson(`${BASE_PATH4}/package_camera_settings.cgi`, { action: "get" }, options);
    return cameraSettingsSchema.parse(res);
  }
  async setCameraSettings(settings, options) {
    await this._postJsonEncoded(
      `${BASE_PATH4}/package_camera_settings.cgi`,
      settings,
      {
        action: "set"
      },
      options
    );
  }
  async fetchServerSettings(options) {
    const res = await this._getJson(`${BASE_PATH4}/package_server_settings.cgi`, { action: "get" }, options);
    return serverSettingsSchema.parse(res);
  }
  async exportAppSettings(dataType, options) {
    return await this._getBlob(`${BASE_PATH4}/package_data.cgi`, { action: "EXPORT", dataType }, options);
  }
  async importAppSettings(dataType, formData, options) {
    const agent = this.getClient(options?.proxyParams);
    const res = await agent.post({
      path: `${BASE_PATH4}/package_data.cgi`,
      data: formData,
      parameters: { action: "IMPORT", dataType },
      timeout: options?.timeout
    });
    if (!res.ok) {
      throw new ImportSettingsError(res);
    }
  }
  async getDomainList(options) {
    const res = await this._getJson(`${BASE_PATH4}/package/getDomainList.cgi`, { action: "get" }, options);
    return external_exports.object({ domainList: domainListSchema }).parse(res).domainList;
  }
  //   ----------------------------------------
  //             Planes & Tracking
  //   ----------------------------------------
  async fetchFlightInfo(targetId, options) {
    const res = await this._getJson(`${BASE_PATH4}/package/flightInfo.cgi`, { targetId }, options);
    return flightInfoSchema.parse(res);
  }
  async getTrackingMode(options) {
    const res = await this._getJson(`${BASE_PATH4}/package/getTrackingMode.cgi`, void 0, options);
    return trackingModeSchema.parse(res);
  }
  async setTrackingMode(mode, options) {
    await this._postJsonEncoded(`${BASE_PATH4}/package/setTrackingMode.cgi`, { mode }, this.apiUser, options);
  }
  // Backwards compatibility with older versions - to be removed in future major release
  async startTrackingPlane(icao, options) {
    const agent = this.getClient(options?.proxyParams);
    await agent.get({
      path: `${BASE_PATH4}/package/trackIcao.cgi`,
      parameters: { icao, ...this.apiUser },
      timeout: options?.timeout
    });
  }
  async stopTrackingPlane(options) {
    const agent = this.getClient(options?.proxyParams);
    await agent.get({
      path: `${BASE_PATH4}/package/resetIcao.cgi`,
      parameters: this.apiUser,
      timeout: options?.timeout
    });
  }
  async startTrackingTarget(targetId, options) {
    const agent = this.getClient(options?.proxyParams);
    await agent.get({
      path: `${BASE_PATH4}/package/trackTarget.cgi`,
      parameters: { targetId, ...this.apiUser },
      timeout: options?.timeout
    });
  }
  async stopTrackingTarget(options) {
    const agent = this.getClient(options?.proxyParams);
    await agent.get({
      path: `${BASE_PATH4}/package/resetTarget.cgi`,
      parameters: this.apiUser,
      timeout: options?.timeout
    });
  }
  async getIcao(by, value, options) {
    const res = await this._getJson(`${BASE_PATH4}/package/getIcao.cgi`, { [by]: value }, options);
    return getIcaoSchema.parse(res).targetId;
  }
  //   ----------------------------------------
  //                   Lists
  //   ----------------------------------------
  async getPriorityList(options) {
    const res = await this._getJson(`${BASE_PATH4}/package/getPriorityList.cgi`, void 0, options);
    return priorityListSchema.parse(res);
  }
  async setPriorityList(priorityList, options) {
    await this._postJsonEncoded(`${BASE_PATH4}/package/setPriorityList.cgi`, priorityList, this.apiUser, options);
  }
  async getWhiteList(options) {
    const res = await this._getJson(`${BASE_PATH4}/package/getWhiteList.cgi`, void 0, options);
    return whiteListSchema.parse(res);
  }
  async setWhiteList(whiteList, options) {
    await this._postJsonEncoded(`${BASE_PATH4}/package/setWhiteList.cgi`, whiteList, this.apiUser, options);
  }
  async getBlackList(options) {
    const res = await this._getJson(`${BASE_PATH4}/package/getBlackList.cgi`, void 0, options);
    return blackListSchema.parse(res);
  }
  async setBlackList(blackList, options) {
    await this._postJsonEncoded(`${BASE_PATH4}/package/setBlackList.cgi`, blackList, this.apiUser, options);
  }
  //   ----------------------------------------
  //                   Map & Zones
  //   ----------------------------------------
  async fetchMapInfo(options) {
    const res = await this._getJson(`${BASE_PATH4}/package/getMapInfo.cgi`, void 0, options);
    return mapInfoSchema.parse(res);
  }
  async getZones(options) {
    const res = await this._getJson(`${BASE_PATH4}/package/getZones.cgi`, void 0, options);
    return zonesSchema.parse(res);
  }
  async setZones(zones, options) {
    await this._postJsonEncoded(`${BASE_PATH4}/package/setZones.cgi`, zones, this.apiUser, options);
  }
  async goToCoordinates(lat, lon, alt, options) {
    const agent = this.getClient(options?.proxyParams);
    const res = await agent.get({
      path: `${BASE_PATH4}/package/goToCoordinates.cgi`,
      parameters: { lat, lon, alt, ...this.apiUser },
      timeout: options?.timeout
    });
    if (!res.ok) {
      if (res.status === 400 && res.statusText === "Cannot set coordinates in automatic mode") {
        throw new CannotSetCoordsInAutoModeError();
      }
      if (res.status === 400 && res.statusText === "Invalid lat/lon parameters") {
        throw new InvalidLatLngError();
      }
      if (res.status === 400 && res.statusText === "Invalid alt parameter") {
        throw new InvalidAltitudeError();
      }
      if (res.status === 400) {
        throw new BadRequestError(res);
      }
      if (res.status === 500) {
        throw new ServerError();
      }
    }
  }
  //   ----------------------------------------
  //                   Milestone
  //   ----------------------------------------
  async checkMilestoneConnection(params, options) {
    try {
      await this._postUrlEncoded(`${BASE_PATH4}/package/checkMilestoneConnection.cgi`, { ...params }, options);
      return true;
    } catch {
      return false;
    }
  }
  async getMilestoneCameraList(params, options) {
    const res = await this._postUrlEncoded(
      `${BASE_PATH4}/package/getMilestoneCameraList.cgi`,
      { ...params },
      options
    );
    return milestoneCameraListSchema.parse(await res.json());
  }
  //   ----------------------------------------
  //                   Report
  //   ----------------------------------------
  downloadReport(options) {
    return this._getText(`${BASE_PATH4}/report.cgi`, void 0, options);
  }
};

// src/types/ws/PlaneTrackerEvents.ts
var wsApiFlightDataSchema = external_exports.object({
  targetId: external_exports.string(),
  icao: external_exports.string(),
  // for backward compatibility
  domain: domainIdSchema,
  categoryId: external_exports.string(),
  groupId: external_exports.string().optional(),
  lat: external_exports.number(),
  // estimated/extrapolated current position (legacy; external consumers rely on this)
  lon: external_exports.number(),
  observedLat: external_exports.number(),
  // raw observation position (un-extrapolated)
  observedLon: external_exports.number(),
  // Epoch ms of the raw observation — pairs with observedLat/observedLon.
  positionTimestamp: external_exports.number(),
  heading: external_exports.number(),
  groundSpeed: external_exports.number(),
  // [km/h]
  altitudeAMSL: external_exports.number(),
  // [m]
  cameraDistance: external_exports.number(),
  // [m]
  // 1-based rank in the automatic selection order (1 = best candidate); null when the target is excluded from automatic selection
  autoTrackingOrder: external_exports.number().nullable(),
  whiteListed: external_exports.boolean(),
  blackListed: external_exports.boolean(),
  priorityListed: external_exports.boolean(),
  friendlyListed: external_exports.boolean(),
  autoSelectionIgnored: external_exports.boolean(),
  signalQuality: external_exports.number(),
  emitterCategorySet: external_exports.number().default(4),
  emitterCategory: external_exports.number().default(3),
  emergencyState: external_exports.boolean(),
  emergencyStatusMessage: external_exports.string()
});
var wsCameraPositionDataSchema = external_exports.object({
  lat: external_exports.number(),
  lon: external_exports.number(),
  azimuth: external_exports.number().min(0).max(360),
  elevation: external_exports.number().min(-90).max(90),
  fov: external_exports.number(),
  // Epoch ms when the PTZ angles were sampled. Enables time-accurate,
  // continuous cone animation on the client.
  sampledAt: external_exports.number()
});
var userSchema = external_exports.object({
  userId: external_exports.string(),
  userName: external_exports.string(),
  userPriority: external_exports.string()
});
var apiUserSchema = userSchema.extend({
  ip: external_exports.string(),
  userPriority: external_exports.number()
});
var EUserActions = /* @__PURE__ */ ((EUserActions2) => {
  EUserActions2["TRACK_ICAO"] = "trackIcao.cgi";
  EUserActions2["TRACK_TARGET"] = "trackTarget.cgi";
  EUserActions2["RESET_ICAO"] = "resetIcao.cgi";
  EUserActions2["RESET_TARGET"] = "resetTarget.cgi";
  EUserActions2["SET_PRIORITY_LIST"] = "setPriorityList.cgi";
  EUserActions2["SET_BLACK_LIST"] = "setBlackList.cgi";
  EUserActions2["SET_WHITE_LIST"] = "setWhiteList.cgi";
  EUserActions2["SET_FRIENDLY_LIST"] = "setFriendlyList.cgi";
  EUserActions2["GO_TO_COORDINATES"] = "goToCoordinates.cgi";
  EUserActions2["SET_TRACKING_MODE"] = "setTrackingMode.cgi";
  EUserActions2["SET_ZONES"] = "setZones.cgi";
  EUserActions2["RESET_PTZ_CALIBRATION"] = "resetPtzCalibration.cgi";
  EUserActions2["LOCK_API"] = "lockApi.cgi";
  EUserActions2["UNLOCK_API"] = "unlockApi.cgi";
  return EUserActions2;
})(EUserActions || {});
var eventsDataSchema = external_exports.union([
  external_exports.object({ type: external_exports.literal("CAMERA_POSITION") }).merge(wsCameraPositionDataSchema),
  external_exports.object({
    type: external_exports.literal("TRACKING_START"),
    icao: external_exports.string(),
    targetId: external_exports.string(),
    domain: domainIdSchema,
    categoryId: external_exports.string()
  }),
  external_exports.object({ type: external_exports.literal("TRACKING_STOP") }),
  external_exports.object({ type: external_exports.literal("FLIGHT_LIST"), list: external_exports.array(wsApiFlightDataSchema) }),
  external_exports.object({
    type: external_exports.literal("USER_ACTION"),
    cgi: external_exports.literal("trackIcao.cgi" /* TRACK_ICAO */),
    ip: external_exports.string(),
    params: userSchema.extend({ icao: external_exports.string() }),
    postJsonBody: external_exports.any()
  }),
  external_exports.object({
    type: external_exports.literal("USER_ACTION"),
    cgi: external_exports.literal("trackTarget.cgi" /* TRACK_TARGET */),
    ip: external_exports.string(),
    params: userSchema.extend({ targetId: external_exports.string() }),
    postJsonBody: external_exports.any()
  }),
  external_exports.object({
    type: external_exports.literal("USER_ACTION"),
    cgi: external_exports.literal("resetIcao.cgi" /* RESET_ICAO */),
    ip: external_exports.string(),
    params: userSchema,
    postJsonBody: external_exports.any()
  }),
  external_exports.object({
    type: external_exports.literal("USER_ACTION"),
    cgi: external_exports.literal("resetTarget.cgi" /* RESET_TARGET */),
    ip: external_exports.string(),
    params: userSchema,
    postJsonBody: external_exports.any()
  }),
  external_exports.object({
    type: external_exports.literal("USER_ACTION"),
    cgi: external_exports.literal("setPriorityList.cgi" /* SET_PRIORITY_LIST */),
    ip: external_exports.string(),
    params: userSchema,
    postJsonBody: priorityListSchema
  }),
  external_exports.object({
    type: external_exports.literal("USER_ACTION"),
    cgi: external_exports.literal("setBlackList.cgi" /* SET_BLACK_LIST */),
    ip: external_exports.string(),
    params: userSchema,
    postJsonBody: blackListSchema
  }),
  external_exports.object({
    type: external_exports.literal("USER_ACTION"),
    cgi: external_exports.literal("setWhiteList.cgi" /* SET_WHITE_LIST */),
    ip: external_exports.string(),
    params: userSchema,
    postJsonBody: whiteListSchema
  }),
  external_exports.object({
    type: external_exports.literal("USER_ACTION"),
    cgi: external_exports.literal("setFriendlyList.cgi" /* SET_FRIENDLY_LIST */),
    ip: external_exports.string(),
    params: userSchema,
    postJsonBody: friendlyListSchema
  }),
  external_exports.object({
    type: external_exports.literal("USER_ACTION"),
    cgi: external_exports.literal("goToCoordinates.cgi" /* GO_TO_COORDINATES */),
    ip: external_exports.string(),
    params: userSchema.extend({ lat: external_exports.string(), lon: external_exports.string() }),
    postJsonBody: external_exports.any()
  }),
  external_exports.object({
    type: external_exports.literal("USER_ACTION"),
    cgi: external_exports.literal("setTrackingMode.cgi" /* SET_TRACKING_MODE */),
    ip: external_exports.string(),
    params: userSchema,
    postJsonBody: trackingModeSchema
  }),
  external_exports.object({
    type: external_exports.literal("USER_ACTION"),
    cgi: external_exports.literal("setZones.cgi" /* SET_ZONES */),
    ip: external_exports.string(),
    params: userSchema,
    postJsonBody: zonesSchema
  }),
  external_exports.object({
    type: external_exports.literal("USER_ACTION"),
    cgi: external_exports.literal("resetPtzCalibration.cgi" /* RESET_PTZ_CALIBRATION */),
    ip: external_exports.string(),
    params: userSchema,
    postJsonBody: external_exports.any()
  }),
  external_exports.object({
    type: external_exports.literal("USER_ACTION"),
    cgi: external_exports.literal("lockApi.cgi" /* LOCK_API */),
    ip: external_exports.string(),
    params: userSchema.extend({ timeout: external_exports.string() }),
    postJsonBody: external_exports.any()
  }),
  external_exports.object({
    type: external_exports.literal("USER_ACTION"),
    cgi: external_exports.literal("unlockApi.cgi" /* UNLOCK_API */),
    ip: external_exports.string(),
    params: userSchema,
    postJsonBody: external_exports.any()
  }),
  external_exports.object({ type: external_exports.literal("CONNECTED_USERS"), users: external_exports.array(apiUserSchema) }),
  external_exports.object({
    type: external_exports.literal("FORCE_TRACKING_STATUS"),
    enabled: external_exports.boolean(),
    icao: external_exports.string().optional(),
    targetId: external_exports.string().optional()
  }),
  external_exports.object({ type: external_exports.literal("API_LOCK_STATUS"), isLocked: external_exports.boolean(), user: apiUserSchema.optional() })
]);
var ptrEventsSchema = external_exports.union([
  external_exports.object({ type: external_exports.literal("init"), data: eventsDataSchema }),
  ...eventsDataSchema.options
]);

// src/ws/PlaneTrackerEvents.ts
var PlaneTrackerEvents = class extends WsEvents {
  constructor(ws, _apiUser) {
    super((data) => ptrEventsSchema.parse(data), ws);
    this._apiUser = _apiUser;
    this.ws.onOpen = this.sendInitMsg;
  }
  _apiUser;
  sendInitMsg = () => {
    this.ws.send(
      JSON.stringify({
        type: "USER_INFO",
        userId: this._apiUser.userId,
        userName: this._apiUser.userName,
        userPriority: this._apiUser.userPriority
      })
    );
  };
};

// src/types/CamScripterAPI.ts
var nodeStateSchema = external_exports.object({
  node_state: external_exports.union([external_exports.literal("OK"), external_exports.literal("NOT_INSTALLED"), external_exports.literal("NOT_FOUND")])
});
var packageInfoListSchema = external_exports.array(
  external_exports.object({
    storage: storageTypeSchema,
    manifest: external_exports.object({
      package_name: external_exports.string(),
      package_menu_name: external_exports.string(),
      package_version: external_exports.string(),
      vendor: external_exports.string(),
      required_camscripter_version: external_exports.string().optional(),
      required_camscripter_rbi_version: external_exports.string().optional(),
      ui_link: external_exports.string()
    })
  })
);
var packageConfigSchema = external_exports.record(external_exports.string(), external_exports.object({ enabled: external_exports.boolean() }));
var cameraStorageSchema = external_exports.union([
  external_exports.tuple([
    external_exports.object({ type: flashStorageTypeSchema, capacity_mb: external_exports.number() }),
    external_exports.object({ type: sdCardStorageTypeSchema, capacity_mb: external_exports.number() })
  ]),
  external_exports.tuple([external_exports.object({ type: flashStorageTypeSchema, capacity_mb: external_exports.number() })])
]);
var camscripterApiResponseSchema = external_exports.object({
  status: external_exports.number(),
  message: external_exports.string()
});

// src/CamScripterAPI.ts
var BASE_PATH5 = "/local/camscripter";
var CamScripterAPI = class extends BasicAPI {
  static getProxyPath = () => `${BASE_PATH5}/proxy.cgi`;
  async checkAPIAvailable(options) {
    await this._getJson(`${BASE_PATH5}/api_check.cgi`, void 0, options);
  }
  async checkCameraTime(options) {
    const res = await this._getJson(`${BASE_PATH5}/camera_time.cgi`, void 0, options);
    return zod_default.boolean().parse(res.state);
  }
  async getNetworkCameraList(options) {
    const res = await this._getJson(`${BASE_PATH5}/network_camera_list.cgi`, void 0, options);
    return networkCameraListSchema.parse(res.camera_list);
  }
  //   ----------------------------------------
  //                   Packages
  //   ----------------------------------------
  async getStorageInfo(options) {
    const res = await this._getJson(`${BASE_PATH5}/package/get_storage.cgi`, void 0, options);
    return cameraStorageSchema.parse(res);
  }
  async getPackageList(options) {
    const res = await this._getJson(`${BASE_PATH5}/package/list.cgi`, void 0, options);
    return packageInfoListSchema.parse(res);
  }
  async installPackages(formData, storage, options) {
    await this._post(`${BASE_PATH5}/package/install.cgi`, formData, { storage }, options);
  }
  async uninstallPackage(packageId, options) {
    await this._getJson(`${BASE_PATH5}/package/remove.cgi`, { package_name: packageId }, options);
  }
  async importSettings(packageId, formData, options) {
    await this._post(
      `${BASE_PATH5}/package/data.cgi`,
      formData,
      {
        action: "IMPORT",
        package_name: packageId
      },
      options
    );
  }
  async exportSettings(packageId, formData, options) {
    await this._post(
      `${BASE_PATH5}/package/data.cgi`,
      formData,
      {
        action: "EXPORT",
        package_name: packageId
      },
      options
    );
  }
  //   ----------------------------------------
  //                   Node.js
  //   ----------------------------------------
  async getNodejsStatus(options) {
    const res = await this._getJson(`${BASE_PATH5}/diagnostics.cgi`, void 0, options);
    return nodeStateSchema.parse(res);
  }
  async installNodejs(storage, options) {
    await this._getJson(`${BASE_PATH5}/node_update.cgi`, { storage }, options);
  }
  //   ----------------------------------------
  //                   Report
  //   ----------------------------------------
  downloadReport(options) {
    return this._getText(`${BASE_PATH5}/report.cgi`, void 0, options);
  }
};

// src/web/DefaultClient.ts
var DefaultClient = class {
  constructor(domain = "", headers = {}) {
    this.domain = domain;
    this.headers = headers;
  }
  domain;
  headers;
  get = (params) => {
    return this.fetchWithTimeout(
      addParametersToPath(params.path, params.parameters),
      {
        method: "GET",
        headers: { ...this.headers, ...params.headers }
      },
      params.timeout
    );
  };
  post = (params) => {
    return this.fetchWithTimeout(
      addParametersToPath(params.path, params.parameters),
      {
        method: "POST",
        body: params.data,
        headers: { ...this.headers, ...params.headers }
      },
      params.timeout
    );
  };
  async fetchWithTimeout(path, options, timeout) {
    const controller = new AbortController();
    const timeoutId = timeout !== void 0 ? setTimeout(() => controller.abort(), timeout) : null;
    try {
      return await fetch(`${this.domain}${path}`, { ...options, signal: controller.signal });
    } finally {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    }
  }
};

// src/web/DeviceConnectClient.ts
var DeviceConnectClient = class extends DefaultClient {
  constructor(deviceAccessToken, host) {
    super(`https://${host}`, { authorization: `Bearer ${deviceAccessToken}` });
  }
};

// src/web/WsClient.ts
var REFRESH_TIMEOUT = 5e3;
var WsClient = class {
  constructor(getUrl) {
    this.getUrl = getUrl;
  }
  getUrl;
  isDestroyed = false;
  ws = null;
  restartTimeout = null;
  init() {
    if (this.isDestroyed) {
      return;
    }
    this.destroyWebsocket();
    const ws = new WebSocket(this.getUrl(), "events");
    ws.binaryType = "arraybuffer";
    ws.onopen = () => this.onOpen();
    ws.onmessage = (e) => this.onMessage(e.data);
    ws.onclose = () => {
      this.restartTimeout = window.setTimeout(() => this.init(), REFRESH_TIMEOUT);
    };
    this.ws = ws;
  }
  send = (msg) => {
    this.ws?.send(msg);
  };
  // set by WsEvents
  onMessage = (_) => {
  };
  onOpen = () => {
  };
  onClose = () => {
  };
  onError = (error) => {
    console.error(error);
  };
  reconnect = () => {
    this.ws?.close();
  };
  destroy = () => {
    this.isDestroyed = true;
    this.destroyWebsocket();
  };
  destroyWebsocket() {
    if (this.restartTimeout !== null) {
      clearTimeout(this.restartTimeout);
      this.restartTimeout = null;
    }
    if (!this.ws) {
      return;
    }
    this.ws.onmessage = null;
    this.ws.onopen = null;
    this.ws.onclose = null;
    if (this.ws.readyState === this.ws.OPEN) {
      this.ws.close();
    }
    this.ws = null;
  }
};

// src/web/DeviceConnectWsClient.ts
var DeviceConnectWsClient = class extends WsClient {
  constructor(deviceAccessToken, host, getPath) {
    super(() => {
      const path = getPath();
      const andChar = path.includes("?") ? "&" : "?";
      return `wss://${host}${path}${andChar}DEVICE_ACCESS_TOKEN=${deviceAccessToken}`;
    });
  }
};
export {
  ADSB_CATEGORY_IDS,
  ALL_APP_IDS,
  APP_IDS,
  AddNewClipError,
  ApplicationAPIError,
  AudioType,
  BadRequestError,
  CamOverlayAPI,
  CamOverlayEvents,
  CamScripterAPI,
  CamStreamerAPI,
  CamStreamerEvents,
  CamSwitcherAPI,
  CamSwitcherEvents,
  CannotSetCoordsInAutoModeError,
  DefaultClient,
  DeviceConnectClient,
  DeviceConnectWsClient,
  EUserActions,
  ErrorWithResponse,
  FIRMWARE_WITH_BITRATE_MODES_SUPPORT,
  FIRMWARE_WITH_OVERLAYS_SUPPORT,
  FetchDeviceInfoError,
  GenerateSilenceError,
  ImageType,
  ImportSettingsError,
  InvalidAltitudeError,
  InvalidLatLngError,
  JsonParseError,
  MaxFPSError,
  MigrationError,
  NoDeviceInfoError,
  PORT_PARAMS,
  ParameterNotFoundError,
  ParsingBlobError,
  PlaneTrackerAPI,
  PlaneTrackerEvents,
  ProxyClient,
  PtzNotSupportedError,
  REMOTE_ID_CATEGORY_IDS,
  ResetCalibrationError,
  SDCardActionError,
  SDCardJobError,
  ServerError,
  ServiceNotFoundError,
  ServiceUnavailableError,
  SettingParameterError,
  StorageDataFetchError,
  TimezoneFetchError,
  TimezoneNotSetupError,
  UtcTimeFetchError,
  VapixAPI,
  WsAuthorizationError,
  WsClient,
  accuweatherSchema,
  addParametersToPath,
  allDateTimeInfoSchema,
  applicationListSchema,
  applicationSchema,
  arrayToUrl,
  assertVersionString,
  audioChannelCountSchema,
  audioChannelSchema,
  audioDeviceConnectionTypeSchema,
  audioDeviceInputOutputSchema,
  audioDeviceRequestSchema,
  audioDeviceSchema,
  audioDeviceSignalingChannelTypeSchema,
  audioDeviceSignalingTypeSchema,
  audioFileListSchema,
  audioFileSchema,
  audioFileStorageTypeSchema,
  audioLocalSchema,
  audioPushInfoSchema,
  audioSampleRatesResponseSchema,
  audioUrlSchema,
  bitrateModeSchema,
  bitrateVapixParamsSchema,
  blackListSchema,
  booleanSchema,
  cameraOptionsSchema,
  cameraPTZItemDataSchema,
  cameraPTZItemSchema,
  cameraSettingsSchema,
  cameraStorageSchema,
  camscripterApiResponseSchema,
  clipFilesListSchema,
  clipListSchema,
  clipSaveLoadSchema,
  clipSaveSchema,
  coEventsSchema,
  connectionSchema,
  coordinateSystemSchema,
  csEventsSchema,
  cswEventsSchema,
  customGraphicsSchema,
  daCastSchema,
  dailymotionSchema,
  dateTimeinfoSchema,
  diagnosticsParamsSchema,
  diagnosticsSchema,
  domainIdSchema,
  domainListSchema,
  facebookRtmpSchema,
  facebookSchema,
  fieldSchema,
  fileSchema,
  firmwareVersionCompare,
  fixVersionToDots,
  flashStorageTypeSchema,
  flightInfoSchema,
  fontFileDataSchema,
  fontFileListSchema,
  fontFileSchema,
  fontFileStorageTypeSchema,
  fontSchema,
  fontStorageDataListSchema,
  fontStorageResponseSchema,
  friendlyListSchema,
  gameChangerSchema,
  getFileDataSchema,
  getFileListSchema,
  getFileSchema,
  getIcaoSchema,
  getPortsResponseSchema,
  getStorageDataListSchema,
  getStorageResponseSchema,
  globalAudioSettingsSchema,
  globalAudioSettingsTypeSchema,
  guardTourSchema,
  h264ProfileSchema,
  hlsPullSchema,
  hlsPushSchema,
  htmlOverlaySchema,
  ibmSchema,
  imageFileDataSchema,
  imageFileListSchema,
  imageFileSchema,
  imageFileStorageTypeSchema,
  imageFilestorageDataListSchema,
  imageStorageResponseSchema,
  imagesSchema,
  infoTickerSchema,
  internalVapixParametersSchema,
  isAccuweather,
  isBaseballScoreBoard,
  isBaseballScoreBoardAutomatic,
  isCamera,
  isClip,
  isCustomGraphics,
  isDaCastStream,
  isDailymotionStream,
  isFacebookRtmpStream,
  isFacebookStream,
  isFirmwareVersionAtLeast,
  isGameChangerStream,
  isHlsPullStream,
  isHlsPushStream,
  isHtmlOverlay,
  isIbmStream,
  isImages,
  isInfoticker,
  isLoopPlayType,
  isMicrosoftAzureStream,
  isMicrosoftStream,
  isMpegDvbStream,
  isNullish,
  isPip,
  isPlaylist,
  isPtz,
  isPtzCompass,
  isRtmpStream,
  isScoreBoard,
  isScoreOverview,
  isScreenSharing,
  isSdCardStream,
  isSrtStream,
  isStream,
  isTracker,
  isTwitchStream,
  isVersionAtLeast,
  isVimeoStream,
  isWebCameraSharing,
  isWindyStream,
  isWowzaStream,
  isYouTubeStream,
  isYoutubeRtmpStream,
  jsonParseCameraParam,
  keyboardShortcutSchema,
  keyboardShortcutsSchema,
  languageSchema,
  listEntryDomainSchema,
  listEntryIdTypeSchema,
  listEntrySchema,
  mapInfoSchema,
  mapTypeSchema,
  mappingZoneSchema,
  mappingZonesCountdownSettingsSchema,
  maxFpsResponseSchema,
  microsoftAzureSchema,
  microsoftStreamSchema,
  milestoneCameraListSchema,
  mpegDvbSchema,
  networkCameraListSchema,
  nodeStateSchema,
  outputInfoSchema,
  overlaySchema,
  packageConfigSchema,
  packageInfoListSchema,
  pad,
  paramToUrl,
  parseBitrateOptionsToVapixParams,
  parseVapixParamsToBitrateOptions,
  parseVapixParamsToVideoOptions,
  parseVideoOptionsToVapixParams,
  pipSchema,
  playlistQueueSchema,
  playlistSaveLoadSchema,
  portSequenceStateSchema,
  portSetSchema,
  portStatusSchema,
  priorityListEntrySchema,
  priorityListSchema,
  ptrEventsSchema,
  ptzCompassSchema,
  ptzOverviewSchema,
  ptzSchema,
  recordingConfigItemSchema,
  rtmpSchema,
  screenSharingSchema,
  sdCardInfoSchema,
  sdCardSchema,
  sdCardStorageTypeSchema,
  sdCardWatchedStatuses,
  secondaryAudioSettingsSchema,
  serverSettingsSchema,
  serviceCommonSchema,
  serviceListSchema,
  serviceNames,
  servicesSchema,
  sharingSchema,
  srtSchema,
  srtStreamStatisticsSchema,
  storageInfoListSchema,
  storageListSchema,
  storageTypeSchema,
  streamCommonSchema,
  streamListSchema,
  streamPlatforms,
  streamSaveLoadSchema,
  streamSchema,
  streamStatsSchema,
  timeZoneSchema,
  trackerSaveLoadSchema,
  trackerSaveSchema,
  trackingModeSchema,
  twitchSchema,
  versionCompare,
  vimeoSchema,
  weatherUnitSchema,
  webCameraSharingSchema,
  whiteListSchema,
  widgetSchema,
  windySchema,
  wowzaSchema,
  wsAliasResponseSchema,
  wsResponseSchema,
  youtubeRtmpSchema,
  youtubeSchema,
  zonePerimeterSchema,
  zonesSchema
};
