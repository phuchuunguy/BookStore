const { transporter } = require('../config/nodemailer')
const { formatPrice } = require('./format')

const orderSuccess = async ({ clientURL, delivery, products, cost, method }) => {
    let html = `<div style="margin:0px;padding:0px;color:rgb(32,32,32);font-size:14px;font-weight:normal;font-family:Helvetica,Arial,sans-serif!important;line-height:150%!important">
                    <div style="margin: auto; max-width: 730px">
                        <table style="width: 100%">
                            <tbody>
                                <tr>
                                    <td>
                                        <div style="padding: 30px; border-bottom: 10px solid #f0f0f0">
                                            <p style="margin:0; font-size: 23px; color: #0f146d; text-align: center">Cám ơn bạn đã đặt hàng tại BookStore!</p>
                                        </div>
                                        <div style="padding: 30px; border-bottom: 10px solid #f0f0f0">
                                            <h2>Xin chào ${delivery?.fullName},</h2>
                                            <p>BookStore đã nhận được yêu cầu đặt hàng của bạn và đang xử lý nhé. Bạn sẽ nhận được thông báo tiếp theo khi đơn hàng đã sẵn sàng được giao.</p>
                                            <div style="margin: auto; width: 200px">
                                                <a href="${clientURL}/don-hang" style="background-image: linear-gradient(to right, #fc8b00, #ff03f6); color: white; padding: 12px; font-weight: bold; width: 200px; display: block; text-align:center; text-decoration: none">Tình trạng đơn hàng</a>
                                            </div>
                                        </div>
                                        <div style="padding: 30px; border-bottom: 10px solid #f0f0f0">
                                            <div style="padding: 5px 0px 15px 0px; font-size: 16px">Đơn hàng được giao đến</div>
                                            <table style="width: 100%">
                                                    <tbody>
                                                    <tr>
                                                        <td width="25%" style="color:#0f146d;font-weight:bold">Tên:</td>
                                                        <td width="75%">${delivery?.fullName}</td>    
                                                    </tr>
                                                    <tr>
                                                        <td style="color:#0f146d;font-weight:bold">Địa chỉ nhà:</td>
                                                        <td>${delivery?.address}</td> 
                                                    </tr>
                                                    <tr>
                                                        <td style="color:#0f146d;font-weight:bold">Điện thoại:</td>
                                                        <td>${delivery?.phoneNumber}</td>
                                                    </tr>
                                                    <tr>
                                                        <td style="color:#0f146d;font-weight:bold">Email:</td>
                                                        <td><a style="color: #33a2b2!important" href="mailto:${delivery?.email}" target="_blank">${delivery?.email}</a></td> 
                                                    </tr>
                                                </tbody>
                                            </table>
                                        </div>
                                        <div style="padding: 30px; border-bottom: 10px solid #f0f0f0">
                                            <div style="padding: 5px 0px 15px 0px; font-size: 16px">Kiện hàng</div>
                                            <table style="width: 100%">
                                                <tbody>
                                                    
                                                </tbody> `
        products.forEach(product => {
            const { name, imageUrl, price, quantity, totalItem } = product
            html +=                                `<tr>
                                                        <td width="40%" style="color:#0f146d;font-weight:bold">
                                                            <img style="width: 160px; margin-right: 10px; object-fit: cover;" src="${imageUrl}" alt="" />
                                                        </td>
                                                        <td style="width:60%">
                                                            <p style="margin: 5px; padding: 0">${name}</p>
                                                            <p style="margin: 5px; padding: 0">Số lượng: ${quantity}</p>
                                                            <p style="margin: 5px; padding: 0">Giá: ${formatPrice(price)}</p>
                                                            <p style="color: #f27c24; margin: 5px; padding: 0">Thành tiền: ${formatPrice(totalItem)}</p>
                                                        </td>
                                                    </tr>`
        })
        html += `
                                            </table>
                                        </div>
                                        <div style="padding: 30px; border-bottom: 10px solid #f0f0f0; line-height: 2">
                                            <table style="width: 100%; border-bottom: 1px solid #d8d8d8">
                                                <tbody>
                                                    <tr>
                                                        <td width="50%" style="color:#0f146d;font-weight:bold">Thành tiền:</td>
                                                        <td align="right" width="50%">${formatPrice(cost?.subTotal)}</td>    
                                                    </tr>
                                                    <tr>
                                                        <td width="50%" style="color:#0f146d;font-weight:bold">Phí vận chuyển:</td>
                                                        <td align="right" width="50%">${formatPrice(cost?.shippingFee)}</td>    
                                                    </tr>
                                                    <tr>
                                                        <td width="50%" style="color:#0f146d;font-weight:bold">Giảm giá:</td>
                                                        <td align="right" width="50%">${formatPrice(cost?.discount)}</td>    
                                                    </tr>
                                                    <tr>
                                                        <td width="50%" style="color:#0f146d;font-weight:bold">Tổng cộng:</td>
                                                        <td align="right" width="50%" style="color: #f27c24; font-weight: bold">${formatPrice(cost?.total)}</td>    
                                                    </tr>
                                                </tbody>
                                            </table>
                                            <table style="width: 100%">
                                                <tbody>
                                                    <tr>
                                                        <td width="50%" style="color:#0f146d;font-weight:bold">Hình thức thanh toán:</td>
                                                        <td align="right" width="50%">${method?.text}</td>    
                                                    </tr>
                                                </tbody>
                                            </table>
                                        </div>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>` 
    return await transporter.sendMail({
        from: '"BookStore" <project.php.nhncomputer@gmail.com>',
        to: delivery?.email,
        subject: `[BookStore] Đã nhận được đơn hàng của bạn`,
        html: `${html}`
    })
}



module.exports = { orderSuccess }