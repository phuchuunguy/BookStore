const initialState = {
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
            console.log({
                ...state,
                ...action.payload,
            })
            return {
                ...state,
                ...action.payload,
            };
        }

        case "UPDATE_FULLNAME": {
            console.log({
                ...state,
                fullName: action?.payload?.fullName
            })
            return {
                ...state,
                fullName: action?.payload?.fullName
            };
        }

        case "UPDATE_AVATAR": {
            console.log({
                ...state,
                avatar: action?.payload
            })
            return {
                ...state,
                avatar: action?.payload
            };
        }

        case "LOGOUT": {
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
  