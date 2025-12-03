<<<<<<< Updated upstream
import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import "sweetalert2/dist/sweetalert2.min.css";

const MySwal = withReactContent(Swal);

function AccessDenied() {
    const navigate = useNavigate();

    useEffect(() => {
        let isMounted = true;
        MySwal.fire({
            title: "Bạn không có quyền truy cập tài nguyên này!",
            icon: "error",
            confirmButtonText: "Quay lại",
            allowOutsideClick: false,
            allowEscapeKey: false,
        }).then(() => {
            if (isMounted) navigate("/", { replace: true });
        });

        // cleanup to prevent state update after unmount
        return () => {
            isMounted = false;
        };
    }, [navigate]);

    // Return null because the popup will be displayed on mount.
    return null;
}

export default AccessDenied
=======
>>>>>>> Stashed changes
