import { useNavigate, useParams } from "@solidjs/router";
import { createResource, Show } from "solid-js";

import { apiGetHost } from "../functions/api";
import { allHosts, Host } from "../functions/exports";
import { secondaryBtnClass } from "../components/Config/formStyles";

import HostCard from "../components/HostPage/HostCard";
import Ping from "../components/HostPage/Ping";
import HistCard from "../components/HostPage/HistCard";

function HostPage() {

  const params = useParams();
  const navigate = useNavigate();

  // Steps to the previous/next host in whatever order the Übersicht table is
  // currently showing (allHosts already reflects the active sort and filter) -
  // so the arrows follow the same list the user navigated in from, not some
  // fixed ID order. Undefined at either end of the list, or before allHosts
  // has loaded yet, which disables the corresponding arrow.
  const currentIndex = (id: number) => allHosts.findIndex(h => h.ID === id);

  const prevHost = (current: Host): Host | undefined => {
    const i = currentIndex(current.ID);
    return i > 0 ? allHosts[i - 1] : undefined;
  };

  const nextHost = (current: Host): Host | undefined => {
    const i = currentIndex(current.ID);
    return i >= 0 && i < allHosts.length - 1 ? allHosts[i + 1] : undefined;
  };

  // params.id can momentarily be undefined on first render in this app's
  // router setup, even though the browser URL already has the correct id -
  // that produced real GET /api/host/undefined requests. Fall back to
  // parsing the id straight out of the URL so the source function never
  // hands createResource a falsy-but-truthy-looking value by accident.
  const hostId = () => params.id || window.location.pathname.split("/").filter(Boolean).pop() || "";

  // createResource (instead of a one-shot onMount) re-fetches whenever
  // hostId() changes, and its accessor is undefined until the fetch
  // resolves - the <Show> below relies on that to guarantee HostCard/Ping/
  // HistCard never render with an undefined host. The fetcher itself is
  // guarded so an empty id never turns into a doomed /api/host/ request.
  const [currentHost] = createResource(hostId, (id) => {
    if (!id) {
      return undefined;
    }
    return apiGetHost(id);
  });

  return (
    <Show when={currentHost()} fallback={<div class="text-sm text-slate-400 dark:text-slate-500">Lade...</div>}>
      {(host) => (
        <div class="flex flex-col gap-4">
          <div class="flex items-center justify-between gap-3">
            <button
              type="button"
              disabled={!prevHost(host())}
              onClick={() => { const h = prevHost(host()); if (h) navigate("/host/" + h.ID); }}
              title={prevHost(host())?.Name ? "Vorheriges Gerät: " + prevHost(host())!.Name : "Vorheriges Gerät"}
              class={secondaryBtnClass + " disabled:opacity-40 disabled:cursor-not-allowed whitespace-nowrap"}
            >
              ← Vorheriges
            </button>
            <Show when={currentIndex(host().ID) >= 0}>
              <div class="text-xs text-slate-400 dark:text-slate-500 whitespace-nowrap">
                {currentIndex(host().ID) + 1} / {allHosts.length}
              </div>
            </Show>
            <button
              type="button"
              disabled={!nextHost(host())}
              onClick={() => { const h = nextHost(host()); if (h) navigate("/host/" + h.ID); }}
              title={nextHost(host())?.Name ? "Nächstes Gerät: " + nextHost(host())!.Name : "Nächstes Gerät"}
              class={secondaryBtnClass + " disabled:opacity-40 disabled:cursor-not-allowed whitespace-nowrap"}
            >
              Nächstes →
            </button>
          </div>
          <div class="grid grid-cols-1 lg:grid-cols-2 gap-4 items-start">
            <HostCard host={host()}></HostCard>
            <Ping IP={host().IP} host={host()}></Ping>
          </div>
          <HistCard mac={host().Mac}></HistCard>
        </div>
      )}
    </Show>
  )
}

export default HostPage
