"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
function _assert() {
  const data = _interopRequireDefault(require("assert"));
  _assert = function () {
    return data;
  };
  return data;
}
function _jsonSourcemap() {
  const data = require("@mischnic/json-sourcemap");
  _jsonSourcemap = function () {
    return data;
  };
  return data;
}
function _diagnostic() {
  const data = require("@parcel/diagnostic");
  _diagnostic = function () {
    return data;
  };
  return data;
}
function _plugin() {
  const data = require("@parcel/plugin");
  _plugin = function () {
    return data;
  };
  return data;
}
function _utils() {
  const data = require("@parcel/utils");
  _utils = function () {
    return data;
  };
  return data;
}
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
// https://developer.mozilla.org/en-US/docs/Web/Manifest
const RESOURCES_SCHEMA = {
  type: 'array',
  items: {
    type: 'object',
    properties: {
      src: {
        type: 'string',
        __validate: s => {
          if (s.length === 0) {
            return 'Must not be empty';
          }
        }
      }
    },
    required: ['src']
  }
};
const MANIFEST_SCHEMA = {
  type: 'object',
  properties: {
    icons: RESOURCES_SCHEMA,
    screenshots: RESOURCES_SCHEMA,
    shortcuts: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          icons: RESOURCES_SCHEMA
        }
      }
    }
  }
};
var _default = new (_plugin().Transformer)({
  async transform({ asset, options: { env } }) {
    const source = await asset.getCode();
    const {
      data,
      pointers
    } = (0, _jsonSourcemap().parse)(source);
    _utils().validateSchema.diagnostic(MANIFEST_SCHEMA, {
      source,
      map: {
        data,
        pointers
      },
      filePath: asset.filePath
    }, '@parcel/transformer-webmanifest', 'Invalid webmanifest');
    for (const key of ['icons', 'screenshots']) {
      const list = data[key];
      if (list) {
        (0, _assert().default)(Array.isArray(list));
        for (let i = 0; i < list.length; i++) {
          const res = list[i];
          res.src = asset.addURLDependency(res.src, {
            loc: {
              filePath: asset.filePath,
              ...(0, _diagnostic().getJSONSourceLocation)(pointers[`/${key}/${i}/src`], 'value')
            }
          });
        }
      }
    }
    if (data.shortcuts) {
      (0, _assert().default)(Array.isArray(data.shortcuts));
      for (let i = 0; i < data.shortcuts.length; i++) {
        const list = data.shortcuts[i].icons;
        if (list) {
          (0, _assert().default)(Array.isArray(list));
          for (let j = 0; j < list.length; j++) {
            const res = list[j];
            res.src = asset.addURLDependency(res.src, {
              loc: {
                filePath: asset.filePath,
                ...(0, _diagnostic().getJSONSourceLocation)(pointers[`/shortcuts/${i}/icons/${j}/src`], 'value')
              }
            });
          }
        }
      }
    }
        // console.log( 'built in', asset )\
    
    // asset.type = 'webmanifest';
    let json_string = JSON.stringify(data)
    const result = json_string.replace(/{{{ ([^}]+) }}}/g, (match, envKey) => {
        asset.invalidateOnEnvChange(envKey);
        return env[envKey] === undefined ? match : env[envKey];
    });
    asset.setCode(result);
    return [asset];
  }
});
exports.default = _default;