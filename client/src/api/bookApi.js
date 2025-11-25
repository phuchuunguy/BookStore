import axiosClient from "./axiosClient"

const bookApi = {
    getAll: ({page = 1, limit, sort = { createdAt: -1 }, query = null}) => {
        const url = 'books/'
        return axiosClient.get(url, { params: {page, limit, sort, query}})
    },
    getById: (id) => {
        const url = `books/${id}`
        return axiosClient.get(url)
    },
    getByBookId: (bookId) => {
        const url = `books/bookId/${bookId}`
        return axiosClient.get(url)
    },
    getBySlug: (slug) => {
        const url = `books/slug/${slug}`
        return axiosClient.get(url)
    },
    checkIsOrdered: (id) => {
        const url = `books/is-ordered/${id}`
        return axiosClient.get(url)
    },
    search: ({key, limit}) => {
        const url = `books/search`
        return axiosClient.get(url, { params: {key, limit}})
    },
    create: (data) => {
        const url = `books/`
        return axiosClient.post(url, data)
    },
    update: (id, data) => {
        const url = `books/${id}`
        return axiosClient.put(url, data)
    },
    delete: (id) => {
        const url = `books/${id}`
        return axiosClient.delete(url)
    }

}

export default bookApi