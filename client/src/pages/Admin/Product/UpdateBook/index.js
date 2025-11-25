import axios from "axios";
import { useEffect, useState } from "react";
import { CKEditor } from '@ckeditor/ckeditor5-react';
import ClassicEditor from '@ckeditor/ckeditor5-build-classic';
import Select from "react-select";
import { Row, Col, Form } from "react-bootstrap";
import { useFormik } from "formik";
import { useNavigate, useParams } from "react-router-dom";

import * as Yup from "yup";
import PreviewImage from "../../../../components/PreviewImage";
import authorApi from "../../../../api/authorApi";
import genreApi from "../../../../api/genreApi";
import bookApi from "../../../../api/bookApi";
import publisherApi from "../../../../api/publisherApi";
import styles from "./UpdateBook.module.css";

function UpdateBook() {

  const params = useParams()
  const { id } = params

  const navigate = useNavigate();

  const [authorList, setAuthorList] = useState([]);
  const [genreList, setGenreList] = useState([]);
  const [publisherList, setPublisherList] = useState([]);

  const [bookData, setBookData] = useState({})

  const [updateImage, setUpdateImage] = useState(false)

  useEffect(() => {
    const fetchBook = async () => {
      try {
        const { data } = await bookApi.getById(id)
        const genres = data.genre.map(item => {
          return {
            value: item._id,
            label: item.name
          }
        })
        const authors = data.author.map(item => {
          return {
            value: item._id,
            label: item.name
          }
        })
        setBookData({...data, genre: genres, author: authors})
      } catch (error) {
        console.log(error);
      }
    };
    fetchBook();
  }, [id]);


  useEffect(() => {
    const fetchAuthors = async () => {
      try {
        const { data } = await authorApi.getAll({ limit: 0 })
        const opts = data.map(item => { return {value: item._id, label: item.name} })
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
        const opts = data.map(item => { return {value: item._id, label: item.name} })
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
      bookId: bookData.bookId ? bookData.bookId : "",
      name: bookData.name ? bookData.name : "",
      year: bookData.year ? bookData.year : "",
      pages: bookData.pages ? bookData.pages : "",
      size: bookData.size ? bookData.size : "",
      price: bookData.price ? bookData.price : "",
      discount: bookData.discount ? bookData.discount : "",
      description: bookData.description ? bookData.description : "",
      author: bookData.author ? bookData.author : [],
      genre: bookData?.genre ? bookData.genre : [],
      publisher: bookData?.publisher?._id ? bookData.publisher._id : "",
    },
    enableReinitialize: true,
    validateOnChange: false,
    validateOnBlur: true,
    validationSchema: Yup.object({
      bookId: Yup.string().required("Không được bỏ trống trường này!"),
      name: Yup.string().required("Không được bỏ trống trường này!"),
      price: Yup.number()
        .typeError("Vui lòng nhập giá hợp lệ!")
        .required("Không được bỏ trống trường này!"),
      image: updateImage && Yup.mixed().required("Không được bỏ trống trường này!")
      .test("FILE_SIZE", "Kích thước file quá lớn!", (value) => !value || (value && value.size < 1024 * 1024))
      .test("FILE_FORMAT", "File không đúng định dạng!", (value) => 
        !value || (value && ['image/png', 'image/gif', 'image/jpeg'].includes(value?.type) )
        )
    }),
    onSubmit: async () => {
      console.log("kiem tra", formik.values);
      const { bookId, name, author, genre, publisher, description, 
        year, pages, size, price, discount, image } = formik.values;
      try {
        if (image) {
          const formData = new FormData();
          formData.append("file", image);
          formData.append("upload_preset", "fti6du11");
          const resCloudinary = await axios.post("https://api.cloudinary.com/v1_1/dbynglvwk/image/upload", formData)
          const { secure_url, public_id } = resCloudinary.data
          if (secure_url && public_id) {
            await bookApi.update(id, { 
              bookId, name, year, pages, size, price, discount, description,
              author: author._id,
              genre: genre._id,
              publisher: publisher._id,
              imageUrl: secure_url,
              publicId: public_id
            })
          } 
        } else {
            await bookApi.update(id, { 
              bookId, name, year, pages, size, price, discount, description,
              author: author._id,
              genre: genre._id,
              publisher: publisher._id,
          })
        }
        alert("Lưu thay đổi thành công!")
        navigate({ pathname: "/admin/book" });
        
      } catch (error) {
        alert("Lưu thay đổi thất bại!")
        console.log(error);
      }
    },
  });

  return (
    <Row>
      <Col xl={12}>
        <div className="admin-content-wrapper">
          <div className="admin-content-header">Cập nhật sách thông tin sách</div>
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
                        formik.errors.bookId
                          ? "is-invalid"
                          : formik.values.bookId && "is-valid"
                      }`}
                      placeholder="Mã sách"
                      value={formik.values.bookId}
                      readOnly
                    />
                    {formik.errors.bookId && (
                      <Form.Control.Feedback type="invalid">
                        {formik.errors.bookId}
                      </Form.Control.Feedback>
                    )}
                  </div>
                </Col>
                <Col xl={9}>
                  <div className="form-group">
                    <label className={styles.formLabel}>Tên sách</label>
                    <input
                      type="text"
                      name="name"
                      className={`form-control ${
                        formik.errors.name
                          ? "is-invalid"
                          : formik.values.name && "is-valid"
                      }`}
                      placeholder="Tên sách"
                      value={formik.values.name}
                      onBlur={formik.handleBlur}
                      onChange={formik.handleChange}
                    />
                    {formik.errors.name && (
                      <Form.Control.Feedback type="invalid">
                        {formik.errors.name}
                      </Form.Control.Feedback>
                    )}
                  </div>
                </Col>
              </Row>

              <Row>
                <Col xl={4}>
                  <div className="form-group">
                    <label className={styles.formLabel}>Tác giả</label>
                    <Select
                      isMulti={true}
                      value={formik.values.author}
                      name="author"
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
                      value={formik.values.genre}
                      name="genre"
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
                          <option key={publisher._id} value={publisher._id}>
                            {publisher.name}
                          </option>
                        ))}
                    </select>
                  </div>
                </Col>
              </Row>
              <Row>
                <Col xl={3}>
                  <div className="form-group">
                    <label className={styles.formLabel}>Năm xuất bản</label>
                    <input
                      type="text"
                      name="year"
                      className={`form-control ${
                        formik.errors.year
                          ? "is-invalid"
                          : formik.values.year && "is-valid"
                      }`}
                      placeholder="Năm xuất bản"
                      value={formik.values.year}
                      onBlur={formik.handleBlur}
                      onChange={formik.handleChange}
                    />
                    {formik.errors.year && (
                      <Form.Control.Feedback
                        type="invalid"
                        className={styles.feedback}
                      >
                        {formik.errors.year}
                      </Form.Control.Feedback>
                    )}
                  </div>
                </Col>
                <Col xl={3}>
                  <div className="form-group">
                    <label className={styles.formLabel}>Số trang</label>
                    <input
                      type="text"
                      name="pages"
                      className={`form-control ${
                        formik.errors.pages
                          ? "is-invalid"
                          : formik.values.pages && "is-valid"
                      }`}
                      placeholder="Số trang"
                      value={formik.values.pages}
                      onBlur={formik.handleBlur}
                      onChange={formik.handleChange}
                    />
                    {formik.errors.pages && (
                      <Form.Control.Feedback
                        type="invalid"
                        className={styles.feedback}
                      >
                        {formik.errors.pages}
                      </Form.Control.Feedback>
                    )}
                  </div>
                </Col>
                <Col xl={3}>
                  <div className="form-group">
                    <label className={styles.formLabel}>Kích thước</label>
                    <input
                      type="text"
                      name="size"
                      className={`form-control ${
                        formik.errors.size
                          ? "is-invalid"
                          : formik.values.size && "is-valid"
                      }`}
                      placeholder="Kích thước"
                      value={formik.values.size}
                      onBlur={formik.handleBlur}
                      onChange={formik.handleChange}
                    />
                    {formik.errors.size && (
                      <Form.Control.Feedback
                        type="invalid"
                        className={styles.feedback}
                      >
                        {formik.errors.size}
                      </Form.Control.Feedback>
                    )}
                  </div>
                </Col>
              </Row>
              <Row>
                <Col xl={3}>
                  <div className="form-group">
                    <label className={styles.formLabel}>Giá bán</label>
                    <input
                      type="number"
                      min="0"
                      name="price"
                      className={`form-control ${
                        formik.errors.price
                          ? "is-invalid"
                          : formik.values.price && "is-valid"
                      }`}
                      placeholder="Giá bán"
                      value={formik.values.price}
                      onBlur={formik.handleBlur}
                      onChange={formik.handleChange}
                    />
                    {formik.errors.price && (
                      <Form.Control.Feedback
                        type="invalid"
                        className={styles.feedback}
                      >
                        {formik.errors.price}
                      </Form.Control.Feedback>
                    )}
                  </div>
                </Col>
                <Col xl={3}>
                  <div className="form-group">
                    <label className={styles.formLabel}>Giảm giá</label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      name="discount"
                      className={`form-control ${
                        formik.errors.discount
                          ? "is-invalid"
                          : formik.values.discount && "is-valid"
                      }`}
                      placeholder="Giảm giá"
                      value={formik.values.discount}
                      onBlur={formik.handleBlur}
                      onChange={formik.handleChange}
                    />
                    {formik.errors.discount && (
                      <Form.Control.Feedback
                        type="invalid"
                        className={styles.feedback}
                      >
                        {formik.errors.discount}
                      </Form.Control.Feedback>
                    )}
                  </div>
                </Col>
                <Col xl={3}>
                  {bookData.imageUrl && <PreviewImage src={bookData.imageUrl} />}
                </Col>
                <Col xl={12}>
                  <label className={styles.formLabel}>Mô tả</label>
                  <CKEditor
                      editor={ ClassicEditor }
                      data={formik.values.description}
                      onReady={ editor => {
                          // You can store the "editor" and use when it is needed.
                          console.log( 'Editor is ready to use!', editor );
                      } }
                      onChange={ ( event, editor ) => {
                          const data = editor.getData();
                          formik.setFieldValue("description", data);
                      } }
                      onBlur={ ( event, editor ) => {
                          console.log( 'Blur.', editor );
                      } }
                      onFocus={ ( event, editor ) => {
                          console.log( 'Focus.', editor );
                      } }
                  />
                </Col>
              </Row>
              <div>
                <button type="button" className={`bookstore-btn ${styles.updateImage}`}
                  onClick={() => setUpdateImage(!updateImage)}
                >Thay đổi hình ảnh</button>
              </div>
              {updateImage && (
                <Row>
                  <Col xl={3}>
                    <div className="form-group">
                      <label className={styles.formLabel}>Thay đổi hình ảnh</label>
                      <input
                        type="file"
                        name="image"
                        className={`form-control ${
                          formik.errors.image
                            ? "is-invalid"
                            : formik.values.image && "is-valid"
                        }`}
                        placeholder="Hình ảnh"
                        accept="image/png, image/gif, image/jpeg"
                        // value={formik.values.image[0]}
                        onChange={(e) => formik.setFieldValue('image', e.target.files[0])}
                      />
                    {formik.values.image && <PreviewImage file={formik.values.image} />}
                      {formik.errors.image && (
                        <Form.Control.Feedback
                          type="invalid"
                          className={styles.feedback}
                        >
                          {formik.errors.image}
                        </Form.Control.Feedback>
                      )}
                    </div>
                  </Col>
                </Row>
              )}

              <button
                type="submit"
                className={`bookstore-btn ${styles.submitBtn}`}
              >
                Lưu thay đổi
              </button>
            </form>
          </div>
        </div>
      </Col>
    </Row>
  );
}

export default UpdateBook;
