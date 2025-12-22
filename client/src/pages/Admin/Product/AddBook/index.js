import { CKEditor } from '@ckeditor/ckeditor5-react';
import ClassicEditor from '@ckeditor/ckeditor5-build-classic';
import { Row, Col, Form, Spinner } from "react-bootstrap";
import Select from "react-select";
import { useFormik } from "formik";
import { useNavigate } from "react-router-dom";
import PreviewImage from "../../../../components/PreviewImage";
import * as Yup from "yup";
import styles from "../UpdateBook/UpdateBook.module.css";
import { useEffect, useState } from "react";
import authorApi from "../../../../api/authorApi";
import genreApi from "../../../../api/genreApi";
import publisherApi from "../../../../api/publisherApi";
import bookApi from "../../../../api/bookApi";
import axiosClient from "../../../../api/axiosClient";
import { swalSuccess, swalError } from "../../../../helper/swal";

function AddBook() {
  const navigate = useNavigate();

  const [authorList, setAuthorList] = useState([]);
  const [genreList, setGenreList] = useState([]);
  const [publisherList, setPublisherList] = useState([]);

  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const fetchAuthors = async () => {
      try {
        const { data } = await authorApi.getAll({ limit: 0 })
        const opts = data.map(item => { return {value: item.id, label: item.name} })
        setAuthorList(opts)
      } catch (error) {
        console.log(error)
      }
    };
    const fetchPublishers = async () => {
      try {
        const res = await publisherApi.getAll({})
        setPublisherList(res.data)
      } catch (error) {
        console.log(error)
      }
    };
    const fetchGenres = async () => {
      try {
        const { data } = await genreApi.getAll({})
        const opts = data.map(item => { return {value: item.id, label: item.name} })
        setGenreList(opts)
      } catch (error) {
        console.log(error)
      }
    };
    fetchAuthors();
    fetchGenres();
    fetchPublishers();
  }, []);

  const formik = useFormik({
    initialValues: {
      bookId: "",
      name: "",
      year: "",
      pages: "",
      size: "",
      price: "",
      discount: 0,
      quantity: 100, // Logic đã có
      image: "",
      description: "",
      author: [],
      genre: [],
      publisher: publisherList[0] ? publisherList[0].id : "",
    },
    enableReinitialize: true,
    validateOnChange: false,
    validateOnBlur: true,
    validationSchema: Yup.object({
      bookId: Yup.string()
        .required("Không được bỏ trống trường này!")
        .test("is-use", "Mã sách đã tồn tại!", async function (value) {
          try {
            const res = await bookApi.getByBookId(value);
            return res?.data?.id ? false : true;
          } catch (error) {
            console.log(error)
          }
        }),
      name: Yup.string().required("Không được bỏ trống trường này!"),
      price: Yup.number()
        .typeError("Vui lòng nhập giá hợp lệ!")
        .required("Không được bỏ trống trường này!"),
      quantity: Yup.number()
        .typeError("Vui lòng nhập số!")
        .min(0, "Số lượng không được âm")
        .required("Không được bỏ trống trường này!"),
      image: Yup.mixed().required("Không được bỏ trống trường này!")
        .test("FILE_SIZE", "Kích thước file quá lớn!", (value) => !value || (value && value.size < 1024 * 1024))
        .test("FILE_FORMAT", "File không đúng định dạng!", (value) => 
          !value || (value && ['image/png', 'image/gif', 'image/jpeg'].includes(value?.type) )
        )
    }),
    onSubmit: async () => {
      const { bookId, name, author, genre, publisher, description, 
        year, pages, size, price, discount, quantity, image } = formik.values;
      const genres = genre.map(item => item.value)
      const authors = author.map(item => item.value)
      try {
        const formData = new FormData();
        formData.append("file", image);
        setLoading(true)
        // Upload via server endpoint which will sign and forward to Cloudinary
        const resCloudinary = await axiosClient.post(`/upload`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        })
        const { secure_url, public_id } = resCloudinary
        if (secure_url && public_id) {
          const res = await bookApi.create({ 
            bookId, name, year, pages, size, price, discount, description,
            quantity: parseInt(quantity),
            author: authors,
            genre: genres,
            publisher: publisher,
            imageUrl: secure_url,
            publicId: public_id
          })
          setLoading(false)
          console.log(res)
          swalSuccess("Thêm sách thành công!")
          navigate({ pathname: "/admin/book" });
        }
        
      } catch (error) {
        setLoading(false)
        swalError("Thất bại!", error?.message || String(error))
        console.log(error);
      }
    },
  });

  return (
    <Row>
      <Col xl={12}>
        <div className="admin-content-wrapper">
          <div className="admin-content-header">Thêm sách mới</div>
          <div className="admin-content-body">
            <form onSubmit={formik.handleSubmit}>
              <Row>
                <Col xl={3}>
                  <div className="form-group">
                    <label className={styles.formLabel}>Mã sách</label>
                    <input
                      type="text"
                      name="bookId"
                      className={`form-control ${
                        formik.errors.bookId && formik.touched.bookId ? "is-invalid" : formik.values.bookId && "is-valid"
                      }`}
                      placeholder="Mã sách"
                      value={formik.values.bookId}
                      onBlur={formik.handleBlur}
                      onChange={formik.handleChange}
                    />
                    {formik.errors.bookId && <Form.Control.Feedback type="invalid">{formik.errors.bookId}</Form.Control.Feedback>}
                  </div>
                </Col>
                <Col xl={9}>
                  <div className="form-group">
                    <label className={styles.formLabel}>Tên sách</label>
                    <input
                      type="text"
                      name="name"
                      className={`form-control ${
                        (formik.errors.name && formik.touched.name) ? "is-invalid" : formik.values.name && "is-valid"
                      }`}
                      placeholder="Tên sách"
                      value={formik.values.name}
                      onBlur={formik.handleBlur}
                      onChange={formik.handleChange}
                    />
                    {formik.errors.name && <Form.Control.Feedback type="invalid">{formik.errors.name}</Form.Control.Feedback>}
                  </div>
                </Col>
              </Row>

              <Row>
                <Col xl={4}>
                  <div className="form-group">
                    <label className={styles.formLabel}>Tác giả</label>
                    <Select
                      isMulti={true}
                      name="author"
                      required={true}
                      onChange={(option) => formik.setFieldValue("author", option)}
                      options={authorList}
                    />
                  </div>
                </Col>
                <Col xl={4}>
                  <div className="form-group">
                    <label className={styles.formLabel}>Thể loại</label>
                    <Select
                      isMulti={true}
                      name="genre"
                      required={true}
                      onChange={(option) => formik.setFieldValue("genre", option)}
                      options={genreList}
                    />
                  </div>
                </Col>
                <Col xl={4}>
                  <div className="form-group">
                    <label className={styles.formLabel}>Nhà xuất bản</label>
                    <select
                      className="form-select"
                      name="publisher"
                      value={formik.values.publisher}
                      onBlur={formik.handleBlur}
                      onChange={formik.handleChange}
                    >
                      {publisherList.length > 0 &&
                        publisherList.map((publisher) => (
                          <option key={publisher.id} value={publisher.id}>
                            {publisher.name}
                          </option>
                        ))}
                    </select>
                  </div>
                </Col>
              </Row>

              {/* HÀNG 3: NĂM - TRANG - KÍCH THƯỚC - SỐ LƯỢNG */}
              <Row>
                <Col xl={4}>
                  <div className="form-group">
                    <label className={styles.formLabel}>Năm xuất bản</label>
                    <input
                      type="text"
                      name="year"
                      className={`form-control ${formik.errors.year && formik.touched.year ? "is-invalid" : formik.values.year && "is-valid"}`}
                      placeholder="Năm xuất bản"
                      value={formik.values.year}
                      onBlur={formik.handleBlur}
                      onChange={formik.handleChange}
                    />
                    {formik.errors.year && <Form.Control.Feedback type="invalid">{formik.errors.year}</Form.Control.Feedback>}
                  </div>
                </Col>
                <Col xl={4}>
                  <div className="form-group">
                    <label className={styles.formLabel}>Số trang</label>
                    <input
                      type="text"
                      name="pages"
                      className={`form-control ${formik.errors.pages && formik.touched.pages ? "is-invalid" : formik.values.pages && "is-valid"}`}
                      placeholder="Số trang"
                      value={formik.values.pages}
                      onBlur={formik.handleBlur}
                      onChange={formik.handleChange}
                    />
                    {formik.errors.pages && <Form.Control.Feedback type="invalid">{formik.errors.pages}</Form.Control.Feedback>}
                  </div>
                </Col>
                <Col xl={4}>
                  <div className="form-group">
                    <label className={styles.formLabel}>Kích thước</label>
                    <input
                      type="text"
                      name="size"
                      className={`form-control ${formik.errors.size && formik.touched.size ? "is-invalid" : formik.values.size && "is-valid"}`}
                      placeholder="Kích thước"
                      value={formik.values.size}
                      onBlur={formik.handleBlur}
                      onChange={formik.handleChange}
                    />
                    {formik.errors.size && <Form.Control.Feedback type="invalid">{formik.errors.size}</Form.Control.Feedback>}
                  </div>
                </Col>
                
              </Row>
              <Row>
                <Col xl={4}>
                  <div className="form-group">
                    <label className={styles.formLabel}>Giá bán</label>
                    <input
                      type="number"
                      min="0"
                      name="price"
                      className={`form-control ${formik.errors.price && formik.touched.price ? "is-invalid" : formik.values.price && "is-valid"}`}
                      placeholder="Giá bán"
                      value={formik.values.price}
                      onBlur={formik.handleBlur}
                      onChange={formik.handleChange}
                    />
                    {formik.errors.price && <Form.Control.Feedback type="invalid">{formik.errors.price}</Form.Control.Feedback>}
                  </div>
                </Col>
                <Col xl={4}>
                  <div className="form-group">
                    <label className={styles.formLabel}>Giảm giá</label>
                    <input
                      type="number"
                      name="discount"
                      min="0"
                      max="100"
                      className={`form-control ${
                        formik.errors.discount && formik.touched.discount 
                        ? "is-invalid" 
                        : formik.values.discount && "is-valid"}`}
                      placeholder="Giảm giá"
                      value={formik.values.discount}
                      onBlur={formik.handleBlur}
                      onChange={(e) => {
                      let value = e.target.value;
                      value = Math.round(Number(value));
                      formik.setFieldValue("discount", value);
                      }}
                    />
                    {formik.errors.discount && <Form.Control.Feedback type="invalid">{formik.errors.discount}</Form.Control.Feedback>}
                  </div>
                </Col>
                <Col xl={4}>
                   <div className="form-group">
                    <label className={styles.formLabel}>Số lượng</label>
                    <input
                      type="number"
                      name="quantity"
                      className={`form-control ${formik.errors.quantity && formik.touched.quantity ? "is-invalid" : formik.values.quantity && "is-valid"}`}
                      placeholder="Số lượng"
                      value={formik.values.quantity}
                      onBlur={formik.handleBlur}
                      onChange={formik.handleChange}
                    />
                    {formik.errors.quantity && <Form.Control.Feedback type="invalid">{formik.errors.quantity}</Form.Control.Feedback>}
                  </div>
                </Col>
              </Row>

              {/* Description and Image Row: mimic UpdateBook layout */}
              <Row className="mt-4">
                <Col xl={8}>
                  <div className="form-group mb-4">
                    <label className={styles.formLabel}>Mô tả</label>
                    <CKEditor
                      editor={ClassicEditor}
                      data={formik.values.description}
                      onChange={(event, editor) => {
                        formik.setFieldValue("description", editor.getData());
                      }}
                    />
                  </div>
                </Col>

                <Col xl={4} className={styles.imageSection}>
                  <div className={styles.imageContainer}>
                    <div className="form-group">
                      <label className={styles.formLabel}>Hình ảnh</label>
                      <input
                        type="file"
                        name="image"
                        className={`form-control ${
                          formik.errors.image && formik.touched.image
                            ? "is-invalid"
                            : formik.values.image && "is-valid"
                        }`}
                        accept="image/png, image/gif, image/jpeg"
                        onChange={(e) => formik.setFieldValue("image", e.target.files[0])}
                      />
                      {formik.errors.image && (
                        <Form.Control.Feedback type="invalid">
                          {formik.errors.image}
                        </Form.Control.Feedback>
                      )}
                    </div>

                    {formik.values.image && (
                      <div className="mt-3">
                        <PreviewImage file={formik.values.image} />
                      </div>
                    )}
                  </div>
                </Col>
              </Row>

              {/* Buttons row (align with UpdateBook) */}
              <Row className="mt-2">
                <Col xl={8} className={styles.buttonsRow}>
                  <button
                    type="submit"
                    className={`bookstore-btn ${styles.submitBtn}`}
                    disabled={loading}
                  >
                    Thêm sách
                  </button>
                  {loading && <Spinner style={{ marginLeft: "20px" }} animation="border" variant="success" />}
                </Col>
                <Col xl={4} />
              </Row>
            </form>
          </div>
        </div>
      </Col>
    </Row>
  );
}

export default AddBook;