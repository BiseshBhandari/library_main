using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Server.Model;
using Server.DTOs.Request;
using Server.DTOs.Response;
using Server.Data;

namespace Server.Controllers
{
    [ApiController]
    [Route("api/announcements/")]
    public class AnnouncementsController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public AnnouncementsController(ApplicationDbContext context)
        {
            _context = context;
        }

        // POST: api/announcements
        [HttpPost("create")]
        public async Task<ActionResult<AnnouncementResponseDto>> CreateAnnouncement([FromBody] CreateAnnouncementRequestDto request)
        {
            // Validation
            if (string.IsNullOrWhiteSpace(request.Message))
            {
                return BadRequest("Message is required");
            }
            if (request.Message.Length > 1000)
            {
                return BadRequest("Message cannot exceed 1000 characters");
            }
            if (request.StartDate == default)
            {
                return BadRequest("Start date is required");
            }
            if (request.EndDate == default)
            {
                return BadRequest("End date is required");
            }
            if (request.EndDate <= request.StartDate)
            {
                return BadRequest("End date must be after start date");
            }

            var announcement = new Announcement
            {
                Id = Guid.NewGuid(),
                Message = request.Message,
                StartDate = request.StartDate,
                EndDate = request.EndDate,
                IsActive = true,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            try
            {
                _context.Announcements.Add(announcement);
                await _context.SaveChangesAsync();

                var response = new AnnouncementResponseDto
                {
                    Id = announcement.Id,
                    Message = announcement.Message,
                    StartDate = announcement.StartDate,
                    EndDate = announcement.EndDate,
                    IsActive = announcement.IsActive,
                    CreatedAt = announcement.CreatedAt,
                    UpdatedAt = announcement.UpdatedAt
                };

                return Ok(response);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"An error occurred while creating the announcement: {ex.Message}");
            }
        }

        // PUT: api/announcements/{id}
        [HttpPut("updateAnnouncement/{id}")]
        public async Task<IActionResult> UpdateAnnouncement(Guid id, [FromBody] UpdateAnnouncementRequestDto request)
        {
            // Validation
            if (string.IsNullOrWhiteSpace(request.Message))
            {
                return BadRequest("Message is required");
            }
            if (request.Message.Length > 1000)
            {
                return BadRequest("Message cannot exceed 1000 characters");
            }
            if (request.StartDate == default)
            {
                return BadRequest("Start date is required");
            }
            if (request.EndDate == default)
            {
                return BadRequest("End date is required");
            }
            if (request.EndDate <= request.StartDate)
            {
                return BadRequest("End date must be after start date");
            }

            var announcement = await _context.Announcements.FindAsync(id);
            if (announcement == null)
            {
                return NotFound($"Announcement with ID {id} not found");
            }

            try
            {
                announcement.Message = request.Message;
                announcement.StartDate = request.StartDate;
                announcement.EndDate = request.EndDate;
                announcement.IsActive = request.IsActive;
                announcement.UpdatedAt = DateTime.UtcNow;

                _context.Entry(announcement).State = EntityState.Modified;
                await _context.SaveChangesAsync();
                return NoContent();
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"An error occurred while updating the announcement: {ex.Message}");
            }
        }

        // DELETE: api/announcements/{id}
        [HttpDelete("delete/{id}")]
        public async Task<IActionResult> DeleteAnnouncement(Guid id)
        {
            var announcement = await _context.Announcements.FindAsync(id);
            if (announcement == null)
            {
                return NotFound($"Announcement with ID {id} not found");
            }

            try
            {
                _context.Announcements.Remove(announcement);
                await _context.SaveChangesAsync();
                return NoContent();
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"An error occurred while deleting the announcement: {ex.Message}");
            }
        }

        // GET: api/announcements
        [HttpGet("get")]
        public async Task<ActionResult<IEnumerable<AnnouncementResponseDto>>> GetAnnouncements()
        {
            try
            {
                var announcements = await _context.Announcements.ToListAsync();
                var response = announcements.Select(a => new AnnouncementResponseDto
                {
                    Id = a.Id,
                    Message = a.Message,
                    StartDate = a.StartDate,
                    EndDate = a.EndDate,
                    IsActive = a.IsActive,
                    CreatedAt = a.CreatedAt,
                    UpdatedAt = a.UpdatedAt
                }).ToList();

                return Ok(response);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"An error occurred while retrieving announcements: {ex.Message}");
            }
        }
    }
}