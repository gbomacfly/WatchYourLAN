export const apiPath = 'http://0.0.0.0:8840';

export const apiGetAllHosts = async () => {
  const url = apiPath+'/api/all';
  const hosts = await (await fetch(url)).json();

  return hosts;
};

export const apiGetConfig = async () => {

  const url = apiPath+'/api/config';
  const res = await (await fetch(url)).json();

  return res;
};

export const apiSetColor = async (color:string) => {

  const url = apiPath+'/api/config/color/'+color;
  const res = await (await fetch(url)).json();

  return res;
};

export const apiGetVersion = async () => {

  const url = apiPath+'/api/version';
  const res = await (await fetch(url)).json();

  return res;
};

export const apiTestNotify = async () => {

  const url = apiPath+'/api/notify_test';
  await fetch(url);
};

export const apiEditHost = async (id:number, name:string, known:string) => {

  const url = apiPath+'/api/edit/'+id+'/'+name+'/'+known;
  const res = await (await fetch(url)).json();

  return res;
};

export const apiSetTags = async (id:number, tags:string[]) => {

  const encoded = tags.map(t => encodeURIComponent(t)).join(',');
  const url = apiPath+'/api/tags/'+id+'/'+encoded;
  const res = await (await fetch(url)).json();

  return res;
};

export const apiGetTags = async (): Promise<string[]> => {

  const url = apiPath+'/api/tags';
  const res = await (await fetch(url)).json();

  return res;
};

export const apiGetHost = async (id:string) => {

  const url = apiPath+'/api/host/'+id;
  const res = await (await fetch(url)).json();

  return res;
};

export const apiDelHost = async (id:number) => {

  const url = apiPath+'/api/host/del/'+id;
  const res = await (await fetch(url)).json();

  return res;
};

export const apiPortScan = async (ip:string, port:number) => {

  const url = apiPath+'/api/port/'+ip+'/'+port;
  const res = await (await fetch(url)).json();

  return res;
};

export const apiGetBanner = async (ip:string, port:number): Promise<string> => {

  const url = apiPath+'/api/banner/'+ip+'/'+port;
  const res = await (await fetch(url)).json();

  return res;
};

export const apiGetHistory = async (mac:string) => {
  const url = apiPath+'/api/history/'+mac+'/?num=210';
  const hosts = await (await fetch(url)).json();

  return hosts;
};

export const apiGetHistoryByDate = async (mac:string, date: string) => {
  const url = apiPath+'/api/history/'+mac+'/'+date;
  const hosts = await (await fetch(url)).json();

  return hosts;
};

export const apiWOL = async (mac:string) => {

  const url = apiPath+'/api/wol/'+mac;
  const res = await (await fetch(url)).json();

  return res;
};

export const apiSavePortScan = async (id:number, ports:{Port:number, Banner:string}[]) => {

  const url = apiPath+'/api/portscan/'+id;
  const res = await (await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(ports),
  })).json();

  return res;
};