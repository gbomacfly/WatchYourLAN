import { For, onCleanup, onMount, Show } from "solid-js";
import { getHistoryForMac } from "../functions/history";
import { Host, show } from "../functions/exports";
import { createStore } from "solid-js/store";

function MacHistory(_props: any) {

  const [hist, setHist] = createStore<Host[]>([]);
  let interval: number;

  onMount(async () => {
    const newHistory = await getHistoryForMac(_props.mac, _props.date);
    setHist(newHistory);
    interval = setInterval(async () => {
      // console.log("Upd Hist", new Date());
      const newHistory = await getHistoryForMac(_props.mac, _props.date);
      setHist(newHistory);
    }, 60000); // 60000 ms = 1 minute
  });

  onCleanup(() => {
    clearInterval(interval);
  });

  return (
    <div class="flex flex-wrap gap-0.5">
      <For each={hist}>{(h, index) =>
        <Show
          when={index() < show()}
        >
          <span
            title={"Date:"+h.Date+"\nIface:"+h.Iface+"\nIP:"+h.IP+"\nKnown:"+h.Known}
            class={"inline-block w-2.5 h-4 rounded-sm " + (h.Now === 0 ? "bg-slate-300 dark:bg-slate-600" : "bg-emerald-500")}
          ></span>
        </Show>
      }</For>
    </div>
  )
}

export default MacHistory
