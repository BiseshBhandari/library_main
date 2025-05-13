using System;

namespace Server.Model
{
    public class Notification
    {
        public int Id { get; set; }
        public string UserId { get; set; } = null!;
        public string Message { get; set; } = null!;
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}
