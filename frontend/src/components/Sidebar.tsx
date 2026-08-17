import { createSignal, For, onCleanup, onMount, Show } from "solid-js";
import { activeFilter, appConfig, groups, setAppConfig, setHistUpdOnFilter } from "../functions/exports";
import { apiGetConfig, apiSetColor } from "../functions/api";
import { filterFunc } from "../functions/filter";

type ColorMode = "light" | "dark" | "system";

function Sidebar() {

  const [themePath, setThemePath] = createSignal('');
  const [iconsPath, setIconsPath] = createSignal('');
  const [colorMode, setColorMode] = createSignal<ColorMode>("dark");

  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)');

  const resolveColor = (mode: ColorMode) =>
    mode === "system" ? (prefersDark.matches ? "dark" : "light") : mode;

  const applyColor = (mode: ColorMode) => {
    const resolved = resolveColor(mode);
    // Tailwind (new UI, class strategy)
    document.documentElement.classList.toggle("dark", resolved === "dark");
    // Bootstrap/Bootswatch (legacy pages not yet migrated, still needed until Phase 5)
    document.documentElement.setAttribute("data-bs-theme", resolved);
    resolved === "dark"
      ? document.documentElement.style.setProperty('--transparent-light', '#ffffff15')
      : document.documentElement.style.setProperty('--transparent-light', '#00000015');
  };

  const handleSystemChange = () => {
    if (colorMode() === "system") {
      applyColor("system");
    }
  };

  // Bootswatch themes + bootstrap-icons are embedded directly in the Go binary
  // (backend/internal/web/public/vendor/) and served from /fs/public/vendor/ - no
  // CDN, no separate node-bootstrap helper container needed.
  const setCurrentTheme = async () => {
    setAppConfig(await apiGetConfig());

    const theme = appConfig().Theme?appConfig().Theme:"sand";
    const color = (appConfig().Color as ColorMode) || "dark";

    setThemePath("/fs/public/vendor/bootswatch/"+theme+"/bootstrap.min.css");
    setIconsPath("/fs/public/vendor/bootstrap-icons/bootstrap-icons.css");

    setColorMode(color);
    applyColor(color);
  }
  setCurrentTheme();

  onMount(() => {
    prefersDark.addEventListener('change', handleSystemChange);
  });

  onCleanup(() => {
    prefersDark.removeEventListener('change', handleSystemChange);
  });

  const cycleColorMode = () => {
    const order: ColorMode[] = ["light", "dark", "system"];
    const next = order[(order.indexOf(colorMode()) + 1) % order.length];

    setColorMode(next);
    applyColor(next);
    apiSetColor(next);
  };

  const colorTitle = () => {
    switch (colorMode()) {
      case "light": return "Farbmodus: Hell (klicken zum Wechseln)";
      case "dark": return "Farbmodus: Dunkel (klicken zum Wechseln)";
      default: return "Farbmodus: System (klicken zum Wechseln)";
    }
  };

  return (
    <>
    {/* legacy stylesheets for pages not yet migrated to Tailwind */}
    <link rel="stylesheet" href={iconsPath()}></link>
    <link rel="stylesheet" href={themePath()}></link>

    <aside class="w-60 shrink-0 h-screen sticky top-0 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col">
      <div class="h-16 flex items-center gap-3 px-5 border-b border-slate-200 dark:border-slate-800">
        <a href="/" class="flex items-center gap-3 no-underline">
          <img src="/fs/public/favicon.png" class="w-8 h-8 rounded-lg" />
          <span class="font-semibold tracking-tight text-slate-900 dark:text-white">WatchYourLAN</span>
        </a>
      </div>

      <nav class="p-3 space-y-0.5 text-sm font-medium">
        <a class="flex items-center gap-2.5 px-3 py-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 no-underline" href="/" title="Home">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/></svg>
          Übersicht
        </a>
        <a class="flex items-center gap-2.5 px-3 py-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 no-underline" href="/history/" title="History">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
          Verlauf
        </a>
        <a class="flex items-center gap-2.5 px-3 py-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 no-underline" href="/config/" title="Config">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/><circle cx="12" cy="12" r="3"/></svg>
          Konfiguration
        </a>
      </nav>

      <div class="px-3 mt-2">
        <div class="px-3 py-2 text-xs font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-500">Gruppen</div>
        <Show when={groups().length > 0} fallback={
          <div class="px-3 py-2 text-xs text-slate-400 dark:text-slate-500 italic">Keine Gruppen</div>
        }>
          <div class="space-y-0.5">
            <a
              href="/"
              class={`flex items-center gap-2.5 px-3 py-1.5 rounded-lg text-sm no-underline ${
                activeFilter().field === "ID"
                  ? "bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white font-medium"
                  : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
              }`}
              onClick={(e) => {
                e.preventDefault();
                filterFunc("ID", 0);
                setHistUpdOnFilter(true);
              }}
            >
              Alle
            </a>
            <For each={groups()}>
              {(group) => (
                <a
                  href="/"
                  class={`flex items-center gap-2.5 px-3 py-1.5 rounded-lg text-sm no-underline truncate ${
                    activeFilter().field === "Group" && activeFilter().value === group
                      ? "bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white font-medium"
                      : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                  }`}
                  title={group}
                  onClick={(e) => {
                    e.preventDefault();
                    filterFunc("Group", group);
                    setHistUpdOnFilter(true);
                  }}
                >
                  {group}
                </a>
              )}
            </For>
          </div>
        </Show>
      </div>

      <div class="mt-auto p-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
        <a href="https://github.com/gbomacfly/WatchYourLAN" target="_blank" class="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 no-underline" title="Github">
          <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.339-2.221-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.269 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.295 2.747-1.026 2.747-1.026.546 1.378.203 2.397.1 2.65.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.02 10.02 0 0022 12.017C22 6.484 17.522 2 12 2z"/></svg>
        </a>
        <button
          onClick={cycleColorMode}
          title={colorTitle()}
          class="w-9 h-9 rounded-lg flex items-center justify-center text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
            {colorMode() === "light" && (
              <g stroke-linecap="round">
                <circle cx="12" cy="12" r="5"/>
                <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/>
              </g>
            )}
            {colorMode() === "dark" && (
              <path stroke-linecap="round" stroke-linejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"/>
            )}
            {colorMode() === "system" && (
              <g>
                <circle cx="12" cy="12" r="9"/>
                <path d="M12 3a9 9 0 000 18z" fill="currentColor" stroke="none"/>
              </g>
            )}
          </svg>
        </button>
      </div>
    </aside>
    </>
  )
};

export default Sidebar
