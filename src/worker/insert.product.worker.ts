import { PrismaClient } from "@prisma/client";
import { isMainThread, parentPort } from "worker_threads";

const client = new PrismaClient();

export type ProductQueryAct = {
  type: "I" | "U";
  date: string;
  keyword: string;
  query: any;
};

if (!isMainThread) {
  const temp = [];
  parentPort.on("message", async (data: ProductQueryAct) => {
    try {
      const index = temp.findIndex((item) => item.keyword === data.keyword);
      console.log(index, data.keyword);
      if (index < 0) {
        temp.push(data);

        const product = await client.product.findUnique({
          where: {
            date_name: {
              date: data.date,
              name: data.keyword,
            },
          },
        });

        if (data.type === "I") {
          if (!product) {
            await client.product.upsert(data.query);
            console.log("insert", data.keyword);
          }
        } else if (data.type === "U") {
          await client.product.update(data.query);
          console.log("update", data.keyword);
        }

        const deleteIdx = temp.findIndex(
          (item) => item.keyword === data.keyword
        );

        temp.splice(deleteIdx, 1);
      } else {
        console.log("중복");
      }
    } catch (e) {
      console.error(data.keyword, e);
    }
  });
}
