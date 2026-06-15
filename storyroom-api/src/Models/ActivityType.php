<?php

namespace StoryRoom\Models;

class ActivityType extends Model
{
    protected static string $table = 'activity_types';
    protected array $fillable = ['name', 'description'];
}
