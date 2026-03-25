import { useState } from "react";

function Inventory() {
  const [food, setFood] = useState(120);
  const [water, setWater] = useState(200);

  const [modal, setModal] = useState(null);
  const [selectedLog, setSelectedLog] = useState(null);

  const [medicines, setMedicines] = useState([
    { id: 1, name: "Paracetamol", purpose: "Fever", quantity: 50 },
    { id: 2, name: "Amoxicillin", purpose: "Antibiotic", quantity: 30 }
  ]);

  const [specialNeeds, setSpecialNeeds] = useState([
    { id: 1, name: "Baby Milk", quantity: 20 },
    { id: 2, name: "Diapers", quantity: 100 }
  ]);

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
      category: "Basic Needs",
      name: "Water",
      quantity: 30,
      date: "2026-03-21",
      destination: "Center A"
    }
  ]);

  const [formBasic, setFormBasic] = useState({ food: "", water: "" });

  const [formMedicine, setFormMedicine] = useState({
    name: "",
    purpose: "",
    quantity: ""
  });

  const [formSpecial, setFormSpecial] = useState({
    name: "",
    quantity: ""
  });

  return (
    <div className="container py-4">

      {/* HEADER */}
      <div className="row mb-4">
        <div className="col">
          <h2 className="fw-bold text-dark">Inventory Management</h2>
          <p className="text-muted mb-0">
            Monitor supplies and track inventory movement
          </p>
        </div>
      </div>

      {/* SUMMARY CARDS */}
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

      {/* TABLES */}
      <div className="card shadow-sm border-0 mb-4">
        <div className="card-body">
          <h5 className="fw-bold mb-3">💊 Medicines</h5>

          <table className="table table-hover">
            <thead className="table-light">
              <tr>
                <th>Name</th>
                <th>Purpose</th>
                <th>Quantity</th>
              </tr>
            </thead>
            <tbody>
              {medicines.map((m) => (
                <tr key={m.id}>
                  <td>{m.name}</td>
                  <td>{m.purpose}</td>
                  <td>{m.quantity}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="card shadow-sm border-0 mb-4">
        <div className="card-body">
          <h5 className="fw-bold mb-3">🆘 Special Needs</h5>

          <table className="table table-hover">
            <thead className="table-light">
              <tr>
                <th>Name</th>
                <th>Quantity</th>
              </tr>
            </thead>
            <tbody>
              {specialNeeds.map((s) => (
                <tr key={s.id}>
                  <td>{s.name}</td>
                  <td>{s.quantity}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* LOGS */}
      <div className="card shadow-sm border-0">
        <div className="card-body">
          <h5 className="fw-bold mb-3">📦 Inventory Logs</h5>

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
              {logs.map((log) => (
                <tr
                  key={log.id}
                  style={{ cursor: "pointer" }}
                  onClick={() => setSelectedLog(log)}
                >
                  <td>
                    <span
                      className={`badge ${
                        log.type === "IN" ? "bg-success" : "bg-danger"
                      }`}
                    >
                      {log.type}
                    </span>
                  </td>
                  <td>{log.category}</td>
                  <td>{log.name}</td>
                  <td>{log.quantity}</td>
                  <td>{log.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ACTION BUTTONS */}
      <div className="d-flex gap-2 mt-3">
        <button className="btn btn-primary" onClick={() => setModal("basic")}>
          + Basic Needs
        </button>
        <button className="btn btn-success" onClick={() => setModal("medicine")}>
          + Medicine
        </button>
        <button className="btn btn-warning" onClick={() => setModal("special")}>
          + Special Needs
        </button>
      </div>

      {/* ================= MODALS ================= */}

      {selectedLog && (
        <Modal onClose={() => setSelectedLog(null)} title="Log Details">
          <p><strong>Type:</strong> {selectedLog.type}</p>
          <p><strong>Category:</strong> {selectedLog.category}</p>
          <p><strong>Name:</strong> {selectedLog.name}</p>
          <p><strong>Quantity:</strong> {selectedLog.quantity}</p>
          <p><strong>Date:</strong> {selectedLog.date}</p>
        </Modal>
      )}

      {modal === "basic" && (
        <Modal onClose={() => setModal(null)} title="Add Basic Needs">
          <input
            className="form-control mb-2"
            type="number"
            placeholder="Food"
            value={formBasic.food}
            onChange={(e) =>
              setFormBasic({ ...formBasic, food: e.target.value })
            }
          />
          <input
            className="form-control mb-2"
            type="number"
            placeholder="Water"
            value={formBasic.water}
            onChange={(e) =>
              setFormBasic({ ...formBasic, water: e.target.value })
            }
          />

          <button
            className="btn btn-success w-100"
            onClick={() => {
              setFood(food + Number(formBasic.food || 0));
              setWater(water + Number(formBasic.water || 0));

              setModal(null);
              setFormBasic({ food: "", water: "" });
            }}
          >
            Add
          </button>
        </Modal>
      )}

      {modal === "medicine" && (
        <Modal onClose={() => setModal(null)} title="Add Medicine">
          <input
            className="form-control mb-2"
            placeholder="Name"
            value={formMedicine.name}
            onChange={(e) =>
              setFormMedicine({ ...formMedicine, name: e.target.value })
            }
          />
          <input
            className="form-control mb-2"
            placeholder="Purpose"
            value={formMedicine.purpose}
            onChange={(e) =>
              setFormMedicine({ ...formMedicine, purpose: e.target.value })
            }
          />
          <input
            className="form-control mb-2"
            type="number"
            placeholder="Quantity"
            value={formMedicine.quantity}
            onChange={(e) =>
              setFormMedicine({ ...formMedicine, quantity: e.target.value })
            }
          />

          <button
            className="btn btn-primary w-100"
            onClick={() => {
              setMedicines([
                ...medicines,
                { id: Date.now(), ...formMedicine }
              ]);

              setModal(null);
              setFormMedicine({ name: "", purpose: "", quantity: "" });
            }}
          >
            Add
          </button>
        </Modal>
      )}

      {modal === "special" && (
        <Modal onClose={() => setModal(null)} title="Add Special Needs">
          <input
            className="form-control mb-2"
            placeholder="Name"
            value={formSpecial.name}
            onChange={(e) =>
              setFormSpecial({ ...formSpecial, name: e.target.value })
            }
          />
          <input
            className="form-control mb-2"
            type="number"
            placeholder="Quantity"
            value={formSpecial.quantity}
            onChange={(e) =>
              setFormSpecial({ ...formSpecial, quantity: e.target.value })
            }
          />

          <button
            className="btn btn-warning w-100"
            onClick={() => {
              setSpecialNeeds([
                ...specialNeeds,
                { id: Date.now(), ...formSpecial }
              ]);

              setModal(null);
              setFormSpecial({ name: "", quantity: "" });
            }}
          >
            Add
          </button>
        </Modal>
      )}
    </div>
  );
}

/* ================= MODAL (CENTERED + BLUR) ================= */
function Modal({ title, children, onClose }) {
  return (
    <div
      className="modal-overlay"
      onClick={onClose}
    >
      <div
        className="modal-box"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <h5 className="fw-bold">{title}</h5>
          <button className="btn-close" onClick={onClose}></button>
        </div>

        <div className="modal-body">{children}</div>
      </div>

      {/* INLINE STYLES FOR BLUR MODAL */}
      <style>{`
        .modal-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0,0,0,0.35);
          backdrop-filter: blur(8px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 9999;
        }

        .modal-box {
          width: 420px;
          background: #fff;
          border-radius: 12px;
          box-shadow: 0 10px 30px rgba(0,0,0,0.2);
          overflow: hidden;
        }

        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 15px;
          border-bottom: 1px solid #eee;
        }

        .modal-body {
          padding: 15px;
        }
      `}</style>
    </div>
  );
}

export default Inventory;