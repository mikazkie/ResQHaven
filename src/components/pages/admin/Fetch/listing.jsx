import { useState, useEffect } from "react"
import { useParams } from "react-router-dom"
import { getRequest } from "../../../../API/API"
import { Link,useNavigate  } from "react-router-dom"

function Listing() {

  const { id } = useParams()
  const [list, setList] = useState([])
  const navigate = useNavigate()
  useEffect(() => {

    const fetchData = async () => {
      try {

        const response = await getRequest(`api/evac-list/${id}`)
        console.log(response)

        setList(response.data || [])

      } catch (error) {
        console.log(error)
      }
    }

    fetchData()

  }, [id])

  return (
    <div className="container mt-4">

      <h2 className="mb-4">Evacuee List</h2>

      <table className="table table-striped table-bordered table-hover">

        <thead className="">
          <tr>
            <th>ID</th>
            <th>Name</th>
            <th>Email</th>
            <th>Status</th>
          </tr>
        </thead>

       <tbody>
  {list.length > 0 ? (
    list.map((user) => (
      <tr
        key={user.id}
        style={{ cursor: "pointer" }}
        onClick={() => navigate(`user/${user.id}`)}
      >
        <td>{user.id}</td>
        <td>{user.firstName} {user.lastName}</td>
        <td>{user.email}</td>
        <td className="bg-success-subtle">{user.status}</td>
      </tr>
    ))
  ) : (
    <tr>
      <td colSpan="4" className="text-center">
        No Data Found
      </td>
    </tr>
  )}
</tbody>

      </table>

    </div>
  )
}

export default Listing