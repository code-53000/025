<?php

namespace StoryRoom\Models;

use StoryRoom\Core\Database;
use PDO;

class Activity extends Model
{
    protected static string $table = 'activities';
    protected array $fillable = [
        'title', 'activity_type_id', 'age_group_id', 'teacher',
        'location', 'start_time', 'end_time', 'max_participants',
        'material_description', 'description', 'status', 'staff_id'
    ];

    public function activityType(): ?ActivityType
    {
        return ActivityType::find($this->attributes['activity_type_id']);
    }

    public function ageGroup(): ?AgeGroup
    {
        return AgeGroup::find($this->attributes['age_group_id']);
    }

    public function staff(): ?Staff
    {
        return Staff::find($this->attributes['staff_id']);
    }

    public function getRegisteredCount(): int
    {
        $sql = "SELECT COUNT(*) as count FROM registrations WHERE activity_id = ? AND status = 'registered'";
        $stmt = Database::getConnection()->prepare($sql);
        $stmt->execute([$this->attributes['id']]);
        return (int)$stmt->fetch(PDO::FETCH_ASSOC)['count'];
    }

    public function getWaitlistedCount(): int
    {
        $sql = "SELECT COUNT(*) as count FROM registrations WHERE activity_id = ? AND status = 'waitlisted'";
        $stmt = Database::getConnection()->prepare($sql);
        $stmt->execute([$this->attributes['id']]);
        return (int)$stmt->fetch(PDO::FETCH_ASSOC)['count'];
    }

    public function getRegistrations(): array
    {
        return Registration::where(['activity_id' => $this->attributes['id']]);
    }

    public function withDetails(): array
    {
        $data = $this->toArray();
        $data['activity_type'] = $this->activityType()?->toArray();
        $data['age_group'] = $this->ageGroup()?->toArray();
        $data['registered_count'] = $this->getRegisteredCount();
        $data['waitlisted_count'] = $this->getWaitlistedCount();
        unset($data['staff_id']);
        return $data;
    }
}
