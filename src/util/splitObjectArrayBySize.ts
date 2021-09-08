const splitObjectArrayBySize = (array: any[], limitInBytes: number) => {
  let chunk: any[] = [];
  const result = [chunk];
  let size;

  for (let index = 0; index < array.length; index++) {
    size = Buffer.byteLength(JSON.stringify(chunk.concat(array[index])));

    if (size > limitInBytes) {
      chunk = [];
      result.push(chunk);
    }

    chunk.push(array[index]);
  }

  return result;
};

export default splitObjectArrayBySize;
