"use client"

import { Line, Bar, Doughnut } from "react-chartjs-2"
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js"

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, ArcElement, Title, Tooltip, Legend)

const ProgressChart = ({ type, data, options, title }) => {
  const defaultOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top",
      },
      title: {
        display: !!title,
        text: title,
      },
    },
    ...options,
  }

  const renderChart = () => {
    switch (type) {
      case "line":
        return <Line data={data} options={defaultOptions} />
      case "bar":
        return <Bar data={data} options={defaultOptions} />
      case "doughnut":
        return <Doughnut data={data} options={defaultOptions} />
      default:
        return <Line data={data} options={defaultOptions} />
    }
  }

  return (
    <div className="progress-chart" style={{ height: "100%", minHeight: "300px" }}>
      {renderChart()}
    </div>
  )
}

export default ProgressChart
