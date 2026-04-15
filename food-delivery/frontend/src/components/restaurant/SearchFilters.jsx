import { useState } from "react";

function SearchFilters({ onSearch }) {
  const [filters, setFilters] = useState({
    search: "",
    cuisine: "",
    rating: "",
    lat: "",
    lng: "",
    radius: "",
  });

  const handleChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSearch(filters);
  };

  const handleReset = () => {
    const emptyFilters = {
      search: "",
      cuisine: "",
      rating: "",
      lat: "",
      lng: "",
      radius: "",
    };
    setFilters(emptyFilters);
    onSearch(emptyFilters);
  };

  return (
    <form className="search-filters" onSubmit={handleSubmit}>
      <input
        type="text"
        name="search"
        placeholder="Search restaurant name"
        value={filters.search}
        onChange={handleChange}
      />

      <input
        type="text"
        name="cuisine"
        placeholder="Cuisine (e.g. Indian)"
        value={filters.cuisine}
        onChange={handleChange}
      />

      <input
        type="number"
        name="rating"
        placeholder="Min rating"
        value={filters.rating}
        onChange={handleChange}
      />

      <input
        type="number"
        name="lat"
        placeholder="Latitude"
        value={filters.lat}
        onChange={handleChange}
      />

      <input
        type="number"
        name="lng"
        placeholder="Longitude"
        value={filters.lng}
        onChange={handleChange}
      />

      <input
        type="number"
        name="radius"
        placeholder="Radius in meters"
        value={filters.radius}
        onChange={handleChange}
      />

      <button type="submit">Search</button>
      <button type="button" onClick={handleReset}>Reset</button>
    </form>
  );
}

export default SearchFilters;