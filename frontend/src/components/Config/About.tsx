import { createSignal, onMount } from "solid-js";
import { apiGetVersion } from "../../functions/api"
import { cardBodyClass, cardClass, cardHeaderClass } from "./formStyles"

function About() {

  const [version, setVersion] = createSignal('');
  const [link, setLink] = createSignal('');

  onMount(async () => {
    const v = await apiGetVersion();
    setVersion(v);
    setLink("https://github.com/gbomacfly/WatchYourLAN/releases/tag/"+v);
  });

  const rows: [string, any][] = [
    ["Swagger API docs", <a href="/swagger/index.html" target="_blank" class="text-brand-600 dark:text-brand-400 hover:underline">/swagger/index.html</a>],
    ["Shoutrrr URL", <>provides notifications to Discord, Email, Gotify, Telegram and other services. <a href="https://shoutrrr.nickfedor.com/services/overview/" target="_blank" class="text-brand-600 dark:text-brand-400 hover:underline">Link to documentation</a></>],
    ["Interfaces", "one or more, space separated"],
    ["Timeout (seconds)", "time between scans"],
    ["Args for arp-scan", <>pass your own arguments to <code class="px-1 rounded bg-slate-100 dark:bg-slate-800">arp-scan</code>. Enable <b>debug</b> log level to see resulting command. (Example: <code class="px-1 rounded bg-slate-100 dark:bg-slate-800">-r 1</code>). See <a href="https://github.com/gbomacfly/WatchYourLAN/blob/main/docs/VLAN_ARP_SCAN.md" target="_blank" class="text-brand-600 dark:text-brand-400 hover:underline">docs</a> for more</>],
    ["Arp Strings", <>can setup scans for <code class="px-1 rounded bg-slate-100 dark:bg-slate-800">vlans</code>, <code class="px-1 rounded bg-slate-100 dark:bg-slate-800">docker0</code> and etcetera. See <a href="https://github.com/gbomacfly/WatchYourLAN/blob/main/docs/VLAN_ARP_SCAN.md" target="_blank" class="text-brand-600 dark:text-brand-400 hover:underline">docs</a> for more</>],
    ["Trim History", "remove history after (hours)"],
    ["PG Connect URL", <>address to connect to PostgreSQL DB. (Example: <code class="px-1 rounded bg-slate-100 dark:bg-slate-800">postgres://username:password@192.168.0.1:5432/dbname?sslmode=disable</code>). Full list of URL parameters <a href="https://pkg.go.dev/github.com/lib/pq#hdr-Connection_String_Parameters" target="_blank" class="text-brand-600 dark:text-brand-400 hover:underline">here</a></>],
  ];

  return (
    <div class={cardClass}>
      <div class={cardHeaderClass}>
        About (<a href={link()} target="_blank" class="text-brand-600 dark:text-brand-400 hover:underline">{version()}</a>)
      </div>
      <div class={cardBodyClass}>
        <dl class="space-y-3 text-sm">
          {rows.map(([term, desc]) => (
            <div>
              <dt class="font-semibold text-slate-700 dark:text-slate-200">{term}</dt>
              <dd class="text-slate-500 dark:text-slate-400 mt-0.5">{desc}</dd>
            </div>
          ))}
        </dl>
      </div>
    </div>
  )
}

export default About
