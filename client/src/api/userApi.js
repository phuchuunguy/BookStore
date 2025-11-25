import axiosClient from "./axiosClient"

const userApi = {
    getAll: ({page = 1, limit, sort = { createdAt: -1 }, query = null}) => {
        const url = 'users/'
        return axiosClient.get(url, { params: {page, limit, sort, query}})
    },
    addAddress: (id, data) => {
        const url = `users/${id}/address`
        return axiosClient.post(url, data)
    },
    getById: (id) => {
        const url = `users/${id}`
        return axiosClient.get(url)
    },
    getAllAddressById: (id) => {
        const url = `users/${id}/address`
        return axiosClient.get(url)
    },
    getCart: (id) => {
        const url = `users/${id}/cart`
        return axiosClient.get(url)
    },
    createStaff: (data) => {
        const url = `users/staff`
        return axiosClient.post(url, data)
    },
    updateCart: (id, data) => {
        const url = `users/${id}/cart`
        return axiosClient.put(url, data)
    },
    updateById: (id, data) => {
        const url = `users/${id}`
        return axiosClient.put(url, data)
    },
    updateStatus: (id, data) => {
        const url = `users/${id}/status`
        return axiosClient.put(url, data)
    },
    updateAvatar: (id, data) => {
        const url = `users/${id}/avatar`
        return axiosClient.put(url, data)
    },
    updateDefaultAddressById: (id, addressId) => {
        const url = `users/${id}/address/status/${addressId}`
        return axiosClient.patch(url)
    },
    deleteById: (id, addressId) => {
        const url = `users/${id}/address/${addressId}`
        return axiosClient.delete(url)
    },

}

export default userApi