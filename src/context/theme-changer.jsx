import { createContext, useContext, useState, useEffect } from "react";

export const themes = ["ghost", "amethyst", "serious blue", "burgundy"];
const THEME_STORAGE_KEY = "app-theme";

const ThemeContext = createContext({
  theme: themes[0],
  setTheme: () => {},
})

export default function ThemeChangerProvider({ children }) {
  const [theme, setThemeState] = useState(() => {
    const storedTheme = localStorage.getItem(THEME_STORAGE_KEY);
    return storedTheme && themes.includes(storedTheme) ? storedTheme : themes[0];
  });

  useEffect(() => {
    localStorage.setItem(THEME_STORAGE_KEY, theme);
  }, [theme]);

  const setTheme = (newTheme) => {
    if (themes.includes(newTheme)) {
      setThemeState(newTheme);
    }
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      <div data-theme={theme}>
        {children}
      </div>
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);
