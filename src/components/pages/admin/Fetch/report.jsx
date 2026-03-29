import { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  LineChart,
  Line
} from "recharts";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

import { getRequest } from "../../../../API/API";

const STATUS_COLORS = ["#0f766e", "#0284c7", "#dc2626", "#65a30d", "#d97706", "#7c3aed"];
const SECONDARY_COLORS = ["#ef4444", "#0ea5e9", "#8b5cf6", "#f59e0b", "#14b8a6", "#64748b"];

const formatDateParam = (date) => {
  if (!date) return "";

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

export default function Report() {
  const today = new Date();
  const defaultRangeStart = new Date();
  defaultRangeStart.setMonth(defaultRangeStart.getMonth() - 1);

  const [report, setReport] = useState(null);
  const [dateRange, setDateRange] = useState([defaultRangeStart, today]);
  const [trend, setTrend] = useState([]);

  const [startDate, endDate] = dateRange;

  useEffect(() => {
    if (startDate && endDate) {
      fetchReport();
      fetchTrend();
    }
  }, [startDate, endDate]);

  const fetchReport = async () => {
    const s = formatDateParam(startDate);
    const e = formatDateParam(endDate);

    try {
      const res = await getRequest(`/api/report?startDate=${s}&endDate=${e}`);
      if (res.success) {
        setReport(res);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const fetchTrend = async () => {
    const s = formatDateParam(startDate);
    const e = formatDateParam(endDate);

    try {
      const res = await getRequest(`/api/report/trend?startDate=${s}&endDate=${e}`);
      setTrend(Array.isArray(res) ? res : []);
    } catch (error) {
      console.log(error);
    }
  };

  if (!report) {
    return <p className="text-center mt-5">Loading analytics...</p>;
  }

  const summary = report.summary || {};

  const overviewCards = [
    { label: "Checked In", value: summary.checkIns, icon: "bi bi-box-arrow-in-right", tone: "#dbeafe" },
    { label: "Checked Out", value: summary.checkOuts, icon: "bi bi-box-arrow-right", tone: "#fee2e2" },
    { label: "Active Sheltered", value: summary.activeSheltered, icon: "bi bi-house-heart", tone: "#dcfce7" },
    { label: "Dead", value: summary.dead, icon: "bi bi-heartbreak", tone: "#fee2e2" },
    { label: "Injured", value: summary.injured, icon: "bi bi-bandaid", tone: "#fef3c7" },
    { label: "Missing", value: summary.missing, icon: "bi bi-search", tone: "#ede9fe" },
    { label: "Families Affected", value: summary.affectedFamilies, icon: "bi bi-people", tone: "#e0f2fe" },
    { label: "Individuals", value: summary.affectedIndividuals, icon: "bi bi-person", tone: "#f1f5f9" }
  ];

  const transactionMix = [
    { name: "Check In", value: Number(summary.checkIns || 0) },
    { name: "Check Out", value: Number(summary.checkOuts || 0) },
    { name: "Evacuated", value: Number(summary.evacuated || 0) }
  ];

  const familyVsIndividual = [
    { name: "Families", value: Number(summary.affectedFamilies || 0) },
    { name: "Individuals", value: Number(summary.affectedIndividuals || 0) }
  ];

  const trendData = trend.map((item) => ({
    ...item,
    label: new Date(item.date).toLocaleDateString()
  }));

  return (
    <div className="p-4" style={{ background: "#f8fafc", minHeight: "100vh" }}>
      <div className="d-flex flex-wrap justify-content-between align-items-center gap-3 mb-4">
        <div>
          <h4 className="fw-semibold mb-1">Disaster Analytics</h4>
          <p className="text-muted mb-0" style={{ fontSize: 13 }}>
            Track status changes, check-in activity, and affected households across the selected date range.
          </p>
        </div>

        <div className="d-flex flex-wrap gap-2 align-items-center">
          <span className="text-muted fw-medium" style={{ fontSize: 12 }}>
            Analytics date range filter
          </span>
          <DatePicker
            selectsRange
            startDate={startDate}
            endDate={endDate}
            onChange={(update) => setDateRange(update)}
            isClearable
            placeholderText="Select analytics range"
            className="form-control rounded-pill shadow-sm px-3"
          />
        </div>
      </div>

      <div className="row g-3 mb-4">
        {overviewCards.map((card) => (
          <div className="col-sm-6 col-xl-3" key={card.label}>
            <StatCard {...card} />
          </div>
        ))}
      </div>

      <div className="row g-4">
        <div className="col-lg-8">
          <Panel title="Transaction Trend">
            <ResponsiveContainer width="100%" height={320}>
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="label" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="checkIns" name="Check In" stroke="#0284c7" strokeWidth={3} />
                <Line type="monotone" dataKey="checkOuts" name="Check Out" stroke="#dc2626" strokeWidth={3} />
                <Line type="monotone" dataKey="injured" name="Injured" stroke="#f59e0b" strokeWidth={3} />
                <Line type="monotone" dataKey="dead" name="Dead" stroke="#7f1d1d" strokeWidth={3} />
              </LineChart>
            </ResponsiveContainer>
          </Panel>
        </div>

        <div className="col-lg-4">
          <Panel title="Primary Status Breakdown">
            <ResponsiveContainer width="100%" height={320}>
              <PieChart>
                <Pie
                  data={report.primaryStatusBreakdown}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={55}
                  outerRadius={95}
                >
                  {report.primaryStatusBreakdown.map((entry, index) => (
                    <Cell key={entry.name} fill={STATUS_COLORS[index % STATUS_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </Panel>
        </div>

        <div className="col-lg-6">
          <Panel title="Secondary Status Analytics">
            <ResponsiveContainer width="100%" height={320}>
              <BarChart data={report.secondaryStatusBreakdown}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="name" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                  {report.secondaryStatusBreakdown.map((entry, index) => (
                    <Cell key={entry.name} fill={SECONDARY_COLORS[index % SECONDARY_COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </Panel>
        </div>

        <div className="col-lg-6">
          <Panel title="Family vs Individual Impact">
            <div className="row g-3">
              <div className="col-md-6">
                <ResponsiveContainer width="100%" height={260}>
                  <PieChart>
                    <Pie data={familyVsIndividual} dataKey="value" nameKey="name" outerRadius={90}>
                      <Cell fill="#0ea5e9" />
                      <Cell fill="#94a3b8" />
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="col-md-6">
                <ResponsiveContainer width="100%" height={260}>
                  <BarChart data={transactionMix}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="name" />
                    <YAxis allowDecimals={false} />
                    <Tooltip />
                    <Bar dataKey="value" fill="#0f766e" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </Panel>
        </div>

        <div className="col-12">
          <Panel title="Supply Transactions">
            <ResponsiveContainer width="100%" height={320}>
              <BarChart data={report.supplyTransactions}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="category" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Legend />
                <Bar dataKey="in" name="Inbound" fill="#10b981" radius={[8, 8, 0, 0]} />
                <Bar dataKey="out" name="Outbound" fill="#ef4444" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Panel>
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, icon, tone }) {
  return (
    <div className="bg-white p-3 rounded-4 shadow-sm h-100">
      <div className="d-flex align-items-center gap-3">
        <div
          className="d-flex align-items-center justify-content-center"
          style={{
            width: 46,
            height: 46,
            borderRadius: 14,
            background: tone,
            fontSize: "1.2rem"
          }}
        >
          <i className={icon}></i>
        </div>
        <div>
          <div className="text-muted" style={{ fontSize: 12 }}>
            {label}
          </div>
          <div className="fw-bold fs-4">{Number(value || 0)}</div>
        </div>
      </div>
    </div>
  );
}

function Panel({ title, children }) {
  return (
    <div className="bg-white p-4 rounded-4 shadow-sm h-100">
      <h6 className="fw-semibold mb-3">{title}</h6>
      {children}
    </div>
  );
}
