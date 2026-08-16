import { searchFunc } from "../functions/search";

function Search() {

  const handleSearch = (s: string) => {
      searchFunc(s);
  };

  return (
    <div class="relative w-full sm:w-64">
      <svg class="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-4.35-4.35M17 11a6 6 0 11-12 0 6 6 0 0112 0z"/>
      </svg>
      <input
        onInput={e => handleSearch(e.target.value)}
        placeholder="Gerät, IP oder MAC suchen…"
        title="Suchen"
        class="w-full pl-9 pr-3 py-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500"
      ></input>
    </div>
  )
}

export default Search
