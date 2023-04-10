export const degreeToRadian = (degrees: number, reverse: boolean = false): number => {
  const radian = degrees * (Math.PI / 180);
  return reverse ? -radian : radian;
};
