import React from 'react'
import SearchBar from '../components/SearchBar.jsx'
import FeaturedGrid from '../components/FeaturedGrid.jsx'

export default function Home(){
  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-8">
      <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800">
        <SearchBar />
      </div>
      <section>
        <h2 className="text-xl font-semibold mb-3">Featured</h2>
        <FeaturedGrid />
      </section>
    </div>
  )
}
