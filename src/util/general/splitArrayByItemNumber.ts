const splitArrayByItemNumber = <T>(array: T[], itemNumber: number): T[][] => {
  return array.reduce((acc, _, index) => {
    if (index % itemNumber === 0) {
      acc.push(array.slice(index, index + itemNumber));
    }

    return acc;
  }, [] as T[][]);
};

export default splitArrayByItemNumber;
