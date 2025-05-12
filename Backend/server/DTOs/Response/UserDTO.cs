using System;

namespace Server.DTOs.Response;

public class UserDTO
{
    public Guid Id { get; set; }
    public string FullName { get; set; }
    public string Role { get; set; }
    public string Email { get; set; }

}
