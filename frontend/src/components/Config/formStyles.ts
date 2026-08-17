// Shared Tailwind classes for the Config page's form components, so Basic/Scan/Influx/
// Prometheus/About/Donate all look consistent with the rest of the (already-migrated)
// Tailwind UI instead of the old Bootstrap card/table/form-control classes.

export const cardClass = "rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 overflow-hidden";
export const cardHeaderClass = "px-4 py-3 border-b border-slate-100 dark:border-slate-800 font-semibold text-slate-700 dark:text-slate-200";
export const cardBodyClass = "p-4";

export const labelClass = "text-sm font-medium text-slate-600 dark:text-slate-300 mb-1 block";
export const inputClass = "px-3 py-2 rounded-lg bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 w-full";
export const selectClass = inputClass;
export const checkboxClass = "w-4 h-4 rounded border-slate-300 dark:border-slate-600 text-brand-600 focus:ring-brand-500";

export const primaryBtnClass = "px-4 py-2 rounded-lg bg-brand-600 text-white text-sm font-medium hover:bg-brand-700";
export const secondaryBtnClass = "px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-800 text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800";
