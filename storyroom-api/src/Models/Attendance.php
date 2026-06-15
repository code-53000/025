<?php

namespace StoryRoom\Models;

use StoryRoom\Core\Database;
use PDO;

class Attendance extends Model
{
    protected static string $table = 'attendances';
    protected array $fillable = [
        'activity_id', 'child_id', 'registration_id',
        'status', 'sign_time', 'leave_reason', 'staff_id'
    ];

    public function activity(): ?Activity
    {
        return Activity::find($this->attributes['activity_id']);
    }

    public function child(): ?Child
    {
        return Child::find($this->attributes['child_id']);
    }

    public function registration(): ?Registration
    {
        return Registration::find($this->attributes['registration_id']);
    }

    public function staff(): ?Staff
    {
        return Staff::find($this->attributes['staff_id']);
    }

    public function withDetails(): array
    {
        $data = $this->toArray();
        $data['child'] = $this->child()?->toArray();
        $data['registration'] = $this->registration()?->toArray();
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

    public static function getByActivity(int $activityId): array
    {
        $table = static::$table;
        $sql = "SELECT * FROM $table WHERE activity_id = ? ORDER BY id DESC";
        $stmt = Database::getConnection()->prepare($sql);
        $stmt->execute([$activityId]);
        $items = $stmt->fetchAll(PDO::FETCH_ASSOC);
        return array_map(fn($item) => new self($item), $items);
    }
}
