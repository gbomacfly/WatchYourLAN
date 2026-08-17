import { apiPath } from "../../functions/api"
import { appConfig } from "../../functions/exports"
import { cardBodyClass, cardClass, cardHeaderClass, checkboxClass, labelClass, primaryBtnClass } from "./formStyles"

function Prometheus() {

  return (
    <div class={cardClass}>
      <div class={cardHeaderClass}>Prometheus config</div>
      <div class={cardBodyClass}>
        <form action={apiPath + '/api/config_prometheus/'} method="post" class="space-y-4">
          <label class="flex items-center gap-2">
            {appConfig().PrometheusEnable
              ? <input type="checkbox" name="enable" checked class={checkboxClass}></input>
              : <input type="checkbox" name="enable" class={checkboxClass}></input>
            }
            <span class={labelClass + " mb-0"}>Enable</span>
          </label>
          <div class="flex items-center gap-3 pt-1">
            <button type="submit" class={primaryBtnClass}>Save</button>
            <a href="/metrics" target="_blank" class="text-sm text-brand-600 dark:text-brand-400 hover:underline">/metrics</a>
          </div>
        </form>
      </div>
    </div>
  )
}

export default Prometheus
