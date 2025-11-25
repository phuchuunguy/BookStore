const format = {
    formatPrice: (price) => {
        return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND", }).format(price);
    },
    arrayToString: (list) => {
        return list.map(item => item?.name).join(", ") 
    },
}

export default format