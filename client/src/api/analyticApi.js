import axiosClient from "./axiosClient"

const analyticApi = {
    getTotalRevenue: () => {
        const url = `analytics/revenue/all`
        return axiosClient.get(url)
    },
    getRevenueWeek: ({start, end}) => {
        const url = `analytics/revenue/week`
        return axiosClient.get(url, { params: {start, end}})
    },
    getRevenueLifeTime: () => {
        const url = `analytics/revenue/lifetime`
        return axiosClient.get(url)
    },
    getOrderCountLifeTime: () => {
        const url = `analytics/ordercount/lifetime`
        return axiosClient.get(url)
    },
    // Alias for backward compatibility: some components call `getCountOrderLifeTime`
    getCountOrderLifeTime: () => {
        return analyticApi.getOrderCountLifeTime()
    },
    getBestSeller: () => {
        const url = `analytics/product/bestseller`
        return axiosClient.get(url)
    },
    getBestSellerPublic: () => {
        const url = `analytics/product/bestseller-public`
        return axiosClient.get(url)
    },
    
}

export default analyticApi