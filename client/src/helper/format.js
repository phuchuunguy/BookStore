const format = {
    formatPrice: (price) => {
        return new Intl.NumberFormat("vi-VN", { 
            style: "currency",
            currency: "VND",
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(price);
    },

    formatPercent: (value) => {
        return new Intl.NumberFormat("vi-VN", {
            style: "percent",
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(value / 100);
    },

    formatNumber: (value) => {
    return new Intl.NumberFormat("vi-VN", {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }).format(value);
},

    formatVoucher: (value) => {
    const num = Number(value);
    return Number.isInteger(num) ? parseInt(num) : num;
},


    arrayToString: (list) => {
        return list.map(item => item?.name).join(", ");
    },
};

export default format;
