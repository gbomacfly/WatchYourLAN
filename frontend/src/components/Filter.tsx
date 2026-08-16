import { createSignal, For } from "solid-js";
import { Host, ifaces, setHistUpdOnFilter } from "../functions/exports";
import { filterFunc } from "../functions/filter";

const selectClass = "px-3 py-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500";

function Filter() {
  type FilterEvent = Event & {
    currentTarget: HTMLSelectElement;
    target: HTMLSelectElement;
  };

  const [selectValue, setSelectValue] = createSignal("");

  const handleFilter = (field: keyof Host, event: FilterEvent) => {
    const value = event.target ? event.target.value : 0;
    filterFunc(field, value);
    setHistUpdOnFilter(true);
  };

  const handleReset = () => {
    filterFunc("ID", 0);
    setSelectValue("something");
    setSelectValue("");
    setHistUpdOnFilter(true);
  };

  return (
    <div class="flex flex-wrap items-center gap-2">
      <select onChange={(event)=>{handleFilter("Iface", event)}} class={selectClass} title="Nach Interface filtern" value={selectValue()}>
        <option value="" selected disabled>Interface</option>
        <For each={ifaces()}>{(iface) =>
          <option value={iface}>{iface}</option>
        }</For>
      </select>
      <select onChange={(event)=>{handleFilter("Known", event)}} class={selectClass} title="Nach Bekannt filtern" value={selectValue()}>
        <option value="" selected disabled>Bekannt</option>
        <option value={1}>Bekannt</option>
        <option value={0}>Unbekannt</option>
      </select>
      <select onChange={(event)=>{handleFilter("Now", event)}} class={selectClass} title="Nach Online filtern" value={selectValue()}>
        <option value="" selected disabled>Online</option>
        <option value={1}>Online</option>
        <option value={0}>Offline</option>
      </select>
      <button
        onClick={handleReset}
        title="Filter zurücksetzen"
        class="px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-800 text-sm font-medium text-brand-600 dark:text-brand-400 hover:bg-brand-50 dark:hover:bg-brand-900/20"
      >
        Zurücksetzen
      </button>
    </div>
  )
}

export default Filter
