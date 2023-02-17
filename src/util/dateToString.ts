/**
 * 날자 한국 포맷 변경
 * @param date
 * @returns
 */
export function dateToString(date: Date) {
  return (
    date.getFullYear() +
    "-" +
    (date.getMonth() + 1).toString().padStart(2, "0") +
    "-" +
    date.getDate().toString().padStart(2, "0")
  );
}

export function dateTimeToString(date: Date) {
  return `${dateToString(date)} ${date
    .getHours()
    .toString()
    .padStart(2, "0")}:${date.getMinutes().toString().padStart(2, "0")}:${date
    .getSeconds()
    .toString()
    .padStart(2, "0")}`;
}

export function upDateToString(date: Date) {
  if (date.getHours() >= 12) {
    return dateToString(date);
  } else {
    date.setDate(date.getDate() - 1);
    return dateToString(date);
  }
}

export function CalcNowDate(year: number, month: number, day: number) {
  const date = nowKrDate();
  date.setFullYear(
    date.getFullYear() + year,
    date.getMonth() + month,
    date.getDate() + day
  );
  return date;
}

export function nowKrDate() {
  // utc 시간
  const utc = new Date(); //curr.getTime() + curr.getTimezoneOffset() * 60 * 1000;

  // kst 시간
  const kst = new Date(
    utc.getFullYear(),
    utc.getMonth(),
    utc.getDate(),
    utc.getHours(),
    utc.getMinutes(),
    utc.getSeconds()
  );
  return utc;
}
