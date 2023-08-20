const nearestColor = require('nearest-color');
const tailwindConfig = require('../../../../tailwind.config.js');

export function getClosestTailwindColor(color: string) {
  return nearestColor.from(getTailwindColors())(color).name;
}

function getTailwindColors() {
  const tailwindColors = {} as any;

  for (const [key, value] of Object.entries(tailwindConfig.theme.colors)) {
    if (['inherit', 'current', 'transparent'].includes(key)) {
      continue;
    }

    if (typeof value === 'object') {
      Object.entries(value as any).forEach(([key2, value2]) => (tailwindColors[`${key}-${key2}`] = value2));
    } else {
      tailwindColors[key] = value;
    }
  }

  return tailwindColors;
}
