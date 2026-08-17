import { createSignal, For, Show } from "solid-js";
import { apiGetBanner, apiPortScan } from "../../functions/api";
import { cardBodyClass, cardClass, cardHeaderClass, inputClass, primaryBtnClass, secondaryBtnClass } from "../Config/formStyles";
import { getWellKnownPortName } from "../../functions/wellKnownPorts";

function Ping(_props: any) {

  let stop = false;

  const [beginStr, setBegin] = createSignal("");
  const [endStr, setEnd] = createSignal("");
  const [curPort, setCurPort] = createSignal("");
  const [foundPorts, setFoundPorts] = createSignal<number[]>([]);
  // Banner grabbing is best-effort and can take a couple seconds per port (protocols that
  // don't greet first need a timeout before we fall back to an HTTP request) - so it runs
  // in the background per found port instead of blocking the scan loop. undefined = not
  // fetched yet, "" = fetched but nothing came back, non-empty = the banner text.
  const [banners, setBanners] = createSignal<Record<number, string | undefined>>({});

  const fetchBanner = async (port: number) => {
    const banner = await apiGetBanner(_props.IP, port);
    setBanners(prev => ({ ...prev, [port]: banner || "" }));
  };

  const handleScan = async () => {
    stop = false;
    setFoundPorts([]);
    setBanners({});

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
        fetchBanner(i); // fire-and-forget, doesn't block the scan
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
        <div class="flex flex-col gap-1.5 mt-3">
        <For each={foundPorts()}>{(port) => {
          const serviceName = getWellKnownPortName(port);
          const banner = () => banners()[port];
          return (
            <div class="rounded-lg bg-emerald-50 dark:bg-emerald-950/40 px-2.5 py-1.5">
              <a
                href={"http://" + _props.IP + ":" + port}
                target="_blank"
                title={serviceName ? `Port ${port} · ${serviceName}` : `Port ${port}`}
                class="text-sm font-medium text-emerald-700 dark:text-emerald-400 hover:underline inline-flex items-baseline gap-1.5"
              >
                <span>{port}</span>
                <Show when={serviceName}>
                  <span class="text-xs font-normal text-emerald-600/80 dark:text-emerald-400/70">{serviceName}</span>
                </Show>
              </a>
              <Show when={banner() === undefined}>
                <div class="text-xs text-slate-400 dark:text-slate-500 mt-0.5 italic">Banner wird gelesen…</div>
              </Show>
              <Show when={banner()}>
                <div
                  class="text-xs font-mono text-slate-500 dark:text-slate-400 mt-0.5 truncate max-w-full"
                  title={banner()}
                >
                  {banner()}
                </div>
              </Show>
            </div>
          );
        }}</For>
        </div>
      </div>
    </div>
  )
}

export default Ping
