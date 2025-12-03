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
import { Bar, Pie, Line } from "react-chartjs-2";
import { Row, Col } from "react-bootstrap";
import bookApi from "../../../api/bookApi";
import orderApi from "../../../api/orderApi";
import analyticApi from "../../../api/analyticApi";
import date from "../../../helper/date"
import styles from "./AnalyticsPage.module.css";
import { useEffect, useState } from "react";
import DashboardCard from "../DashboardCard";
import Loading from "../../../components/Loading"

import { FaBook, FaChartBar, FaShoppingBag, FaFire } from "react-icons/fa"

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

// Add helper for weekday labels
const weekdayLabels = ["Chủ nhật", "Thứ 2", "Thứ 3", "Thứ 4", "Thứ 5", "Thứ 6", "Thứ 7"];
const monthLabels = [
  "Tháng 1", "Tháng 2", "Tháng 3", "Tháng 4", "Tháng 5", "Tháng 6",
  "Tháng 7", "Tháng 8", "Tháng 9", "Tháng 10", "Tháng 11", "Tháng 12"
];

const formatNumber = (value = 0) =>
  typeof value === "number"
    ? value.toLocaleString("vi-VN")
    : value || "0";

const formatMoneyShort = (value = 0) => {
  if (!value) return "0 ₫";
  const absValue = Math.abs(value);
  if (absValue >= 1_000_000_000) {
    return `${(value / 1_000_000_000).toFixed(1)} tỷ ₫`;
  }
  if (absValue >= 1_000_000) {
    return `${(value / 1_000_000).toFixed(1)} triệu ₫`;
  }
  return `${value.toLocaleString("vi-VN")} ₫`;
};

function AnalyticsPage() {

  const [revenueChartData, setRevenueChartData] = useState({});
  const [orderCountLifeTimeChartData, setOrderCountLifeTimeChartData] = useState({});
  const [bookBestSellerChartData, setBookBestSellerChartData] = useState({});
  const [revenueSummary, setRevenueSummary] = useState({
    total: 0,
    average: 0,
    peakLabel: "",
    peakValue: 0,
    direction: "neutral",
  });
  const [topBooks, setTopBooks] = useState([]);

  const [revenueTime, setRevenueTime] = useState({ value: 1, text: "Toàn thời gian" })

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
        let chartData = [];
        let labels = [];
        let dataPoints = [];
        switch (revenueTime.value) {
          case 1: {
            // Toàn thời gian: labels are months, always show 12 columns
            const { data } = await analyticApi.getRevenueLifeTime();
            chartData = data;
            labels = monthLabels;
            // Create a map for quick lookup - group by month from date
            const monthMap = {};
            chartData.forEach(item => {
              const itemDate = new Date(item.date);
              const month = itemDate.getMonth() + 1; // getMonth() returns 0-11, we need 1-12
              monthMap[month] = (monthMap[month] || 0) + (item.revenue || 0);
            });
            // Fill dataPoints for all 12 months
            dataPoints = Array.from({ length: 12 }, (_, i) => monthMap[i + 1] || 0);
            break;
          }
          case 2: {
            // Tuần này: labels are weekdays
            const now = new Date();
            const monday = date.getMonday(now);
            const { data } = await analyticApi.getRevenueWeek({
              start: monday,
              end: date.getSunday(now)
            });
            chartData = data;
            labels = weekdayLabels;
            // Map weekday revenue by date, fill missing days with 0
            const dayMap = {};
            chartData.forEach(item => {
              const itemDate = new Date(item.date);
              const dayOfWeek = itemDate.getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
              dayMap[dayOfWeek] = (dayMap[dayOfWeek] || 0) + (item.revenue || 0);
            });
            // Fill dataPoints for all 7 days (0 = Sunday, 1 = Monday, ..., 6 = Saturday)
            // But weekdayLabels is ["Chủ nhật", "Thứ 2", "Thứ 3", "Thứ 4", "Thứ 5", "Thứ 6", "Thứ 7"]
            // So we need to map: 0->0, 1->1, 2->2, 3->3, 4->4, 5->5, 6->6
            dataPoints = Array.from({ length: 7 }, (_, i) => dayMap[i] || 0);
            break;
          }
          case 3: {
            // Tháng trước: labels are weeks in the month
            const now = new Date();
            // Get first day of previous month
            const firstDayPrevMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
            firstDayPrevMonth.setHours(0, 0, 0, 0);
            // Get last day of previous month
            const lastDayPrevMonth = new Date(now.getFullYear(), now.getMonth(), 0);
            lastDayPrevMonth.setHours(23, 59, 59, 999);

            const { data } = await analyticApi.getRevenueWeek({
              start: firstDayPrevMonth,
              end: lastDayPrevMonth
            });

            // Group data by week
            const weekMap = {};
            const weekStartDates = [];

            // Calculate all week start dates (Mondays) in the previous month
            let currentDate = new Date(firstDayPrevMonth);
            // Find the first Monday of the month (or start from first day if it's Monday)
            const firstDayOfWeek = currentDate.getDay();
            const daysToMonday = firstDayOfWeek === 0 ? 6 : firstDayOfWeek - 1;
            if (daysToMonday > 0) {
              currentDate.setDate(currentDate.getDate() - daysToMonday);
            }

            // Collect all week start dates that fall within or overlap the previous month
            while (currentDate <= lastDayPrevMonth ||
              (currentDate.getMonth() === now.getMonth() - 1 && currentDate <= lastDayPrevMonth)) {
              const weekEnd = new Date(currentDate);
              weekEnd.setDate(weekEnd.getDate() + 6);
              weekEnd.setHours(23, 59, 59, 999);

              // Only include weeks that overlap with the previous month
              if (weekEnd >= firstDayPrevMonth && currentDate <= lastDayPrevMonth) {
                weekStartDates.push(new Date(currentDate));
              }
              currentDate.setDate(currentDate.getDate() + 7);
            }

            // Initialize week map
            weekStartDates.forEach((weekStart, index) => {
              weekMap[index] = 0;
            });

            // Group revenue data by week
            data.forEach(item => {
              const itemDate = new Date(item.date);
              // Find which week this date belongs to
              for (let i = 0; i < weekStartDates.length; i++) {
                const weekStart = weekStartDates[i];
                const weekEnd = new Date(weekStart);
                weekEnd.setDate(weekEnd.getDate() + 6);
                weekEnd.setHours(23, 59, 59, 999);

                if (itemDate >= weekStart && itemDate <= weekEnd) {
                  weekMap[i] = (weekMap[i] || 0) + (item.revenue || 0);
                  break;
                }
              }
            });

            // Create labels and data points
            labels = weekStartDates.map((_, index) => `Tuần ${index + 1}`);
            dataPoints = weekStartDates.map((_, index) => weekMap[index] || 0);
            break;
          }
          default: {
            const { data } = await analyticApi.getRevenueLifeTime();
            chartData = data;
            labels = monthLabels;
            // Create a map for quick lookup - group by month from date
            const monthMap = {};
            chartData.forEach(item => {
              const itemDate = new Date(item.date);
              const month = itemDate.getMonth() + 1; // getMonth() returns 0-11, we need 1-12
              monthMap[month] = (monthMap[month] || 0) + (item.revenue || 0);
            });
            dataPoints = Array.from({ length: 12 }, (_, i) => monthMap[i + 1] || 0);
            break;
          }
        }
        setRevenueChartData({
          labels: labels,
          datasets: [
            {
              label: "Doanh thu",
              data: dataPoints,
              borderColor: "rgb(255, 99, 132)",
              backgroundColor: "rgba(255, 99, 132)",
            },
          ],
        });

        const safePoints = dataPoints.map((value) =>
          typeof value === "number" && !Number.isNaN(value) ? value : 0
        );
        const totalRevenue = safePoints.reduce((sum, value) => sum + value, 0);
        const average =
          safePoints.length > 0 ? totalRevenue / safePoints.length : 0;
        const peakIndex =
          safePoints.length > 0
            ? safePoints.reduce(
              (peak, value, idx, arr) => (value > arr[peak] ? idx : peak),
              0
            )
            : 0;
        const peakValue = safePoints[peakIndex] || 0;
        const peakLabel = labels[peakIndex] || "";
        const lastValue =
          safePoints.length > 0 ? safePoints[safePoints.length - 1] : 0;
        const direction =
          safePoints.length === 0
            ? "neutral"
            : lastValue >= average
              ? "up"
              : "down";

        setRevenueSummary({
          total: totalRevenue,
          average,
          peakLabel,
          peakValue,
          direction,
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
          labels: chartData.map((item) => item?.id),
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
        setTopBooks(
          chartData
            .map((item) => ({
              name: item.product[0]?.name || "Chưa xác định",
              count: item.count || 0,
            }))
            .slice(0, 5)
        );
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

  const topBookTotal = topBooks.reduce((sum, item) => sum + (item.count || 0), 0);

  return (
    <div className={styles.wrapperDashboard}>
      {cardData && cardData.book ? (
        <Row className={`g-3 mb-4 ${styles.statsRow}`}>
          <Col xl={3} md={6} className="d-flex">
            <DashboardCard
              name="Tổng sản phẩm"
              quantity={formatNumber(cardData?.book || 0)}
              subtitle="Danh mục đang kinh doanh"
              accent="emerald"
              Icon={FaBook}
              trendValue={`${formatNumber(cardData?.book || 0)} SP`}
              trendLabel="Kho BookStore"

            />
          </Col>
          <Col xl={3} md={6} className="d-flex">
            <DashboardCard
              name="Đơn hàng toàn thời gian"
              quantity={formatNumber(cardData?.order || 0)}
              subtitle="Bao gồm các đơn đã xác minh"
              accent="sapphire"
              Icon={FaShoppingBag}
              trendLabel="Kênh trực tuyến"
            />
          </Col>
          <Col xl={3} md={6} className="d-flex">
            <DashboardCard
              name={`Doanh thu ${revenueTime?.text || ""}`}
              value={formatMoneyShort(revenueSummary.total)}
              subtitle="Tổng doanh thu ghi nhận"
              accent="rose"
              Icon={FaChartBar}
              trendValue={
                revenueSummary.peakValue
                  ? formatMoneyShort(revenueSummary.peakValue)
                  : ""
              }
              trendDirection={revenueSummary.direction}
              trendLabel={
                revenueSummary.peakLabel
                  ? `Đỉnh: ${revenueSummary.peakLabel}`
                  : "Chờ dữ liệu"
              }

            />
          </Col>
          <Col xl={3} md={6} className="d-flex">
            <DashboardCard
              name="Top sản phẩm bán chạy"
              quantity={formatNumber(topBookTotal)}
              subtitle="Tổng số đơn của Top 5"
              accent="amber"
              Icon={FaFire}
              trendValue={
                topBooks[0] ? `${formatNumber(topBooks[0].count)} đơn` : ""
              }
              trendLabel={
                topBooks[0] ? `Đứng đầu: ${topBooks[0].name}` : "Chờ dữ liệu"
              }

            />
          </Col>
        </Row>
      ) : (
        <Loading />
      )}
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
              <option value="3">Tháng trước</option>
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
            <div className={styles.chartHeader}>
              <h2>SÁCH BÁN CHẠY</h2>
              <span className={styles.badgeSoft}>Top 5</span>
            </div>
            {/* chartContent chỉ cần flex: 1, không cần height cứng */}
            <div className={styles.chartContent}>
              {bookBestSellerChartData && bookBestSellerChartData.datasets && (
                <Pie
                  options={{
                    responsive: true,
                    maintainAspectRatio: false, // giống Bar chart
                    plugins: {
                      legend: {
                        position: "top",
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
          </div>
        </Col>
        <Col xl={8}>

        </Col>
      </Row>
    </div>
  );
}

export default AnalyticsPage;
