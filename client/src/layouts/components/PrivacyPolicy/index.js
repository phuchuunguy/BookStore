import React from "react";
import { Container } from 'react-bootstrap';
import styles from './PrivacyPolicy.module.css';

// Component này hiển thị Chính sách Bảo mật của trang web.
const PrivacyPolicy = () => {
  return (
    <Container className={styles.container}>
      <h1 className="text-3xl font-bold text-center text-indigo-700 mb-6 border-b-2 border-indigo-200 pb-2">
        CHÍNH SÁCH BẢO MẬT
      </h1>

      <div className="space-y-6 text-gray-700 leading-relaxed">
        
        {/* 1. Mục đích và phạm vi thu thập thông tin */}
        <h2 className="text-xl font-semibold text-indigo-600 border-l-4 border-indigo-500 pl-3">
          1. Mục đích và phạm vi thu thập thông tin
        </h2>
        <p>
          Để truy cập và sử dụng một số dịch vụ tại website, bạn có thể sẽ được yêu cầu đăng ký với chúng tôi thông tin cá nhân (Email, Họ tên, Số ĐT liên lạc…). Mọi thông tin khai báo phải đảm bảo tính chính xác và hợp pháp. Chúng tôi không chịu mọi trách nhiệm liên quan đến pháp luật của thông tin khai báo.
        </p>
        <p>
          Chúng tôi thu thập và sử dụng thông tin cá nhân bạn với mục đích phù hợp và hoàn toàn tuân thủ nội dung của "Chính sách bảo mật" này. Khi cần thiết, chúng tôi có thể sử dụng những thông tin này để liên hệ trực tiếp với bạn dưới các hình thức như: Gởi thư ngỏ, đơn đặt hàng, thư cảm ơn, thông tin về kỹ thuật và bảo mật...
        </p>
        <p>
          Trong một số trường hợp, chúng tôi có thể thuê một đơn vị độc lập để tiến hành các dự án nghiên cứu thị trường và khi đó thông tin của bạn sẽ được cung cấp cho đơn vị này để tiến hành dự án. Bên thứ ba này sẽ bị ràng buộc bởi một thỏa thuận về bảo mật mà theo đó họ chỉ được phép sử dụng những thông tin được cung cấp cho mục đích hoàn thành dự án.
        </p>

        {/* 2. Phạm vi sử dụng thông tin */}
        <h2 className="text-xl font-semibold text-indigo-600 border-l-4 border-indigo-500 pl-3 pt-4">
          2. Phạm vi sử dụng thông tin
        </h2>
        <ul className="list-disc list-inside space-y-2 pl-4">
          <li>
            Website thu thập và sử dụng thông tin cá nhân quý khách với mục đích phù hợp và hoàn toàn tuân thủ nội dung của “Chính sách bảo mật” này.
          </li>
          <li>
            Khi cần thiết, chúng tôi có thể sử dụng những thông tin này để liên hệ trực tiếp với bạn dưới các hình thức như: gởi thư ngỏ, đơn đặt hàng, thư cảm ơn, thông tin về kỹ thuật và bảo mật, quý khách có thể nhận được thư định kỳ cung cấp thông tin sản phẩm, dịch vụ mới, thông tin về các sự kiện sắp tới hoặc thông tin tuyển dụng nếu quý khách đăng kí nhận email thông báo.
          </li>
        </ul>

        {/* 3. Thời gian lưu trữ thông tin */}
        <h2 className="text-xl font-semibold text-indigo-600 border-l-4 border-indigo-500 pl-3 pt-4">
          3. Thời gian lưu trữ thông tin
        </h2>
        {/* Đã chuyển thành gạch đầu dòng */}
        <ul className="list-disc list-inside space-y-2 pl-4">
          <li>
            Ngoại trừ các trường hợp về sử dụng thông tin cá nhân như đã nêu trong chính sách này, chúng tôi cam kết sẽ không tiết lộ thông tin cá nhân bạn ra ngoài.
          </li>
          <li>
            Thông tin sẽ được lưu trữ vĩnh viễn cho đến khi quý khách không sử dụng dịch vụ của chúng tôi nữa.
          </li>
        </ul>
        
        {/* 4. Cam kết bảo mật thông tin cá nhân khách hàng */}
        <h2 className="text-xl font-semibold text-indigo-600 border-l-4 border-indigo-500 pl-3 pt-4">
          4. Cam kết bảo mật thông tin cá nhân khách hàng
        </h2>
        {/* Đã chuyển thành gạch đầu dòng */}
        <ul className="list-disc list-inside space-y-2 pl-4">
          <li>
            Chúng tôi cam kết bảo mật thông tin cá nhân của bạn bằng mọi cách thức có thể. Chúng tôi sẽ sử dụng nhiều công nghệ bảo mật thông tin khác nhau nhằm bảo vệ thông tin này không bị truy lục, sử dụng hoặc tiết lộ ngoài ý muốn.
          </li>
          <li>
            Chúng tôi khuyến cáo bạn nên bảo mật các thông tin liên quan đến mật khẩu truy xuất của bạn và không nên chia sẻ với bất kỳ người nào khác.
          </li>
          <li>
            Nếu sử dụng máy tính chung nhiều người, bạn nên đăng xuất, hoặc thoát hết tất cả cửa sổ Website đang mở.
          </li>
        </ul>
      </div>
    </Container>
  );
};

export default PrivacyPolicy;