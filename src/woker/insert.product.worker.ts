import { PrismaClient } from "@prisma/client";
import { isMainThread, parentPort } from "worker_threads";

const client = new PrismaClient();

if (!isMainThread) {
  const temp = [];
  parentPort.on("message", async (data) => {
    try {
      const index = temp.findIndex((item) => item.keyword === data.keyword);
      console.log(index, data.keyword);
      if (index < 0) {
        temp.push(data);

        const product = await client.product.findUnique({
          where: {
            date_name: {
              date: data.create.date,
              name: data.keyword,
            },
          },
        });

        if (!product) {
          const res = await client.product.upsert({
            create: data.create,
            update: {},
            where: {
              date_name: {
                date: data.create.date,
                name: data.keyword,
              },
            },
          });

          console.log("insert", data.keyword);
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
