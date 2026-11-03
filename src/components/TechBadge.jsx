import { BarChart3, Brain, Code2, Database, Languages, Layers, Network, ScanLine } from 'lucide-react';
import { getTechnology } from '../data/technologies';

const symbols = { chart: BarChart3, brain: Brain, code: Code2, database: Database, language: Languages, layers: Layers, network: Network, scan: ScanLine };

export default function TechBadge({ name, compact = false }) {
  const { icons, symbol } = getTechnology(name);
  const Symbol = symbols[symbol] || Code2;

  return (
    <span className={`tech-badge${compact ? ' tech-badge-compact' : ''}`}>
      <span className="tech-icon-group" aria-hidden="true">
        {icons ? icons.map(({ file, plate }) => (
          <img key={file} className={`tech-icon${plate ? ' tech-icon-plate' : ''}`} src={`${import.meta.env.BASE_URL}${file}`} alt="" width="18" height="18" loading="lazy" decoding="async" />
        )) : <Symbol className="tech-icon tech-symbol" size={18} />}
      </span>
      <bdi>{name}</bdi>
    </span>
  );
}
