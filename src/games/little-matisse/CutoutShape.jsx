import { SHAPES } from './shapes';

/**
 * Single SVG cutout component.
 * Renders a Matisse-style cutout shape with colour, rotation, and size.
 * No drop shadows — Matisse cutouts are glued flush to paper.
 */
export default function CutoutShape({
  shape,       // key from SHAPES
  color,       // hex colour
  size = 100,  // px
  rotation = 0,
  style = {},
  className,
  ...rest
}) {
  const path = SHAPES[shape];
  if (!path) return null;

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      className={className}
      style={{
        display: 'block',
        transform: `rotate(${rotation}deg)`,
        ...style,
      }}
      {...rest}
    >
      <path d={path} fill={color} />
    </svg>
  );
}
