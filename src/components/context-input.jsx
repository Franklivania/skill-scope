export default function ContextInput({ value, onChange, placeholder }) {
  const handleChange = (e) => {
    onChange?.(e.target.value);
  };

  const charCount = (value || '').length;

  return (
    <div className="w-full">
      <label className="block mb-2 font-semibold">
        Additional Context <span className="text-xs font-normal" style={{ color: 'hsl(var(--color-text-muted))' }}>(Optional)</span>
      </label>
      <textarea
        value={value || ''}
        onChange={handleChange}
        placeholder={placeholder || "Add any additional context, questions, or information that would help provide better guidance..."}
        rows={4}
        className="w-full px-4 py-3 rounded-lg border resize-none text-base"
        style={{
          backgroundColor: `hsl(var(--color-surface))`,
          color: `hsl(var(--color-text))`,
          borderColor: `hsl(var(--color-border))`,
        }}
      />
      <p className="text-xs mt-1" style={{ color: 'hsl(var(--color-text-muted))' }}>
        {charCount} characters
      </p>
    </div>
  );
}

