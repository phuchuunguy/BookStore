import React, { useEffect, useState } from "react";
import { Container, Row, Col, Breadcrumb, NavLink } from "react-bootstrap";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { FaCartPlus, FaMinus, FaPlus, FaTruck } from "react-icons/fa"; // Thêm icon xe tải
import Swal from "sweetalert2";
import moment from "moment";

import bookApi from "../../api/bookApi";
import userApi from "../../api/userApi";
import format from "../../helper/format";
import { addToCart } from "../../redux/actions/cart"; // Giữ nguyên action cũ
import Loading from "../../components/Loading";

import styles from "./ProductDetail.module.css";

export default function ProductDetail() {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { slug } = useParams();
    const { userId } = useSelector((state) => state.auth);
    const cartData = useSelector((state) => state.cart);
    const currentUser = useSelector((state) => state.auth);

    const [bookData, setBookData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [quantity, setQuantity] = useState(1);
    
    // Giả lập state biến thể cho giống Shopee
    const [version, setVersion] = useState("Bản thường");
    const [hasBookmark, setHasBookmark] = useState(false);

    useEffect(() => {
    const addToCart = async() => {
      try {
        const { list } = cartData
        const newList = list.map(item => {
          return { product: item.product.id, quantity: item.quantity }
        })
        await userApi.updateCart(currentUser.userId, {cart: newList})
      } catch (error) {
        console.log(error)
      }
    }
    if (currentUser && currentUser.userId) {
      addToCart()
    }
  }, [cartData, currentUser])

    useEffect(() => {
        const fetchBook = async () => {
            try {
                setLoading(true);
                const res = await bookApi.getBySlug(slug);
                const data = res.data || res;
                setBookData(data);
                setLoading(false);
            } catch (error) {
                setLoading(false);
                console.log(error);
            }
        };
        fetchBook();
    }, [slug]);

    const decQuantity = () => {
        if (quantity > 1) setQuantity(quantity - 1);
    };

    const incQuantity = () => {
        if (bookData.quantity && quantity >= bookData.quantity) {
             Swal.fire("Thông báo", `Chỉ còn ${bookData.quantity} sản phẩm!`, "warning");
             return;
        }
        setQuantity(quantity + 1);
    };

    const handleChange = (e) => {
        const val = parseInt(e.target.value);
        if (val && val > 0) setQuantity(val);
        else setQuantity(1);
    };

    // --- GIỮ NGUYÊN LOGIC CŨ ---
    const handleAddToCart = async () => {
        if (userId) {
            try {
                const { id: productId, name, imageUrl, slug, price, discount } = bookData;
                let newPrice = price;
                if (discount > 0) {
                    newPrice = price - (price * discount) / 100;
                }
                
                // Gọi action Redux cũ
                const action = addToCart({
                    quantity, productId, name, imageUrl, slug, 
                    price: newPrice, 
                    totalPriceItem: newPrice * quantity
                });
                dispatch(action);

                // Gọi API cập nhật giỏ hàng (Logic cũ)
                await userApi.addToCart(userId, { productId, quantity });

                Swal.fire({
                    title: "Thành công!",
                    text: "Đã thêm vào giỏ hàng!",
                    icon: "success",
                    confirmButtonColor: "#ee4d2d",
                    timer: 1500
                });
            } catch (error) {
                console.log(error);
                Swal.fire("Lỗi", "Không thể thêm vào giỏ hàng", "error");
            }
        } else {
            Swal.fire({
                title: "Thông báo",
                text: "Vui lòng đăng nhập để thực hiện!",
                icon: "info",
                confirmButtonColor: "#17a2b8",
            });
            navigate("/dang-nhap");
        }
    };

    const handleBuyNow = async () => {
        if (userId) {
            await handleAddToCart(); // Thêm vào giỏ trước
            navigate("/gio-hang");   // Rồi chuyển trang
        } else {
            Swal.fire({
                title: "Thông báo",
                text: "Vui lòng đăng nhập để mua hàng!",
                icon: "info",
                confirmButtonColor: "#17a2b8",
            });
            navigate("/dang-nhap");
        }
    };

    if (!bookData) return <Loading />;

    const priceAfterDiscount = bookData.price - (bookData.price * (bookData.discount || 0) / 100);

    const computeFinalPrice = () => {
    let price = priceAfterDiscount;

    if (version === "Bản đặc biệt") price += 25000;
    if (hasBookmark) price += 10000;

    return price;
    };

    const finalPrice = computeFinalPrice();

    const deliveryStart = moment().add(3, 'days').format('D [Th]MM');
    const deliveryEnd = moment().add(5, 'days').format('D [Th]MM');

    return (
        <div className="main" style={{ backgroundColor: "#f5f5f5", minHeight: "100vh", paddingBottom: "30px" }}>
            <Container>
                <div style={{ padding: "15px 0" }}>
                    <Breadcrumb>
                        <Breadcrumb.Item linkAs={NavLink} linkProps={{ to: "/" }}>Trang chủ</Breadcrumb.Item>
                        <Breadcrumb.Item linkAs={NavLink} linkProps={{ to: "/san-pham" }}>Sản phẩm</Breadcrumb.Item>
                        <Breadcrumb.Item active>{bookData.name}</Breadcrumb.Item>
                    </Breadcrumb>
                </div>

                {!loading ? (
                    <>
                        {/* KHUNG SẢN PHẨM CHÍNH */}
                        <div className={styles.productBox}>
                            <Row>
                                {/* CỘT ẢNH */}
                                <Col md={5}>
                                    <div className={styles.imageWrapper}>
                                        <img src={bookData.imageUrl} alt={bookData.name} className={styles.mainImage} />
                                    </div>
                                </Col>

                                {/* CỘT THÔNG TIN */}
                                <Col md={7}>
                                    <h1 className={styles.title}>{bookData.name}</h1>

                                    <div className={styles.meta}>
                                        <span>Tác giả: <span className={styles.metaVal}>{bookData.author?.[0]?.name || "Đang cập nhật"}</span></span>
                                        <span className={styles.divider}>|</span>
                                        <span>NXB: <span className={styles.metaVal}>{bookData.publisher?.name}</span></span>
                                        <span className={styles.divider}>|</span>
                                        <span>Năm: <span className={styles.metaVal}>{bookData.year}</span></span>
                                    </div>

                                    {/* GIÁ TIỀN */}
                                    <div className={styles.priceSection}>
                                        {bookData.discount > 0 && (
                                            <span className={styles.oldPrice}>{format.formatPrice(bookData.price)}</span>
                                        )}

                                        {/* GIÁ SAU KHI CỘNG OPTION */}
                                        <span className={styles.currentPrice}>{format.formatPrice(finalPrice)}</span>

                                        {bookData.discount > 0 && (
                                            <span className={styles.discountTag}> GIẢM {Math.round(bookData.discount)}%</span>
                                        )}
                                    </div>

                                    {/* PHÂN LOẠI */}
                                    <div className={styles.rowSection}>
                                        <span className={styles.label}>Phân Loại</span>
                                        <div className={styles.classificationGroup}>

                                            {/* Bản thường */}
                                            <button
                                                className={`${styles.classBtn} ${version === "Bản thường" ? styles.classBtnActive : ""}`}
                                                onClick={() => setVersion("Bản thường")}
                                            >
                                                Bản thường
                                            </button>

                                            {/* Bản đặc biệt +25k */}
                                            <button
                                                className={`${styles.classBtn} ${version === "Bản đặc biệt" ? styles.classBtnActive : ""}`}
                                                onClick={() => setVersion("Bản đặc biệt")}
                                            >
                                                Bản đặc biệt
                                            </button>

                                            {/* Bookmark +10k */}
                                            <button
                                                className={`${styles.classBtn} ${hasBookmark ? styles.classBtnActive : ""}`}
                                                onClick={() => setHasBookmark(!hasBookmark)}
                                            >
                                                Kèm Bookmark
                                            </button>

                                        </div>
                                    </div>

                                    {/* VẬN CHUYỂN */}
                                    <div className={styles.shippingSection}>
                                        <span className={styles.label}>Vận Chuyển</span>
                                        <div className={styles.shippingInfo}>
                                            <div className={styles.shippingRow}>
                                                <FaTruck className={styles.truckIcon} />
                                                <span className={styles.shippingText}>
                                                    Nhận hàng từ <span className={styles.boldText}>{deliveryStart}</span> - <span className={styles.boldText}>{deliveryEnd}</span>
                                                </span>
                                            </div>
                                            <div className={styles.shippingFee}>
                                                <span className={styles.feeLabel}>Phí vận chuyển:</span>
                                                <span className={styles.feeValue}>0₫ - 30.000₫</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* SỐ LƯỢNG */}
                                    <div className={styles.rowSection}>
                                        <span className={styles.label}>Số lượng</span>
                                        <div className={styles.quantityControl}>
                                            <button onClick={decQuantity}><FaMinus /></button>
                                            <input type="text" value={quantity} onChange={handleChange} />
                                            <button onClick={incQuantity}><FaPlus /></button>
                                        </div>
                                        <span className={styles.stock}>{bookData.quantity || 100} sản phẩm có sẵn</span>
                                    </div>

                                    {/* NÚT MUA */}
                                    <div className={styles.actions}>
                                        <button className={styles.btnAddCart} onClick={handleAddToCart}>
                                            <FaCartPlus style={{ marginRight: 8 }} />
                                            Thêm vào giỏ hàng
                                        </button>
                                        <button className={styles.btnBuyNow} onClick={handleBuyNow}>
                                            Mua Ngay
                                        </button>
                                    </div>
                                </Col>
                            </Row>
                        </div>

                        {/* KHUNG CHI TIẾT & MÔ TẢ */}
                        <div className={styles.descriptionBox}>
                            <h4 className={styles.descTitle}>CHI TIẾT SẢN PHẨM</h4>
                            <div className={styles.specs} style={{ padding: '0 20px 20px' }}>
                                <div className={styles.specRow}><label>Mã sách</label><span>{bookData.bookId}</span></div>
                                <div className={styles.specRow}><label>Kích thước</label><span>{bookData.size || "Đang cập nhật"}</span></div>
                                <div className={styles.specRow}><label>Số trang</label><span>{bookData.pages || "Đang cập nhật"}</span></div>
                                <div className={styles.specRow}><label>Thể loại</label><span>{format.arrayToString(bookData?.genre || [])}</span></div>
                            </div>

                            {version === "Bản đặc biệt" && (
                            <div className={styles.specRow}>
                                <label>Ưu điểm bản đặc biệt</label>
                                <span>
                                    Bản đặc biệt sẽ có những hình ảnh và các ví dụ minh họa mô tả chi tiết nội dung của các câu truyện một cách rõ ràng hơn 
                                    nhằm mục đích tạo ra những nội dung dễ hiểu và không gây ức chế người đọc, giúp độc giả có những giây phút đọc sách một cách thoải mái.
                                    Và sẽ có thay đổi một chút hơi cầu kỳ về thiết kế... 
                                    nói chung là các bạn cứ mua là sẽ hiểu 😜
                                </span>
                            </div>
                            )}

                            <hr style={{ borderTop: '1px solid #f1f1f1', margin: 0 }} />

                            <h4 className={styles.descTitle}>MÔ TẢ NỘI DUNG</h4>
                            <div className={styles.descContent}>
                                {bookData.description && bookData.description.includes('<') ? (
                                    <div dangerouslySetInnerHTML={{ __html: bookData.description }} />
                                ) : (
                                    <p style={{ whiteSpace: 'pre-line' }}>{bookData.description}</p>
                                )}
                            </div>
                        </div>
                    </>
                ) : <Loading />}
            </Container>
        </div>
    );
}