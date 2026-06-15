<?php

namespace StoryRoom\Models;

use StoryRoom\Core\Database;
use PDO;

class Registration extends Model
{
    protected static string $table = 'registrations';
    protected array $fillable = [
        'activity_id', 'child_id', 'parent_id', 'status',
        'waitlist_position', 'canceled_at'
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
        $data['activity'] = $this->activity()?->toArray();
        return $data;
    }

    public static function findByActivityAndChild(int $activityId, int $childId): ?self
    {
        $table = static::$table;
        $sql = "SELECT * FROM $table WHERE activity_id = ? AND child_id = ?";
        $stmt = Database::getConnection()->prepare($sql);
        $stmt->execute([$activityId, $childId]);
        $data = $stmt->fetch(PDO::FETCH_ASSOC);
        return $data ? new self($data) : null;
    }

    public static function getNextWaitlistPosition(int $activityId): int
    {
        $table = static::$table;
        $sql = "SELECT MAX(waitlist_position) as max_pos FROM $table WHERE activity_id = ? AND status = 'waitlisted'";
        $stmt = Database::getConnection()->prepare($sql);
        $stmt->execute([$activityId]);
        $max = $stmt->fetch(PDO::FETCH_ASSOC)['max_pos'];
        return $max ? $max + 1 : 1;
    }

    public static function getFirstWaitlisted(int $activityId): ?self
    {
        $table = static::$table;
        $sql = "SELECT * FROM $table WHERE activity_id = ? AND status = 'waitlisted' ORDER BY waitlist_position ASC LIMIT 1";
        $stmt = Database::getConnection()->prepare($sql);
        $stmt->execute([$activityId]);
        $data = $stmt->fetch(PDO::FETCH_ASSOC);
        return $data ? new self($data) : null;
    }
}
