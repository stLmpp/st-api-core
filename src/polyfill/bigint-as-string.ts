(BigInt.prototype as bigint & { toJSON(): string }).toJSON = function () {
  return String(this);
};
