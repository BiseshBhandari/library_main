using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Server.Data;
using Server.DTOs.Response;
using Server.Model;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Server.Controllers
{
    [Route("api/admin/user")]
    [ApiController]
    public class UserController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        public UserController(ApplicationDbContext context)
        {
            _context = context;
        }

        // GET: api/admin/user/getall
        [HttpGet("getall")]
        public async Task<ActionResult<IEnumerable<UserDTO>>> GetAllUsers()
        {
            var users = await _context.Users
                .Select(u => new UserDTO
                {
                    Id = u.Id,
                    FullName = u.FullName,
                    Role = u.Role,
                    Email = u.Email
                })
                .ToListAsync();

            return Ok(users);
        }

        // PUT: api/admin/user/edit/{id}
        [HttpPut("edit/{id}")]
        public async Task<ActionResult<UserDTO>> EditUser(Guid id, [FromBody] UserDTO userDto)
        {
            var user = await _context.Users.FindAsync(id);
            if (user == null)
                return NotFound("User not found");

            user.FullName = userDto.FullName;
            user.Role = userDto.Role;
            user.Email = userDto.Email;

            await _context.SaveChangesAsync();

            return Ok(new UserDTO
            {
                Id = user.Id,
                FullName = user.FullName,
                Role = user.Role,
                Email = user.Email
            });
        }

        // DELETE: api/admin/user/delete/{id}
        [HttpDelete("delete/{id}")]
        public async Task<IActionResult> DeleteUser(Guid id)
        {
            var user = await _context.Users.FindAsync(id);
            if (user == null)
                return NotFound("User not found");

            _context.Users.Remove(user);
            await _context.SaveChangesAsync();

            return NoContent();
        }
    }
}