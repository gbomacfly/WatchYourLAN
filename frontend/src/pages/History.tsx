import { For } from "solid-js"
import Filter from "../components/Filter"
import { allHosts, setShow, show } from "../functions/exports"
import MacHistory from "../components/MacHistory"
import HistShow from "../components/HistShow"

function History() {

  const showStr = localStorage.getItem("histShow") as string;
  setShow(+showStr);
  (show() === 0 || isNaN(show())) ? setShow(200) : '';

  return (
    <div class="rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 overflow-hidden">
      <div class="px-4 py-3 border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center gap-3">
        <Filter></Filter>
        <div class="sm:ml-auto">
          <HistShow name="histShow"></HistShow>
        </div>
      </div>
      <div class="overflow-x-auto">
        <table class="min-w-full text-sm">
          <tbody>
          <For each={allHosts}>{(host, index) =>
            <tr class="border-b border-slate-100 dark:border-slate-800 last:border-0 hover:bg-slate-50 dark:hover:bg-slate-800/40 transition">
              <td class="px-3.5 py-2 text-xs text-slate-400 tabular-nums">{index()+1}.</td>
              <td class="px-3.5 py-2 whitespace-nowrap">
                <a href={"/host/"+host.ID} class="font-medium hover:text-brand-600 dark:hover:text-brand-400">{host.Name}</a>
                <br></br>
                <a href={"http://"+host.IP} target="_blank" class="font-mono text-xs text-slate-400 hover:text-brand-600 dark:hover:text-brand-400">{host.IP}</a>
              </td>
              <td class="px-3.5 py-2 w-full">
                <MacHistory mac={host.Mac} date=""></MacHistory>
              </td>
            </tr>
            }</For>
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default History
