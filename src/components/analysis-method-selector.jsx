import { getAvailableAnalysisMethods } from '../utils/prompt-builder';

export default function AnalysisMethodSelector({ selectedMethod, onMethodChange }) {
  const methods = getAvailableAnalysisMethods();

  return (
    <div className="w-full">
      <label className="block mb-2 font-semibold">
        Analysis Method <span className="text-xs font-normal" style={{ color: 'hsl(var(--color-text-muted))' }}>(Optional)</span>
      </label>
      <select
        value={selectedMethod || ''}
        onChange={(e) => onMethodChange?.(e.target.value || null)}
        className="w-full px-4 py-2 rounded-lg border text-base"
        style={{
          backgroundColor: `hsl(var(--color-surface))`,
          color: `hsl(var(--color-text))`,
          borderColor: `hsl(var(--color-border))`,
        }}
      >
        <option value="">All Methods (Comprehensive)</option>
        {methods.map((method) => (
          <option key={method.value} value={method.value}>
            {method.name} - {method.description}
          </option>
        ))}
      </select>
      {selectedMethod && (
        <p className="text-xs mt-2" style={{ color: 'hsl(var(--color-text-muted))' }}>
          {methods.find(m => m.value === selectedMethod)?.description}
        </p>
      )}
    </div>
  );
}

