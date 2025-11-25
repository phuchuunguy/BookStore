import axiosClient from "./axiosClient"

const optionApi = {
    getAll: () => {
        const url = 'options/'
        return axiosClient.get(url)
    },
}

export default optionApi