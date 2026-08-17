import { apiPath } from "../../functions/api"
import { appConfig } from "../../functions/exports"
import { cardBodyClass, cardClass, cardHeaderClass, checkboxClass, inputClass, labelClass, primaryBtnClass } from "./formStyles"

function Influx() {

  return (
    <div class={cardClass}>
      <div class={cardHeaderClass}>InfluxDB2 config</div>
      <div class={cardBodyClass}>
        <form action={apiPath + '/api/config_influx/'} method="post" class="space-y-4">
          <label class="flex items-center gap-2">
            {appConfig().InfluxEnable
              ? <input type="checkbox" name="enable" checked class={checkboxClass}></input>
              : <input type="checkbox" name="enable" class={checkboxClass}></input>
            }
            <span class={labelClass + " mb-0"}>Enable</span>
          </label>
          <div>
            <label class={labelClass}>Address</label>
            <input name="addr" type="text" class={inputClass} value={appConfig().InfluxAddr}></input>
          </div>
          <div>
            <label class={labelClass}>Token</label>
            <input name="token" type="text" class={inputClass} value={appConfig().InfluxToken}></input>
          </div>
          <div>
            <label class={labelClass}>Org</label>
            <input name="org" type="text" class={inputClass} value={appConfig().InfluxOrg}></input>
          </div>
          <div>
            <label class={labelClass}>Bucket</label>
            <input name="bucket" type="text" class={inputClass} value={appConfig().InfluxBucket}></input>
          </div>
          <label class="flex items-center gap-2">
            {appConfig().InfluxSkipTLS
              ? <input type="checkbox" name="skip" checked class={checkboxClass}></input>
              : <input type="checkbox" name="skip" class={checkboxClass}></input>
            }
            <span class={labelClass + " mb-0"}>Skip TLS verify</span>
          </label>
          <div class="pt-1">
            <button type="submit" class={primaryBtnClass}>Save</button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default Influx
