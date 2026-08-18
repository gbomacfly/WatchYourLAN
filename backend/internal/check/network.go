package check

import (
	"context"
	"net"
	"strings"
	"time"

	"github.com/gbomacfly/WatchYourLAN/internal/models"
)

// dnsLookupTimeout bounds how long a single reverse-DNS lookup may block.
// The plain net.LookupAddr has no timeout of its own and can hang for a
// long time against a slow or unreachable DNS server (e.g. no PTR records
// configured on a home network) - which would otherwise stall whatever
// called it, such as the host detail page's GET /api/host/:id, or the
// periodic scan loop, indefinitely.
const dnsLookupTimeout = 2 * time.Second

// DNS - returns DNS names of a host, giving up after dnsLookupTimeout
func DNS(host models.Host) (name, dns string) {

	ctx, cancel := context.WithTimeout(context.Background(), dnsLookupTimeout)
	defer cancel()

	var resolver net.Resolver
	dnsNames, _ := resolver.LookupAddr(ctx, host.IP)

	if len(dnsNames) > 0 {
		name = dnsNames[0]
		dns = strings.Join(dnsNames, " ")
	}

	return name, dns
}
