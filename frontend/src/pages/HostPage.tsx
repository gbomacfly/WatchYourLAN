import { useParams } from "@solidjs/router";
import { createResource, Show } from "solid-js";

import { apiGetHost } from "../functions/api";

import HostCard from "../components/HostPage/HostCard";
import Ping from "../components/HostPage/Ping";
import HistCard from "../components/HostPage/HistCard";

function HostPage() {

  const params = useParams();

  // createResource (instead of a one-shot onMount) re-fetches whenever
  // params.id changes, and its accessor is undefined until the fetch
  // resolves - the <Show> below relies on that to guarantee HostCard/Ping/
  // HistCard never render with an undefined host.
  const [currentHost] = createResource(() => params.id, apiGetHost);

  return (
    <Show when={currentHost()} fallback={<div class="text-sm text-slate-400 dark:text-slate-500">Lade...</div>}>
      {(host) => (
        <div class="flex flex-col gap-4">
          <div class="grid grid-cols-1 lg:grid-cols-2 gap-4 items-start">
            <HostCard host={host()}></HostCard>
            <Ping IP={host().IP}></Ping>
          </div>
          <HistCard mac={host().Mac}></HistCard>
        </div>
      )}
    </Show>
  )
}

export default HostPage
