import { useEffect, useState } from "react";

// Theme interface matching our CSS variables
export interface ThemeVariables {
  primaryColor: string;
  primaryColorLight: string;
  primaryColorDark: string;
  textColor: string;
  textColorSecondary: string;
  headingColor: string;
  backgroundColor: string;
  backgroundColorLight: string;
  borderColor: string;
  successColor: string;
  warningColor: string;
  errorColor: string;
  infoColor: string;
}

// Get CSS variable value helper function
export const getCssVariable = (name: string): string => {
  if (typeof window === "undefined") {
    return "";
  }
  return getComputedStyle(document.documentElement)
    .getPropertyValue(`--${name}`)
    .trim();
};

// React hook to access theme variables
export const useTheme = (): ThemeVariables => {
  const [theme, setTheme] = useState<ThemeVariables>({
    primaryColor: "#1890ff",
    primaryColorLight: "#40a9ff",
    primaryColorDark: "#096dd9",
    textColor: "#262626",
    textColorSecondary: "#595959",
    headingColor: "#262626",
    backgroundColor: "#ffffff",
    backgroundColorLight: "#f5f5f5",
    borderColor: "#e8e8e8",
    successColor: "#52c41a",
    warningColor: "#faad14",
    errorColor: "#f5222d",
    infoColor: "#1890ff",
  });

  useEffect(() => {
    // Only run in browser
    if (typeof window === "undefined") return;

    const updateTheme = () => {
      setTheme({
        primaryColor: getCssVariable("primary-color"),
        primaryColorLight: getCssVariable("primary-color-light"),
        primaryColorDark: getCssVariable("primary-color-dark"),
        textColor: getCssVariable("text-color"),
        textColorSecondary: getCssVariable("text-color-secondary"),
        headingColor: getCssVariable("heading-color"),
        backgroundColor: getCssVariable("background-color"),
        backgroundColorLight: getCssVariable("background-color-light"),
        borderColor: getCssVariable("border-color"),
        successColor: getCssVariable("success-color"),
        warningColor: getCssVariable("warning-color"),
        errorColor: getCssVariable("error-color"),
        infoColor: getCssVariable("info-color"),
      });
    };

    // Update theme initially
    updateTheme();

    // Listen for theme changes
    const observer = new MutationObserver(() => {
      updateTheme();
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });

    return () => {
      observer.disconnect();
    };
  }, []);

  return theme;
};

// Export static theme values for use outside React components
export const theme = {
  light: {
    primaryColor: "#1890ff",
    primaryColorLight: "#40a9ff",
    primaryColorDark: "#096dd9",
    textColor: "#262626",
    textColorSecondary: "#595959",
    headingColor: "#262626",
    backgroundColor: "#ffffff",
    backgroundColorLight: "#f5f5f5",
    borderColor: "#e8e8e8",
  },
  dark: {
    primaryColor: "#177ddc",
    primaryColorLight: "#40a9ff",
    primaryColorDark: "#096dd9",
    textColor: "#ffffff",
    textColorSecondary: "#a6a6a6",
    headingColor: "#ffffff",
    backgroundColor: "#141414",
    backgroundColorLight: "#1f1f1f",
    borderColor: "#434343",
  },
};
