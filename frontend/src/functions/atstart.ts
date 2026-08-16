import { apiGetAllHosts } from "./api";
import { allHosts, setAllHosts, setBkpHosts, setIfaces, setGroups } from "./exports";
import { filterAtStart, filterFunc } from "./filter";
import { sortAtStart } from "./sort";

export function runAtStart() {
  getHosts();
  filterFunc("ID", 0); // reset filter

  setInterval(() => {
    getHosts();
  }, 60000); // 60000 ms = 1 minute
}

export async function getHosts() {
  const hosts = await apiGetAllHosts();

  if (hosts !== null && hosts.length > 0) {
    setAllHosts(hosts);
    setBkpHosts(hosts);

    listIfaces();
    listGroups();
    sortAtStart();
    filterAtStart();
  }
}

function listIfaces() {

  let ifaces:string[] = [];

  for (let host of allHosts) {
    if (!ifaces.includes(host.Iface)) {
      ifaces.push(host.Iface);
    }
  }

  setIfaces(ifaces);
}

function listGroups() {

  let groups:string[] = [];

  for (let host of allHosts) {
    if (host.Group && !groups.includes(host.Group)) {
      groups.push(host.Group);
    }
  }
  groups.sort((a, b) => a.localeCompare(b));

  setGroups(groups);
}