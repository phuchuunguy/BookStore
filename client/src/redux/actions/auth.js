export const login = (user) => {
    return  {
        type: 'LOGIN',
        payload: user
    }
}

export const updateFullName = (data) => {
    return {
        type: 'UPDATE_FULLNAME',
        payload: data
    }
}

export const updateAvatar = (data) => {
    return {
        type: 'UPDATE_AVATAR',
        payload: data
    }
}

export const logout = () => {
    return {
        type: 'LOGOUT',
    }
}



