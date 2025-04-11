
// Shared color palette for consistent styling across header and footer

export const colorPalette = {
  // Gradients
  gradients: {
    tealEmerald: "bg-gradient-to-r from-teal-500 to-emerald-600", // Default
    blueIndigo: "bg-gradient-to-r from-blue-500 to-indigo-600",
    purplePink: "bg-gradient-to-r from-purple-500 to-pink-500",
    redOrange: "bg-gradient-to-r from-red-500 to-orange-500",
    amberYellow: "bg-gradient-to-r from-amber-400 to-yellow-500",
    purpleIndigo: "bg-gradient-to-r from-purple-400 to-indigo-500",
  },
  
  // Light gradients (for footer)
  lightGradients: {
    tealEmerald: "bg-gradient-to-r from-teal-50 to-emerald-50",
    blueIndigo: "bg-gradient-to-r from-blue-50 to-indigo-50",
    purplePink: "bg-gradient-to-r from-purple-50 to-pink-50",
    redOrange: "bg-gradient-to-r from-red-50 to-orange-50",
    amberYellow: "bg-gradient-to-r from-amber-50 to-yellow-50",
    graySlate: "bg-gradient-to-r from-gray-50 to-slate-100",
  },
  
  // Solid colors
  solid: {
    white: "bg-white",
    grayLight: "bg-gray-100",
    grayDark: "bg-gray-800",
    black: "bg-black",
    emeraldDark: "bg-emerald-700 text-white",
    indigoDark: "bg-indigo-700 text-white"
  }
};

// Helper to get matching footer color based on header color
export const getMatchingFooterColor = (headerColor: string): string => {
  // Map header colors to matching footer colors
  const headerToFooter: Record<string, string> = {
    // Gradients
    [colorPalette.gradients.tealEmerald]: colorPalette.lightGradients.tealEmerald,
    [colorPalette.gradients.blueIndigo]: colorPalette.lightGradients.blueIndigo,
    [colorPalette.gradients.purplePink]: colorPalette.lightGradients.purplePink,
    [colorPalette.gradients.redOrange]: colorPalette.lightGradients.redOrange,
    [colorPalette.gradients.amberYellow]: colorPalette.lightGradients.amberYellow,
    [colorPalette.gradients.purpleIndigo]: colorPalette.lightGradients.blueIndigo,
    
    // Solid colors
    [colorPalette.solid.white]: colorPalette.solid.white,
    [colorPalette.solid.grayLight]: colorPalette.solid.grayLight,
    [colorPalette.solid.grayDark]: colorPalette.solid.grayDark,
    [colorPalette.solid.black]: colorPalette.solid.grayDark,
    [colorPalette.solid.emeraldDark]: colorPalette.lightGradients.tealEmerald,
    [colorPalette.solid.indigoDark]: colorPalette.lightGradients.blueIndigo
  };
  
  return headerToFooter[headerColor] || colorPalette.lightGradients.tealEmerald;
};
