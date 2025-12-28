using Backend.Models;
using System.Collections.Generic;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Backend.Data;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;

var builder = WebApplication.CreateBuilder(args);
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseNpgsql("Host=localhost;Port=5432;Database=ToDoDb;Username=postgres;Password=Maskotis123"));

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
app.UseHttpsRedirection();

var todos = new List<ToDoItem>();

app.MapGet("/api/todos", async (AppDbContext db) =>
{
    return await db.Todos.ToListAsync();
});
app.MapPost("/api/todos", async (AppDbContext db, ToDoItem newTodo) =>
{
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

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();

app.Run();