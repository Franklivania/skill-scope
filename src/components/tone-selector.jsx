import { getAvailableTones } from '../utils/prompt-builder';

export default function ToneSelector({ selectedTone, onToneChange }) {
  const tones = getAvailableTones();

  return (
    <div className="w-full">
      <label className="block mb-2 font-semibold">
        Response Tone
      </label>
      <div className="flex flex-wrap gap-2">
        {tones.map((tone) => (
          <button
            key={tone.value}
            onClick={() => onToneChange?.(tone.value)}
            className={`
              px-4 py-2 rounded-lg text-sm font-medium transition-all
              ${selectedTone === tone.value
                ? 'ring-2 ring-offset-2'
                : 'hover:opacity-80'
              }
            `}
            style={{
              backgroundColor: selectedTone === tone.value
                ? `hsl(var(--color-primary))`
                : `hsl(var(--color-surface))`,
              color: selectedTone === tone.value
                ? 'white'
                : `hsl(var(--color-text))`,
              ...(selectedTone === tone.value && {
                '--tw-ring-color': `hsl(var(--color-primary))`,
                '--tw-ring-offset-color': `hsl(var(--color-background))`,
              }),
            }}
            title={tone.description}
          >
            {tone.name}
          </button>
        ))}
      </div>
      {selectedTone && (
        <p className="text-xs mt-2" style={{ color: 'hsl(var(--color-text-muted))' }}>
          {tones.find(t => t.value === selectedTone)?.description}
        </p>
      )}
    </div>
  );
}

