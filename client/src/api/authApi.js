import axiosClient from "./axiosClient"

const authApi = {
    loginWithGoogle: (accessToken) => {
        const url = 'auth/google'
        return axiosClient.post(url, {accessToken: accessToken})
    },
    loginWithFacebook: (data) => {
        const url = 'auth/facebook'
        return axiosClient.post(url, data)
    },
    register: (data) => {
        const url = 'auth/register'
        return axiosClient.post(url, data)
    },
    login: (data) => {
        const url = 'auth/login-bookstore'
        return axiosClient.post(url, data)
    },
    activeAccount: ({active_code}) => {
        const url = 'auth/verify-email'
        return axiosClient.get(url, { params: {active_code}})
    },
    requestActiveAccount: ({email}) => {
        const url = `auth/send-verification-email/${email}`
        return axiosClient.get(url)
    },
    forgotPassword: (data) => {
        const url = 'auth/forgot-password'
        return axiosClient.post(url, data)
    },
    resetPassword: (data) => {
        const url = 'auth/reset-password'
        return axiosClient.patch(url, data)
    },
    getRefreshToken: () => {
        const url = 'auth/refresh-token'
        return axiosClient.post(url)
    },
    me: () => {
        const url = 'auth/me'
        return axiosClient.get(url)
    },
    logout: () => {
        const url = `auth/logout`
        return axiosClient.get(url)
    }

}

export default authApi