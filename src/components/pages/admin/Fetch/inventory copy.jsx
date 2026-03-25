import { useState } from "react"

function Inventory() {

  const [food, setFood] = useState(120)
  const [water, setWater] = useState(200)

  const [modal, setModal] = useState(null);

  const [medicines] = useState([
    { id: 1, name: "Paracetamol", purpose: "Fever", quantity: 50 },
    { id: 2, name: "Amoxicillin", purpose: "Antibiotic", quantity: 30 }
  ])

  const [specialNeeds] = useState([
    { id: 1, name: "Baby Milk", quantity: 20 },
    { id: 2, name: "Diapers", quantity: 100 }
  ])

  const [logs, setLogs] = useState([
    {
      id: 1,
      type: "IN",
      category: "Medicine",
      name: "Paracetamol",
      quantity: 50,
      date: "2026-03-20",
      destination: ""
    },
    {
      id: 2,
      type: "OUT",
      category: "Basic Need",
      name: "Water",
      quantity: 30,
      date: "2026-03-21",
      destination: "Center A"
    }
  ])

  const [selectedLog, setSelectedLog] = useState(null)

  return (
    <div className="container py-4">

      {/* Header */}
      <div className="row mb-4">
        <div className="col">
          <h2 className="fw-bold text-dark">
            Inventory Management
          </h2>
          <p className="text-muted mb-0">
            Monitor supplies and track inventory movement
          </p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="row mb-4 g-3">
        <div className="col-md-3">
          <div className="card shadow-sm border-0 text-center p-3">
            <h6 className="text-muted">🍚 Food</h6>
            <h4 className="fw-bold text-primary">{food}</h4>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card shadow-sm border-0 text-center p-3">
            <h6 className="text-muted">💧 Water</h6>
            <h4 className="fw-bold text-primary">{water}</h4>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card shadow-sm border-0 text-center p-3">
            <h6 className="text-muted">💊 Medicines</h6>
            <h4 className="fw-bold text-success">{medicines.length}</h4>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card shadow-sm border-0 text-center p-3">
            <h6 className="text-muted">🆘 Special Needs</h6>
            <h4 className="fw-bold text-warning">{specialNeeds.length}</h4>
          </div>
        </div>
      </div>

      {/* Medicines Table */}
      <div className="card shadow-sm border-0 mb-4">
        <div className="card-body">
          <h5 className="fw-bold mb-3">💊 Medicines</h5>
          <div className="table-responsive">
            <table className="table table-hover">
              <thead className="table-light">
                <tr>
                  <th>Name</th>
                  <th>Purpose</th>
                  <th>Quantity</th>
                </tr>
              </thead>
              <tbody>
                {medicines.map(med => (
                  <tr key={med.id}>
                    <td className="fw-medium">{med.name}</td>
                    <td>{med.purpose}</td>
                    <td>{med.quantity}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Special Needs Table */}
      <div className="card shadow-sm border-0 mb-4">
        <div className="card-body">
          <h5 className="fw-bold mb-3">🆘 Special Needs</h5>
          <div className="table-responsive">
            <table className="table table-hover">
              <thead className="table-light">
                <tr>
                  <th>Name</th>
                  <th>Quantity</th>
                </tr>
              </thead>
              <tbody>
                {specialNeeds.map(item => (
                  <tr key={item.id}>
                    <td className="fw-medium">{item.name}</td>
                    <td>{item.quantity}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Logs */}
      <div className="card shadow-sm border-0">
        <div className="card-body">
          <h5 className="fw-bold mb-3">📦 Inventory Logs</h5>

          <div className="table-responsive">
            <table className="table table-hover align-middle">
              <thead className="table-light">
                <tr>
                  <th>Status</th>
                  <th>Type</th>
                  <th>Name</th>
                  <th>Quantity</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {logs.map(log => (
                  <tr key={log.id}
                    style={{ cursor: "pointer" }}
                    onClick={() => setSelectedLog(log)}
                  >
                    <td>
                      <span className={`badge ${
                        log.type === "IN"
                          ? "bg-success"
                          : "bg-danger"
                      }`}>
                        {log.type}
                      </span>
                    </td>
                    <td>{log.category}</td>
                    <td className="fw-medium">{log.name}</td>
                    <td>{log.quantity}</td>
                    <td>{log.date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="d-flex gap-2 mt-3">
        <button className="btn btn-primary">+ Basic Needs</button>
        <button className="btn btn-success">+ Medicine</button>
        <button className="btn btn-warning">+ Special Needs</button>
      </div>

      {/* Modal */}
      {selectedLog && (
        <div className="modal fade show d-block">
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Log Details</h5>
                <button
                  className="btn-close"
                  onClick={() => setSelectedLog(null)}
                ></button>
              </div>
              <div className="modal-body">
                <p><strong>Type:</strong> {selectedLog.type}</p>
                <p><strong>Category:</strong> {selectedLog.category}</p>
                <p><strong>Name:</strong> {selectedLog.name}</p>
                <p><strong>Quantity:</strong> {selectedLog.quantity}</p>
                <p><strong>Date:</strong> {selectedLog.date}</p>
                {selectedLog.type === "OUT" && (
                  <p><strong>Destination:</strong> {selectedLog.destination}</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}

export default Inventory
