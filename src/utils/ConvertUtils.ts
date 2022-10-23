export function converToJson(data: any) {
  let json = JSON.stringify(data);
  let emp = JSON.parse(json);
  return emp;
}

export function formatDate(data: string) {
  const newData = data.substring(6, 10) + '-' + data.substring(3, 5) + '-' + data.substring(0, 2) + ' 00:00:00';
  return newData;
}