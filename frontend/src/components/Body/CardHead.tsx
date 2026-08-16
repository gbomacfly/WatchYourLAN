import { Show } from "solid-js";
import { editNames, selectedIDs, setEditNames } from "../../functions/exports";
import Filter from "../Filter";
import Search from "../Search";
import { getHosts } from "../../functions/atstart";
import { apiDelHost } from "../../functions/api";

function CardHead() {

  const handleEditNames = (toggle: boolean) => {
    if (!toggle) {
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
