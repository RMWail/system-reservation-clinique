import React from 'react'

function Filters(props) {

    const {searchQuery,setSearchQuery,setSelectFiler} = props;

  return (
    <div>
           <div className="filters">
          <div className="search-container">
            <input 
              type="text" 
              placeholder="Rechercher par identifiant, téléphone ou nom..."
              className="search-input"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
     {/*
               <input 
            type="date" 
            className="date-filter"
            onChange={(e) => {setFilterByDate(e.target.value)}}
          />
     */}
          <select 
            className="status-filter"
            onChange={(e) => setSelectFiler(e.target.value)}
          >
            <option value="">Tous les statuts</option>
            <option value="1">confirmé</option>
            <option value="0">en attente</option>
            <option value="-1">annulé</option>
          </select>
        </div>
    </div>
  )
}

export default Filters
