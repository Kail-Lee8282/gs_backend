import { Sleep } from "../util/sleep";

type RetryResult = {
  cnt: number;
  result: any;
  err?: any;
};
export async function retry(
  n: number,
  promise: Promise<any>
): Promise<RetryResult> {
  return new Promise((resolver, reject) => {
    promise
      .then((res) => {
        resolver({ cnt: n, result: res });
      })
      .catch(async (err) => {
        console.error("retry : ", n);
        if (n >= 5) {
          return { cnt: n, result: null, err };
        }
        await Sleep(300);
        console.log("try");
        return retry(n + 1, promise.then(resolver).catch(reject));
      });
  });
}
