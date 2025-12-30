namespace Backend.Models
{
    public class Group
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public int OwnerId { get; set; }
        public User Owner { get; set; } = null!;

        public List<GroupUser> GroupUsers { get; set; } = new();
        public List<ToDoItem> Todos { get; set; } = new();
    }
}