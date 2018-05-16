module.exports = (array, compareFunction) => {
  return array.every((_, i) => {
    if (i === 0) {
      return true;
    }
    return compareFunction(array[i], array[i - 1]) >= 0;
  });
};
