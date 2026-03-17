import { useState, useEffect } from "react"
import { useParams } from "react-router-dom"
import { getRequest } from "../../../../API/API"


function Profile() {
const { id } = useParams()
const [user, setUser] = useState([])

useEffect(()=>{
    try{
        const profile = async ()=>{
        
            const response = await getRequest(`api/profile/${id}`)

            if(response.success){
                setUser(response.user)
            }
            else{
                alert('failed to get the data')
            }

        }
        profile()
    }catch(error){
        console.log(error);
        
    }
},[id])
    return (
    <div>
        <h1>{user.firstName}</h1>
    </div>
  )
}

export default Profile
