import { useEffect, useState } from "react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend, LineChart, Line
} from "recharts";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

import { getRequest } from "../../../../API/API";

export default function Report() {
  const [report, setReport] = useState(null);

  const [selectedDate, setSelectedDate] = useState(new Date());
  const [dateRange, setDateRange] = useState([null, null]);
  const [startDate, endDate] = dateRange;
const [trend, setTrend] = useState([]);

useEffect(() => {
  fetchReport(selectedDate);
}, [selectedDate]);

useEffect(() => {
  if (startDate && endDate) {
    fetchTrend();
  }
}, [startDate, endDate]);

// 📊 SINGLE DAY REPORT
const fetchReport = async (date) => {
  const formattedDate = date.toISOString().split("T")[0];

  try {
    const res = await getRequest(`/api/report?date=${formattedDate}`);
    setReport(res);
  } catch (error) {
    console.log(error);
  }
};

// 📈 TREND (DATE RANGE)
const fetchTrend = async () => {
  const s = startDate.toISOString().split("T")[0];
  const e = endDate.toISOString().split("T")[0];

  try {
    const res = await getRequest(
      `/api/report/trend?startDate=${s}&endDate=${e}`
    );
    setTrend(res);
  } catch (error) {
    console.log(error);
  }
};
  if (!report) return <p className="text-center mt-5">Loading...</p>;

  const distributionData = [
    { name: "Food", value: report.foodDistributed },
    { name: "Special", value: report.goodsDistributed },
    { name: "Medicine", value: report.medicne },
    { name: "Evacuated", value: report.evacuated },
  ];

  const statusData = [
    { name: "Injured", value: Number(report.injured) },
    { name: "Missing", value: Number(report.missing) },
    { name: "Dead", value: Number(report.dead) },
  ];

  const vulnerableData = [
    { name: "Senior", value: Number(report.senior) },
    { name: "PWD", value: Number(report.pwd) },
    { name: "Pregnant", value: Number(report.pregnant) },
  ];

  const COLORS = ["#3b82f6", "#f59e0b", "#ef4444"];

  return (
    <div className="p-4" style={{ background: "#f8fafc", minHeight: "100vh" }}>

      {/* HEADER */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div className="d-flex flex-wrap justify-content-between align-items-center mb-4 gap-3">

  {/* LEFT */}
  <div>
    <h4 className="fw-semibold mb-1">Analytics</h4>
    <p className="text-muted mb-0" style={{ fontSize: 13 }}>
      Disaster report insights
    </p>
  </div>

  {/* RIGHT CONTROLS */}
  <div className="d-flex gap-2 align-items-center">

    {/* 📅 SINGLE DATE */}
    <DatePicker
      selected={selectedDate}
      onChange={(date) => setSelectedDate(date)}
      className="form-control rounded-pill shadow-sm px-3"
      style={{ width: 180 }}
    />

    {/* 📅 RANGE */}
    <DatePicker
      selectsRange
      startDate={startDate}
      endDate={endDate}
      onChange={(update) => setDateRange(update)}
      isClearable
      placeholderText="Range"
      className="form-control rounded-pill shadow-sm px-3"
      style={{ width: 220 }}
    />

  </div>
</div>
      </div>

      {/* 🔢 STATS */}
      <div className="row g-3 mb-4">
        <StatCard icon={<i class="bi bi-people"></i>} label="Families" value={report.affectedFamilies} />
        <StatCard icon={<i class="bi bi-person"></i>} label="Evacuated" value={report.evacuated} />
        <StatCard icon={<i class="bi bi-exclamation-circle"></i>} label="Missing" value={report.missing} />
        <StatCard icon={<i class="bi bi-exclamation-circle"></i>} label="Dead" value={report.dead} />
        <StatCard icon={<i class="bi bi-exclamation-circle"></i>} label="Injured" value={report.injured} />
      </div>

      <div className="row g-4">

        {/* 📊 BAR CHART */}
        <div className="col-md-6">
          <div className="p-3 rounded-4 shadow-sm bg-white">
            <h6 className="fw-semibold mb-3">Relief Distribution</h6>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={distributionData}>
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 🥧 CASUALTY */}
        <div className="col-md-6">
          <div className="p-3 rounded-4 shadow-sm bg-white">
            <h6 className="fw-semibold mb-3">Casualties</h6>
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie data={statusData} dataKey="value" innerRadius={50} outerRadius={90}>
                  {statusData.map((_, i) => (
                    <Cell key={i} fill={COLORS[i]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 🧑‍🦽 VULNERABLE */}
        <div className="col-md-12">
          <div className="p-3 rounded-4 shadow-sm bg-white">
            <h6 className="fw-semibold mb-3">Vulnerable Groups</h6>
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie data={vulnerableData} dataKey="value" innerRadius={50} outerRadius={90}>
                  {vulnerableData.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>


        <div className="col-md-12">
          <div className="p-3 rounded-4 shadow-sm bg-white">
            <h6 className="fw-semibold mb-3">Trend (Evacuation)</h6>

            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={trend}>
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Line 
                  type="monotone" 
                  dataKey="evacuated" 
                  stroke="#3b82f6"
                  strokeWidth={3}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>
    </div>
  );
}

function StatCard({ icon, label, value }) {
  return (
    <div className="col-md-4">
      <div className="p-3 rounded-4 shadow-sm bg-white d-flex align-items-center gap-3">
        <div
          className="d-flex align-items-center justify-content-center"
          style={{
            width: 45,
            height: 45,
            borderRadius: "12px",
            background: "#f1f5f9",
            fontSize: "1.5rem"
          }}
        >
          {icon}
        </div>
        <div>
          <div className="text-muted" style={{ fontSize: 12 }}>
            {label}
          </div>
          <div className="fw-bold fs-5">{value}</div>
        </div>
      </div>
    </div>
  );
}