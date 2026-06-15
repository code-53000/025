<?php

namespace StoryRoom\Models;

class Staff extends Model
{
    protected static string $table = 'staff';
    protected array $fillable = ['username', 'password', 'name', 'phone', 'role'];

    public function verifyPassword(string $password): bool
    {
        return password_verify($password, $this->attributes['password'] ?? '');
    }
}
