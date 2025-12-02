import { useEffect } from "react";
import { useLocation } from "react-router-dom";

export default function ScrollToTop() {
  // Lấy đường dẫn (pathname) và tham số (?genre=...) hiện tại
  const { pathname, search } = useLocation();

  useEffect(() => {
    // Mỗi khi đường dẫn hoặc tham số thay đổi -> Cuộn lên đầu trang ngay lập tức
    window.scrollTo(0, 0);
  }, [pathname, search]);

  return null;
}