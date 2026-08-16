import { createSignal, For } from "solid-js";
import { Host } from "../../functions/exports";
import { sortByAnyField } from "../../functions/sort";

function TableHead() {

  const [sortField, setSortField] = createSignal<string>('');

  const showSort = () => {
    let field = localStorage.getItem("sortField") as string;
    field === "Mac" ? field = "MAC" : '';
    field === "Hw" ? field = "Hardware" : '';
    field === "Now" ? field = "On" : '';
    setSortField(field);
  };
  showSort();

  const handleSort = (sortBy: string) => {
    setSortField(sortBy);
    sortBy === "MAC" ? sortBy = "Mac" : '';
    sortBy === "Hardware" ? sortBy = "Hw" : '';
    sortBy === "On" ? sortBy = "Now" : '';
    sortByAnyField(sortBy as keyof Host);
  };

  return (
    <thead>
      <tr class="text-left text-xs font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-500 border-b border-slate-100 dark:border-slate-800">
        <th class="px-5 py-2.5 font-semibold w-8"></th>
        <For each={["Name", "Iface", "IP", "MAC", "Hardware", "Date", "Known", "On"]}>{(key) =>
          <th
            class={"px-5 py-2.5 font-semibold select-none " + (key === sortField() ? "text-brand-600 dark:text-brand-400" : "")}
          >
            <button
              type="button"
              onClick={[handleSort, key]}
              title={"Sortieren nach " + key}
              class="inline-flex items-center gap-1 hover:text-slate-700 dark:hover:text-slate-300"
            >
              {key}
              <svg class="w-3 h-3" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" d="M3 4h13M3 8h9M3 12h5m7-4v12m0 0l-3-3m3 3l3-3"/>
              </svg>
            </button>
          </th>
        }</For>
        <th class="px-5 py-2.5 font-semibold w-8 text-right" title="Bearbeiten">
          <svg class="w-3.5 h-3.5 inline" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>
        </th>
      </tr>
    </thead>
  )
}

export default TableHead
