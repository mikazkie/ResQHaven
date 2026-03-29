import { useEffect, useState } from "react";
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from "recharts";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

import { getRequest, postRequest, putRequest } from "../../../../API/API";

export default function Inventory() {
  const today = new Date();
  const defaultRangeStart = new Date();
  defaultRangeStart.setMonth(defaultRangeStart.getMonth() - 1);

  const [inventory, setInventory] = useState([]);
  const [logs, setLogs] = useState([]);
  const [modal, setModal] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);
  const [dateRange, setDateRange] = useState([defaultRangeStart, today]);
  const [logTypeFilter, setLogTypeFilter] = useState("all");
  const [categoryFilters, setCategoryFilters] = useState([]);

  const [formBasic, setFormBasic] = useState({
    type: "", name: "", quantity: ""
  });

  const [startDate, endDate] = dateRange;

  useEffect(() => {
    if (startDate && endDate) {
      fetchInventory();
    }
  }, [startDate, endDate]);

  const fetchInventory = async () => {
    try {
      const s = startDate.toISOString().split("T")[0];
      const e = endDate.toISOString().split("T")[0];
      const res = await getRequest(`/api/inventory?startDate=${s}&endDate=${e}`);
      if (res.success) {
        setInventory(res.inventory);
        setLogs(res.logs);
      }
    } catch (err) {
      console.log(err);
    }
  };

  // 📊 COMPUTED
  const food = inventory.filter(i => i.category === "food")
    .reduce((sum, i) => sum + i.quantity, 0);

  const water = inventory.filter(i => i.category === "water")
    .reduce((sum, i) => sum + i.quantity, 0);

  const medicine = inventory.filter(i => i.category === "medicine")
    .reduce((sum, i) => sum + i.quantity, 0);

  const special = inventory.filter(i => i.category === "special")
    .reduce((sum, i) => sum + i.quantity, 0);

  const total = food + water + medicine + special;

  const filteredLogs = logs.filter((log) => {
    const matchesType = logTypeFilter === "all" ? true : log.type === logTypeFilter;
    const matchesCategory =
      categoryFilters.length === 0 ? true : categoryFilters.includes(log.category);

    return matchesType && matchesCategory;
  });

  const trendData = (() => {
  let balance = 0;

  const sortedLogs = [...filteredLogs].sort(
    (a, b) => new Date(a.created_at) - new Date(b.created_at)
  );

  return sortedLogs.map(log => {
    if (log.type === "in") {
      balance += log.quantity;
    } else {
      balance -= log.quantity;
    }

    return {
      date: new Date(log.created_at).toLocaleDateString(),
      value: balance
    };
  });
})();

  const chartData = [
    { name: "Food", value: food },
    { name: "Water", value: water },
    { name: "Medicine", value: medicine },
    { name: "Special", value: special }
  ];

  const COLORS = ["#3b82f6", "#06b6d4", "#10b981", "#f59e0b"];

  const handleSubmitBasic = async () => {
    try {
      const payload = {
        type: formBasic.type,
        name: formBasic.name,
        quantity: Number(formBasic.quantity)
      };

      const res = await postRequest("auth/inventory/add", payload);

      if (res.success) {
        await fetchInventory();
        setFormBasic({ type: "", name: "", quantity: "" });
        setModal(null);
      }
    } catch (err) {
      alert("Failed to add");
    }
  };

  const handleEdit = async () => {
    try {
      const payload = {
        name: selectedItem.name,
        quantity: Number(selectedItem.quantity),
        category: selectedItem.category
      };

      const res = await putRequest(
        `auth/inventory/update/${selectedItem.id}`,
        payload
      );

      if (res.success) {
        await fetchInventory();
        setSelectedItem(null);
      }
    } catch (err) {
      console.log(err);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this item?")) return;

    try {
      const res = await postRequest(`auth/inventory/delete/${id}`);

      if (res.success) {
        await fetchInventory();
      }
    } catch (err) {
      console.log(err);
    }
  };

  

  return (
    <div style={{ background: "#f8fafc", padding: 20 }}>

      {/* HEADER */}
      <div className="mb-4 d-flex flex-wrap justify-content-between align-items-start gap-3">
        <div>
          <h3 className="fw-bold mb-1">Inventory Dashboard</h3>
          <p className="text-muted mb-0" style={{ fontSize: 13 }}>
            Monitor and manage relief supplies
          </p>
        </div>

        <div className="d-flex flex-wrap gap-2 align-items-center">
          <span className="text-muted fw-medium" style={{ fontSize: 12 }}>
            Inventory activity date range filter
          </span>
          <DatePicker
            selectsRange
            startDate={startDate}
            endDate={endDate}
            onChange={(update) => setDateRange(update)}
            isClearable={false}
            placeholderText="Select inventory range"
            className="form-control rounded-pill shadow-sm px-3"
          />
        </div>
      </div>

      {/* STATS */}
      <div className="row g-3 mb-4">
        <StatCard title="Food" value={food} />
        <StatCard title="Water" value={water} />
        <StatCard title="Medicine" value={medicine} />
        <StatCard title="Special" value={special} />
      </div>

      {/* CHARTS */}
      <div className="row g-4 mb-4">

        {/*  TREND */}
        <div className="col-md-8">
          <div className="bg-white p-4 rounded-4 shadow-sm">
            <h6 className="fw-semibold mb-3">
              Inventory Trend
              {" "}
              {logTypeFilter === "all" ? "(IN vs OUT)" : `(${logTypeFilter.toUpperCase()} only)`}
              {categoryFilters.length > 0
                ? ` - ${categoryFilters
                    .map((category) =>
                      category === "special"
                        ? "Special Food"
                        : category.charAt(0).toUpperCase() + category.slice(1)
                    )
                    .join(", ")}`
                : ""}
            </h6>

            <ResponsiveContainer width="100%" height={250}>
  <LineChart data={trendData}>
    <XAxis dataKey="date" />
    <YAxis />
    <Tooltip />


    <Line
  type="monotone"
  dataKey="value"
  stroke="#3b82f6"
  strokeWidth={3}
  dot={false}
  activeDot={{ r: 6 }}
/>
  </LineChart>
</ResponsiveContainer>
          </div>
        </div>

        {/* PIE */}
        <div className="col-md-4">
          <div className="bg-white p-4 rounded-4 shadow-sm text-center">
            <h6 className="fw-semibold mb-2">Inventory Overview</h6>

            <ResponsiveContainer width="100%" height={230}>
              <PieChart>
                <Pie data={chartData} dataKey="value" innerRadius={50}>
                  {chartData.map((_, i) => (
                    <Cell key={i} fill={COLORS[i]} />
                  ))}
                </Pie>
                <Legend />
              </PieChart>
            </ResponsiveContainer>

            <div className="mt-2 text-muted" style={{ fontSize: 12 }}>
              Total Items: <strong>{total}</strong>
            </div>
          </div>
        </div>

      </div>

      {/* TABLE */}
      <div className="bg-white p-4 rounded-4 shadow-sm mb-4">
        <h6 className="fw-semibold mb-3">Inventory Items</h6>

        <table className="table align-middle">
          <thead>
            <tr className="text-muted">
              <th>Name</th>
              <th>Category</th>
              <th>Qty</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {inventory.map(i => (
              <tr key={i.id}>
                <td>{i.name}</td>
                <td>{i.category}</td>
                <td>{i.quantity}</td>
                <td className="text-end">
                  <button
                    className="btn btn-sm btn-outline-primary me-2"
                    onClick={() => setSelectedItem(i)}
                  >
                    Edit
                  </button>
                  <button
                    className="btn btn-sm btn-outline-danger"
                    onClick={() => handleDelete(i.id)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* 📜 LOGS */}
      <div className="bg-white p-4 rounded-4 shadow-sm mb-4">
        <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-3">
          <h6 className="fw-semibold mb-0">Recent Activity</h6>
          <div className="d-flex flex-wrap gap-2 justify-content-end">
            <button
              type="button"
              className={`btn btn-sm rounded-pill px-3 ${logTypeFilter === "all" ? "btn-dark" : "btn-outline-secondary"}`}
              onClick={() => setLogTypeFilter("all")}
            >
              All
            </button>
            <button
              type="button"
              className={`btn btn-sm rounded-pill px-3 ${logTypeFilter === "in" ? "btn-success" : "btn-outline-success"}`}
              onClick={() => setLogTypeFilter("in")}
            >
              In
            </button>
            <button
              type="button"
              className={`btn btn-sm rounded-pill px-3 ${logTypeFilter === "out" ? "btn-danger" : "btn-outline-danger"}`}
              onClick={() => setLogTypeFilter("out")}
            >
              Out
            </button>
            <button
              type="button"
              className={`btn btn-sm rounded-pill px-3 ${categoryFilters.length === 0 ? "btn-dark" : "btn-outline-secondary"}`}
              onClick={() => setCategoryFilters([])}
            >
              All Categories
            </button>
            <button
              type="button"
              className={`btn btn-sm rounded-pill px-3 ${categoryFilters.includes("food") ? "btn-primary" : "btn-outline-primary"}`}
              onClick={() =>
                setCategoryFilters((prev) =>
                  prev.includes("food")
                    ? prev.filter((item) => item !== "food")
                    : [...prev, "food"]
                )
              }
            >
              Food
            </button>
            <button
              type="button"
              className={`btn btn-sm rounded-pill px-3 ${categoryFilters.includes("water") ? "btn-info text-white" : "btn-outline-info"}`}
              onClick={() =>
                setCategoryFilters((prev) =>
                  prev.includes("water")
                    ? prev.filter((item) => item !== "water")
                    : [...prev, "water"]
                )
              }
            >
              Water
            </button>
            <button
              type="button"
              className={`btn btn-sm rounded-pill px-3 ${categoryFilters.includes("medicine") ? "btn-success" : "btn-outline-success"}`}
              onClick={() =>
                setCategoryFilters((prev) =>
                  prev.includes("medicine")
                    ? prev.filter((item) => item !== "medicine")
                    : [...prev, "medicine"]
                )
              }
            >
              Medicine
            </button>
            <button
              type="button"
              className={`btn btn-sm rounded-pill px-3 ${categoryFilters.includes("special") ? "btn-warning text-dark" : "btn-outline-warning"}`}
              onClick={() =>
                setCategoryFilters((prev) =>
                  prev.includes("special")
                    ? prev.filter((item) => item !== "special")
                    : [...prev, "special"]
                )
              }
            >
              Special Food
            </button>
          </div>
        </div>
        <div style={{ maxHeight: "360px", overflowY: "auto", paddingRight: 4 }}>
          {filteredLogs.length > 0 ? filteredLogs.map(l => (
            <div key={l.id}
              className="d-flex justify-content-between border-bottom py-2">

              <div>
                <span className="fw-medium">{l.name}</span>
                <div className="text-muted" style={{ fontSize: 12 }}>
                  {l.category}
                </div>
              </div>

              <div className="text-end">
                <div className={l.type === "in" ? "text-success fw-bold" : "text-danger fw-bold"}>
                  {l.type === "in" ? "+" : "-"}{l.quantity}
                </div>
                <div style={{ fontSize: 12 }}>
                  {new Date(l.created_at).toLocaleDateString()}
                </div>
              </div>

            </div>
          )) : (
            <div className="text-muted text-center py-4">
              No matching activity found for the selected filters and date range.
            </div>
          )}
        </div>
      </div>

      {/* ADD BUTTON */}
      <button
        className="btn btn-primary rounded-pill px-4"
        onClick={() => setModal("basic")}
      >
        + Add Item
      </button>

      {/* ADD MODAL */}
      {modal === "basic" && (
        <Modal title="Add Item" onClose={() => setModal(null)}>
          <select className="form-control mb-2"
            value={formBasic.type}
            onChange={(e) =>
              setFormBasic({ ...formBasic, type: e.target.value })
            }>
            <option value="">Category</option>
            <option value="food">Food</option>
            <option value="water">Water</option>
            <option value="medicine">Medicine</option>
            <option value="special">Special</option>
          </select>

          <input className="form-control mb-2"
            placeholder="Item Name"
            value={formBasic.name}
            onChange={(e) =>
              setFormBasic({ ...formBasic, name: e.target.value })
            }
          />

          <input className="form-control mb-3"
            type="number"
            placeholder="Quantity"
            value={formBasic.quantity}
            onChange={(e) =>
              setFormBasic({ ...formBasic, quantity: e.target.value })
            }
          />

          <button className="btn btn-primary w-100"
            onClick={handleSubmitBasic}>
            Add Item
          </button>
        </Modal>
      )}

      {/* EDIT MODAL */}
      {selectedItem && (
        <Modal title="Edit Item" onClose={() => setSelectedItem(null)}>
          <select className="form-control mb-2"
            value={selectedItem.category}
            onChange={(e) =>
              setSelectedItem({ ...selectedItem, category: e.target.value })
            }>
            <option value="food">Food</option>
            <option value="water">Water</option>
            <option value="medicine">Medicine</option>
            <option value="special">Special</option>
          </select>

          <input className="form-control mb-2"
            value={selectedItem.name}
            onChange={(e) =>
              setSelectedItem({ ...selectedItem, name: e.target.value })
            }
          />

          <input className="form-control mb-3"
            type="number"
            value={selectedItem.quantity}
            onChange={(e) =>
              setSelectedItem({ ...selectedItem, quantity: e.target.value })
            }
          />

          <button className="btn btn-success w-100"
            onClick={handleEdit}>
            Save Changes
          </button>
        </Modal>
      )}
    </div>
  );
}

/* COMPONENTS */

function StatCard({ title, value }) {
  return (
    <div className="col-md-3">
      <div className="bg-white p-3 rounded-4 shadow-sm">
        <div className="text-muted" style={{ fontSize: 12 }}>{title}</div>
        <div className="fw-bold fs-4">{value}</div>
      </div>
    </div>
  );
}

function Modal({ title, children, onClose }) {
  return (
    <div style={{
      position: "fixed",
      inset: 0,
      background: "rgba(0,0,0,0.4)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center"
    }}>
      <div className="bg-white p-4 rounded-4" style={{ width: 400 }}>
        <div className="d-flex justify-content-between mb-3">
          <strong>{title}</strong>
          <button onClick={onClose}>✕</button>
        </div>
        {children}
      </div>
    </div>
  );
}
