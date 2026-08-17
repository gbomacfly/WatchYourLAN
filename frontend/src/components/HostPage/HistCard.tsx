import { createSignal, onMount, Show } from "solid-js";
import { setShow } from "../../functions/exports";
import MacHistory from "../MacHistory"
import { cardBodyClass, cardClass, cardHeaderClass, inputClass } from "../Config/formStyles";

function HistCard(_props: any) {

  const [today, setToday] = createSignal('');

  onMount(() => {
    setShow(15000);
    setToday(new Date().toLocaleDateString("en-CA"));
  });

  const handleDate = (date: string) => {
    setToday("");
    setToday(date);
  };

  return (
    <div class={cardClass}>
      <div class={cardHeaderClass + " flex items-center gap-3"}>
        <span class="whitespace-nowrap">Host History for</span>
        <input
          type="date"
          class={inputClass + " w-auto"}
          value={today()}
          onInput={(e) => handleDate(e.currentTarget.value)}
        />
      </div>
      <div class={cardBodyClass}>
        <Show when={_props.mac !== "" && today() !== ""} fallback={<span class="text-sm text-slate-400">Loading...</span>}>
          <MacHistory mac={_props.mac} date={today()}></MacHistory>
        </Show>
      </div>
    </div>
  )
}

export default HistCard
