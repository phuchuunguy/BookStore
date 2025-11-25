import { useEffect, useState, memo } from "react";
import styles from "./AddressSelect.module.css";

function AddressSelect({ onChange }) {
  const [provinceList, setProvinceList] = useState([]);
  const [districtList, setDistrictList] = useState([]);
  const [wardList, setWardList] = useState([]);

  const [province, setProvince] = useState({});
  const [district, setDistrict] = useState({});
  const [ward, setWard] = useState({});
  const [address, setAddress] = useState("");


  useEffect(() => {
    onChange({ province, district, ward, address });
  }, [province, district, ward, address, onChange]);


  useEffect(() => {
    const fetchProvince = async () => {
      const result = await fetch("https://online-gateway.ghn.vn/shiip/public-api/master-data/province", {
        method: "GET",
        headers: {
          'token': process.env.REACT_APP_GHN_TOKEN,
        },
      });
      const { data } = await result.json();
      const convert = data.map(province => { 
        return {
          provinceId: province?.ProvinceID, 
          provinceName: province?.ProvinceName, 
        }
       })
      setProvinceList(convert);
      setProvince(convert[0])
    };

    fetchProvince();
  }, []);

  useEffect(() => {
    const fetchDistrict = async () => {
      const result = await fetch(`https://online-gateway.ghn.vn/shiip/public-api/master-data/district?province_id=${province?.provinceId}`, {
        method: "GET",
        headers: {
          'token': process.env.REACT_APP_GHN_TOKEN,
        },
      });
      const { data } = await result.json();
      const convert = data.map(district => { 
        return {
          districtId: district?.DistrictID, 
          districtName: district?.DistrictName, 
        }
       })
       setDistrictList(convert)
       setDistrict(convert[0])
    };

    if (province && province?.provinceId) fetchDistrict()
  }, [province]);

  useEffect(() => {
    const fetchWard = async () => {
      const result = await fetch(`https://online-gateway.ghn.vn/shiip/public-api/master-data/ward?district_id=${district?.districtId}`, {
        method: "GET",
        headers: {
          'token': process.env.REACT_APP_GHN_TOKEN,
        },
      });
      const { data } = await result.json();
      const convert = data.map(ward => { 
        return {
          wardId: ward?.WardCode,
          wardName: ward?.WardName, 
        }
       })
      setWardList(convert);
      setWard(convert[0])
    };
    if (district && district?.districtId) fetchWard()
  }, [district]);

  const handleChangeProvince = (e) => {
    const index = e.target.selectedIndex;
    setProvince({ provinceId: parseInt(e.target.value), provinceName: e.target[index].text });
  };

  const handleChangeDistrict = (e) => {
    const index = e.target.selectedIndex;
    setDistrict({ districtId: parseInt(e.target.value), districtName: e.target[index].text });
  };

  const handleChangeWard = (e) => {
    const index = e.target.selectedIndex;
    setWard({ wardId: parseInt(e.target.value), wardName: e.target[index].text });
  };

  return (
    <div>
      <div className={styles.boxSelect}>
        <select
          className="form-select"
          value={province && province?.provinceId}
          onChange={handleChangeProvince}
        >
          {provinceList && provinceList?.length > 0 &&
            provinceList.map((province) => (
              <option key={province?.provinceId} value={province?.provinceId}>
                {province?.provinceName}
              </option>
            ))}
        </select>

        <select
          className="form-select"
          value={district && district?.districtId}
          onChange={handleChangeDistrict}
        >
          {districtList && districtList?.length > 0 &&
            districtList.map((district) => (
              <option key={district?.districtId} value={district?.districtId}>
                {district?.districtName}
              </option>
            ))}
        </select>
        <select
          className="form-select"
          value={ward && ward?.wardId}
          onChange={handleChangeWard}
        >
          {wardList.length > 0 &&
            wardList.map((ward) => (
              <option key={ward?.wardId} value={ward?.wardId}>
               {ward?.wardName}
              </option>
            ))}
        </select>
      </div>
      <div className={`form-group ${styles.addressDetail}`}>
        <input
          required
          type="text"
          name="newAddress"
          className="form-control"
          placeholder="Địa chỉ: Số nhà, tên đường, ấp"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
        />
      </div>
    </div>
  );
}

export default memo(AddressSelect);
