import { Link } from "react-router-dom"

function Cards({ center, canManageStatus = false, onStatusChange, updatingCenterId = null }) {
  return (
    <div className="row g-4">

      {center.map((element) => (

        <div className="col-md-4 col-lg-3" key={element.id}>

          <div className="card border-0 shadow-sm h-100 hover-shadow">
            <Link
              to={`evac-list/${element.id}`}
              className="text-decoration-none"
            >
              <div className="card-body text-center">

                <div className="mb-3">
                  <i className="bi bi-house-door fs-1 text-primary"></i>
                </div>

                <h5 className="card-title fw-semibold">
                  {element.name}
                </h5>

                <p className={ element.status === 'open' ? "text-muted mb-2 text-success" : "text-muted mb-2 text-danger"}>
                  {element.status}
                </p>

                <div className="fw-medium">
                  {element.current_occupancy} / {element.capacity}
                </div>

              </div>
            </Link>

            {canManageStatus ? (
              <div className="border-top px-3 py-3">
                <label className="form-label text-muted mb-2" style={{ fontSize: 12 }}>
                  Center status
                </label>
                <select
                  className="form-select form-select-sm rounded-3"
                  value={element.status || "closed"}
                  disabled={updatingCenterId === element.id}
                  onChange={(event) => onStatusChange?.(element.id, event.target.value)}
                >
                  <option value="open">Open</option>
                  <option value="closed">Closed</option>
                </select>
              </div>
            ) : null}
          </div>

        </div>

      ))}

    </div>
  )
}

export default Cards
