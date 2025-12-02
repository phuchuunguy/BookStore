import React from "react";
import { Container } from 'react-bootstrap';
import styles from './ShippingPolicy.module.css';

// Component hiển thị Chính sách Vận chuyển của Wabooks.
// Các classes Tailwind CSS nội bộ vẫn được giữ lại để tận dụng framework styling.
const ShippingPolicy = () => {
  return (
    // Sử dụng styles.container từ CSS module thay cho các lớp Tailwind bên ngoài
    <Container className={styles.container}>
      <h1 className="text-3xl font-bold text-center text-indigo-700 mb-6 border-b-2 border-indigo-200 pb-2">
        CHÍNH SÁCH VẬN CHUYỂN
      </h1>

      <div className="space-y-6 text-gray-700 leading-relaxed">
        {/* I. QUY ĐỊNH VỀ PHẠM VI GIAO HÀNG */}
        <h2 className="text-xl font-semibold text-indigo-600 border-l-4 border-indigo-500 pl-3">
          I. QUY ĐỊNH VỀ PHẠM VI GIAO HÀNG
        </h2>
        <p>
          D2P phục vụ giao hàng cho khách hàng phạm vi&nbsp;
          <strong>toàn quốc</strong>.
        </p>

        {/* II. Quy định về phí giao hàng */}
        <h2 className="text-xl font-semibold text-indigo-600 border-l-4 border-indigo-500 pl-3 pt-4">
          II. QUY ĐỊNH VỀ PHÍ GIAO HÀNG
        </h2>
        <p>
          Từ ngày 01/12/2025, phí ưu đãi giao hàng&nbsp;
          <strong>toàn quốc đồng giá 25.000 vnđ</strong> với tất cả các đơn hàng.
        </p>
        <p className="pl-4 italic text-sm text-gray-600">
          (*) Miễn phí vận chuyển với các đơn hàng mua các sản phẩm sách Combo đặc biệt, và nằm trong chương trình miễn phí vận chuyển của D2P.
        </p>

        {/* III. QUY ĐỊNH VỀ THỜI GIAN GIAO HÀNG */}
        <h2 className="text-xl font-semibold text-indigo-600 border-l-4 border-indigo-500 pl-3 pt-4">
          III. QUY ĐỊNH VỀ THỜI GIAN GIAO HÀNG
        </h2>

        {/* 1. Thời gian hoạt động giao hàng */}
        <h3 className="text-lg font-medium text-gray-800">
          1. Thời gian hoạt động giao hàng
        </h3>
        <ul className="list-disc list-inside space-y-2 pl-4">
          <li>
            <strong>Đối với khách hàng nội thành Hà Nội, và các tỉnh phía Bắc:</strong> thời gian giao hàng trong vòng <strong>2-3 ngày</strong> kể từ ngày đặt sách (trừ những ngày lễ, tết, và chủ nhật).
          </li>
          <li>
            <strong>Đối với các khách hàng khu vực phía Nam:</strong> thời gian giao hàng trong vòng <strong>5-7 ngày</strong> kể từ ngày đặt sách (trừ những ngày lễ, tết, và chủ nhật).
          </li>
        </ul>

        {/* 2. Quy định khung giờ xác nhận đơn hàng và giao hàng */}
        <h3 className="text-lg font-medium text-gray-800 pt-4">
          2. Quy định khung giờ xác nhận đơn hàng và giao hàng:
        </h3>
        <p>
          Trừ trường hợp có ghi chú về thời gian giao hàng đặc biệt của quý khách, khung giờ xác nhận đơn hàng sẽ được áp dụng như sau:
        </p>

        {/* Bảng Quy định khung giờ */}
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 border border-gray-300 rounded-lg">
            <thead className="bg-indigo-50">
              <tr>
                <th className="px-3 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider border-r border-gray-300">
                  Giờ xác nhận
                </th>
                <th className="px-3 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider border-r border-gray-300">
                  KH khu vực Hà Nội và ngoại thành phía bắc
                </th>
                <th className="px-3 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                  KH khu vực miền Nam
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {/* Row 1: Trước 16:00 */}
              <tr className="hover:bg-gray-50">
                <td className="px-3 py-3 whitespace-nowrap text-sm font-medium text-gray-900 border-r border-gray-300">
                  Trước 16:00 hàng ngày
                </td>
                <td className="px-3 py-3 text-sm text-gray-600 border-r border-gray-300">
                  Đơn hàng được xác nhận vào ngày đăng ký. Và được giao trong vòng <strong>2-3 ngày</strong> kể từ khi xác nhận đơn hàng
                </td>
                <td className="px-3 py-3 text-sm text-gray-600">
                  Đơn hàng được xác nhận vào ngày đăng ký. Và được giao trong vòng <strong>3-5 ngày</strong> kể từ khi xác nhận đơn hàng
                </td>
              </tr>
              {/* Row 2: Sau 16:00 */}
              <tr className="hover:bg-gray-50">
                <td className="px-3 py-3 whitespace-nowrap text-sm font-medium text-gray-900 border-r border-gray-300">
                  Sau 16:00 hàng ngày
                </td>
                <td className="px-3 py-3 text-sm text-gray-600 border-r border-gray-300">
                  Đơn hàng được xác nhận vào ngày hôm sau. Và được giao trong vòng <strong>2-3 ngày</strong> kể từ khi xác nhận đơn hàng
                </td>
                <td className="px-3 py-3 text-sm text-gray-600">
                  Đơn hàng được xác nhận vào ngày hôm sau. Và được giao trong vòng <strong>3-5 ngày</strong> kể từ khi xác nhận đơn hàng
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </Container>
  );
};

export default ShippingPolicy;