import { For, Show } from "solid-js";
import { apiPath, apiTestNotify } from "../../functions/api"
import { appConfig } from "../../functions/exports"
import { inputClass, labelClass, primaryBtnClass, secondaryBtnClass, selectClass } from "./formStyles"

function Basic() {

  const themes = ["cerulean", "cosmo", "cyborg", "darkly", "emerald", "flatly", "grass", "grayscale", "journal", "litera", "lumen", "lux", "materia", "minty", "morph", "ocean", "pulse", "quartz", "sand", "sandstone", "simplex", "sketchy", "slate", "solar", "spacelab", "superhero", "united", "vapor", "wood", "yeti", "zephyr"];
  const colors = ["dark", "light", "system"];

  const handleTestNotify = () => {
    apiTestNotify();
  };

  return (
    <div class="rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 overflow-hidden">
      <div class="px-4 py-3 border-b border-slate-100 dark:border-slate-800 font-semibold text-slate-700 dark:text-slate-200">Basic config</div>
      <div class="p-4">
        <form action={apiPath + '/api/config/'} method="post" class="space-y-4">
          <div>
            <label class={labelClass}>Host</label>
            <input name="host" type="text" class={inputClass} value={appConfig().Host}></input>
          </div>
          <div>
            <label class={labelClass}>Port</label>
            <input name="port" type="text" class={inputClass} value={appConfig().Port}></input>
          </div>
          <div>
            <label class={labelClass}>Theme</label>
            <select name="theme" class={selectClass}>
            <For each={themes}>{theme =>
              <Show
                when={theme == appConfig().Theme}
                fallback={<option value={theme}>{theme}</option>}
              >
                <option value={theme} selected>{theme}</option>
              </Show>
            }</For>
            </select>
          </div>
          <div>
            <label class={labelClass}>Color mode</label>
            <select name="color" class={selectClass}>
            <For each={colors}>{color =>
              <Show
                when={color == (appConfig().Color || "dark")}
                fallback={<option value={color}>{color}</option>}
              >
                <option value={color} selected>{color}</option>
              </Show>
            }</For>
            </select>
            <div class="text-xs text-slate-400 dark:text-slate-500 mt-1">"system" follows your OS/browser setting automatically. You can also click the sun/moon icon in the top navbar to switch instantly.</div>
          </div>
          <div>
            <label class={labelClass}>Shoutrrr URL</label>
            <textarea name="shout" class={inputClass + " w-full"} rows="3" wrap="soft">{appConfig().ShoutURL}</textarea>
          </div>
          <div class="flex items-center gap-2 pt-1">
            <button type="submit" class={primaryBtnClass}>Save</button>
            <button onClick={handleTestNotify} type="button" class={secondaryBtnClass}>Test notification</button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default Basic
