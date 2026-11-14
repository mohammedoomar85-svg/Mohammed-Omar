import Svg, { Circle, Ellipse, Path, Polygon, Rect } from 'react-native-svg';

export const SHAPE_NAMES = {
  circle: { ar: 'دائرة', en: 'circle' },
  square: { ar: 'مربع', en: 'square' },
  triangle: { ar: 'مثلث', en: 'triangle' },
  star: { ar: 'نجمة', en: 'star' },
  heart: { ar: 'قلب', en: 'heart' },
  semicircle: { ar: 'نصف دائرة', en: 'semicircle' },
  rectangle: { ar: 'مستطيل', en: 'rectangle' },
  diamond: { ar: 'معيّن', en: 'diamond' },
  hexagon: { ar: 'سداسي', en: 'hexagon' },
  pentagon: { ar: 'خماسي', en: 'pentagon' },
  oval: { ar: 'بيضاوي', en: 'oval' },
};

const poly = (n, r = 44, rot = -90) =>
  Array.from({ length: n }, (_, i) => {
    const a = ((rot + (360 / n) * i) * Math.PI) / 180;
    return `${50 + r * Math.cos(a)},${50 + r * Math.sin(a)}`;
  }).join(' ');

const star = () =>
  Array.from({ length: 10 }, (_, i) => {
    const r = i % 2 ? 19 : 46;
    const a = ((-90 + 36 * i) * Math.PI) / 180;
    return `${50 + r * Math.cos(a)},${52 + r * Math.sin(a)}`;
  }).join(' ');

// Draws one shape in a 100x100 box.
export function Shape({ type, fill, size = 90, stroke }) {
  const p = { fill, stroke, strokeWidth: stroke ? 3 : 0 };
  let el;
  switch (type) {
    case 'circle':
      el = <Circle cx="50" cy="50" r="44" {...p} />;
      break;
    case 'square':
      el = <Rect x="8" y="8" width="84" height="84" rx="6" {...p} />;
      break;
    case 'triangle':
      el = <Polygon points="50,6 95,90 5,90" {...p} />;
      break;
    case 'star':
      el = <Polygon points={star()} {...p} />;
      break;
    case 'heart':
      el = <Path d="M50 88 C20 66 4 48 6 30 C8 14 22 6 34 8 C42 9 47 14 50 21 C53 14 58 9 66 8 C78 6 92 14 94 30 C96 48 80 66 50 88 Z" {...p} />;
      break;
    case 'semicircle':
      el = <Path d="M6 72 A44 44 0 0 1 94 72 Z" {...p} />;
      break;
    case 'rectangle':
      el = <Rect x="4" y="24" width="92" height="52" rx="6" {...p} />;
      break;
    case 'diamond':
      el = <Polygon points="50,4 92,50 50,96 8,50" {...p} />;
      break;
    case 'hexagon':
      el = <Polygon points={poly(6, 46, 0)} {...p} />;
      break;
    case 'pentagon':
      el = <Polygon points={poly(5, 46)} {...p} />;
      break;
    case 'oval':
      el = <Ellipse cx="50" cy="50" rx="46" ry="30" {...p} />;
      break;
    default:
      el = null;
  }
  return (
    <Svg width={size} height={size} viewBox="0 0 100 100">
      {el}
    </Svg>
  );
}
