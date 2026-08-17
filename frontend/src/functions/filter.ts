import { allHosts, bkpHosts, Host, setAllHosts, setActiveFilter } from "./exports";

let oldFilter = 'ID';

export function filterAtStart() {
  const field = localStorage.getItem("filterField") as keyof Host;
  const value = localStorage.getItem("filterValue");

  filterFunc(field, value);
}

export function filterFunc(field: keyof Host, value: any) {

  let addrsArray = allHosts;
  
  if (oldFilter == field) {
    addrsArray = bkpHosts();
  }
  oldFilter = field;

  localStorage.setItem("filterField", field);
  localStorage.setItem("filterValue", value);
  setActiveFilter({ field, value });

  switch (field) {
    case 'Iface':
      addrsArray = addrsArray.filter((item) => item.Iface == value);
      break;
    case 'Known':
      addrsArray = addrsArray.filter((item) => item.Known == value);
      break;
    case 'Now':
      addrsArray = addrsArray.filter((item) => item.Now == value);
      break;
    case 'Tags':
      addrsArray = addrsArray.filter((item) => (item.Tags ?? []).includes(value));
      break;
    default:
      addrsArray = bkpHosts();
  }

  setAllHosts(addrsArray);
}