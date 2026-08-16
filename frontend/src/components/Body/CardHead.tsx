import { createSignal, For, Show } from "solid-js";
import { editNames, groups, selectedIDs, setEditNames } from "../../functions/exports";
import Filter from "../Filter";
import Search from "../Search";
import { getHosts } from "../../functions/atstart";
import { apiDelHost, apiSetGroup } from "../../functions/api";

function CardHead() {

  const [groupInput, setGroupInput] = createSignal("");

  const handleEditNames = (toggle: boolean) => {
    if (!toggle) {
      setGroupInput("");
      getHosts();
    }
    setEditNames(toggle);
  };

  const handleDel = async () => {
    const ids = selectedIDs();

    for (let id of ids) {
      await apiDelHost(id);
    }

    window.location.href = '/';
  };

  const handleSetGroup = async () => {
    const ids = selectedIDs();
    const group = groupInput().trim();

    if (ids.length === 0) {
      return;
    }

    for (let id of ids) {
      await apiSetGroup(id, group);
    }

    setGroupInput("");
    await getHosts();
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
          <input
            type="text"
            list="group-suggestions"
            value={groupInput()}
            onInput={e => setGroupInput((e.target as HTMLInputElement).value)}
            placeholder="Gruppe..."
            title="Gruppe für ausgewählte Geräte (leer lassen zum Entfernen)"
            class="px-2.5 py-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-sm w-32"
          />
          <datalist id="group-suggestions">
            <For each={groups()}>{(group) => <option value={group} />}</For>
          </datalist>
          <button
            type="button"
            onClick={handleSetGroup}
            disabled={selectedIDs().length === 0}
            title="Gruppe für ausgewählte Geräte setzen"
            class="px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-800 text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 whitespace-nowrap disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Gruppe zuweisen
          </button>
          <button
            type="button"
            onClick={handleDel}
            title="Ausgewählte Geräte löschen"
            class="px-3 py-2 rounded-lg border border-red-200 dark:border-red-900/50 text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 whitespace-nowrap"
          >
            Löschen
          </button>
          <button
            onClick={[handleEditNames, false]}
            title="Bearbeiten beenden"
            class="px-3 py-2 rounded-lg bg-brand-600 text-white text-sm font-medium hover:bg-brand-700 whitespace-nowrap"
          >
            Fertig
          </button>
        </Show>
      </div>
    </div>
  )
}

export default CardHead
