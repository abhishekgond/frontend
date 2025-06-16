// components/Theme.jsx
export const availableThemes = [
  "dracula",
  "monokai",
  // Add more if you've imported them
];

export const themeMap = {
  dracula: "dracula",
  monokai: "monokai",
};

export const formatThemeName = (theme) =>
  theme.charAt(0).toUpperCase() + theme.slice(1);
