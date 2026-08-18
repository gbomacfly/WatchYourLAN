import { useParams } from "@solidjs/router";
import { createResource, Show } from "solid-js";

import { apiGetHost } from "../functions/api";

import HostCard from "../components/HostPage/HostCard";
import Ping from "../components/HostPage/Ping";
import HistCard from "../components/HostPage/HistCard";

function HostPage() {

  const params = useParams();

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
