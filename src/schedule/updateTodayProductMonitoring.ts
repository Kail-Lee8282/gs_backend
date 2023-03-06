import client from "../modules/client";
import { getProductDisplayPosition } from "../schemas/productMonitoring/monitoring.resolvers";
import { dateTimeToString, dateToString } from "../util/dateToString";
import { Sleep } from "../util/sleep";

/**
 * 금일 제품 업데이트
 */
export async function updateTodayProductMonitoring() {
  try {
    const today = dateToString(new Date());
    const findDatas = await client.monitoringKeyword.findMany({
      where: {
        MonitoringKeywordRank: {
          none: {
            date: today,
          },
        },
      },
      select: {
        id: true,
        productNo: true,
        keyword: true,
      },
    });
    if (findDatas && findDatas.length > 0) {
      for (let i = 0; i < findDatas.length; i++) {
        const { id, keyword, productNo } = findDatas[i];
        await Sleep(500);
        const data = await getProductDisplayPosition(keyword, productNo);
        const updateData = await client.monitoringKeywordRank.create({
          data: {
            date: dateToString(new Date()),
            keywordInfo: {
              connect: {
                id,
              },
            },
            adIndex: data.adIndex,
            adPage: data.adPage,
            adRank: data.adPage,
            index: data.index,
            page: data.page,
            rank: data.rank,
          },
        });
      }

      console.log("product monitoring completed");
    }
  } catch (e) {
    console.error(e);
  }
}
