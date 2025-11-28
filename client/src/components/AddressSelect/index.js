import { useEffect, useState, memo } from "react";
// Đảm bảo đường dẫn CSS đúng với dự án của bạn
// import styles from "./AddressSelect.module.css"; 

const GHN_API_URL = "https://dev-online-gateway.ghn.vn/shiip/public-api/master-data";
const GHN_TOKEN = process.env.REACT_APP_GHN_TOKEN;

function AddressSelect({ onChange }) {
  const [provinceList, setProvinceList] = useState([]);
  const [districtList, setDistrictList] = useState([]);
  const [wardList, setWardList] = useState([]);

  const [province, setProvince] = useState(null);
  const [district, setDistrict] = useState(null);
  const [ward, setWard] = useState(null);
  const [address, setAddress] = useState("");

  // 1. Lấy danh sách Tỉnh/Thành
  useEffect(() => {
    const fetchProvince = async () => {
      try {
        const response = await fetch(`${GHN_API_URL}/province`, {
          headers: { token: GHN_TOKEN },
        });
        const result = await response.json();
        if (result.code === 200) {
          const convert = result.data.map(p => ({
            provinceId: p.ProvinceID,
            provinceName: p.ProvinceName,
          }));
          setProvinceList(convert);
        }
      } catch (error) {
        console.error("Lỗi lấy tỉnh:", error);
      }
    };
    fetchProvince();
  }, []);

  // 2. Lấy danh sách Quận/Huyện (FIX LỖI CRASH TẠI ĐÂY)
  useEffect(() => {
    // Chỉ chạy nếu province có dữ liệu và có provinceId
    if (!province || !province.provinceId) {
        setDistrictList([]);
        return;
    }

    const fetchDistrict = async () => {
      try {
        const response = await fetch(`${GHN_API_URL}/district?province_id=${province.provinceId}`, {
          headers: { token: GHN_TOKEN },
        });
        const result = await response.json();
        if (result.code === 200) {
          const convert = result.data.map(d => ({
            districtId: d.DistrictID,
            districtName: d.DistrictName,
          }));
          setDistrictList(convert);
        }
      } catch (error) {
        console.error("Lỗi lấy huyện:", error);
      }
    };
    
    fetchDistrict();
    
    // Khi đổi tỉnh -> Reset huyện, xã
    setDistrict(null);
    setWard(null);
  }, [province]); // Chỉ chạy khi province thay đổi

  // 3. Lấy danh sách Phường/Xã
  useEffect(() => {
    // Chỉ chạy nếu district có dữ liệu và có districtId
    if (!district || !district.districtId) {
        setWardList([]);
        return;
    }

    const fetchWard = async () => {
      try {
        const response = await fetch(`${GHN_API_URL}/ward?district_id=${district.districtId}`, {
          headers: { token: GHN_TOKEN },
        });
        const result = await response.json();
        if (result.code === 200) {
          const convert = result.data.map(w => ({
            wardId: w.WardCode,
            wardName: w.WardName,
          }));
          setWardList(convert);
        }
      } catch (error) {
        console.error("Lỗi lấy xã:", error);
      }
    };

    fetchWard();
    
    // Khi đổi huyện -> Reset xã
    setWard(null);
  }, [district]);

  // 4. Gửi dữ liệu ra Component Cha
  useEffect(() => {
    onChange({ province, district, ward, address });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [province, district, ward, address]);

  // --- Handlers ---
  const handleChangeProvince = (e) => {
    const selectedId = parseInt(e.target.value);
    const selectedItem = provinceList.find(p => p.provinceId === selectedId);
    setProvince(selectedItem || null);
  };

  const handleChangeDistrict = (e) => {
    const selectedId = parseInt(e.target.value);
    const selectedItem = districtList.find(d => d.districtId === selectedId);
    setDistrict(selectedItem || null);
  };

  const handleChangeWard = (e) => {
    const selectedId = e.target.value; // WardCode là string
    const selectedItem = wardList.find(w => w.wardId === selectedId);
    setWard(selectedItem || null);
  };

  return (
    <div className="address-select-container">
      <div className="row mb-3">
        <div className="col-md-4">
          <select
            className="form-select"
            value={province?.provinceId || ""}
            onChange={handleChangeProvince}
          >
            <option value="">-- Tỉnh/Thành --</option>
            {provinceList.map((p) => (
              <option key={p.provinceId} value={p.provinceId}>
                {p.provinceName}
              </option>
            ))}
          </select>
        </div>

        <div className="col-md-4">
          <select
            className="form-select"
            value={district?.districtId || ""}
            onChange={handleChangeDistrict}
            disabled={!province}
          >
            <option value="">-- Quận/Huyện --</option>
            {districtList.map((d) => (
              <option key={d.districtId} value={d.districtId}>
                {d.districtName}
              </option>
            ))}
          </select>
        </div>

        <div className="col-md-4">
          <select
            className="form-select"
            value={ward?.wardId || ""}
            onChange={handleChangeWard}
            disabled={!district}
          >
            <option value="">-- Phường/Xã --</option>
            {wardList.map((w) => (
              <option key={w.wardId} value={w.wardId}>
                {w.wardName}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="form-group">
        <input
          required
          type="text"
          className="form-control"
          placeholder="Số nhà, tên đường..."
          value={address}
          onChange={(e) => setAddress(e.target.value)}
        />
      </div>
    </div>
  );
}

export default memo(AddressSelect);