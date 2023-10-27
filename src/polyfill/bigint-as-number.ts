(BigInt.prototype as bigint & { toJSON(): number }).toJSON = function () {
  return Number(this);
};
