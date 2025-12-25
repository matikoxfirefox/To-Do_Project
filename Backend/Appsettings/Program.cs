using Backend.Models;


var builder = WebApplication.CreateBuilder(args);

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


var todos = new List<ToDoItem>
{
   // new ToDoItem { Id = 1, Title = "Zrobic backend"},
   // new ToDoItem { Id = 2, Title = "Odpalic Reacta"},
};

app.MapGet("/api/todos", () => todos);
app.MapPost("/api/todos", (ToDoItem newTodo) =>
{
    todos.Add(newTodo);
    return newTodo;
});
app.MapPut("/api/todos/{id}", (int id, ToDoItem updatedTodo) =>
{
    var todo = todos.Find(t => t.Id == id);
    if (todo == null) 
        return Results.NotFound("Not found");

    todo.Title = updatedTodo.Title;
    todo.IsDone = updatedTodo.IsDone;

    return Results.Ok(todo); 
});
app.MapDelete("/api/todos/{id}", (int id) =>
{
    var todo = todos.Find(t => t.Id == id);
    if (todo == null)
        return Results.NotFound("Not found");
    todos.Remove(todo);
    return Results.Ok(todo);
});

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();

var summaries = new[]
{
    "Freezing", "Bracing", "Chilly", "Cool", "Mild", "Warm", "Balmy", "Hot", "Sweltering", "Scorching"
};

app.MapGet("/weatherforecast", () =>
    {
        var forecast = Enumerable.Range(1, 5).Select(index =>
                new WeatherForecast
                (
                    DateOnly.FromDateTime(DateTime.Now.AddDays(index)),
                    Random.Shared.Next(-20, 55),
                    summaries[Random.Shared.Next(summaries.Length)]
                ))
            .ToArray();
        return forecast;
    })
    .WithName("GetWeatherForecast")
    .WithOpenApi();

app.Run();

record WeatherForecast(DateOnly Date, int TemperatureC, string? Summary)
{
    public int TemperatureF => 32 + (int)(TemperatureC / 0.5556);
}