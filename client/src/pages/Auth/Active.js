import { useEffect, useState } from "react";
import { Container } from "react-bootstrap";
import { useNavigate, useSearchParams } from "react-router-dom";

import authApi from "../../api/authApi";

export default function Active() {

  const [result, setResult] = useState("")
  const [loading, setLoading] = useState(false)

  const [searchParams] = useSearchParams()
  const navigate = useNavigate()

  const active_code = searchParams.get('active_code')

  useEffect(() => {
    console.log(active_code)
    const handleAcitve = async () => {
        try {
            setLoading(true)
            const { error } = await authApi.activeAccount({active_code})
            setLoading(false)
            if (!error) {
                setResult("Xác minh thành công!")
                setTimeout(() => {
                    navigate({ pathname: "/dang-nhap" });
                }, 2000)
            } else {
                setResult("Xác minh thất bại!")
            }

        } catch (error) {
            setLoading(false)
            console.log(error)
        }
    }
    handleAcitve()
    
  }, [active_code, navigate])

  return (
    <div className="main">
      <Container>
        <div className="auth-wrapper">
            <h2 className="title text-center">
                {
                    loading ? "Đang xác minh" : (result ? result : null)
                }
            </h2>
        </div>
      </Container>
    </div>
  );
}

