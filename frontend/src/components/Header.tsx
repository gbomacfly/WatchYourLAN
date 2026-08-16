import { createSignal, onCleanup, onMount } from "solid-js";
import { appConfig, setAppConfig } from "../functions/exports";
import { apiGetConfig, apiSetColor } from "../functions/api";

type ColorMode = "light" | "dark" | "system";

function Header() {

  const [themePath, setThemePath] = createSignal('');
  const [iconsPath, setIconsPath] = createSignal('');
  const [colorMode, setColorMode] = createSignal<ColorMode>("dark");

  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)');

  const resolveColor = (mode: ColorMode) =>
    mode === "system" ? (prefersDark.matches ? "dark" : "light") : mode;

  const applyColor = (mode: ColorMode) => {
    const resolved = resolveColor(mode);
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

  const setCurrentTheme = async () => {
    setAppConfig(await apiGetConfig());

    const theme = appConfig().Theme?appConfig().Theme:"sand";
    const color = (appConfig().Color as ColorMode) || "dark";

    if (appConfig().NodePath == '') {
      setThemePath("https://cdn.jsdelivr.net/npm/aceberg-bootswatch-fork@v5.3.3-2/dist/"+theme+"/bootstrap.min.css");
      setIconsPath("https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.css");
    } else {
      setThemePath(appConfig().NodePath+"/node_modules/bootswatch/dist/"+theme+"/bootstrap.min.css");
      setIconsPath(appConfig().NodePath+"/node_modules/bootstrap-icons/font/bootstrap-icons.css");
    }

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

  const colorIcon = () => {
    switch (colorMode()) {
      case "light": return "bi-sun-fill";
      case "dark": return "bi-moon-stars-fill";
      default: return "bi-circle-half";
    }
  };

  return (
    <>
    <link rel="stylesheet" href={iconsPath()}></link> {/* icons */}
    <link rel="stylesheet" href={themePath()}></link> {/* theme */}
    <nav class="navbar navbar-expand-md navbar-dark bg-primary">
      <div class="container-lg">
        <a class="navbar-brand" href="/">
          <img src="/fs/public/favicon.png" style="width: 2em"/>
        </a>
        <ul class="navbar-nav me-auto mb-2 mb-md-0">
          <li class="nav-item">
            <a class="nav-link active" href="/" title="Home">Home</a>
          </li>
          <li class="nav-item">
            <a class="nav-link active" href="/config/" title="Config">Config</a>
          </li>
          <li class="nav-item">
            <a class="nav-link active" href="/history/" title="History">History</a>
          </li>
        </ul>
        <ul class="navbar-nav">
          <li class="nav-item">
            <a
              class="nav-link active fs-5 ms-md-2"
              href="#"
              title={"Color mode: " + colorMode() + " (click to switch)"}
              onClick={(e) => { e.preventDefault(); cycleColorMode(); }}
            >
              <i class={"bi " + colorIcon()}></i>
            </a>
          </li>
          <li class="nav-item">
            <a class="nav-link active fs-3 ms-md-2" target="_blank" href="https://github.com/aceberg/WatchYourLAN" title="Github"><i class="bi bi-github"></i></a>
          </li>
        </ul>
      </div>
    </nav>
    </>
  )
};

export default Header
