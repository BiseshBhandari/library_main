using System;
using System.ComponentModel.DataAnnotations;

namespace Server.DTOs.Request;

public class RegisterDTO
{
    [Required]
    [StringLength(100, ErrorMessage = "Full name cannot be longer than 100 characters.")]
    public string FullName { get; set; } = string.Empty;

    [Required]
    [EmailAddress(ErrorMessage = "Invalid email address.")]
    public string Email { get; set; } = string.Empty;

    [Required]
    [StringLength(50, MinimumLength = 8, ErrorMessage = "Password must be between 8 and 50 characters.")]
    public string Password { get; set; } = string.Empty;

    [Required]
    [Compare("Password", ErrorMessage = "The password and confirmation password do not match.")]
    public string confirmPassword { get; set; } = string.Empty;

}
