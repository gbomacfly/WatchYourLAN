import { createSignal, For, Show } from "solid-js";
import { apiPortScan } from "../../functions/api";
import { cardBodyClass, cardClass, cardHeaderClass, inputClass, primaryBtnClass, secondaryBtnClass } from "../Config/formStyles";
import { getWellKnownPortName } from "../../functions/wellKnownPorts";

function Ping(_props: any) {

  let stop = false;

  const [beginStr, setBegin] = createSignal("");
  const [endStr, setEnd] = createSignal("");
  const [curPort, setCurPort] = createSignal("");
  const [foundPorts, setFoundPorts] = createSignal<number[]>([]);

  const handleScan = async () => {
    stop = false;

    let begin = Number(beginStr());
    if (Number.isNaN(begin) || begin < 1 || begin > 65535) {
      begin = 1;
    }
    let end = Number(endStr());
    if (Number.isNaN(end) || end < 1 || end > 65535) {
      end = 65535;
    }

    let portOpened:boolean;
    for (let i = begin ; i <= end; i++) {

      if (stop) {
          break;
      }
      setCurPort(i.toString());
      portOpened = await apiPortScan(_props.IP, i);
      if (portOpened) {
        setFoundPorts([...foundPorts(), i]);
      }
    }
  };

  const handleStop = () => {
    if (stop) {
      setBegin(curPort());
      handleScan();
    } else {
      stop = true;
    }
  }

  return (
    <div class={cardClass}>
      <div class={cardHeaderClass}>Port Scan</div>
      <div class={cardBodyClass}>
        <div class="flex items-center gap-2">
          <input type="text" class={inputClass} placeholder="1"
            onInput={e => setBegin(e.target.value)}></input>
          <input type="text" class={inputClass} placeholder="65535"
            onInput={e => setEnd(e.target.value)}></input>
          <button type="button" onClick={handleScan} class={primaryBtnClass + " whitespace-nowrap"}>Scan</button>
        </div>
        <Show when={curPort() != ""}>
          <div class="flex items-center justify-between mt-3 text-sm text-slate-500 dark:text-slate-400">
            <button type="button" onClick={handleStop} class={secondaryBtnClass}>Stop/Continue</button>
            <div>Scanning port: {curPort()}</div>
          </div>
        </Show>
        <div class="flex flex-wrap gap-2 mt-3">
        <For each={foundPorts()}>{(port) => {
          const serviceName = getWellKnownPortName(port);
          return (
            <a
              href={"http://" + _props.IP + ":" + port}
              target="_blank"
              title={serviceName ? `Port ${port} · ${serviceName}` : `Port ${port}`}
              class="px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 text-sm font-medium hover:underline inline-flex items-baseline gap-1.5"
            >
              <span>{port}</span>
              <Show when={serviceName}>
                <span class="text-xs font-normal text-emerald-600/80 dark:text-emerald-400/70">{serviceName}</span>
              </Show>
            </a>
          );
        }}</For>
        </div>
      </div>
    </div>
  )
}

export default Ping
