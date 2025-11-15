import { themes, useTheme } from "../context/theme-changer"
export default function WebHeader() {
  const { theme, setTheme } = useTheme()
  const handleThemeChange = (e) => {
    setTheme(e.target.value)
  }
  return (
    <header className="w-full fixed top-0 left-0 z-30 px-3 py-4 bg-transparent flex items-center justify-between">
      <h1>SkillScope</h1>

      <aside>
        <select
          name="theme"
          id="theme"
          value={theme}
          onChange={handleThemeChange}
          className="text-base bg-accent"
        >
          <option value="auto">Auto</option>
          {themes.map((theme) => (
            <option
              key={theme}
              value={theme}
              className="capitalize text-base text-accent"
            >
              {theme.charAt(0).toUpperCase() + theme.slice(1)}
            </option>
          ))}
        </select>
      </aside>
    </header>
  )
}
