import { Link } from "react-router-dom"

function Cards({ center }) {
  return (
    <div className="row g-4">

      {center.map((element) => (

        <div className="col-md-4 col-lg-3" key={element.id}>

          <Link
            to={`evac-list/${element.id}`}
            className="text-decoration-none"
          >

            <div className="card border-0 shadow-sm h-100 hover-shadow">

              <div className="card-body text-center">

                <div className="mb-3">
                  <i className="bi bi-house-door fs-1 text-primary"></i>
                </div>

                <h5 className="card-title fw-semibold">
                  Evacuation Center
                </h5>

                <p className="text-muted mb-2">
                  {element.name}
                </p>

                <div className="fw-medium">
                  {element.current_occupancy} / {element.capacity}
                </div>

              </div>

            </div>

          </Link>

        </div>

      ))}

    </div>
  )
}

export default Cards