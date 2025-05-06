import { useEffect, useState } from "react";
import BookCard from "../../Components/BookComponents/BookCard";
// import BookCard from "../Components/BookCard";
// import "../styles/Landing.css"; // Import the external CSS
import "../../styles/Landing.css"; // Adjust the path as necessary

const LandingPage = () => {
  const [books, setBooks] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortOption, setSortOption] = useState("");
  const [inStockOnly, setInStockOnly] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(""); // State for selected genre
  const [genres, setGenres] = useState([]); // State for storing genres

  const API_URL = "http://localhost:5001/api/book";

  // Get unique genres from the books
  useEffect(() => {
    fetch(API_URL)
      .then((res) => res.json())
      .then((data) => {
        setBooks(data);
        const uniqueGenres = [
          ...new Set(data.map((book) => book.genre)) // Assuming each book has a 'genre' field
        ];
        setGenres(uniqueGenres); // Set the genres dynamically
      })
      .catch((err) => console.error(err));
  }, []);

  const filteredBooks = books
    .filter((book) => book.title.toLowerCase().includes(searchQuery.toLowerCase()))
    .filter((book) => (inStockOnly ? book.inventoryCount > 0 : true))
    .filter((book) => {
      if (selectedCategory && selectedCategory !== "All Books") {
        return book.genre === selectedCategory; // Filter by selected genre
      }
      return true; // Show all books if "All Books" is selected
    })
    .sort((a, b) => {
      if (sortOption === "title-asc") return a.title.localeCompare(b.title);
      if (sortOption === "title-desc") return b.title.localeCompare(a.title);
      if (sortOption === "price-asc") return a.price - b.price;
      if (sortOption === "price-desc") return b.price - a.price;
      return 0;
    });

  return (
    <div className="container">
      {/* Sidebar */}
      <aside className="sidebar">
        <h1 className="logo">BookHaven</h1>
        <nav className="nav">
          <button className="nav-item active">🏠 Home</button>
          <button className="nav-item">🔍 Browse</button>
        </nav>
      </aside>

      {/* Main content */}
      <main className="main-content">
        {/* Top menu */}
        <div className="top-menu">
          <div className="filters">
            {/* "All Books" option + dynamically generated genre buttons */}
            <button
              className="filter-btn"
              onClick={() => setSelectedCategory("All Books")} // Set category to "All Books"
            >
              All Books
            </button>
            {genres.map((genre, idx) => (
              <button
                key={idx}
                className="filter-btn"
                onClick={() => setSelectedCategory(genre)} // Set the genre on button click
              >
                {genre}
              </button>
            ))}
          </div>
          <div className="auth-buttons">
            <button className="auth-btn">🛒</button>
            <button className="auth-btn" onClick={() => window.location.href = '/register'}>Sign up</button>
            <button className="auth-btn" onClick={() => window.location.href = '/login'}>Login</button>
          </div>
        </div>

        {/* Search and Sort */}
        <div className="top-menu">
          <div className="filters">
            {/* Search Input */}
            <input
              type="text"
              placeholder="Search books..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-input"
            />

            {/* Sort Dropdown */}
            <select
              className="sort-dropdown"
              value={sortOption}
              onChange={(e) => setSortOption(e.target.value)}
            >
              <option value="">Sort By</option>
              <option value="title-asc">Title A–Z</option>
              <option value="title-desc">Title Z–A</option>
              <option value="price-asc">Price Low–High</option>
              <option value="price-desc">Price High–Low</option>
            </select>

            {/* Filter Checkbox */}
            <label className="filter-label">
              <input
                type="checkbox"
                checked={inStockOnly}
                onChange={() => setInStockOnly(!inStockOnly)}
              />
              In Stock Only
            </label>
          </div>
        </div>

        {/* Genre Filtered Books Section */}
        <section className="section">
          <h2 className="section-title">{selectedCategory || "All Books"}</h2> {/* Dynamic title based on selected category */}
          <p className="section-subtitle">Browse books from the {selectedCategory || "All Books"} category</p>
          <div className="book-grid">
            {filteredBooks.map((book) => (
              <BookCard
                key={book.id}
                id={book.id}
                title={book.title}
                imageUrl={book.imageUrl}
                rating={book.rating}
              />

            ))}
          </div>
        </section>

        {/* Authors Section */}
        <section className="section">
          <h2 className="section-title">Authors</h2>
          <p className="section-subtitle">Find your favorite author</p>
          <div className="author-grid">
            {Array.from({ length: 6 }).map((_, idx) => (
              <div key={idx} className="author-card">
                <div className="author-img"></div>
                <p className="author-name">Author Name</p>
                <p className="author-genre">Genre</p>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
};

export default LandingPage;
