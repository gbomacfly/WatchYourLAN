# Change Log
All notable changes to this project will be documented in this file.

> [!NOTE]
> This is [gbomacfly/WatchYourLAN](https://github.com/gbomacfly/WatchYourLAN), a fork of [aceberg/WatchYourLAN](https://github.com/aceberg/WatchYourLAN). Entries from `v2.1.4` and earlier are upstream's original history. Everything under **Fork** below is specific to this repo.

## [Fork] - unreleased

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

