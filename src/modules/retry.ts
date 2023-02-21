import { Sleep } from "../util/sleep";

type RetryResult = {
  cnt: number;
  result: any;
  err?: any;
};
export function retry(n: number, promise: Promise<any>): Promise<RetryResult> {
  return new Promise((resolver, reject) => {
    promise
      .then((res) => resolver({ cnt: n, result: res }))
      .catch((err) => {
        if (n >= 5) return { cnt: n, result: null, err };
        Sleep(300);
        return retry(n + 1, promise.then(resolver).catch(reject));
      });
  });
}
