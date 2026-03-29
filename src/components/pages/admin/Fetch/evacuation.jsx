import { useState, useEffect } from "react"
import Cards from "../../../layout/cards"
import { getRequest, putRequest } from "../../../../API/API"
import { useAuth } from "../../../../authentication/AuthContext"

function Evacuation() {
  const { user } = useAuth()

  const [centers, setCenters] = useState([])
  const [loading, setLoading] = useState(true)
  const [updatingCenterId, setUpdatingCenterId] = useState(null)

  const fetchCenters = async () => {
    try {
      const response = await getRequest("api/evacuations")
      const allCenters = response || []
      setCenters(allCenters)
    } catch (error) {
      console.error("Failed to fetch centers:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCenters()
  }, [])

  const visibleCenters = centers.filter((center) => {
    if (user?.role === 'barangay_official') {
      return Number(center.id) === Number(user?.assigned_center_id)
    }

    return true
  })

  const handleStatusChange = async (centerId, status) => {
    const currentCenter = centers.find((center) => Number(center.id) === Number(centerId))
    if (!currentCenter || currentCenter.status === status) {
      return
    }

    try {
      setUpdatingCenterId(centerId)
      await putRequest(`/auth/evacuation-centers/${centerId}/status`, { status })
      setCenters((current) =>
        current.map((center) =>
          Number(center.id) === Number(centerId)
            ? { ...center, status }
            : center
        )
      )
    } catch (error) {
      console.error("Failed to update center status:", error)
    } finally {
      setUpdatingCenterId(null)
    }
  }

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
        <Cards
          center={visibleCenters}
          canManageStatus={user?.role === 'drrmo'}
          onStatusChange={handleStatusChange}
          updatingCenterId={updatingCenterId}
        />
      )}

    </div>
  )
}

export default Evacuation
