import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import "sweetalert2/dist/sweetalert2.min.css";

const MySwal = withReactContent(Swal);

export const swalSuccess = (title = "Thành công", options = {}) => {
  return MySwal.fire({
    title,
    icon: "success",
    confirmButtonText: "OK",
    ...options,
  });
};

export const swalError = (title = "Thất bại", text = "", options = {}) => {
  return MySwal.fire({
    title,
    text,
    icon: "error",
    confirmButtonText: "OK",
    ...options,
  });
};

export const swalInfo = (title = "Thông báo", options = {}) => {
  return MySwal.fire({
    title,
    icon: "info",
    confirmButtonText: "OK",
    ...options,
  });
};

export const swalConfirm = async (options = {}) => {
  const result = await MySwal.fire({
    icon: "warning",
    showCancelButton: true,
    confirmButtonText: "Đồng ý",
    cancelButtonText: "Hủy",
    ...options,
  });
  return result.isConfirmed;
};

export default MySwal;
