import { useEffect, useState } from "react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from "recharts";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

import { getRequest } from "../../../../API/API";

export default function Report() {
  const [report, setReport] = useState(null);
  const [selectedDate, setSelectedDate] = useState(new Date());

  useEffect(() => {
    fetchReport(selectedDate);
  }, [selectedDate]);

  const fetchReport = async (date) => {
    const formattedDate = date.toISOString().split("T")[0];

    try{
    const res = await getRequest(`/api/report?date=${formattedDate}`);
    setReport(res);
    console.log(res);
    
    }
    catch(error){
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
    { name: "Missing", value: Number(report.missing)},
    { name: "Dead", value: Number(report.dead) },
  ];

  const vulnerableData = [
    { name: "Senior", value: Number(report.senior) },
    { name: "PWD", value: Number(report.pwd) },
    { name: "Pregnant", value: Number(report.pregnant) },
  ];

  const COLORS = ["#0d6efd", "#ffc107", "#dc3545"];

  return (
    <div className="container mt-4">

      {/* 📅 DATE FILTER */}
      <div className="d-flex justify-content-between mb-4">
        <DatePicker
          selected={selectedDate}
          onChange={(date) => setSelectedDate(date)}
          className="form-control"
        />
      </div>

      {/* 🔢 CARDS */}
      <div className="row g-3 mb-4">
        <Card title="Affected Families" value={report.affectedFamilies} />
        <Card title="Evacuated" value={report.evacuated} />
        <Card title="Missing" value={report.missing} />
      </div>

      <div className="row g-4">

        {/* 📊 BAR */}
        <div className="col-md-6">
          <div className="card p-3 shadow-sm">
            <h5>Relief Distribution</h5>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={distributionData}>
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="#0d6efd" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 🥧 CASUALTY */}
        <div className="col-md-6">
          <div className="card p-3 shadow-sm">
            <h5>Casualty Overview</h5>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie data={statusData} dataKey="value" label>
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

        {/* 🧑‍🦽 VULNERABLE GROUPS */}
        <div className="col-md-12">
          <div className="card p-3 shadow-sm">
            <h5>Vulnerable Groups</h5>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie data={vulnerableData} dataKey="value" label>
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

      </div>
    </div>
  );
}

function Card({ title, value }) {
  return (
    <div className="col-md-4">
      <div className="card text-center p-3 shadow-sm">
        <h6 className="text-muted">{title}</h6>
        <h3>{value}</h3>
      </div>
    </div>
  );
}