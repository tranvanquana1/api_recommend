"use strict";
exports.escapeRegExp = escapeRegExp;

function escapeRegExp(input) {
  if (!input) return "";
  return input.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"); // $& means the whole matched string
}
