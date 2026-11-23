// Kept out of theme.ts ("use client"): a server component importing a value from a client module
// gets a client reference, not the string.

export const THEME_KEY = "theme";

/** Runs in <head> before the page paints: applies the saved theme. Keep in sync with `apply` in theme.ts. */
export const themeScript = `(function(){try{var t=localStorage.getItem("${THEME_KEY}");if(t==="light"||t==="dark")document.documentElement.setAttribute("data-theme",t)}catch(e){}})()`;
