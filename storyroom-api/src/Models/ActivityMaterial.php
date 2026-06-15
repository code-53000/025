<?php

namespace StoryRoom\Models;

use StoryRoom\Core\Database;
use PDO;

class ActivityMaterial extends Model
{
    protected static string $table = 'activity_materials';
    protected array $fillable = ['activity_id', 'material_id', 'quantity_per_child', 'notes'];

    public function activity(): ?Activity
    {
        return Activity::find($this->attributes['activity_id']);
    }

    public function material(): ?Material
    {
        return Material::find($this->attributes['material_id']);
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
        $sql = "SELECT * FROM $table WHERE activity_id = ?";
        $stmt = Database::getConnection()->prepare($sql);
        $stmt->execute([$activityId]);
        $items = $stmt->fetchAll(PDO::FETCH_ASSOC);
        return array_map(fn($item) => new self($item), $items);
    }
}
