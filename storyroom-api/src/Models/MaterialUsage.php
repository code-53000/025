<?php

namespace StoryRoom\Models;

use StoryRoom\Core\Database;
use PDO;

class MaterialUsage extends Model
{
    protected static string $table = 'material_usage';
    protected array $fillable = [
        'activity_id', 'material_id', 'quantity_used',
        'staff_id', 'notes', 'recorded_at'
    ];

    public function activity(): ?Activity
    {
        return Activity::find($this->attributes['activity_id']);
    }

    public function material(): ?Material
    {
        return Material::find($this->attributes['material_id']);
    }

    public function staff(): ?Staff
    {
        return Staff::find($this->attributes['staff_id']);
    }

    public function withDetails(): array
    {
        $data = $this->toArray();
        $data['material'] = $this->material()?->toArray();
        return $data;
    }

    public static function getByActivity(int $activityId): array
    {
        $table = static::$table;
        $sql = "SELECT * FROM $table WHERE activity_id = ? ORDER BY recorded_at DESC";
        $stmt = Database::getConnection()->prepare($sql);
        $stmt->execute([$activityId]);
        $items = $stmt->fetchAll(PDO::FETCH_ASSOC);
        return array_map(fn($item) => new self($item), $items);
    }
}
