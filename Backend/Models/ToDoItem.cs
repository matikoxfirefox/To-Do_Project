namespace Backend.Models
{
    public class ToDoItem
    {
        public int Id { get; set; }
        public string Title { get; set; } = "";
        public string Description { get; set; } = "";
        public bool IsDone { get; set; }

        public int OwnerId { get; set; }
        public int? GroupId { get; set; }
        public DateTime DateAdded { get; set; } = DateTime.UtcNow;
        public int Priority { get; set; } = 1;
        public User Owner { get; set; } = null!;
    }
}