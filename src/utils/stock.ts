import axios, { AxiosError } from 'axios'

export const searchStocks = async (keyword: string): Promise<searchResults> => {
  return axios
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
}

export const searchStock = async (code: string): Promise<stock> => {
  return axios
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
}

interface stock {
  marketSum: number // 시가 총액
  per: number // 1 : 상한 , 2 : 상승, 3: 보합? , 4 : 하한, 5, 하락
  eps: number // 전일대비 가격 차이
  pbr: number // 상승율
  now: number // 고가
  diff: number // 저가
  rate: number // 거래량
  quant: number // 거래대금
  amount: number // 거래대금
  high: number // EPS
  low: number // PBR
  risefall: number // 현재가
}

interface searchResults {
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
