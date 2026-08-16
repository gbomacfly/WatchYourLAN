# FAQ

> [!NOTE]
> This is the FAQ for [gbomacfly/WatchYourLAN](https://github.com/gbomacfly/WatchYourLAN), a fork of [aceberg/WatchYourLAN](https://github.com/aceberg/WatchYourLAN). Entries below carried over from upstream still apply unless noted otherwise.

## MAC vendor names are outdated or missing (`(Unknown: ...)`)

This fork downloads a current copy of arp-scan's MAC vendor database (`ieee-oui.txt`) automatically on startup, and refreshes it once a week - no manual steps needed. Check the container log for a line like:
```
INFO Updating arp-scan MAC vendor database url=https://raw.githubusercontent.com/royhills/arp-scan/master/ieee-oui.txt
INFO OUI vendor database updated path=/usr/share/arp-scan/ieee-oui.txt bytes=1649021
```
If it's missing, the container likely has no outbound internet access - the last vendor database it had (baked into the image, or a previously downloaded one) keeps being used, nothing breaks.

To pin your own file instead (e.g. fully offline setups), see the commented-out volume mount in [docker-compose.yml](docker-compose.yml).

Once a fresher database is in place, updated vendor names show up on the **next scan** for both new and already-known hosts - you no longer need to delete a host to see its Hardware field refresh (that used to be required upstream, see below).

## Allow custom MAC vendor overrides
Issues [#169](https://github.com/aceberg/WatchYourLAN/issues/169), [#185](https://github.com/aceberg/WatchYourLAN/issues/185)

WatchYourLAN is using `arp-scan`, so most of its options are available to WYL users.

1. Prepare a [mac-vendor.txt](https://manpages.debian.org/testing/arp-scan/mac-vendor.5.en.html) file with additional MACs and put it in a mounted WYL directory.
2. If you are using `IFACES` variable to define interfaces, add path to mac-vendor.txt to `ARP_ARGS`
```yaml
arp_args: --macfile=/data/WatchYourLAN/mac-vendor.txt
```
3. For interfaces defined in `ARP_STRS` add the same directly in the beginning of `ARP_STRS` string
```yaml
arp_strs:
    - --macfile=/data/WatchYourLAN/mac-vendor.txt -gNx 10.144.0.1/24 -I eth0
```
4. Updated vendor names show up on the next scan in this fork (see above) - you don't need to delete the host and wait, unlike in upstream.
