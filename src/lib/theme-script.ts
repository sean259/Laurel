// Kept out of theme.ts ("use client"): a server component importing a value from a client module
// gets a client reference, not the string.

export const THEME_KEY = "theme";
export const SEASONAL_KEY = "seasonal"; // "off" when the visitor turned seasonal themes off

/** One seasonal theme per month, January first. Colors live in globals.css under [data-season]. */
export const SEASONS = [
  "newyear",
  "valentine",
  "stpatrick",
  "spring",
  "bloom",
  "summer",
  "tropical",
  "ocean",
  "harvestmoon",
  "autumn",
  "halloween",
  "christmas",
] as const;

/**
 * Runs in <head> before the page paints: applies the saved light/dark choice, and the season for
 * the visitor's local month unless they turned it off. `?season=<key>` previews a season.
 * Keep in sync with `apply` in theme.ts.
 */
export const themeScript = `(function(){var d=document.documentElement,S=${JSON.stringify(SEASONS)},s=S[new Date().getMonth()],on=true;try{var t=localStorage.getItem("${THEME_KEY}");if(t==="light"||t==="dark")d.setAttribute("data-theme",t);on=localStorage.getItem("${SEASONAL_KEY}")!=="off"}catch(e){}var q=/[?&]season=([a-z]+)/.exec(location.search);if(q&&S.indexOf(q[1])>=0){s=q[1];on=true}if(on)d.setAttribute("data-season",s)})()`;
