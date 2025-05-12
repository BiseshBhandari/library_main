using Microsoft.AspNetCore.Mvc;
using Server.DTOs.Request;
using Server.DTOs.Response;
using Server.Model;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Server.Data;

namespace Server.Controllers
{
    [ApiController]
    [Route("api/users/{userId}/reviews")]
    public class ReviewController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public ReviewController(ApplicationDbContext context)
        {
            _context = context;
        }

        // GET: api/users/{userId}/reviews/reviewable-books
        [HttpGet("reviewable-books")]
        public async Task<ActionResult<IEnumerable<ReviewableBookDTO>>> GetReviewableBooks(Guid userId)
        {
            var completedOrderBookIds = await _context.Orders
                .Where(o => o.UserId == userId && (o.Status == "Completed" || o.Status == "Complete"))
                .SelectMany(o => o.OrderItems)
                .Select(oi => oi.BookId)
                .Distinct()
                .ToListAsync();

            var userReviews = (await _context.Reviews
                .Where(r => r.UserId == userId)
                .GroupBy(r => r.BookId)
                .Select(g => new
                {
                    BookId = g.Key,
                    LatestRating = g.OrderByDescending(r => r.CreatedAt).First().Rating
                })
                .ToListAsync())
                .ToList();

            var reviewableBooks = await _context.Books
                .Where(b => completedOrderBookIds.Contains(b.Id))
                .ToListAsync();

            var now = DateTime.UtcNow;
            var reviewableBookDTOs = reviewableBooks
                .Select(b => new ReviewableBookDTO
                {
                    BookId = b.Id,
                    Title = b.Title,
                    Author = b.Author,
                    ImageUrl = b.ImageUrl,
                    Price = b.Price,
                    EffectivePrice = b.IsOnSale &&
                                    b.DiscountStart.HasValue &&
                                    b.DiscountEnd.HasValue &&
                                    b.DiscountStart.Value <= now &&
                                    b.DiscountEnd.Value >= now &&
                                    b.DiscountPercentage.HasValue
                        ? Math.Round(b.Price * (1 - (decimal)b.DiscountPercentage.Value / 100), 2)
                        : b.Price,
                    IsOnSale = b.IsOnSale,
                    DiscountStart = b.DiscountStart,
                    DiscountEnd = b.DiscountEnd,
                    Rating = userReviews.FirstOrDefault(r => r.BookId == b.Id)?.LatestRating ?? 0
                })
                .ToList();

            return Ok(reviewableBookDTOs);
        }

        // POST: api/users/{userId}/reviews
        [HttpPost]
        public async Task<ActionResult<ReviewResponseDTO>> CreateReview(Guid userId, [FromBody] CreateReviewRequestDTO request)
        {
            // Validate the book exists
            var bookExists = await _context.Books.AnyAsync(b => b.Id == request.BookId);
            if (!bookExists)
            {
                return NotFound(new { message = $"Book with ID {request.BookId} not found." });
            }

            // Validate that the user has a completed order with the book
            var completedOrder = await _context.Orders
                .Where(o => o.UserId == userId && (o.Status == "Completed" || o.Status == "Complete") && o.OrderItems.Any(oi => oi.BookId == request.BookId))
                .Select(o => new { o.Id, o.Status })
                .FirstOrDefaultAsync();

            if (completedOrder == null)
            {
                return BadRequest(new { message = $"You cannot review this book as it was not purchased in a completed order." });
            }

            // Create the review
            var review = new Review
            {
                Id = Guid.NewGuid(),
                UserId = userId,
                BookId = request.BookId,
                Rating = request.Rating,
                Comment = request.Comment,
                CreatedAt = DateTime.UtcNow
            };

            _context.Reviews.Add(review);
            await _context.SaveChangesAsync();

            // Prepare response
            var response = new ReviewResponseDTO
            {
                ReviewId = review.Id,
                BookId = review.BookId,
                Rating = review.Rating,
                Comment = review.Comment,
                CreatedAt = review.CreatedAt
            };

            return CreatedAtAction(nameof(GetReviewableBooks), new { userId }, response);
        }
    }
}