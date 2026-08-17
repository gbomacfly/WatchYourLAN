import { apiDelHost, apiEditHost, apiWOL } from "../../functions/api";
import { cardBodyClass, cardClass, cardHeaderClass, inputClass } from "../Config/formStyles";

import { debounce } from "@solid-primitives/scheduled";

function Row(_props: any) {
  return (
    <div class="flex items-center justify-between gap-4 py-2 border-b border-slate-100 dark:border-slate-800 last:border-0">
      <span class="text-sm text-slate-500 dark:text-slate-400 shrink-0">{_props.label}</span>
      <span class="text-sm font-medium text-slate-800 dark:text-slate-100 text-right min-w-0">{_props.children}</span>
    </div>
  )
}

function HostCard(_props: any) {

  let name:string = "";

  const debouncedApi = debounce(async (val: string) => {
      await apiEditHost(_props.host.ID, val, "");
    }, 300);

  const handleInput = async (n: string) => {

    name = n;
    debouncedApi(n);
  };

  const handleToggle = async () => {

    if (name == "") {
      name = _props.host.Name;
    }

    await apiEditHost(_props.host.ID, name, 'toggle');
  };

  const handleDel = async () => {

    await apiDelHost(_props.host.ID);
    window.location.href = '/';
  };

  const handleWOL = async () => {

    await apiWOL(_props.host.Mac);
  };

  const known = () => _props.host.Known == 1;
  const online = () => _props.host.Now == 1;

  return (
    <div class={cardClass}>
      <div class={cardHeaderClass}>Host</div>
      <div class={cardBodyClass}>
        <Row label="ID">{_props.host.ID}</Row>
        <Row label="Name">
          <input
            type="text"
            class={inputClass + " text-right"}
            value={_props.host.Name}
            onInput={e => handleInput(e.target.value)}
          ></input>
        </Row>
        <Row label="DNS name">{_props.host.DNS}</Row>
        <Row label="Iface">{_props.host.Iface}</Row>
        <Row label="IP">
          <a href={"http://" + _props.host.IP} target="_blank" class="font-mono text-brand-600 dark:text-brand-400 hover:underline">{_props.host.IP}</a>
        </Row>
        <Row label="MAC">
          <span class="font-mono">{_props.host.Mac}</span>
        </Row>
        <Row label="Hardware">{_props.host.Hw}</Row>
        <Row label="Date">{_props.host.Date}</Row>
        <Row label="Known">
          <button
            type="button"
            role="switch"
            aria-checked={known()}
            onClick={handleToggle}
            title={known() ? "Als bekannt markiert" : "Als unbekannt markiert"}
            class={"relative inline-flex h-5 w-9 items-center rounded-full transition-colors " + (known() ? "bg-brand-600" : "bg-slate-300 dark:bg-slate-700")}
          >
            <span class={"inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform " + (known() ? "translate-x-[18px]" : "translate-x-1")}></span>
          </button>
        </Row>
        <Row label="Online">
          <div class="flex items-center justify-end gap-2.5">
            <span class={"w-2 h-2 rounded-full shrink-0 " + (online() ? "bg-emerald-500" : "bg-slate-300 dark:bg-slate-600")}></span>
            <button
              type="button"
              onClick={handleWOL}
              class="px-3 py-1.5 rounded-lg border border-emerald-200 dark:border-emerald-900/50 text-xs font-medium text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 whitespace-nowrap"
            >
              Wake-on-LAN
            </button>
          </div>
        </Row>
        <div class="pt-4">
          <button
            type="button"
            onClick={handleDel}
            class="px-3 py-2 rounded-lg border border-red-200 dark:border-red-900/50 text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30"
          >
            Delete host
          </button>
        </div>
      </div>
    </div>
  )
}

export default HostCard
