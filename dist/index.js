"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var Comparator_1 = require("./Comparator");
function newComparator(config, container) {
    return new Comparator_1.Comparator(config, container);
}
exports.newComparator = newComparator;
tslib_1.__exportStar(require("./Comparator"), exports);
