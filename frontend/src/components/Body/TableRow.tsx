import { createSignal, Show } from "solid-js";
import { editNames, selectedIDs, setSelectedIDs } from "../../functions/exports";
import { apiEditHost } from "../../functions/api";

import { debounce } from "@solid-primitives/scheduled";

function TableRow(_props: any) {

  const [name, setName] = createSignal(_props.host.Name);

  const online = _props.host.Now == 1;

  let known:boolean;
  _props.host.Known === 1 ? known = true : known = false;

  const debouncedApi = debounce(async (val: string) => {
    await apiEditHost(_props.host.ID, val, "");
  }, 300);

  const handleInput = async (n: string) => {
    setName(n);
    debouncedApi(n);
  };
  const handleToggle = async () => {
    await apiEditHost(_props.host.ID, name(), "toggle");
  };

  const handleCheck = (checked: boolean) => {
    const id = _props.host.ID;
    setSelectedIDs(prev => {
      if (checked) {
        return prev.includes(id) ? prev : [...prev, id];
      } else {
        return prev.filter(item => item !== id);
      }
    });
  };

  return (
    <tr class="border-b border-slate-100 dark:border-slate-800 last:border-0 hover:bg-slate-50 dark:hover:bg-slate-800/40 transition">
      <td class="px-5 py-3 text-xs text-slate-400 tabular-nums">{_props.index}.</td>
      <td class="px-5 py-3">
        <div class="flex items-center gap-2.5">
          <span class={"w-2 h-2 rounded-full shrink-0 " + (online ? "bg-emerald-500" : "bg-slate-300 dark:bg-slate-600")} title={online ? "Online" : "Offline"}></span>
          <Show
            when={editNames()}
            fallback={<span class="font-medium">{name()}</span>}
          >
            <input type="text" class="px-2 py-1 rounded-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-sm w-full max-w-[12rem]" value={name()}
              onInput={e => handleInput(e.target.value)}></input>
          </Show>
        </div>
      </td>
      <td class="px-5 py-3 text-slate-500 dark:text-slate-400">{_props.host.Iface}</td>
      <td class="px-5 py-3 font-mono text-slate-500 dark:text-slate-400">
        <a href={"http://" + _props.host.IP} target="_blank" class="hover:text-brand-600 dark:hover:text-brand-400">{_props.host.IP}</a>
      </td>
      <td class="px-5 py-3 font-mono text-slate-400 hidden md:table-cell">{_props.host.Mac}</td>
      <td class="px-5 py-3 text-slate-400 hidden lg:table-cell" title={_props.host.Hw}>{_props.host.Hw.slice(0,12)+".."}</td>
      <td class="px-5 py-3 text-slate-400 hidden xl:table-cell">{_props.host.Date}</td>
      <td class="px-5 py-3">
        <button
          type="button"
          role="switch"
          aria-checked={known}
          onClick={handleToggle}
          title={known ? "Als bekannt markiert" : "Als unbekannt markiert"}
          class={"relative inline-flex h-5 w-9 items-center rounded-full transition-colors " + (known ? "bg-brand-600" : "bg-slate-300 dark:bg-slate-700")}
        >
          <span class={"inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform " + (known ? "translate-x-[18px]" : "translate-x-1")}></span>
        </button>
      </td>
      <td class="px-5 py-3">
        <Show
          when={online}
          fallback={<span class="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400">Offline</span>}
        >
          <span class="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400">Online</span>
        </Show>
      </td>
      <td class="px-5 py-3 text-right">
        <Show
          when={editNames()}
          fallback={
          <a href={"/host/" + _props.host.ID} title="Details" class="inline-flex w-7 h-7 rounded-lg items-center justify-center text-slate-400 hover:text-brand-600 hover:bg-brand-50 dark:hover:bg-brand-900/30">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M12 6v.01M12 12v.01M12 18v.01"/></svg>
          </a>}
        >
          <input
            type="checkbox"
            checked={selectedIDs().includes(_props.host.ID)}
            onChange={e => handleCheck((e.target as HTMLInputElement).checked)}
            class="w-4 h-4 rounded border-slate-300 dark:border-slate-600 text-brand-600 focus:ring-brand-500"
          />
        </Show>
      </td>
    </tr>
  )
}

export default TableRow
