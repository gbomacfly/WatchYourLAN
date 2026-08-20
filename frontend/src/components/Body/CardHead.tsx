import { createSignal, For, Show } from "solid-js";
import { allHosts, editNames, tags, selectedIDs, setEditNames, setSelectedIDs } from "../../functions/exports";
import Filter from "../Filter";
import Search from "../Search";
import { getHosts } from "../../functions/atstart";
import { apiDelHost, apiGetBanner, apiPortScan, apiSavePortScan, apiSetTags } from "../../functions/api";

function CardHead() {

  const [tagsInput, setTagsInput] = createSignal("");

  const handleEditNames = (toggle: boolean) => {
    if (!toggle) {
      setTagsInput("");
      setSelectedIDs([]);
      getHosts();
    }
    setEditNames(toggle);
  };

  const allSelected = () => allHosts.length > 0 && selectedIDs().length === allHosts.length;

  const handleToggleSelectAll = () => {
    if (allSelected()) {
      setSelectedIDs([]);
    } else {
      setSelectedIDs(allHosts.map(h => h.ID));
    }
  };

  const handleDel = async () => {
    const ids = selectedIDs();

    for (let id of ids) {
      await apiDelHost(id);
    }

    window.location.href = '/';
  };

  const parsedTags = () => tagsInput().split(',').map(t => t.trim()).filter(t => t !== "");

  const handleSetTags = async () => {
    const ids = selectedIDs();
    const newTags = parsedTags();

    if (ids.length === 0) {
      return;
    }

    for (let id of ids) {
      await apiSetTags(id, newTags);
    }

    setTagsInput("");
    setSelectedIDs([]);
    await getHosts();
  };

  // Bulk port scan across all currently selected hosts. Runs one host at a time (each
  // host still scans its own port range sequentially, same as the single-host scan on
  // the detail page) and saves results per host via the same /api/portscan endpoint, so
  // reopening a host's detail page afterwards shows the freshly scanned ports as cached.
  const [scanBegin, setScanBegin] = createSignal("");
  const [scanEnd, setScanEnd] = createSignal("");
  const [scanning, setScanning] = createSignal(false);
  const [scanStatus, setScanStatus] = createSignal("");
  let stopScan = false;

  const handlePortScan = async () => {
    const ids = selectedIDs();
    if (ids.length === 0) {
      return;
    }

    let begin = Number(scanBegin());
    if (Number.isNaN(begin) || begin < 1 || begin > 65535) {
      begin = 1;
    }
    let end = Number(scanEnd());
    if (Number.isNaN(end) || end < 1 || end > 65535) {
      end = 65535;
    }

    stopScan = false;
    setScanning(true);

    for (let hi = 0; hi < ids.length; hi++) {
      if (stopScan) {
        break;
      }
      const id = ids[hi];
      const host = allHosts.find(h => h.ID === id);
      if (!host) {
        continue;
      }

      const found: number[] = [];
      const bannersMap: Record<number, string> = {};
      const bannerFetches: Promise<void>[] = [];

      for (let port = begin; port <= end; port++) {
        if (stopScan) {
          break;
        }
        setScanStatus(`(${hi + 1}/${ids.length}) ${host.Name}: Port ${port}`);
        const open = await apiPortScan(host.IP, port);
        if (open) {
          found.push(port);
          bannerFetches.push(
            apiGetBanner(host.IP, port)
              .then(banner => { bannersMap[port] = banner || ""; })
              .catch(() => { bannersMap[port] = ""; })
          );
        }
      }

      // Only persist a host's results once its own range finished (mirrors the single-host
      // scan's "only save on natural completion" rule) - if stopped mid-host, leave its
      // previously saved results untouched rather than saving a partial scan as if complete.
      if (!stopScan) {
        await Promise.all(bannerFetches);
        const ports = found.map(port => ({ Port: port, Banner: bannersMap[port] ?? "" }));
        try {
          await apiSavePortScan(id, begin, end, ports);
        } catch (err) {
          console.error("Failed to save bulk port scan results for host " + id, err);
        }
      }
    }

    setScanning(false);
    setScanStatus("");
  };

  const handleStopScan = () => {
    stopScan = true;
  };

  return (
    <div class="flex flex-col sm:flex-row sm:items-center gap-3">
      <Filter></Filter>
      <div class="flex items-center gap-2 sm:ml-auto">
        <Search></Search>
        <Show
          when={editNames()}
          fallback={
            <button
              title="Namen bearbeiten"
              onClick={[handleEditNames, true]}
              class="px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-800 text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 whitespace-nowrap"
            >
              Bearbeiten
            </button>
          }
        >
          <button
            type="button"
            onClick={handleToggleSelectAll}
            title={allSelected() ? "Alle abwählen" : "Alle auswählen"}
            class="px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-800 text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 whitespace-nowrap"
          >
            {allSelected() ? "Keine" : "Alle"}
          </button>
          <input
            type="text"
            list="tag-suggestions"
            value={tagsInput()}
            onInput={e => setTagsInput((e.target as HTMLInputElement).value)}
            placeholder="Tags..."
            title="Kommagetrennte Tags für ausgewählte Geräte, ersetzt bestehende Tags (leer lassen, um alle Tags zu entfernen)"
            class="px-2.5 py-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-sm w-40"
          />
          <datalist id="tag-suggestions">
            <For each={tags()}>{(tag) => <option value={tag} />}</For>
          </datalist>
          <button
            type="button"
            onClick={handleSetTags}
            disabled={selectedIDs().length === 0}
            title={parsedTags().length === 0 ? "Alle Tags der ausgewählten Geräte entfernen" : "Tags für ausgewählte Geräte setzen (ersetzt bestehende Tags)"}
            class="px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-800 text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 whitespace-nowrap disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {parsedTags().length === 0 ? "Tags entfernen" : "Tags zuweisen"}
          </button>
          <button
            type="button"
            onClick={handleDel}
            title="Ausgewählte Geräte löschen"
            class="px-3 py-2 rounded-lg border border-red-200 dark:border-red-900/50 text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 whitespace-nowrap"
          >
            Löschen
          </button>
          <input
            type="text"
            value={scanBegin()}
            onInput={e => setScanBegin((e.target as HTMLInputElement).value)}
            placeholder="1"
            title="Erster Port (Standard: 1)"
            class="px-2 py-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-sm w-14"
          />
          <input
            type="text"
            value={scanEnd()}
            onInput={e => setScanEnd((e.target as HTMLInputElement).value)}
            placeholder="65535"
            title="Letzter Port (Standard: 65535)"
            class="px-2 py-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-sm w-16"
          />
          <button
            type="button"
            onClick={handlePortScan}
            disabled={selectedIDs().length === 0 || scanning()}
            title="Portscan für ausgewählte Geräte starten"
            class="px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-800 text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 whitespace-nowrap disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Portscan
          </button>
          <Show when={scanning()}>
            <button
              type="button"
              onClick={handleStopScan}
              title="Portscan abbrechen"
              class="px-3 py-2 rounded-lg border border-red-200 dark:border-red-900/50 text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 whitespace-nowrap"
            >
              Stop
            </button>
          </Show>
          <button
            onClick={[handleEditNames, false]}
            title="Bearbeiten beenden"
            class="px-3 py-2 rounded-lg bg-brand-600 text-white text-sm font-medium hover:bg-brand-700 whitespace-nowrap"
          >
            Fertig
          </button>
        </Show>
      </div>
      <Show when={editNames() && scanning()}>
        <div class="text-xs text-slate-400 dark:text-slate-500 italic sm:ml-auto">
          Portscan läuft: {scanStatus()}
        </div>
      </Show>
    </div>
  )
}

export default CardHead
