import { createEffect, createSignal, For, onCleanup, Show } from "solid-js";
import { apiDelHost, apiEditHost, apiSetTags, apiWOL } from "../../functions/api";
import { cardBodyClass, cardClass, cardHeaderClass, inputClass } from "../Config/formStyles";
import { tags as allTags } from "../../functions/exports";

import { debounce } from "@solid-primitives/scheduled";

function Row(_props: any) {
  return (
    <div class="flex items-center justify-between gap-4 py-2 border-b border-slate-100 dark:border-slate-800 last:border-0">
      <span class="text-sm text-slate-500 dark:text-slate-400 shrink-0">{_props.label}</span>
      <span class="text-sm font-medium text-slate-800 dark:text-slate-100 text-right min-w-0">{_props.children}</span>
    </div>
  )
}

function TagsEditor(_props: any) {

  const [hostTags, setHostTags] = createSignal<string[]>([]);
  const [newTag, setNewTag] = createSignal("");
  const [dropdownOpen, setDropdownOpen] = createSignal(false);

  let containerRef: HTMLDivElement | undefined;

  // Keep the local, editable tag list in sync whenever the host prop
  // (re)loads - e.g. once HostPage's async apiGetHost() call resolves.
  createEffect(() => {
    setHostTags([..._props.host.Tags ?? []]);
  });

  const availableTags = () => allTags().filter(t => !hostTags().includes(t));

  const persist = async (next: string[]) => {
    setHostTags(next);
    await apiSetTags(_props.host.ID, next);
  };

  const addTag = (tag: string) => {
    tag = tag.trim();
    if (tag === "" || hostTags().includes(tag)) {
      return;
    }
    persist([...hostTags(), tag]);
  };

  const removeTag = (tag: string) => {
    persist(hostTags().filter(t => t !== tag));
  };

  const handleAddCustom = () => {
    addTag(newTag());
    setNewTag("");
    setDropdownOpen(false);
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddCustom();
    }
  };

  const handleDocClick = (e: MouseEvent) => {
    if (dropdownOpen() && containerRef && !containerRef.contains(e.target as Node)) {
      setDropdownOpen(false);
    }
  };

  document.addEventListener("click", handleDocClick);
  onCleanup(() => document.removeEventListener("click", handleDocClick));

  return (
    <div class="flex flex-col items-end gap-2 w-full">
      <div class="flex flex-wrap justify-end gap-1.5">
        <For each={hostTags()}>
          {(tag) => (
            <span class="inline-flex items-center gap-1 pl-2.5 pr-1.5 py-0.5 rounded-full bg-brand-50 dark:bg-brand-900/30 text-brand-700 dark:text-brand-300 text-xs font-medium">
              {tag}
              <button
                type="button"
                onClick={() => removeTag(tag)}
                title="Tag entfernen"
                class="w-3.5 h-3.5 flex items-center justify-center rounded-full leading-none hover:bg-brand-200 dark:hover:bg-brand-800"
              >
                ×
              </button>
            </span>
          )}
        </For>
        <Show when={hostTags().length === 0}>
          <span class="text-xs text-slate-400 dark:text-slate-500 italic">Keine Tags</span>
        </Show>
      </div>

      <div class="relative flex items-center gap-1.5" ref={containerRef}>
        <input
          type="text"
          class={inputClass + " text-right w-32"}
          value={newTag()}
          placeholder="Tag hinzufügen..."
          title="Neuen Tag eingeben und Enter drücken"
          onInput={e => setNewTag((e.target as HTMLInputElement).value)}
          onKeyDown={handleKeyDown}
        ></input>
        <button
          type="button"
          onClick={() => setDropdownOpen(o => !o)}
          title="Vorhandene Tags auswählen"
          class="w-8 h-8 shrink-0 rounded-lg border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800"
        >
          <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7"/></svg>
        </button>

        <Show when={dropdownOpen()}>
          <div class="absolute right-0 top-full mt-1 z-10 w-48 max-h-56 overflow-auto rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-lg py-1">
            <Show when={availableTags().length > 0} fallback={
              <div class="px-3 py-1.5 text-xs text-slate-400 dark:text-slate-500 italic">Keine weiteren Tags</div>
            }>
              <For each={availableTags()}>
                {(tag) => (
                  <button
                    type="button"
                    onClick={() => { addTag(tag); setDropdownOpen(false); }}
                    class="block w-full text-left px-3 py-1.5 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
                  >
                    {tag}
                  </button>
                )}
              </For>
            </Show>
          </div>
        </Show>
      </div>
    </div>
  )
}

function HostCard(_props: any) {

  let name:string = "";

  const debouncedApi = debounce(async (val: string) => {
      await apiEditHost(_props.host.ID, val, "");
    }, 300);

  const handleInput = async (n: string) => {

    name = n;
    debouncedApi(n);
  };

  const handleToggle = async () => {

    if (name == "") {
      name = _props.host.Name;
    }

    await apiEditHost(_props.host.ID, name, 'toggle');
  };

  const handleDel = async () => {

    await apiDelHost(_props.host.ID);
    window.location.href = '/';
  };

  const handleWOL = async () => {

    await apiWOL(_props.host.Mac);
  };

  const known = () => _props.host.Known == 1;
  const online = () => _props.host.Now == 1;

  return (
    <div class={cardClass}>
      <div class={cardHeaderClass}>Host</div>
      <div class={cardBodyClass}>
        <Row label="ID">{_props.host.ID}</Row>
        <Row label="Name">
          <input
            type="text"
            class={inputClass + " text-right"}
            value={_props.host.Name}
            onInput={e => handleInput(e.target.value)}
          ></input>
        </Row>
        <Row label="DNS name">{_props.host.DNS}</Row>
        <Row label="Iface">{_props.host.Iface}</Row>
        <Row label="IP">
          <a href={"http://" + _props.host.IP} target="_blank" class="font-mono text-brand-600 dark:text-brand-400 hover:underline">{_props.host.IP}</a>
        </Row>
        <Row label="MAC">
          <span class="font-mono">{_props.host.Mac}</span>
        </Row>
        <Row label="Hardware">{_props.host.Hw}</Row>
        <Row label="Date">{_props.host.Date}</Row>
        <Row label="Tags">
          <TagsEditor host={_props.host}></TagsEditor>
        </Row>
        <Row label="Known">
          <button
            type="button"
            role="switch"
            aria-checked={known()}
            onClick={handleToggle}
            title={known() ? "Als bekannt markiert" : "Als unbekannt markiert"}
            class={"relative inline-flex h-5 w-9 items-center rounded-full transition-colors " + (known() ? "bg-brand-600" : "bg-slate-300 dark:bg-slate-700")}
          >
            <span class={"inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform " + (known() ? "translate-x-[18px]" : "translate-x-1")}></span>
          </button>
        </Row>
        <Row label="Online">
          <div class="flex items-center justify-end gap-2.5">
            <span class={"w-2 h-2 rounded-full shrink-0 " + (online() ? "bg-emerald-500" : "bg-slate-300 dark:bg-slate-600")}></span>
            <button
              type="button"
              onClick={handleWOL}
              class="px-3 py-1.5 rounded-lg border border-emerald-200 dark:border-emerald-900/50 text-xs font-medium text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 whitespace-nowrap"
            >
              Wake-on-LAN
            </button>
          </div>
        </Row>
        <div class="pt-4">
          <button
            type="button"
            onClick={handleDel}
            class="px-3 py-2 rounded-lg border border-red-200 dark:border-red-900/50 text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30"
          >
            Delete host
          </button>
        </div>
      </div>
    </div>
  )
}

export default HostCard
