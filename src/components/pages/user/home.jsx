import React from 'react'
import Map from '../../map/map'
import Sidebar from '../../layout/sidebar'
import '../../styles/Home.css'

function Home() {
  return (
    <div className="home-container">
      <div className="row g-0 h-100">

        {/* MAP - Left Side */}
        <div className="col-12 col-md-8 col-lg-9">
          <div className="map-wrapper">
            <Map />
          </div>
        </div>

        {/* SIDEBAR - Right Side */}
        <div className="col-12 col-md-4 col-lg-3">
          <div className="sidebar-wrapper">
            <Sidebar />
          </div>
        </div>

      </div>
    </div>
  )
}

export default Home