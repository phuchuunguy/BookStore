import axiosClient from "./axiosClient"

const authorApi = {

    getAll: ({page, limit, sortByDate}) => {
        const url = 'authors/'
        return axiosClient.get(url, { params: {page, limit, sortByDate}})
    },
    getById: (id) => {
        const url = `authors/${id}`
        return axiosClient.get(url)
    },
    update: (id, data) => {
        const url = `authors/${id}`
        return axiosClient.put(url, data)
    },
    create: (data) => {
        const url = `authors/`
        return axiosClient.post(url, data)
    },
    delete: (id) => {
        const url = `authors/${id}`
        return axiosClient.delete(url)
    }

   
}

export default authorApi