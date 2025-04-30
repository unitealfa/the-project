import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'

/* pages … */
import Login               from './pages/Login'
import CreateCompany       from './pages/CreateCompany'
import CompaniesList       from './pages/CompaniesList'
import CompanyDetail       from './pages/CompanyDetail'
import CompanyEdit         from './pages/CompanyEdit'
import CreateDepot         from './pages/CreateDepot'
import DepotsList          from './pages/DepotsList'
import DepotDetail         from './pages/DepotDetail'
import DepotEdit           from './pages/DepotEdit'
import Teams               from './pages/Teams'
import TeamManage          from './pages/TeamManage'
import DeliveryTeam        from './pages/DeliveryTeam'
import AddMember           from './pages/AddMember'

/* helpers */
import RequireAuth         from './components/RequireAuth'
import RoleBasedDashboard  from './components/RoleBasedDashboard'

export default function App () {
  return (
    <Routes>
      {/* login */}
      <Route path='/' element={<Login/>} />

      {/* super-admin */}
      <Route path='/create-company'    element={<RequireAuth allowedRoles={['Super Admin']}><CreateCompany/></RequireAuth>} />
      <Route path='/companies'         element={<RequireAuth allowedRoles={['Super Admin']}><CompaniesList/></RequireAuth>} />
      <Route path='/companies/:id'     element={<RequireAuth allowedRoles={['Super Admin']}><CompanyDetail/></RequireAuth>} />
      <Route path='/companies/:id/edit'element={<RequireAuth allowedRoles={['Super Admin']}><CompanyEdit/></RequireAuth>} />

      {/* admin – dépôts */}
      <Route path='/create-depot'   element={<RequireAuth allowedRoles={['Admin']}><CreateDepot/></RequireAuth>} />
      <Route path='/depots'         element={<RequireAuth allowedRoles={['Admin']}><DepotsList/></RequireAuth>} />
      <Route path='/depots/:id'     element={<RequireAuth allowedRoles={['Admin']}><DepotDetail/></RequireAuth>} />
      <Route path='/depots/:id/edit'element={<RequireAuth allowedRoles={['Admin']}><DepotEdit/></RequireAuth>} />

      {/* admin – équipes */}
      <Route path='/teams'                 element={<RequireAuth allowedRoles={['Admin']}><Teams/></RequireAuth>} />
      <Route path='/teams/:depotId'        element={<RequireAuth allowedRoles={['Admin']}><TeamManage/></RequireAuth>} />
      <Route path='/teams/:depotId/livraison'      element={<RequireAuth allowedRoles={['Admin']}><DeliveryTeam/></RequireAuth>} />
      <Route path='/teams/:depotId/livraison/add'  element={<RequireAuth allowedRoles={['Admin']}><AddMember/></RequireAuth>} />

      {/* dashboard générique */}
      <Route path='/dashboard' element={<RequireAuth><RoleBasedDashboard/></RequireAuth>} />

      {/* fallback */}
      <Route path='*' element={<Navigate to='/' replace/>} />
    </Routes>
  )
}
