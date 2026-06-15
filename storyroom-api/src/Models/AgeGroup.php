<?php

namespace StoryRoom\Models;

class AgeGroup extends Model
{
    protected static string $table = 'age_groups';
    protected array $fillable = ['name', 'min_age', 'max_age', 'description'];
}
