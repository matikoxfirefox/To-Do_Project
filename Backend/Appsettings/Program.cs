using Backend.Models;
using Backend.Data;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseNpgsql("Host=localhost;Port=5432;Database=ToDoDb;Username=postgres;Password=Maskotis123"));

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", policy =>
    {
        policy.AllowAnyOrigin().AllowAnyHeader().AllowAnyMethod();
    });
});

var app = builder.Build();
app.UseCors("AllowAll");
app.UseSwagger();
app.UseSwaggerUI();

app.MapPost("/api/auth", async (AppDbContext db, AuthRequest req) =>
{
    if (req.Action == "register")
    {
        var exists = await db.Users.AnyAsync(u => u.Username == req.Username);
        if (exists) return Results.BadRequest(new { error = "Użytkownik już istnieje" });

        var newUser = new User { Username = req.Username, Password = req.Password };
        db.Users.Add(newUser);
        await db.SaveChangesAsync();
        return Results.Ok(new { id = newUser.Id, username = newUser.Username });
    }
    else if (req.Action == "login")
    {
        var user = await db.Users.FirstOrDefaultAsync(u => u.Username == req.Username && u.Password == req.Password);
        if (user == null) return Results.BadRequest(new { error = "Nieprawidłowe dane" });
        return Results.Ok(new { id = user.Id, username = user.Username });
    }
    return Results.BadRequest(new { error = "Nieznana akcja" });
});


app.MapPost("/api/groups", async (AppDbContext db, Group group) =>
{
    db.Groups.Add(group);
    await db.SaveChangesAsync();
    return Results.Created($"/api/groups/{group.Id}", group);
});

app.MapGet("/api/users/{userId}/groups", async (AppDbContext db, int userId) =>
{
    return await db.Groups.Where(g => g.UserId == userId).ToListAsync();
});

app.MapGet("/api/todos/{userId}", async (AppDbContext db, int userId, int? groupId) =>
{
    var query = db.Todos.Where(t => t.UserId == userId);
    if (groupId.HasValue) query = query.Where(t => t.GroupId == groupId.Value);
    return await query.ToListAsync();
});

app.MapPost("/api/todos/{userId}", async (AppDbContext db, int userId, ToDoItem newTodo) =>
{
    newTodo.UserId = userId;
    db.Todos.Add(newTodo);
    await db.SaveChangesAsync();
    return Results.Created($"/api/todos/{newTodo.Id}", newTodo);
});

app.MapPut("/api/todos/{id}", async (AppDbContext db, int id, ToDoItem updatedTodo) =>
{
    var todo = await db.Todos.FindAsync(id);
    if (todo == null) return Results.NotFound("Not found");
    todo.Title = updatedTodo.Title;
    todo.IsDone = updatedTodo.IsDone;
    todo.GroupId = updatedTodo.GroupId;
    await db.SaveChangesAsync();
    return Results.Ok(todo);
});

app.MapDelete("/api/todos/{id}", async (AppDbContext db, int id) =>
{
    var todo = await db.Todos.FindAsync(id);
    if (todo == null) return Results.NotFound("Not found");
    db.Todos.Remove(todo);
    await db.SaveChangesAsync();
    return Results.Ok(todo);
});

app.Urls.Add("http://localhost:5263");
app.Run();
