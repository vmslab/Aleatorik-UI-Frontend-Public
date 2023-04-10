export const createCurvature = (
  startPosX: number,
  startPosY: number,
  endPosX: number,
  endPosY: number,
  curvatureValue: number,
  type: string,
) => {
  const lineX = startPosX;
  const lineY = startPosY;
  const x = endPosX;
  const y = endPosY;
  const curvature = curvatureValue;
  let hx1: number;
  let hx2: number;
  // type openclose open close other
  switch (type) {
    case "open":
      if (startPosX >= endPosX) {
        hx1 = lineX + Math.abs(x - lineX) * curvature;
        hx2 = x - Math.abs(x - lineX) * (curvature * -1);
      } else {
        hx1 = lineX + Math.abs(x - lineX) * curvature;
        hx2 = x - Math.abs(x - lineX) * curvature;
      }
      return ` M ${lineX} ${lineY} C ${hx1} ${lineY} ${hx2} ${y} ${x}  ${y}`;

    case "close":
      if (startPosX >= endPosX) {
        hx1 = lineX + Math.abs(x - lineX) * (curvature * -1);
        hx2 = x - Math.abs(x - lineX) * curvature;
      } else {
        hx1 = lineX + Math.abs(x - lineX) * curvature;
        hx2 = x - Math.abs(x - lineX) * curvature;
      }
      return ` M ${lineX} ${lineY} C ${hx1} ${lineY} ${hx2} ${y} ${x}  ${y}`;
    case "other":
      if (startPosX >= endPosX) {
        hx1 = lineX + Math.abs(x - lineX) * (curvature * -1);
        hx2 = x - Math.abs(x - lineX) * (curvature * -1);
      } else {
        hx1 = lineX + Math.abs(x - lineX) * curvature;
        hx2 = x - Math.abs(x - lineX) * curvature;
      }
      return ` M ${lineX} ${lineY} C ${hx1} ${lineY} ${hx2} ${y} ${x}  ${y}`;
    default:
      hx1 = lineX + Math.abs(x - lineX) * curvature;
      hx2 = x - Math.abs(x - lineX) * curvature;

      return ` M ${lineX} ${lineY} C ${hx1} ${lineY} ${hx2} ${y} ${x}  ${y}`;
  }
};
