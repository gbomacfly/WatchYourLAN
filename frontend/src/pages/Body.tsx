import { For, onMount, createMemo } from "solid-js";

import { activeFilter, allHosts, bkpHosts, setHistUpdOnFilter } from "../functions/exports";

import TableRow from "../components/Body/TableRow";
import TableHead from "../components/Body/TableHead";
import CardHead from "../components/Body/CardHead";
import { getHosts } from "../functions/atstart";
import { filterFunc } from "../functions/filter";

function Body() {

  onMount(() => {
    getHosts();
  });

  const stats = createMemo(() => {
    const hosts = bkpHosts();
    const total = hosts.length;
    const online = hosts.filter(h => h.Now === 1).length;
    const offline = total - online;
    const known = hosts.filter(h => h.Known === 1).length;
    const unknown = total - known;
    return { total, online, offline, known, unknown };
  });

  const tiles = () => [
    { label: "Gesamt", value: stats().total, color: "text-slate-800 dark:text-slate-100", field: "ID" as const, filterValue: 0 },
    { label: "Online", value: stats().online, color: "text-emerald-600 dark:text-emerald-400", field: "Now" as const, filterValue: 1 },
    { label: "Offline", value: stats().offline, color: "text-slate-400 dark:text-slate-500", field: "Now" as const, filterValue: 0 },
    { label: "Bekannt", value: stats().known, color: "text-brand-600 dark:text-brand-400", field: "Known" as const, filterValue: 1 },
    { label: "Unbekannt", value: stats().unknown, color: "text-amber-600 dark:text-amber-400", field: "Known" as const, filterValue: 0 },
  ];

  const isActive = (tile: ReturnType<typeof tiles>[number]) =>
    activeFilter().field === tile.field && activeFilter().value == tile.filterValue;

  const handleTileClick = (tile: ReturnType<typeof tiles>[number]) => {
    filterFunc(tile.field, tile.filterValue);
    setHistUpdOnFilter(true);
  };

  return (
    <div class="flex flex-col gap-6">
      <div class="grid grid-cols-2 sm:grid-cols-5 gap-2">
        <For each={tiles()}>{(tile) =>
          <button
            type="button"
            onClick={[handleTileClick, tile]}
            title={"Nach " + tile.label + " filtern"}
            class={
              "text-left rounded-xl bg-white dark:bg-slate-900 border px-4 py-2.5 transition " +
              (isActive(tile)
                ? "border-brand-400 dark:border-brand-500 ring-1 ring-brand-400 dark:ring-brand-500"
                : "border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700")
            }
          >
            <div class={"text-2xl font-semibold tabular-nums " + tile.color}>{tile.value}</div>
            <div class="text-xs font-medium text-slate-400 dark:text-slate-500 mt-0.5">{tile.label}</div>
          </button>
        }</For>
      </div>

      <div class="rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 overflow-hidden">
        <div class="px-4 py-3 border-b border-slate-100 dark:border-slate-800">
          <CardHead></CardHead>
        </div>
        <div class="overflow-x-auto">
          <table class="min-w-full text-sm">
            <TableHead></TableHead>
            <tbody>
              <For each={allHosts}>{(host, index) =>
              <TableRow host={host} index={index() + 1}></TableRow>
              }</For>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default Body
