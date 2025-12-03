const savedUser = (() => {
    try {
        const raw = localStorage.getItem('user');
        return raw ? JSON.parse(raw) : null;
    } catch (e) {
        return null;
    }
})();

const initialState = savedUser || {
    email: '',
    fullName: '',
    phoneNumber: '',
    avatar: '',
    userId: '',
    role: -1,
};
const userReducer = (state = initialState, action) => {
    switch (action.type) {

        case "LOGIN": {
            const newState = {
                ...state,
                ...action.payload,
            };
            try {
                localStorage.setItem('user', JSON.stringify(newState));
            } catch (e) {}
            return newState;
        }

        case "UPDATE_FULLNAME": {
            console.log({
                ...state,
                fullName: action?.payload?.fullName
            })
            const updated = {
                ...state,
                fullName: action?.payload?.fullName
            };
            try { localStorage.setItem('user', JSON.stringify(updated)); } catch(e) {}
            return updated;
        }

        case "UPDATE_AVATAR": {
            console.log({
                ...state,
                avatar: action?.payload
            })
            const updated = {
                ...state,
                avatar: action?.payload
            };
            try { localStorage.setItem('user', JSON.stringify(updated)); } catch(e) {}
            return updated;
        }

        case "LOGOUT": {
            try { localStorage.removeItem('user'); } catch (e) {}
            return {
                ...state,
                email: '',
                fullName: '',
                phoneNumber: '',
                avatar: '',
                userId: '',
                role: -1,
            };
        }

        default: {
            return state;
        }
    }
};
  
export default userReducer;
  