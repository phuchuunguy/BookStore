const RoleEnum = {
    Customer: 1,
    Staff: 2,
    Admin: 3
}

const methodEnum = {
    cash: {
        code: 0,
        text: "Thanh toán bằng tiền mặt"
    },
    momo: {
        code: 1,
        text: "Ví momo"
    },
    paypal: {
        code: 2,
        text: "Paypal"
    },
}

const orderStatusEnum = {
    awaitingCheckPayment: {
        code: 0,
        text: "Chờ cửa hàng xác nhận"
    },
    paymentAccepted: {
        code: 1,
        text: "Đã xác nhận đơn hàng"
    },
    readyToShip: {
        code: 2,
        text: "Đã đóng gói. Chuẩn bị giao"
    },
    transit: {
        code: 3,
        text: "Đang trên đường vận chuyển"
    },
    pickup: {
        code: 4,
        text: "Kiện hàng sắp đến"
    },
    delivered: {
        code: 5,
        text: "Giao hàng thành công"

    },
}

const paymentStatusEnum = {
    unPaid: {
        code: 0,
        text: "Chưa thanh toán"
    },
    Failed: {
        code: 1,
        text: "Thanh toán thất bại"
    },
    Paid: {
        code: 2,
        text: "Thanh toán thành công"
    },
}


module.exports = { RoleEnum, methodEnum, orderStatusEnum, paymentStatusEnum }
