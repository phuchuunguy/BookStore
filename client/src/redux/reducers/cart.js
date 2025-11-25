const initialState =  {
    list: [],
    voucher: {
        _id: "",
        code: "",
        value: 0,
        minimum: 0,
        by: ""
    },
    subTotal: 0,
    shippingFee: 0,
    discount: 0,
    total: 0,
};
const cartReducer = (state = initialState, action) => {
    switch (action.type) {

        case "ADD_TO_CART": {
            const newList = [...state.list]
            const { voucher, shippingFee } = state
            const { value, by } = voucher
            let isFind = false
            const { productId, quantity, price, ...data } = action.payload
            newList.forEach(item => {
                if (item.product._id === productId) {
                    isFind = true
                    item.quantity += parseInt(quantity)
                    item.totalPriceItem = item.quantity * price
                    return
                }
            })
            if (!isFind) {
                newList.push({product: {_id: productId, price, ...data}, quantity: quantity, totalPriceItem: quantity * price })
            }   

            const subTotal = newList.reduce((sum, product) => sum + product.totalPriceItem, 0)
            let discount = 0
            if (value > 0) {
                discount = by === "percent" ? (subTotal * value / 100) : (value);
            }

            console.log({
                ...state,
                list: newList,
                subTotal: subTotal,
                discount: discount,
                total: subTotal - discount + shippingFee,
            })

            return {
                ...state,
                list: newList,
                subTotal: subTotal,
                discount: discount,
                total: subTotal - discount + shippingFee,
            }
        }

        case "UPDATE_QUANTITY": {
            const newList = [...state.list]
            const { voucher, shippingFee } = state
            const { value, by, minimum } = voucher
            newList.forEach(item => {
                if (item.product._id === action.payload.productId) {
                    item.quantity = action.payload.quantity
                    item.totalPriceItem = item.quantity * item.product.price
                    return
                }
            })

            const subTotal = newList.reduce((sum, product) => sum + product.totalPriceItem, 0)
            
            let updateVouhcer = voucher
            let discount = 0
            if (subTotal < minimum) {
                updateVouhcer = {}
            } else if (value > 0) {
                discount = by === "percent" ? (subTotal * value / 100) : (value);
            }

            console.log({
                ...state,
                list: newList,
                subTotal: subTotal,
                discount: discount,
                total: subTotal - discount + shippingFee,
                voucher: updateVouhcer
            })

            return {
                ...state,
                list: newList,
                subTotal: subTotal,
                discount: discount,
                total: subTotal - discount + shippingFee,
                voucher: updateVouhcer
            }
        }

        case "REMOVE_ITEM": {

            const { voucher, shippingFee } = state
            const { minimum, value, by } = voucher

            const newList = [...state.list].filter(item => item.product._id !== action.payload.productId)
            const subTotal = newList.reduce((sum, product) => sum + product.totalPriceItem, 0)

            let updateVouhcer = voucher
            let discount = 0

            if (subTotal < minimum) {
                updateVouhcer = {}
            } else if (value > 0) {
                discount = by === "percent" ? (subTotal * value / 100) : (value);
            }

            console.log({
                ...state,
                list: newList,
                subTotal: subTotal,
                discount: discount,
                total: subTotal - discount + shippingFee,
                voucher: updateVouhcer
            })

            return {
                ...state,
                list: newList,
                subTotal: subTotal,
                discount: discount,
                total: subTotal - discount + shippingFee,
                voucher: updateVouhcer
            }
        }

        case "UPDATE_VOUCHER": {
            const { shippingFee } =  state
            const { value, by } = action.payload
            const newList = [...state.list]

            const subTotal = newList.reduce((sum, product) => sum + product.totalPriceItem, 0)
            let discount = 0
            if (value > 0) {
                discount = by === "percent" ? (subTotal * value / 100) : (value);
            }

            console.log({
                ...state,
                voucher: action.payload,
                subTotal: subTotal,
                discount: discount,
                total: subTotal - discount + shippingFee
            })

            return {
                ...state,
                voucher: action.payload,
                subTotal: subTotal,
                discount: discount,
                total: subTotal - discount + shippingFee
            }
        }

        case "DESTROY": {
            
           return {
                ...state,
                list: [],
                voucher: {},
                subTotal: 0,
                shippingFee: 0,
                discount: 0,
                total: 0,
           }
       }

       case "SET_CART": {
            return {
                ...state,
                list: action.payload,
                voucher: "",
                subTotal: 0,
                shippingFee: 0,
                discount: 0,
                total: 0,
        }
       }

        default: {
            return state;
        }
    }
};
  
export default cartReducer;
  