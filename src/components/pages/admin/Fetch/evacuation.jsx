import { useState, useEffect } from "react"
import Cards from "../../../layout/cards"
import { getRequest } from "../../../../API/API"

function Evacuation() {

  const [centers, setCenters] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {

    const fetchCenters = async () => {
      try {

        const response = await getRequest("api/evacuations")
        setCenters(response || [])

      } catch (error) {
        console.error("Failed to fetch centers:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchCenters()

  }, [])

  return (
    <div className="container py-4">

      <div className="row mb-4">
        <div className="col">
          <h2 className="fw-bold text-dark">
            Evacuation Centers
          </h2>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status"></div>
          <p className="mt-2 text-muted">Loading evacuation centers...</p>
        </div>
      ) : (
        <Cards center={centers} />
      )}

    </div>
  )
}

export default Evacuation