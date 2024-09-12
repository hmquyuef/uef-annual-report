export function capitalize(str: string) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

export function convertTimestampToDate(timestamp: number): string {
  const date = new Date(timestamp * 1000);

  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();

  return `${day}/${month}/${year}`;
}

export function convertTimestampToYYYYMMDD(timestamp: number): string {
  const date = new Date(timestamp * 1000);

  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();

  return `${year}-${month}-${day}`;
}