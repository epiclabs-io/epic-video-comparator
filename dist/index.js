"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Comparator_1 = require("./Comparator");
function newComparator(config, container) {
    return new Comparator_1.Comparator(config, container);
}
exports.newComparator = newComparator;
