<?php

namespace StoryRoom\Models;

class ParentUser extends Model
{
    protected static string $table = 'parents';
    protected array $fillable = ['openid', 'name', 'phone', 'avatar'];

    public function children(): array
    {
        return Child::where(['parent_id' => $this->attributes['id']]);
    }
}
