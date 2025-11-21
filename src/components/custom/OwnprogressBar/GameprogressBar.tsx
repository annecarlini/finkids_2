import './GameprogressBar.css';

export default function CustomProgressBar({ value = 0, height = '12px', showLabel = false, animated = true }) {
const pct = Math.max(0, Math.min(100, Number(value)));


return (
<div className="cpb-root">
<div className="cpb-track" style={{ height }} aria-hidden>
<div
className={`cpb-fill ${animated ? 'cpb-animated' : ''}`}
style={{ width: `${pct}%` }}
role="progressbar"
aria-valuemin={0}
aria-valuemax={100}
aria-valuenow={pct}
/>
</div>


{showLabel && (
<div className="cpb-label" aria-hidden>
{pct}%
</div>
)}
</div>
);
}