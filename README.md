<h1><a href="https://github.com/gbomacfly/WatchYourLAN">
    <img src="https://raw.githubusercontent.com/gbomacfly/WatchYourLAN/main/assets/logo.png" width="20" />
</a>WatchYourLAN</h1>
<br/>

[![Docker](https://github.com/gbomacfly/WatchYourLAN/actions/workflows/main-docker-all.yml/badge.svg)](https://github.com/gbomacfly/WatchYourLAN/actions/workflows/main-docker-all.yml)

> [!NOTE]
> **This is a fork of [aceberg/WatchYourLAN](https://github.com/aceberg/WatchYourLAN)**, created because the original project has seen very little activity lately. All credit for the original design and the vast majority of the codebase goes to [aceberg](https://github.com/aceberg) — this fork builds on that work rather than replacing it.
>
> Changes here so far: a Tailwind-based UI redesign (dark/light/system mode), multi-tag support for hosts, an auto-updating MAC vendor database for `arp-scan`, a few scan/data bugfixes, and a Docker/Compose setup built around this fork's own image on `ghcr.io`. See [CHANGELOG.md](CHANGELOG.md) for the full list.
>
> Please consider supporting the original author too: [aceberg#donate](https://github.com/aceberg#donate).

Lightweight network IP scanner with web GUI. Features:
- Send notification when new host is found
- Monitor hosts online/offline history
- Keep a list of all hosts in the network
- Send data to `InfluxDB2` or `Prometheus` to make a `Grafana` dashboard

![Screenshot light mode](https://raw.githubusercontent.com/gbomacfly/WatchYourLAN/main/assets/screenshot-light.png)
![Screenshot dark mode](https://raw.githubusercontent.com/gbomacfly/WatchYourLAN/main/assets/screenshot-dark.png)

## Quick start

<details>
  <summary>Expand</summary>

Replace `$YOURTIMEZONE` with correct time zone and `$YOURIFACE` with network interface you want to scan. Network mode must be `host` (arp-scan needs direct access to the physical interface). Set `$DOCKERDATAPATH` for container to save data:

```sh
docker run --name watchyourlan \
	-e "IFACES=$YOURIFACE" \
	-e "TZ=$YOURTIMEZONE" \
	--network="host" \
	-v $DOCKERDATAPATH/watchyourlan:/data/WatchYourLAN \
    ghcr.io/gbomacfly/watchyourlan
```
Web GUI should be at http://localhost:8840

Or use the [docker-compose.yml](docker-compose.yml) in this repo together with `.env.example` (copy it to `.env` and fill in your values).

</details>

## Auth

<details>
  <summary>Expand</summary>

**WatchYourLAN** does not have built-in auth option. But you can use it with SSO tools like Authelia, or the simple auth app [ForAuth](https://github.com/aceberg/ForAuth) by aceberg.
Here is an example [docker-compose-auth.yml](docker-compose-auth.yml).

> :warning:  **WARNING!**
> Please, don't forget that WYL needs `host` network mode to work. So, WYL port will be exposed in this setup. You need to limit access to it with firewall or other measures.

</details>

## Install on Linux

<details>
  <summary>Expand</summary>

Upstream publishes binary packages (`.deb`, `.rpm`, `.apk`, `.tar.gz`) with each [release](https://github.com/aceberg/WatchYourLAN/releases/latest). This fork currently only ships Docker images via `ghcr.io/gbomacfly/watchyourlan` - the binary-release workflow exists in this repo but hasn't been exercised yet, so treat native packages from this fork as untested for now.

Supported architectures: `amd64`, `i386`, `arm_v5`, `arm_v6`, `arm_v7`, `arm64`.
Dependencies: `arp-scan`, `tzdata`.

</details>

## Config
<details>
  <summary>Expand</summary>

Configuration can be done through config file, GUI or environment variables. Variable names is `config_v2.yaml` file are the same, but in lowcase.

### Basic config
| Variable  | Description | Default |
| --------  | ----------- | ------- |
| TZ | Set your timezone for correct time | Europe/Berlin (in this fork's docker-compose.yml) |
| HOST | Listen address | 0.0.0.0 |
| PORT   | Port for web GUI | 8840 |
| COLOR | `light`, `dark` or `system` (follows the browser's OS-level preference) | system (in this fork's docker-compose.yml) |
| SHOUTRRR_URL | WatchYourLAN uses [Shoutrrr](https://github.com/nicholas-fedor/shoutrrr) to send notifications. It is already integrated, just needs a correct URL. Examples for Discord, Email, Gotify, Matrix, Ntfy, Pushover, Slack, Telegram, Generic Webhook and etc are [here](https://nicholas-fedor.github.io/shoutrrr/) | |

### Scan settings
| Variable  | Description | Default |
| --------  | ----------- | ------- |
| IFACES | Interfaces to scan. Could be one or more, separated by space. See [docs/VLAN_ARP_SCAN.md](docs/VLAN_ARP_SCAN.md). | |
| TIMEOUT | Time between scans (seconds) | 120 |
| ARP_ARGS | Arguments for `arp-scan`. Enable `debug` log level to see resulting command. (Example: `-r 1`). See [docs/VLAN_ARP_SCAN.md](docs/VLAN_ARP_SCAN.md). | |
| ARP_STRS ARP_STRS_JOINED | See [docs/VLAN_ARP_SCAN.md](docs/VLAN_ARP_SCAN.md). | |
| LOG_LEVEL | Log level: `debug`, `info`, `warn` or `error` | info |
| TRIM_HIST | Remove history after (hours) | 48 |
| HIST_IN_DB | DEPRECATED since 2.1.3. Now History is always stored in DB. Use TRIM_HIST to reduce DB size |  |
| USE_DB | Either `sqlite` or `postgres` | sqlite |
| PG_CONNECT | Address to connect to PostgreSQL. (Example: `postgres://username:password@192.168.0.1:5432/dbname?sslmode=disable`). Full list of URL parameters [here](https://pkg.go.dev/github.com/lib/pq#hdr-Connection_String_Parameters) | |

> [!NOTE]
> This fork automatically downloads Wireshark's MAC vendor database, converts it into arp-scan's `ieee-oui.txt` format, and refreshes it weekly, so Hardware/vendor names stay current (and fuller than arp-scan's own upstream copy) without any manual setup. See [FAQ.md](FAQ.md) for details and how to override it with your own file.

### InfluxDB2 config
This config matches Grafana's config for InfluxDB data source

| Variable  | Description | Default | Example |
| --------  | ----------- | ------- | ------- |
| INFLUX_ENABLE | Enable export to InfluxDB2 | false | true |
| INFLUX_SKIP_TLS | Skip TLS Verify | false | true |
| INFLUX_ADDR | Address:port of InfluxDB2 server | | https://192.168.2.3:8086/ |
| INFLUX_BUCKET | InfluxDB2 bucket | | test |
| INFLUX_ORG | InfluxDB2 org | | home |
| INFLUX_TOKEN | Secret token, generated by InfluxDB2 | | |

### Prometheus config
This config configures the Prometheus data source

| Variable  | Description | Default | Example |
| --------  | ----------- | ------- | ------- |
| PROMETHEUS_ENABLE | Enable the Prometheus `/metrics` endpoint | false | true |

</details>

## Config file

<details>
  <summary>Expand</summary>

Config file name is `config_v2.yaml`. Example:

```yaml
arp_args: ""
color: system
host: 0.0.0.0
ifaces: enp4s0
influx_addr: ""
influx_bucket: ""
influx_enable: false
influx_org: ""
influx_skip_tls: false
influx_token: ""
log_level: info
pg_connect: ""
port: "8840"
prometheus_enable: false
shoutrrr_url: "gotify://192.168.0.1:8083/AwQqpAae.rrl5Ob/?title=Unknown host detected&DisableTLS=yes"
timeout: 60
trim_hist: 48
use_db: sqlite
```

</details>

## Options

<details>
  <summary>Expand</summary>

| Key  | Description | Default |
| --------  | ----------- | ------- |
| -d | Path to config dir | /data/WatchYourLAN |

</details>

> [!NOTE]
> The web GUI is fully offline-capable - no CDN or external assets are loaded at runtime.

## API & Integrations

<details>
  <summary>Expand</summary>

### API
Moved to [docs/API.md](docs/API.md)

### Integrations
These are built against upstream `aceberg/WatchYourLAN` and haven't been verified against this fork's API additions (e.g. the `tags` endpoints):
- [ArchLinux (AUR)](https://aur.archlinux.org/packages/watch-your-lan) by `gilcu3`
- [Python API client](https://github.com/drwahl/py-watchyourlanclient) by [drwahl](https://github.com/drwahl)
- [Umbrel](https://apps.umbrel.com/app/watch-your-lan) by [Jasper](https://github.com/ceramicwhite)
- [YunoHost](https://apps.yunohost.org/app/watchyourlan)
</details>

## Thanks
<details>
  <summary>Expand</summary>

- [aceberg](https://github.com/aceberg) for the original WatchYourLAN, which this fork is built on
- All go packages listed in [dependencies](https://github.com/gbomacfly/WatchYourLAN/network/dependencies)
- Favicon and logo: [Access point icons created by Freepik - Flaticon](https://www.flaticon.com/free-icons/access-point)
- [Tailwind CSS](https://tailwindcss.com/)

</details>
