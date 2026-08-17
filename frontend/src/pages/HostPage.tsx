import { useParams } from "@solidjs/router";
import { createSignal, onMount } from "solid-js";

import { apiGetHost } from "../functions/api";

import HostCard from "../components/HostPage/HostCard";
import Ping from "../components/HostPage/Ping";
import HistCard from "../components/HostPage/HistCard";
import { emptyHost, Host } from "../functions/exports";

function HostPage() {

  const [currentHost, setCurrentHost] = createSignal<Host>(emptyHost);

  onMount(async () => {
    const params = useParams();
    const host = await apiGetHost(params.id);

    setCurrentHost(host);
  });

  return (
    <div class="flex flex-col gap-4">
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-4 items-start">
        <HostCard host={currentHost()}></HostCard>
        <Ping IP={currentHost().IP}></Ping>
      </div>
      <HistCard mac={currentHost().Mac}></HistCard>
    </div>
  )
}

export default HostPage
