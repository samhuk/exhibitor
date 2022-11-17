"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.COMPONENTS_BUNDLE_DIR = exports.COMPONENTS_BUNDLE_OUTPUT_FILE_NAME = exports.COMPONENTS_BUNDLE_INPUT_FILE_NAME = exports.COMPONENTS_BUNDLE_OUTPUT_DIR_NAME = exports.OUTPUT_ROOT_DIR = void 0;
const path_1 = __importDefault(require("path"));
exports.OUTPUT_ROOT_DIR = './.exh';
exports.COMPONENTS_BUNDLE_OUTPUT_DIR_NAME = 'components';
exports.COMPONENTS_BUNDLE_INPUT_FILE_NAME = 'index.exh.ts';
exports.COMPONENTS_BUNDLE_OUTPUT_FILE_NAME = 'index.exh.js';
exports.COMPONENTS_BUNDLE_DIR = path_1.default.join(exports.OUTPUT_ROOT_DIR, exports.COMPONENTS_BUNDLE_OUTPUT_DIR_NAME);
