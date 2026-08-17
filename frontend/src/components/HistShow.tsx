import { setShow, show } from "../functions/exports";

function HistShow(_props: any) {

  const handleSaveShow = (showStr: string) => {
    localStorage.setItem(_props.name, showStr);

    setShow(+showStr);
    show() == 0 ? setShow(200) : '';
  };

  return (
    <input
      class="px-3 py-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-sm w-40 focus:outline-none focus:ring-2 focus:ring-brand-500"
      onInput={e => handleSaveShow(e.target.value)}
      placeholder="Anzahl Einträge"
      title="Anzahl der anzuzeigenden Einträge"
    ></input>
  )
}

export default HistShow
