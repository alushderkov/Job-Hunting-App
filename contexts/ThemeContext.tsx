import AsyncStorage from "@react-native-async-storage/async-storage";
import React, {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";
import { ColorSchemeName } from "react-native";

type ThemeContextType = {
  colorScheme: ColorSchemeName;
  toggleTheme: () => void;
  isLoading: boolean;
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const THEME_STORAGE_KEY = "@app_theme";

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [colorScheme, setColorScheme] = useState<ColorSchemeName>("light");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadTheme();
  }, []);

  const loadTheme = async () => {
    try {
      const savedTheme = await AsyncStorage.getItem(THEME_STORAGE_KEY);
      if (savedTheme === "dark" || savedTheme === "light") {
        setColorScheme(savedTheme);
      }
    } catch (error) {
      console.error("Error loading theme:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleTheme = async () => {
    try {
      const newTheme: ColorSchemeName =
        colorScheme === "light" ? "dark" : "light";
      setColorScheme(newTheme);
      await AsyncStorage.setItem(THEME_STORAGE_KEY, newTheme);
    } catch (error) {
      console.error("Error saving theme:", error);
    }
  };

  return (
    <ThemeContext.Provider value={{ colorScheme, toggleTheme, isLoading }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}
