const MAX_HEIGHT = 50;
const MIN_HEIGHT = 5;

export const getBuildingHeight = (properties) => {
  const height =
    properties.relativeheightmaximum ||
    properties.height_relativemax_m ||
    properties.absoluteheightmaximum ||
    10;

  return Math.min(Math.max(height, MIN_HEIGHT), MAX_HEIGHT);
};
