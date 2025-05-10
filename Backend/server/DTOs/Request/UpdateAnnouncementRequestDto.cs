using System;

namespace Server.DTOs.Request;

public class UpdateAnnouncementRequestDto
{
    public string Message { get; set; }
    public DateTime StartDate { get; set; }
    public DateTime EndDate { get; set; }
    public bool IsActive { get; set; }

}
