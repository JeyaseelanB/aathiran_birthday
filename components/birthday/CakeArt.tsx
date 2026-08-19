"use client";

import { motion, useReducedMotion } from "framer-motion";

type CakeArtProps = {
  /** Candle flames are hidden once the wish has been made. */
  lit?: boolean;
  className?: string;
};

/** Hand-built SVG birthday cake shared by the hero and the cake section. */
export default function CakeArt({ lit = true, className = "" }: CakeArtProps) {
  const reduceMotion = useReducedMotion();
  const candleX = [70, 100, 130];

  return (
    <svg
      viewBox="0 0 200 180"
      className={className}
      role="img"
      aria-label={lit ? "Birthday cake with lit candles" : "Birthday cake with candles blown out"}
    >
      <defs>
        <linearGradient id="cake-frosting" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#fff3fa" />
          <stop offset="100%" stopColor="#ffc2dd" />
        </linearGradient>
        <linearGradient id="cake-base" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#ffd9a3" />
          <stop offset="100%" stopColor="#f0a962" />
        </linearGradient>
        <linearGradient id="cake-mid" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#bfe4ff" />
          <stop offset="100%" stopColor="#7cc7ff" />
        </linearGradient>
      </defs>

      {/* Candles */}
      {candleX.map((x, index) => (
        <g key={x}>
          {lit && (
            <motion.g
              animate={reduceMotion ? undefined : { scaleY: [1, 1.25, 1], opacity: [0.85, 1, 0.85] }}
              transition={{ duration: 0.9, repeat: Infinity, delay: index * 0.15 }}
              style={{ originX: `${x}px`, originY: "56px" }}
            >
              <ellipse cx={x} cy={50} rx={5} ry={9} fill="#ffb43a" />
              <ellipse cx={x} cy={52} rx={2.6} ry={5.4} fill="#fff3b0" />
            </motion.g>
          )}
          <rect x={x - 4} y={60} width={8} height={30} rx={4} fill={index === 1 ? "#ff8fc2" : "#a97bff"} />
          <rect x={x - 4} y={60} width={8} height={30} rx={4} fill="url(#cake-frosting)" opacity={0.25} />
        </g>
      ))}

      {/* Tiers */}
      <rect x={62} y={88} width={76} height={26} rx={10} fill="url(#cake-mid)" />
      <rect x={46} y={110} width={108} height={30} rx={12} fill="url(#cake-frosting)" />
      <rect x={34} y={136} width={132} height={32} rx={14} fill="url(#cake-base)" />

      {/* Drips + sprinkles */}
      <path
        d="M34 140c10 10 16-6 26 2s16-8 26 1 16-8 26 1 16-8 26 2v-12H34z"
        fill="#fff6fb"
        opacity={0.85}
      />
      {[
        [58, 152],
        [80, 158],
        [104, 150],
        [126, 158],
        [146, 151],
        [70, 122],
        [96, 126],
        [122, 121],
      ].map(([cx, cy], i) => (
        <circle key={`${cx}-${cy}`} cx={cx} cy={cy} r={3} fill={i % 2 ? "#ff5fa2" : "#63dcc0"} />
      ))}

      {/* Plate */}
      <ellipse cx={100} cy={170} rx={82} ry={8} fill="#e6f0ff" />
    </svg>
  );
}
