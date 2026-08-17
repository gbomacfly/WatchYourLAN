import { createSignal, For, Show } from "solid-js";
import { allHosts, editNames, tags, selectedIDs, setEditNames, setSelectedIDs } from "../../functions/exports";
import Filter from "../Filter";
import Search from "../Search";
import { getHosts } from "../../functions/atstart";
import { apiDelHost, apiSetTags } from "../../functions/api";

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
