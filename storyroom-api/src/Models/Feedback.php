<?php

namespace StoryRoom\Models;

use StoryRoom\Core\Database;
use PDO;

class Feedback extends Model
{
    protected static string $table = 'feedbacks';
    protected array $fillable = [
        'activity_id', 'child_id', 'parent_id', 'content', 'rating'
    ];

    public function activity(): ?Activity
    {
        return Activity::find($this->attributes['activity_id']);
    }

    public function child(): ?Child
    {
        return Child::find($this->attributes['child_id']);
    }

    public function parent(): ?ParentUser
    {
        return ParentUser::find($this->attributes['parent_id']);
    }

    public function withDetails(): array
    {
        $data = $this->toArray();
        $data['child'] = $this->child()?->toArray();
        $data['parent'] = $this->parent()?->toArray();
        return $data;
    }

    public static function getByActivity(int $activityId): array
    {
        $table = static::$table;
        $sql = "SELECT * FROM $table WHERE activity_id = ? ORDER BY created_at DESC";
        $stmt = Database::getConnection()->prepare($sql);
        $stmt->execute([$activityId]);
        $items = $stmt->fetchAll(PDO::FETCH_ASSOC);
        return array_map(fn($item) => new self($item), $items);
    }
}
