## API
```http
GET /api/all
```
Returns all hosts in `json`.


```http
GET /api/history
```
Returns all History. Not recommended, the output can be a lot.

```http
GET /api/history/:mac/:date
```
Returns only history of a device with this `mac` filtered by `date`. `date` format can be anything from `2` to `2025-07` to `2025-07-26`.

```http
GET /api/history/:mac?num=20
```
Returns only last 20 lines of history of a device with this `mac`.


```http
GET /api/host/:id
```
Returns host with this `id` in `json`.


```http
GET /api/port/:addr/:port
```
Gets state of one `port` of `addr`. Returns `true` if port is open or `false` otherwise.
<details>
  <summary>Request example</summary>

```bash
curl http://0.0.0.0:8840/api/port/192.168.2.2/8844
```
</details><br>


```http
GET /api/banner/:addr/:port
```
Best-effort: connects to `port` on `addr` and returns whatever greeting/banner text it can read (e.g. an SSH version string, or the HTTP status line + `Server` header for web servers). Returns an empty string if nothing useful came back. Meant to be called after `/api/port/:addr/:port` confirms the port is open.
<details>
  <summary>Request example</summary>

```bash
curl http://0.0.0.0:8840/api/banner/192.168.2.2/22
```
</details><br>


```http
POST /api/portscan/:id
```
Save port scan results for host `id`, so they can be shown again later without re-scanning - the frontend calls this after a port scan finishes. Body is a JSON array of `{"Port": int, "Banner": string}`. The scan timestamp is set server-side. Returns the updated host, which includes the saved results under `PortScan` (`ScannedAt` + `Ports`) - also returned as part of `/api/host/:id` and `/api/all`.
<details>
  <summary>Request example</summary>

```bash
curl -X POST http://0.0.0.0:8840/api/portscan/5 \
  -H "Content-Type: application/json" \
  -d '[{"Port": 22, "Banner": "SSH-2.0-OpenSSH_9.6"}, {"Port": 80, "Banner": ""}]'
```
</details><br>


```http
GET /api/edit/:id/:name/*known
```
Edit host with ID `id`. Can change `name`. `known` is optional, when set to `toggle` will change Known state.


```http
GET /api/tags/:id/*name
```
Replace all tags on host `id` with a comma-separated list, e.g. `Network,IoT`. Pass an empty trailing segment (`/api/tags/5/`) to clear all tags on that host. Returns the updated host.
<details>
  <summary>Request example</summary>

```bash
curl http://0.0.0.0:8840/api/tags/5/Network,IoT
```
</details><br>


```http
GET /api/tags
```
Returns a sorted list of all distinct, non-empty tags currently in use across all hosts.


```http
GET /api/host/del/:id
```
Remove host with ID `id`.


```http
GET /api/notify_test
```
Send test notification.


```http
GET /api/status/*iface
```
Show status (Total number of hosts, online/offline, known/unknown). The `iface` parameter is optional and shows status for one interface only. For all interfaces just call `/api/status/`.