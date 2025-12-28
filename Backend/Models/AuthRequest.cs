namespace Backend.Models
{
    public class AuthRequest
    {
        public string Action { get; set; } = string.Empty;
        public string Username { get; set; } = string.Empty;
        public string Password { get; set; } = string.Empty;
    }
}