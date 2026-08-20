# Change Log
All notable changes to this project will be documented in this file.

> [!NOTE]
> This is [gbomacfly/WatchYourLAN](https://github.com/gbomacfly/WatchYourLAN), a fork of [aceberg/WatchYourLAN](https://github.com/aceberg/WatchYourLAN). Entries from `v2.1.4` and earlier are upstream's original history. Everything under **Fork** below is specific to this repo.

## [Fork] - unreleased
### Planned
- Config-based MAC vendor overrides: let users map custom MAC prefixes to their own names for hosts the OUI database can't identify (homemade hardware, Proxmox VMs, ...) - see upstream [#185](https://github.com/aceberg/WatchYourLAN/issues/185)

## [Fork 2.9.3] - 2026-08-20
### Changed
- Host detail page: the tag autocomplete dropdown now preselects its first entry as soon as it has any matches, so pressing Enter accepts it immediately without needing to press Down first - same as a browser address bar.

## [Fork 2.9.2] - 2026-08-20
### Added
- Host detail page: the tag autocomplete dropdown can now be navigated with Up/Down (wraps around at either end, scrolling the highlighted entry into view), Enter picks the highlighted suggestion, and Escape closes it. Enter with nothing highlighted still adds whatever's typed as a brand new tag, as before.

## [Fork 2.9.1] - 2026-08-20
### Added
- Host detail page: Left/Right arrow keys now also step to the previous/next device, same as the "← Vorheriges" / "Nächstes →" buttons. Disabled while typing in a text field (device name, tags, port range, history date), so it doesn't interfere with normal editing.

## [Fork 2.9.0] - 2026-08-20
### Added
- Host detail page: "← Vorheriges" / "Nächstes →" buttons to step through devices without going back to the Übersicht table, plus a "current position / total" indicator. Follows whatever order the table is currently sorted/filtered to, not raw ID order - the arrows disable themselves at the first/last device.

## [Fork 2.8.1] - 2026-08-18
### Fixed
- A limited-range port scan (e.g. re-scanning just 1-1024) was overwriting the *entire* saved scan result, wiping out ports previously found outside that range. Saving now only replaces results within the range that was actually scanned; `POST /api/portscan/:id` takes the scanned `Begin`/`End` range alongside the found ports to make this possible.

## [Fork 2.8.0] - 2026-08-18
### Added
- Port scan results (open ports + banners) are now saved per host once a scan finishes, with the timestamp of the last scan. Reopening a host's detail page shows the last results right away instead of an empty list - a new scan (partial range or full) can still be started at any time and overwrites the saved results once it completes. A scan that's stopped/paused mid-way is not saved until it's let run to completion. New endpoint: `POST /api/portscan/:id`.

## [Fork 2.7.6] - 2026-08-18
### Added
- Host detail page: the tag input now autocompletes as you type - the dropdown filters down to matching existing tags instead of only offering the full list via the arrow button. Escape closes it.

## [Fork 2.7.5] - 2026-08-18
### Fixed
- Host detail page crashed with "y is not a function or its return value is not iterable" and silently dropped the tag pills, because the previous release only shipped 2 of the 6 built frontend JS chunks. Vite assigns short internal names to shared exports on every build, even for files whose source didn't change, so the un-updated chunks (`MacHistory.js`, `Config.js`, `History.js`, `formStyles.js`) ended up importing names that no longer existed in the newly-built `index.js`. The built JS chunks are always a matched set now - all of them ship together on every release, not just the ones with source changes.

## [Fork 2.7.4] - 2026-08-18
### Fixed
- Host detail page could get stuck on "Lade..." forever: the router's `id` param was occasionally still undefined at the moment the page's data fetch kicked off, which fired a request to `/api/host/undefined` instead of the real host id and left the page waiting for data that was never coming. The page's id is now also read directly from the URL as a fallback, and the fetch is skipped entirely (instead of firing with a broken id) whenever no id is available yet.

## [Fork 2.7.3] - 2026-08-18
### Fixed
- Reverse-DNS lookups (used when loading a single host's detail page, and for naming newly discovered hosts during a scan) had no timeout - a slow or unreachable DNS server (e.g. no PTR records on a home network) could block the request indefinitely. The host detail page's new "Lade..." state made this pre-existing hang newly visible as a page that never finishes loading. Lookups now give up after 2 seconds.

## [Fork 2.7.2] - 2026-08-18
### Fixed
- Host detail page could end up rendering with an undefined host object (e.g. while the `/api/host/:id` request was still in flight), which crashed the tag editor and any other interaction on the page - and, since the crash happened mid-render, could leave the app looking "stuck" on subsequent client-side navigation (URL changes, content doesn't) until a full reload. The page now waits for the host to actually be loaded before rendering, with a small "Lade..." placeholder in the meantime, and tag-saving is guarded against firing without a valid host.

## [Fork 2.7.1] - 2026-08-18
### Changed
- Host detail page: tags are now shown as small removable pills, with a dropdown to pick from existing tags (click to add) plus a text field to add a brand new one. Replaces the plain comma-separated text field, which also wasn't reliably reflecting a host's already-assigned tags.

## [Fork 2.7.0] - 2026-08-17
### Added
- Hosts can now have multiple free-form tags instead of a single group, filterable in the sidebar and editable per-host (Host detail page) or in bulk (select hosts, type comma-separated tags, assign). Closes upstream [#152](https://github.com/aceberg/WatchYourLAN/issues/152).

### Changed
- API: `/api/group/:id/*name` and `/api/groups` are replaced by `/api/tags/:id/*name` (comma-separated tag list) and `/api/tags`. Existing single-group assignments are preserved as a one-tag list - no manual migration needed, same DB column is reused.

## [Fork 2.6.2] - 2026-08-17
### Changed
- Clicking a device's name in the host table now opens that device's detail/edit page (`/host/:id`), instead of switching the whole table into bulk edit mode

## [Fork 2.6.1] - 2026-08-17
### Added
- Clicking a device's name in the host table now also opens edit mode (previously only the "Bearbeiten" button did)

## [Fork 2.6.0] - 2026-08-17
### Added
- Port scanner now grabs a short greeting/banner from each open port (`GET /api/banner/:addr/:port`): reads what the service volunteers on connect for greeting-first protocols (SSH, FTP, SMTP, ...), or sends a minimal HTTP HEAD request otherwise, with automatic TLS for common TLS ports (443, 993, ...). Shown under each found port in the UI as soon as it's ready, without slowing down the scan itself.

## [Fork 2.5.0] - 2026-08-17
### Added
- Open ports found by the port scanner now show a well-known service name (e.g. "22 SSH", "80 HTTP", "32400 Plex") next to the port number, with the full name in a hover tooltip, covering common IANA well-knowns plus self-hosted apps often found on a home/small office LAN

## [Fork 2.4.0] - 2026-08-17
### Added
- The stat tiles above the host table (Gesamt/Online/Offline/Bekannt/Unbekannt) are now clickable and filter the table, with the active tile highlighted
- "Alle"/"Keine" button in edit mode to select or deselect all visible hosts at once
- The group-assign button now reads "Gruppe entfernen" and its tooltip explains that leaving the group field empty removes the selected hosts from their group

### Changed
- Selection checkboxes are now cleared automatically after assigning/removing a group, and when leaving edit mode

## [Fork 2.3.0] - 2026-08-17
### Changed
- Config, History and Host detail pages restyled from Bootstrap to Tailwind CSS, matching the rest of the UI (cards, inputs, buttons, dark/light mode). This was the last batch of pages still using Bootstrap.

### Removed
- Bootstrap is gone entirely - no page renders any Bootstrap markup anymore, so the Bootswatch theme bundle and bootstrap-icons introduced in 2.2.0 (~7.6 MB in the binary) are removed again, along with the `THEME` config option and the Config page's theme picker. `COLOR` (light/dark/system) is unaffected and still controls the UI.

## [Fork 2.2.0] - 2026-08-17
### Added
- Tailwind CSS-based UI redesign: fixed sidebar layout, stat tiles, dark/light/system color mode toggle (phased rollout, in progress)
- `Group` field on hosts, plus `GET /api/group/:id/:name` and `GET /api/groups` API endpoints, wired into the Sidebar (group filter) and edit mode (assign group to selected hosts)
- Automatic download and weekly refresh of a MAC vendor database (`ieee-oui.txt`) converted from Wireshark's `manuf` file, which includes fuller vendor names than arp-scan's own upstream copy, see [FAQ.md](FAQ.md)
- `.env`-based configuration for `docker-compose.yml` / `docker-compose-auth.yml`, with `.env.example` as a template

### Changed
- Docker images published to `ghcr.io/gbomacfly/watchyourlan` via this repo's own GitHub Actions workflow, instead of upstream's Docker Hub / GHCR images
- Go module renamed from `github.com/aceberg/WatchYourLAN` to `github.com/gbomacfly/WatchYourLAN`
- `COLOR` config gained a `system` option, in addition to `light`/`dark`
- `docker-compose.yml` volumes now default to `./data` next to the compose file, instead of `~/.dockerdata`
- All Bootswatch themes and bootstrap-icons are now bundled directly in the binary instead of being pulled from a CDN or the optional `node-bootstrap` helper container - the web GUI now works fully offline out of the box. The `NODEPATH`/`-n` config option and the `node-bootstrap` compose service are gone.

### Fixed
- Hardware/vendor field was only ever set on a host's first discovery and never refreshed on later scans, even after the MAC vendor database improved. It's now refreshed on every scan.
- History page showed an empty list after a hard reload (only a filter click, e.g. "Zurücksetzen", brought the list back). The page kept its own one-time, non-reactive snapshot of the host list instead of reading the reactive store directly, so it never picked up the async initial data load.
- Row-selection checkbox now sits before the online-status indicator instead of at the far right.

## [v2.1.4] - 2025-09-10
### Added
- Swagger API docs (`/swagger/index.html`)
- Add host from API [#72](https://github.com/aceberg/WatchYourLAN/issues/72)
- Trigger rescan from API or by pressing `Save` on `Config/Scan settings` [#74](https://github.com/aceberg/WatchYourLAN/issues/74)
- Delete selected hosts [#195](https://github.com/aceberg/WatchYourLAN/issues/195)
- Wake-on-LAN [#135](https://github.com/aceberg/WatchYourLAN/issues/135), [#196](https://github.com/aceberg/WatchYourLAN/issues/196)

## [v2.1.3] - 2025-07-26
### Fixed
- Memory leak bug [#149](https://github.com/aceberg/WatchYourLAN/issues/149)
- Duplicated devices bug [#187](https://github.com/aceberg/WatchYourLAN/issues/187) [#198](https://github.com/aceberg/WatchYourLAN/issues/198)

### Changed
- **DEPRECATED:** `HIST_IN_DB` config option. Now history is always stored in `DB`
- Upd to `go 1.24.5`
- Moved `DB` handling to `GORM`
- Moved to maintained `Shoutrrr`: [github.com/nicholas-fedor/shoutrrr](https://github.com/nicholas-fedor/shoutrrr) ([#197](https://github.com/aceberg/WatchYourLAN/issues/197))

## [v2.1.2] - 2025-03-30
### Fixed
- Edit names bug
- History page full rerenders replaced with only rerendering updated data
- Select options reset

## [v2.1.1] - 2025-03-26
### Fixed
- Filter bug in Chrome

## [v2.1.0] - 2025-03-25
### Added
- Rewrited GUI in `SolidJS` and `TypeScript`
- Prometheus integration [#181](https://github.com/aceberg/WatchYourLAN/pull/181)
- Optimized Docker build [#180](https://github.com/aceberg/WatchYourLAN/pull/180)

### Fixed
- Vite: file names
- Node Path bug

## [v2.0.4] - 2024-10-21
### Added
- Notification test [#147](https://github.com/aceberg/WatchYourLAN/issues/147) 
- API status [#148](https://github.com/aceberg/WatchYourLAN/issues/148) 

### Fixed
- [#101](https://github.com/aceberg/WatchYourLAN/issues/101) 
- The same problem for Theme, Color mode, Log level
- Sort bug in Chrome [#140](https://github.com/aceberg/WatchYourLAN/issues/140) 

## [v2.0.3] - 2024-09-17
### Fixed
- `ARP_STRS_JOINED` should be empty in config file
- Optimized History Trim

## [v2.0.2] - 2024-09-07
### Added
- Remember Refresh setting in browser [#123](https://github.com/aceberg/WatchYourLAN/issues/123)

### Fixed
- Error when `IFACES` are empty
- Sticky sort bug fix
- Bug [#124](https://github.com/aceberg/WatchYourLAN/issues/124)
- Bug [#128](https://github.com/aceberg/WatchYourLAN/issues/128)


## [v2.0.1] - 2024-09-02
### Added
- `Vlans` and `docker0` support [#47](https://github.com/aceberg/WatchYourLAN/issues/47). Thanks [thehijacker](https://github.com/thehijacker)!
- Remember `sort` field
- `InfluxDB` error handling

### Fixed
- Bug [#103](https://github.com/aceberg/WatchYourLAN/issues/103)
- Bug [#104](https://github.com/aceberg/WatchYourLAN/issues/104). Thanks [Steve Clement](https://github.com/SteveClement)!

## [v2.0.0] - 2024-08-30
### Added
- API
- Arguments for `arp-scan` option
- `InfluxDB` export
- `PostgreSQL` or `SQLite` DB options
- Names from DNS

### Changed
- Better UI with JS
- Switched to `gin` web framework
- Reworked DB schema and config variables

