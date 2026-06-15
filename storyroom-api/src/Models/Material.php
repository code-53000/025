<?php

namespace StoryRoom\Models;

class Material extends Model
{
    protected static string $table = 'materials';
    protected array $fillable = ['name', 'unit', 'quantity', 'description'];
}
