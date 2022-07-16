import axios, { AxiosError } from 'axios'
import { stockCache, searchStockCache, searchStocksCache } from './Cache'

export const searchStocks = async (
  keyword: string
): Promise<searchResults | undefined> => {
  if (searchStockCache.has(keyword)) {
    return searchStockCache.get(keyword)
  } else {
    const searchData = await axios
      .get(
        `https://m.stock.naver.com/api/json/search/searchListJson.nhn?keyword=${encodeURI(
          keyword
        )}`
      )
      .then((res) => {
        return res.data
      })
      .catch((e: AxiosError) => {
        throw new Error(e.message)
      })
    searchStockCache.set(keyword, searchData)
    return searchData
  }
}

export const searchStock = async (code: string): Promise<stock | undefined> => {
  if (stockCache.has(code)) {
    return stockCache.get(code)
  } else {
    const searchData = axios
      .get(
        `https://api.finance.naver.com/service/itemSummary.nhn?itemcode=${encodeURI(
          code
        )}`
      )
      .then((res) => {
        return res.data
      })
      .catch((e: AxiosError) => {
        throw new Error(e.message)
      })
    stockCache.set(code, searchData)
    return searchData
  }
}

export const searchStockList = async (
  keyword: string
): Promise<searchStocksList | undefined> => {
  if (searchStocksCache.has(keyword)) {
    return searchStocksCache.get(keyword)
  } else {
    const searchData = axios
      .get(
        `https://ac.stock.naver.com/ac?q=${encodeURI(
          keyword
        )}&target=stock,index,marketindicator`
      )
      .then((res) => {
        return res.data
      })
      .catch((e: AxiosError) => {
        throw new Error(e.message)
      })
    searchStocksCache.set(keyword, searchData)
    return searchData
  }
}

export interface stock {
  /**
   * @description 시가 총액
   */
  marketSum: number
  /**
   * @description 1 - 상한
   * 2 - 상승
   * 3 - 보합(?)
   * 4 - 하한
   * 5 - 하락
   */
  per: number
  /**
   * @description 전일대비 가격차이
   */
  eps: number
  /**
   * @description 상승율
   */
  pbr: number
  /**
   * @description 고가
   */
  now: number
  /**
   * @description 저가
   */
  diff: number
  /**
   * @description 거래량
   */
  rate: number
  /**
   * @description 거래대금
   */
  quant: number
  /**
   * @description 거래대금
   */
  amount: number
  /**
   * @description ESP
   */
  high: number
  /**
   * @description PBS
   */
  low: number
  /**
   * @description 현재가
   */
  risefall: number
}

export interface searchResults {
  result: searchStockResults
  resultCode: string
}

interface searchStockResults {
  d: stocks[]
  totCnt: number
  t: string
}

interface stocks {
  cd: string
  nm: string
  nv: string
  cv: string
  cr: string
  rf: string
  mks: number
  aa: number
  nation: string
  etf: boolean
}
export interface searchStocksList {
  query: string
  items: searchStocksListItems[]
}

interface searchStocksListItems {
  code: string
  name: string
  typeCode: string
  typeName: string
  url: string
  reutersCode: string
  nationCode: string
  nationName: string
}
