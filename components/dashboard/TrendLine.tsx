import { formatCount } from "@/lib/time";

export interface TrendPoint {
  date: string;
  value: number;
}

// 轻量 SVG 折线图，自绘不依赖第三方库
export function TrendLine({ points }: { points: TrendPoint[] }) {
  if (points.length < 2) {
    return <div className="text-xs text-slate-500">数据点不足</div>;
  }
  const w = 280;
  const h = 80;
  const pad = 6;
  const values = points.map((p) => p.value);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = Math.max(1, max - min);

  const coords = points.map((p, i) => {
    const x = pad + (i / (points.length - 1)) * (w - pad * 2);
    const y = h - pad - ((p.value - min) / range) * (h - pad * 2);
    return [x, y] as const;
  });

  const linePath = coords.map(([x, y], i) => `${i === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`).join(" ");
  const areaPath = `${linePath} L${coords[coords.length - 1][0].toFixed(1)},${h - pad} L${coords[0][0].toFixed(1)},${h - pad} Z`;

  return (
    <div>
      <svg viewBox={`0 0 ${w} ${h}`} className="w-full" preserveAspectRatio="none">
        <path d={areaPath} fill="rgba(34,211,238,0.12)" />
        <path d={linePath} fill="none" stroke="#22d3ee" strokeWidth="2" />
        {coords.map(([x, y], i) => (
          <circle key={i} cx={x} cy={y} r="2" fill="#22d3ee" />
        ))}
      </svg>
      <div className="mt-1 flex justify-between text-[10px] text-slate-500">
        <span>{points[0].date.slice(5)}</span>
        <span className="text-accent">{formatCount(points[points.length - 1].value)}</span>
        <span>{points[points.length - 1].date.slice(5)}</span>
      </div>
    </div>
  );
}
