import { For, onMount, createMemo } from "solid-js";

import { allHosts, bkpHosts } from "../functions/exports";

import TableRow from "../components/Body/TableRow";
import TableHead from "../components/Body/TableHead";
import CardHead from "../components/Body/CardHead";
import { getHosts } from "../functions/atstart";

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
    { label: "Gesamt", value: stats().total, color: "text-slate-800 dark:text-slate-100" },
    { label: "Online", value: stats().online, color: "text-emerald-600 dark:text-emerald-400" },
    { label: "Offline", value: stats().offline, color: "text-slate-400 dark:text-slate-500" },
    { label: "Bekannt", value: stats().known, color: "text-brand-600 dark:text-brand-400" },
    { label: "Unbekannt", value: stats().unknown, color: "text-amber-600 dark:text-amber-400" },
  ];

  return (
    <div class="flex flex-col gap-6">
      <div class="grid grid-cols-2 sm:grid-cols-5 gap-2">
        <For each={tiles()}>{(tile) =>
          <div class="rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-4 py-2.5">
            <div class={"text-2xl font-semibold tabular-nums " + tile.color}>{tile.value}</div>
            <div class="text-xs font-medium text-slate-400 dark:text-slate-500 mt-0.5">{tile.label}</div>
          </div>
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
