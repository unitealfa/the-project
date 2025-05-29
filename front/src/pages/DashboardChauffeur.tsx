 import React from 'react';
 import { Link } from 'react-router-dom';
 import Header from '../components/Header';

 export default function DashboardChauffeur() {
   const raw  = localStorage.getItem('user');
   const u    = raw ? JSON.parse(raw) as { nom:string; prenom:string; companyName?:string } : null;
   if (!u) return null;

   return (
     <>
       <Header/>
       <main style={{padding:'2rem',fontFamily:'Arial, sans-serif'}}>
         <h1>Bienvenue {u.prenom} {u.nom}</h1>
         <p>Rôle : <strong>Chauffeur</strong></p>
         <p>Société : <strong>{u.companyName ?? '—'}</strong></p>

         <section style={{marginTop:'2rem'}}>
           <h2>🛣️  Planning de trajets</h2>

           <Link
             to="/chauffeur/tournees"
             style={{
               display: 'inline-block',
               marginTop: '0.5rem',
               padding: '0.5rem 1rem',
               backgroundColor: '#4f46e5',
               color: 'white',
               textDecoration: 'none',
               borderRadius: '4px'
             }}
           >
             Voir mes tournées
           </Link>
         </section>
       </main>
     </>
   );
 }
