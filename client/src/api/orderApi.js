import axiosClient from "./axiosClient"

const orderApi = {
    getAll: ({page = 1, limit, sort = { createdAt: -1 }, userId}) => {
        const url = 'orders/'
        return axiosClient.get(url, { params: {page, limit, sort, userId}})
    },
    getById: (id, {userId}) => {
        const url = `orders/${id}`
        return axiosClient.get(url, { params: {userId}})
    },
    getPayUrlMoMo: (data) => {
        const url = `orders/thanhtoan/momo`
        return axiosClient.post(url, data)
    },
    verifyMoMo: (data) => {
        const url = `orders/thanhtoan/momo/verify`
        return axiosClient.post(url, data)
    },
    create: (data) => {
        const url = `orders/`
        return axiosClient.post(url, data)
    },
    updatePaymentId: (id, data) => {
        const url = `orders/${id}/paymentid`
        return axiosClient.put(url, data)
    },
    updateOrderStatus: (id, data) => {
        const url = `orders/${id}/order-status`
        return axiosClient.put(url, data)
    },
    // updatePaymentStatusById: (id, data) => {
    //     const url = `orders/${id}/payment-status`
    //     return axiosClient.put(url, data)
    // },
}

export default orderApi