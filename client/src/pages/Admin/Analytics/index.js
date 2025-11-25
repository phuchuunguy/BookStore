import {
  Chart as ChartJS,
  ArcElement,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";
import { Bar, Pie } from "react-chartjs-2";
import { Row, Col } from "react-bootstrap";
import bookApi from "../../../api/bookApi";
import orderApi from "../../../api/orderApi";
import analyticApi from "../../../api/analyticApi";
import date from "../../../helper/date"
import styles from "./AnalyticsPage.module.css";
import { useEffect, useState } from "react";
import DashboardCard from "../DashboardCard";
import Loading from "../../../components/Loading"

import { FaBook, FaChartBar, FaShoppingBag } from "react-icons/fa"

ChartJS.register(
  ArcElement,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

function AnalyticsPage() {

  const [revenueChartData, setRevenueChartData] = useState({});
  const [orderCountLifeTimeChartData, setOrderCountLifeTimeChartData] = useState({});
  const [bookBestSellerChartData, setBookBestSellerChartData] = useState({});

  const [revenueTime, setRevenueTime] = useState({value: 1, text: "Toàn thời gian"})

  const [cardData, setCardData] = useState({})


  useEffect(() => {
    const fetchCardData = async () => {
      try {
        const [resBook, resOrder, resRevenue] = await Promise.all([
          bookApi.getAll({}),
          orderApi.getAll({}),
          analyticApi.getTotalRevenue()
        ])
        setCardData(pre => {
          return {
            ...pre, 
            book: resBook?.count || 0,
            order: resOrder?.count || 0,
            revenue: resRevenue?.data[0]?.revenue || 0
          }
        })
      } catch (error) {
        console.log(error)
      }
    }
    fetchCardData()
  }, [])

  useEffect(() => {
    const fetchRevenueLifeTime = async () => {
      try {
        let chartData = []
        switch (revenueTime.value) {
          case 1: {
            const { data } = await analyticApi.getRevenueLifeTime();
            chartData = data;
            break;
          }

          case 2: {
            const now = new Date()
            const { data } = await analyticApi.getRevenueWeek({
              start: date.getMonday(now), 
              end: date.getSunday(now) 
            });
            chartData = data;
            break;
          }

          case 3: {
            const now = new Date()
            now.setDate(now.getDate() - 7)
            const { data } = await analyticApi.getRevenueWeek({
              start: date.getMonday(now), 
              end: date.getSunday(now) 
            });
            chartData = data;
            break;
          }
          
          default: {
            const { data } = await analyticApi.getRevenueLifeTime();
            chartData = data;
            break;
          }
        }
        setRevenueChartData({
          labels: chartData.map((item) => item._id),
          datasets: [
            {
              label: "Doanh thu",
              data: chartData.map((item) => item.revenue),
              borderColor: "rgb(255, 99, 132)",
              backgroundColor: "rgba(255, 99, 132)",
            },
          ],
        });
      } catch (error) {
        console.log(error);
      }
    };
    fetchRevenueLifeTime();

  }, [revenueTime])

  useEffect(() => {
    const fetchCountOrderLifeTime = async () => {
      try {
        const { data: chartData } = await analyticApi.getCountOrderLifeTime();
        setOrderCountLifeTimeChartData({
          labels: chartData.map((item) => item?._id),
          datasets: [
            {
              label: "Số lượng đơn hàng",
              data: chartData.map((item) => item?.total),
              borderColor: "rgb(75, 192, 192)",
              backgroundColor: "rgba(75, 192, 192)",
            },
          ],
        });
      } catch (error) {
        console.log(error);
      }
    };

    const fetchBookBestSeller = async () => {
      try {
        const { data: chartData } = await analyticApi.getBestSeller();
        console.log(chartData);
        setBookBestSellerChartData({
          labels: chartData.map((item) => item.product[0]?.name),
          datasets: [
            {
              label: "Sản phẩm bán chạy",
              data: chartData.map((item) => item.count),
              backgroundColor: ["#ff6384", "#e8c3b9", "#ffce56", "#8e5ea2"],
            },
          ],
        });
      } catch (error) {
        console.log(error);
      }
    };

    fetchCountOrderLifeTime();
    fetchBookBestSeller();
  }, []);

  const handleChangeRevenueTime = (e) => {
    const index = e.target.selectedIndex;
    setRevenueTime({
      value: parseInt(e.target.value),
      text: e.target[index].text,
    })
  }

  return (
    <div className={styles.wrapperDashboard}>
      {cardData && cardData.book ? 
        <Row className="mb-4"><Col xl={3}>
            <DashboardCard 
              name="Sản phẩm" 
              quantity={cardData && cardData.book} 
              bgColor="bg-success" 
              Icon={FaBook} />
        </Col>
        <Col xl={3}>
          <DashboardCard 
            name="Đơn hàng" 
            quantity={cardData && cardData.order} 
            bgColor="bg-info" 
            Icon={FaShoppingBag} />
        </Col>
        <Col xl={3}>
          <DashboardCard 
            name="Doanh thu (triệu)" 
            quantity={cardData && ((cardData.revenue / 1000000).toFixed(2))} 
            bgColor="bg-danger" 
            Icon={FaChartBar} />
        </Col> 
      </Row>: <Loading />}
      <Row>
        <Col xl={8}>
          <div className={styles.chart}>
            <h2>DOANH THU</h2>
            <select 
              className={`form-select ${styles.revenueSelectTime}`} 
              value={revenueTime && revenueTime.value}
              onChange={handleChangeRevenueTime}
            >
              <option value="1">Toàn thời gian</option>
              <option value="2">Tuần này</option>
              <option value="3">Tuần trước</option>
            </select>
          {revenueChartData && revenueChartData.datasets && (
            <Bar
              options={{
                responsive: true,
                plugins: {
                  legend: {
                    position: "top",
                  },
                  title: {
                    display: true,
                    text: `Doanh thu ${revenueTime && revenueTime.text}`,
                  },
                },
              }}
              data={revenueChartData}
            />
          )}
          </div>
        </Col>
        <Col xl={4}>
          <div className={styles.chart}>
            <h2>SÁCH BÁN CHẠY</h2>
            {bookBestSellerChartData && bookBestSellerChartData.datasets && (
              <Pie
                options={{
                  responsive: true,
                  plugins: {
                    legend: {
                      position: "top",
                      align: "start",
                    },
                    title: {
                      display: true,
                      text: "Sản phẩm bán chạy",
                    },
                  },
                }}
                data={bookBestSellerChartData}
              />
            )}
          </div>
        </Col>
        <Col xl={8}>
          <div className={styles.chart}>
            <h2>SỐ LƯỢNG ĐƠN HÀNG</h2>
            {orderCountLifeTimeChartData && orderCountLifeTimeChartData.datasets && (
              <Bar
                options={{
                  responsive: true,
                  plugins: {
                    legend: {
                      position: "top",
                    },
                    title: {
                      display: true,
                      text: "Đơn hàng toàn thời gian",
                    },
                  },
                }}
                data={orderCountLifeTimeChartData}
              />
            )}
          </div>
        </Col>
      </Row>
    </div>
  );
}

export default AnalyticsPage;
