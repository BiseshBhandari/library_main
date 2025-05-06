using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Server.Data;
using Server.Model;

namespace Server.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class BooksController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly string _baseImageUrl = "/images/";
        public BooksController(ApplicationDbContext context)
        {
            _context = context;

        }

        [HttpGet]
        public ActionResult<IEnumerable<Book>> GetAll()
        {
            return Ok(_context.Books.ToList());
        }


        [HttpGet("{id}")]
        public ActionResult<Book> GetById(Guid id)
        {
            var book = _context.Books.Find(id);
            if (book == null) return NotFound();
            return Ok(book);
        }

        [HttpPost]
        public ActionResult<Book> Create(Book book)
        {
            book.Id = Guid.NewGuid();
            book.CreatedAt = DateTime.UtcNow;
            book.UpdatedAt = DateTime.UtcNow;
            _context.Books.Add(book);
            _context.SaveChanges();
            return CreatedAtAction(nameof(GetById), new { id = book.Id }, book);
        }

        [HttpPut("{id}")]
        public IActionResult Update(Guid id, Book updatedBook)
        {
            var book = _context.Books.Find(id);
            if (book == null) return NotFound();

            book.Title = updatedBook.Title;
            book.Author = updatedBook.Author;
            book.ISBN = updatedBook.ISBN;
            book.Genre = updatedBook.Genre;
            book.Description = updatedBook.Description;
            book.ImageUrl = updatedBook.ImageUrl;
            book.Price = updatedBook.Price;
            book.InventoryCount = updatedBook.InventoryCount;
            book.IsOnSale = updatedBook.IsOnSale;
            book.UpdatedAt = DateTime.UtcNow;

            _context.SaveChanges();
            return NoContent();
        }

        [HttpDelete("{id}")]
        public IActionResult Delete(Guid id)
        {
            var book = _context.Books.Find(id);
            if (book == null) return NotFound();

            _context.Books.Remove(book);
            _context.SaveChanges();
            return NoContent();
        }
    }
}
