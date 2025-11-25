import authReducer from "./auth";
import cartReducer from "./cart";

import { combineReducers } from 'redux';

const rootReducer = combineReducers({
    auth: authReducer,
    cart: cartReducer,
})

export default rootReducer