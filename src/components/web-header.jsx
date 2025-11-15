import { themes, useTheme } from "../context/theme-changer"
import { Icon } from "@iconify/react"

export default function WebHeader() {
  const { theme, setTheme } = useTheme()
  const handleThemeChange = (e) => {
    setTheme(e.target.value)
  }
  return (
    <header 
      className="w-full fixed top-0 left-0 z-30 px-4 py-3 flex items-center justify-between"
      style={{
        backgroundColor: 'hsl(var(--color-background))',
        borderBottom: '1px solid hsl(var(--color-border))',
      }}
    >
      <h1 className="text-xl font-bold" style={{ color: 'hsl(var(--color-text))' }}>
        SkillScope
      </h1>

      <aside className="relative">
        <label 
          htmlFor="theme-select"
          className="flex items-center gap-2 cursor-pointer group"
        >
          <Icon
            icon="mdi:palette"
            className="w-5 h-5 transition-colors"
            style={{ color: 'hsl(var(--color-text-muted))' }}
          />
          <div className="relative group">
            <select
              id="theme-select"
              name="theme"
              value={theme}
              onChange={handleThemeChange}
              className="appearance-none pr-8 pl-3 py-2 rounded-lg text-sm font-medium cursor-pointer transition-all border focus:outline-none focus:ring-2 focus:ring-offset-2 theme-select"
              style={{
                backgroundColor: 'hsl(var(--color-surface))',
                color: 'hsl(var(--color-text))',
                borderColor: 'hsl(var(--color-border))',
                '--tw-ring-color': 'hsl(var(--color-primary))',
                '--tw-ring-offset-color': 'hsl(var(--color-background))',
              }}
            >
              <option value="auto">Auto</option>
              {themes.map((themeOption) => (
                <option
                  key={themeOption}
                  value={themeOption}
                  style={{
                    backgroundColor: 'hsl(var(--color-surface))',
                    color: 'hsl(var(--color-text))',
                  }}
                >
                  {themeOption.charAt(0).toUpperCase() + themeOption.slice(1)}
                </option>
              ))}
            </select>
            <Icon
              icon="mdi:chevron-down"
              className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none"
              style={{ color: 'hsl(var(--color-text-muted))' }}
            />
          </div>
        </label>
      </aside>
    </header>
  )
}
