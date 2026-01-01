using Backend.Models;
using Backend.Data;
using Microsoft.EntityFrameworkCore;
using System.Net.Mail;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddDbContext<AppDbContext>(options => 
    options.UseNpgsql(Environment.GetEnvironmentVariable("postgresql://tododb_qsy2_user:uY3vSiSn8zo08H3SMO89pZyBwByfrjDL@dpg-d5be4bmr433s738tm2f0-a/tododb_qsy2")));
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", policy =>
    {
        policy.AllowAnyOrigin()
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
});
var app = builder.Build();

app.UseCors("AllowAll");
app.UseSwagger();
app.UseSwaggerUI();
app.UseDefaultFiles();
app.UseStaticFiles();
bool IsValidEmail(string email)
{
    try
    {
        var addr = new MailAddress(email);
        return addr.Address == email;
    }
    catch
    {
        return false;
    }
}

app.MapPost("/api/auth", async (AppDbContext db, AuthRequest req) =>
{
    if (!IsValidEmail(req.Email))
        return Results.BadRequest(new { error = "Niepoprawny email" });

    if (req.Action == "register")
    {
        if (await db.Users.AnyAsync(u => u.Email == req.Email))
            return Results.BadRequest(new { error = "Użytkownik już istnieje" });

        var newUser = new User
        {
            Email = req.Email,
            Password = req.Password 
        };

        db.Users.Add(newUser);
        await db.SaveChangesAsync();

        return Results.Ok(new { id = newUser.Id, email = newUser.Email });
    }

    if (req.Action == "login")
    {
        var user = await db.Users
            .FirstOrDefaultAsync(u => u.Email == req.Email && u.Password == req.Password);

        if (user == null)
            return Results.BadRequest(new { error = "Nieprawidłowe dane" });

        return Results.Ok(new { id = user.Id, email = user.Email });
    }

    return Results.BadRequest(new { error = "Nieznana akcja" });
});
app.MapPost("/api/groups", async (AppDbContext db, Group group) =>
{
    if (group.OwnerId == 0)
        return Results.BadRequest("OwnerId required");

    db.Groups.Add(group);
    await db.SaveChangesAsync();

    return Results.Created($"/api/groups/{group.Id}", group);
});

app.MapGet("/api/groups/{userId}", async (AppDbContext db, int userId) =>
{
    return await db.Groups
        .Where(g => g.OwnerId == userId)
        .ToListAsync();
});

app.MapDelete("/api/groups/{groupId}", async (AppDbContext db, int groupId) =>
{
    var group = await db.Groups
        .Include(g => g.Todos)
        .FirstOrDefaultAsync(g => g.Id == groupId);

    if (group == null)
        return Results.NotFound("Grupa nie istnieje");

    if (group.Todos != null && group.Todos.Count > 0)
        db.Todos.RemoveRange(group.Todos);

    db.Groups.Remove(group);
    await db.SaveChangesAsync();

    return Results.Ok();
});
app.MapGet("/api/todos/group/{groupId}/all", async (AppDbContext db, int groupId) =>
{
    var todos = await db.Todos
        .Include(t => t.Owner) 
        .Where(t => t.GroupId == groupId)
        .ToListAsync();

    return Results.Ok(todos);
});

app.MapPost("/api/groups/{groupId}/users", async (
    AppDbContext db,
    int groupId,
    AddUserToGroupDto dto) =>
{
    var user = await db.Users.FirstOrDefaultAsync(u => u.Email == dto.email);
    if (user == null) return Results.NotFound("User not found");

    var exists = await db.GroupUsers.AnyAsync(gu => gu.GroupId == groupId && gu.UserId == user.Id);
    if (exists) return Results.BadRequest("User already in group");

    db.GroupUsers.Add(new GroupUser { GroupId = groupId, UserId = user.Id });
    await db.SaveChangesAsync();
    return Results.Ok();
});
app.MapGet("/api/todos/{userId}", async (AppDbContext db, int userId, int? groupId) =>
{
    if (!groupId.HasValue)
        return Results.BadRequest("groupId required");

    var isMember = await db.GroupUsers.AnyAsync(gu =>
        gu.GroupId == groupId.Value && gu.UserId == userId);

    if (!isMember)
        return Results.Unauthorized(); 

    var todos = await db.Todos
        .Include(t => t.Owner)
        .Where(t => t.GroupId == groupId.Value)
        .ToListAsync();

    return Results.Ok(todos);
});

app.MapPost("/api/todos/{userId}", async (AppDbContext db, int userId, ToDoItem newTodo) =>
{
    newTodo.OwnerId = userId;
    newTodo.DateAdded = DateTime.UtcNow;

    if (newTodo.Priority < 0 || newTodo.Priority > 2)
        newTodo.Priority = 1;

    db.Todos.Add(newTodo);
    await db.SaveChangesAsync();

    return Results.Created($"/api/todos/{newTodo.Id}", newTodo);
});

app.MapPut("/api/todos/{id}", async (AppDbContext db, int id, ToDoItem updatedTodo) =>
{
    var todo = await db.Todos.FindAsync(id);
    if (todo == null)
        return Results.NotFound();

    todo.Title = updatedTodo.Title;
    todo.IsDone = updatedTodo.IsDone;
    todo.GroupId = updatedTodo.GroupId;

    await db.SaveChangesAsync();
    return Results.Ok(todo);
});

app.MapDelete("/api/todos/{id}", async (AppDbContext db, int id) =>
{
    var todo = await db.Todos.FindAsync(id);
    if (todo == null)
        return Results.NotFound();

    db.Todos.Remove(todo);
    await db.SaveChangesAsync();

    return Results.Ok();
});

app.MapGet("/api/todos/group/{groupId}", async (AppDbContext db, int groupId) =>
{
    return await db.Todos
        .Include(t => t.Owner)
        .Where(t => t.GroupId == groupId)
        .ToListAsync();
});

app.MapGet("/api/users/{userId}/groups", async (AppDbContext db, int userId) =>
{
    var ownerGroups = db.Groups.Where(g => g.OwnerId == userId);
    var memberGroups = db.GroupUsers
        .Where(gu => gu.UserId == userId)
        .Select(gu => gu.Group);

    var allGroups = await ownerGroups
        .Union(memberGroups)
        .Distinct()
        .ToListAsync();

    return Results.Ok(allGroups);
});

app.Urls.Add("http://localhost:5263");
app.Run();

public record AddUserToGroupDto(string email);
