import { useState, useEffect } from "react"
import { useParams, useNavigate, Link } from "react-router"
import { getRequest, postRequest } from "../../../../API/API"
import NeedsPanel from "../../../../components/graph/NeedsPanel"
import {
  SecondaryStatusChart,
  PrimaryStatusChart
} from "../../../../components/graph/StatusBarChart"

function Listing() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [list, setList] = useState([])
  const [center, setCenter] = useState(null)
  const [stats, setStats] = useState({
    totalFamilies: 0,
    totalPeople: 0,
    foodNeeds: 0,
    medicineNeeds: 0,
    allergyCount: 0,
    specialFoodCount: 0,
    maleCount: 0,
    femaleCount: 0,
  })
  const [secondaryStatusData, setSecondaryStatusData] =
    useState([])
  const [primaryStatusData, setPrimaryStatusData] =
    useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

 useEffect(() => {
  const fetchData = async () => {
    try {
      setLoading(true)

     
      const response = await getRequest(
        `api/evac-list/${id}`
      )

      console.log(response)

      const data = response.data || [] 
      setList(data)
      setCenter(response.center?.[0] || null)

      setStats({
        totalFamilies: data.length,
        totalPeople: data.reduce(
          (sum, u) =>
            sum + (u.number_of_people || 1), 0
        ),
        foodNeeds: response.needs?.foodCount || 0,
        medicineNeeds: response.needs?.medCount || 0,
        allergyCount: response.needs?.allergy || 0,
        specialFoodCount:
          response.needs?.specialCount || 0,
        maleCount: data.filter(
          u => u.sex === 'male'
        ).length,
        femaleCount: data.filter(
          u => u.sex === 'female'
        ).length,
      })

      setSecondaryStatusData(
        response.secondaryStatus || []
      )
      setPrimaryStatusData(
        response.primaryStatus || []
      )

    } catch (error) {
      console.log(error)
    } finally {
      setLoading(false)
    }
  }
  fetchData()
}, [id])

  const filtered = list.filter(u =>
    `${u.firstName} ${u.lastName}`
      .toLowerCase()
      .includes(search.toLowerCase()) ||
    u.email?.toLowerCase()
      .includes(search.toLowerCase()) ||
    u.barangay?.toLowerCase()
      .includes(search.toLowerCase())
  )

  const capacityPct = center
    ? Math.round(
        (center.current_occupancy /
          center.capacity) * 100
      )
    : 0

  if (loading) {
    return (
      <div className='d-flex justify-content-center
        align-items-center'
        style={{ minHeight: 400 }}
      >
        <div className='spinner-border text-danger' />
      </div>
    )
  }


  const handleDistribute = async (e)=>{
      e.preventDefault()
    try{

     await postRequest(`/auth/distribute`, {id})
    }
    catch(error){
      console.log(error);
      alert('failed to distribute')
    }
  }

  return (
    <div className='p-2'>

      {/* Back */}
      <Link
        to='/evacuation'
        className='btn btn-outline-secondary btn-sm mb-3'
      >
        ← Back to Centers
      </Link>

      {/* Center Header */}
      {center && (
        <div className='card border-0 shadow-sm mb-4'>
          <div className='card-body p-4'>
            <div className='row align-items-center'>

              <div className='col-md-8'>
                <div className='d-flex
                  align-items-center gap-3'
                >
                  
                  <div>
                    <h5 className='fw-bold mb-1'>
                      {center.name}
                    </h5>
                    <p className='text-muted mb-0'
                      style={{ fontSize: 13 }}
                    >
                      {center.barangay},{' '}
                      {center.city}
                    </p>
                    <span className={`badge mt-1 ${
                      center.status === 'open'
                        ? 'bg-success'
                        : center.status === 'full'
                        ? 'bg-danger'
                        : 'bg-secondary'
                    }`}>
                      {center.status?.toUpperCase()}
                    </span>
                    
                  </div>
                  
                </div>
              </div>

              <div className='col-md-4 mt-3 mt-md-0'>
                <div className='row g-2 mb-2'>
                  <div className='col-6 text-center'>
                    <div className='fw-bold text-danger'
                      style={{ fontSize: 20 }}
                    >
                      {stats.totalFamilies}
                    </div>
                    <div className='text-muted'
                      style={{ fontSize: 11 }}
                    >
                      Families
                    </div>
                  </div>
                  <div className='col-6 text-center'>
                    <div className='fw-bold text-primary'
                      style={{ fontSize: 20 }}
                    >
                      {stats.totalPeople}
                    </div>
                    <div className='text-muted'
                      style={{ fontSize: 11 }}
                    >
                      People
                    </div>
                  </div>
                </div>

                <div className='text-muted mb-1'
                  style={{ fontSize: 12 }}
                >
                  Capacity
                </div>
                <div className='progress mb-1'
                  style={{ height: 10 }}
                >
                  <div
                    className={`progress-bar ${
                      capacityPct >= 90
                        ? 'bg-danger'
                        : capacityPct >= 70
                        ? 'bg-warning'
                        : 'bg-success'
                    }`}
                    style={{ width: `${capacityPct}%` }}
                  />
                </div>
                <div className='d-flex
                  justify-content-between'
                  style={{ fontSize: 12 }}
                >
                  <span className='text-muted'>
                    {center.current_occupancy} /{' '}
                    {center.capacity} persons
                  </span>
                  <span className='fw-bold'>
                    {capacityPct}%
                  </span>
                </div>
              </div>

            </div>
          </div>
        </div>
      )}

      {/* ── Panels Row ── */}
      <div className='row g-3 mb-4'>

        {/*  Needs Panel */}
        <div className='col-md-4'>
          <NeedsPanel stats={stats} />
        </div>

      
        {/* Secondary Status Chart */}
        <div className='col'>
          <SecondaryStatusChart
            data={secondaryStatusData}
          />
        </div>

      </div>

      {/* Evacuee Table */}
      <div className='card border-0 shadow-sm'>
        <div className='card-body p-4'>

          <div className='d-flex align-items-center
            justify-content-between mb-3'
          >
            <h6 className='fw-bold mb-0'>
              Evacuee List 
             
              <span className='badge bg-danger ms-2'>
                {filtered.length}
              </span>
            </h6>
            <div style={{ width: 250 }}>
              <input
                type='text'
                className='form-control form-control-sm'
                placeholder='Search name, email...'
                value={search}
                onChange={(e) =>
                  setSearch(e.target.value)
                }
              />
            </div>
             <button type="button" onClick={handleDistribute} className="btn btn-primary mt-1"> 
                      Distribute food
            </button>
          </div>

          <div className='table-responsive'>
            <table className='table table-hover mb-0'
              style={{ fontSize: 13 }}
            >
              <thead className='table-light'>
                <tr>
                  <th>#</th>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Barangay</th>
                  <th>People</th>
                  <th>Needs</th>
                  <th>Status</th>
                  <th>Check-in</th>
                </tr>
              </thead>

              <tbody>
                {filtered.length > 0 ? (
                  filtered.map((user, i) => (
                    <tr
                      key={user.id}
                      style={{ cursor: 'pointer' }}
                      onClick={() =>
                        navigate(`user/${user.id}`)
                      }
                    >
                      <td className='text-muted'>
                        {i + 1}
                      </td>
                      <td>
                        <div className='fw-medium'>
                          {user.firstName}{' '}
                          {user.lastName}
                        </div>
                        <div className='text-muted'
                          style={{ fontSize: 11 }}
                        >
                          {user.sex}
                        </div>
                      </td>
                      <td className='text-muted'>
                        {user.email}
                      </td>
                      <td>{user.barangay}</td>
                      <td className='text-center'>
                        <span className='badge
                          bg-primary bg-opacity-10
                          text-primary'
                        >
                          {user.number_of_people || 1} pax
                        </span>
                      </td>

                      {/* Needs badges */}
                      <td>
                        <div className='d-flex flex-wrap gap-1'>
                          {user.medical && (
                            <span className='badge
                              bg-warning bg-opacity-10
                              text-warning'
                              style={{ fontSize: 10 }}
                            >
                              Med
                            </span>
                          )}
                         
                          {user.special_food && (
                            <span className='badge
                              bg-success bg-opacity-10
                              text-success'
                              style={{ fontSize: 10 }}
                            >
                               Food
                            </span>
                          )}
                          {!user.medical &&
                           !user.allergy &&
                           !user.special_food && (
                            <span className='text-muted'
                              style={{ fontSize: 11 }}
                            >
                              None
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Status */}
                      <td>
                        <span className={`badge ${
                          user.checkout_at
                            ? 'bg-secondary'
                            : 'bg-success'
                        }`}>
                          {user.checkout_at
                            ? 'Checked Out'
                            : 'Inside'
                          }
                        </span>
                      </td>

                      {/* Check-in time */}
                      <td className='text-muted'
                        style={{ fontSize: 11 }}
                      >
                        {user.checkin_at
                          ? new Date(user.checkin_at)
                              .toLocaleString('en-PH', {
                                month: 'short',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })
                          : '—'
                        }
                      </td>

                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan='8'
                      className='text-center text-muted py-4'
                    >
                      {search
                        ? '🔍 No results found'
                        : '👥 No evacuees yet'
                      }
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

        </div>
      </div>

    </div>
  )
}

export default Listing