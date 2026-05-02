const getEucludianDistance = (encoding1: number[], encoding2: number[]): number => {
  if (encoding1.length !== encoding2.length) {
    throw new Error('Encodings must have same length');
  }

  let distance: number = 0;
  for (let i = 0; i < encoding1.length; i++) {
    distance += (encoding1[i] - encoding2[i]) ** 2;
  }
  return Math.sqrt(distance);
};

console.log(getEucludianDistance([1, 2, 3], [1, 2, 4]));
export default getEucludianDistance;
