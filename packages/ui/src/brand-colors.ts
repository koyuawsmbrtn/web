import primitives from "./primitives";
import variables from "./variables";

const brandColors = {
  "bg-primary": variables["light-sage"],
  "bg-secondary": variables.terracotta,
  white: "#FAFCFE",
  gray: "#F5F5F5",

  foreground: "#333333",
  error: "#C23935",
  success: primitives.primary1[400],
  warning: primitives.secondary2[100],
};

export default brandColors;
