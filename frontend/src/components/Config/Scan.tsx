import { For, Show } from "solid-js"
import { appConfig } from "../../functions/exports"
import { apiPath } from "../../functions/api"
import { cardBodyClass, cardClass, cardHeaderClass, inputClass, labelClass, primaryBtnClass, selectClass } from "./formStyles"

function Scan() {

  return (
    <div class={cardClass}>
      <div class={cardHeaderClass}>Scan settings</div>
      <div class={cardBodyClass}>
        <form action={apiPath + '/api/config_settings/'} method="post" class="space-y-4">
          <div>
            <label class={labelClass}>Interfaces</label>
            <input name="ifaces" type="text" class={inputClass} value={appConfig().Ifaces}></input>
          </div>
          <div>
            <label class={labelClass}>Timeout (seconds)</label>
            <input name="timeout" type="number" class={inputClass} value={appConfig().Timeout}></input>
          </div>
          <div>
            <label class={labelClass}>Args for arp-scan</label>
            <input name="arpargs" type="text" class={inputClass} value={appConfig().ArpArgs}></input>
          </div>
          <div>
            <label class={labelClass}>Arp Strings</label>
            <div class="space-y-2">
              <For each={appConfig().ArpStrs}>{arpStr =>
                <input name="arpstrs" type="text" class={inputClass} value={arpStr}></input>
              }</For>
              <input name="arpstrs" type="text" class={inputClass}></input>
            </div>
          </div>
          <div>
            <label class={labelClass}>Log level</label>
            <select name="log" class={selectClass}>
            <For each={["debug","info","warn","error"]}>{level =>
              <Show
                when={level == appConfig().LogLevel}
                fallback={<option value={level}>{level}</option>}
              >
              <option value={level} selected>{level}</option>
              </Show>
            }</For>
            </select>
          </div>
          <div>
            <label class={labelClass}>Trim History (hours)</label>
            <input name="trim" type="number" class={inputClass} value={appConfig().TrimHist}></input>
          </div>
          <div>
            <label class={labelClass}>Use DB</label>
            <select name="usedb" class={selectClass}>
              <Show
                when={appConfig().UseDB == "sqlite"}
                fallback={<>
                  <option value="sqlite">sqlite</option>
                  <option value="postgres" selected>postgres</option>
                </>}
              >
                <option value="sqlite" selected>sqlite</option>
                <option value="postgres">postgres</option>
              </Show>
            </select>
          </div>
          <div>
            <label class={labelClass}>PG Connect URL</label>
            <textarea name="pgconnect" class={inputClass} rows="3" wrap="soft">{appConfig().PGConnect}</textarea>
          </div>
          <div class="flex items-center gap-3 pt-1">
            <button type="submit" class={primaryBtnClass}>Save</button>
            <span class="text-xs text-slate-400 dark:text-slate-500">*Pressing <b>Save</b> will trigger a rescan</span>
          </div>
        </form>
      </div>
    </div>
  )
}

export default Scan
