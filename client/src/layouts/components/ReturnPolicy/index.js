import React from "react";
import styles from "./ReturnPolicy.module.css";
import { Container, Row, Col } from "react-bootstrap";
import Loading from "../../../components/Loading"
function ReturnPolicy() {
  return (
    <div className={styles.container}>
      <h1>CHÍNH SÁCH ĐỔI TRẢ</h1>

      <p>
        Quý khách có thể thực hiện đổi trả hàng trong vòng <strong>03 ngày</strong> kể từ
        ngày nhận hàng cho các sản phẩm đặt mua tại D2P Store. Các sản phẩm thực hiện đổi trả
        phải không nằm trong danh mục hạn chế, không có dấu hiệu đã qua sử dụng, không bị dơ bẩn,
        trầy xước, có mùi lạ, không bị can thiệp sửa chữa và còn nguyên tem, mác, bao bì như ban đầu
        (trừ trường hợp sản phẩm bị lỗi hoặc hư hại trong quá trình vận chuyển).
      </p>

      <p>
        Phiếu mua hàng là phần không thể thiếu trong quy trình đổi trả tại D2P Store.
        Sau khi nhận được yêu cầu và hàng hóa gửi tới kho, D2P Store sẽ xử lý yêu cầu của quý khách
        trong thời gian sớm nhất.
      </p>

      <h2>1. Đổi trả theo nhu cầu khách hàng (đổi trả vì không ưng ý)</h2>

      <p>
        Tất cả sản phẩm đã mua đều có thể hoàn trả trong vòng <strong>03 ngày</strong> kể từ ngày
        nhận hàng (trừ khi có quy định khác). Chúng tôi chỉ chấp nhận đổi trả sản phẩm còn nguyên
        điều kiện ban đầu, bao gồm:
      </p>

      <ul>
        <li>Còn nguyên đóng gói và bao bì không bị móp rách.</li>
        <li>Đầy đủ chi tiết, phụ kiện.</li>
        <li>Tem/phiếu bảo hành, tem thương hiệu, hướng dẫn kỹ thuật và quà tặng kèm còn đầy đủ.</li>
        <li>Không bị dơ bẩn, trầy xước, hư hỏng, có mùi lạ hoặc dấu hiệu đã qua sử dụng.</li>
      </ul>

      <h2>2. Đổi trả không vì lý do chủ quan từ khách hàng</h2>

      <h3>2.1. Hàng giao không mới, không nguyên vẹn, sai nội dung hoặc bị thiếu</h3>
      <p>
        Quý khách được khuyến nghị kiểm tra tình trạng bên ngoài của thùng hàng và sản phẩm trước khi
        thanh toán để đảm bảo đúng chủng loại, số lượng, màu sắc và không bị tác động.
      </p>

      <p>
        Nếu phát hiện lỗi, vui lòng <strong>từ chối nhận hàng</strong> và báo ngay cho bộ phận hỗ trợ
        để được xử lý kịp thời. (Lưu ý: việc kiểm tra chuyên sâu chỉ được chấp nhận sau khi thanh toán.)
      </p>

      <p>
        Nếu đã nhận hàng và sau đó phát hiện lỗi, vui lòng chụp ảnh sản phẩm và gửi về email hỗ trợ để
        được hỗ trợ đổi/trả hoặc bổ sung sản phẩm còn thiếu.
      </p>

      <p>
        Sau <strong>48 giờ</strong> kể từ khi nhận hàng, chúng tôi có quyền từ chối hỗ trợ với các
        khiếu nại dạng này.
      </p>

      <h3>2.2. Hàng giao bị lỗi</h3>

      <p>Khi gặp vấn đề với sản phẩm, vui lòng làm theo các bước:</p>

      <ul>
        <li>
          <strong>Bước 1:</strong> Kiểm tra sản phẩm, chụp lại lỗi.
        </li>
        <li>
          <strong>Bước 2:</strong> Liên hệ trung tâm chăm sóc khách hàng qua hotline
          <strong> 0397 639 062</strong> để được xác nhận thông tin và hướng dẫn xử lý.
        </li>
        <li>
          <strong>Bước 3:</strong> Trong vòng 15 ngày kể từ khi xác nhận, quý khách sẽ được đổi trả hoặc
          hoàn tiền (nếu có).
        </li>
      </ul>

      <h2>3. Phương thức hoàn tiền</h2>

      <p>
        Tùy theo lý do đổi trả và kết quả đánh giá tại kho, chúng tôi áp dụng các hình thức hoàn tiền
        sau:
      </p>

      <ul>
        <li>Hoàn tiền bằng mã tiền điện tử để mua sản phẩm mới.</li>
        <li>Đổi sản phẩm mới cùng loại.</li>
        <li>Chuyển khoản ngân hàng theo thông tin khách hàng cung cấp.</li>
        <li>Hoàn tiền về tài khoản thẻ (đối với đơn thanh toán bằng thẻ quốc tế).</li>
        <li>Hoàn tiền mặt tại văn phòng.</li>
      </ul>

      <p>
        Mọi chi tiết hoặc thắc mắc, vui lòng liên hệ hotline hỗ trợ hoặc gửi yêu cầu trên website.
        Xin chân thành cảm ơn!
      </p>
    </div>
  );
}

export default ReturnPolicy;
