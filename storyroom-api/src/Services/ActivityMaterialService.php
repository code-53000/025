<?php

namespace StoryRoom\Services;

use StoryRoom\Models\ActivityMaterial;
use StoryRoom\Models\Material;
use StoryRoom\Models\Activity;
use StoryRoom\Core\Database;

class ActivityMaterialService
{
    public function list(int $page = 1, int $pageSize = 10, ?int $activityId = null): array
    {
        $conditions = [];
        if ($activityId) {
            $conditions['activity_id'] = $activityId;
        }

        $result = ActivityMaterial::paginate($page, $pageSize, $conditions);
        $items = array_map(fn($am) => $am->withDetails(), $result['items']);

        return [
            'items' => $items,
            'total' => $result['total'],
            'page' => $result['page'],
            'page_size' => $result['page_size'],
        ];
    }

    public function getByActivity(int $activityId): array
    {
        $items = ActivityMaterial::getByActivity($activityId);
        return array_map(fn($am) => $am->withDetails(), $items);
    }

    public function create(array $data): array
    {
        $this->validateData($data);

        $activity = Activity::find($data['activity_id']);
        if (!$activity) {
            throw new \Exception('活动不存在');
        }

        $material = Material::find($data['material_id']);
        if (!$material) {
            throw new \Exception('材料不存在');
        }

        $existing = ActivityMaterial::where([
            'activity_id' => $data['activity_id'],
            'material_id' => $data['material_id'],
        ]);

        if (!empty($existing)) {
            throw new \Exception('该活动已添加此材料');
        }

        $activityMaterial = new ActivityMaterial();
        $activityMaterial->activity_id = $data['activity_id'];
        $activityMaterial->material_id = $data['material_id'];
        $activityMaterial->quantity_per_child = $data['quantity_per_child'] ?? 1;
        $activityMaterial->notes = $data['notes'] ?? null;
        $activityMaterial->save();

        return $activityMaterial->withDetails();
    }

    public function update(int $id, array $data): array
    {
        $activityMaterial = ActivityMaterial::find($id);
        if (!$activityMaterial) {
            throw new \Exception('活动材料不存在');
        }

        if (isset($data['quantity_per_child'])) {
            $activityMaterial->quantity_per_child = $data['quantity_per_child'];
        }
        if (array_key_exists('notes', $data)) {
            $activityMaterial->notes = $data['notes'];
        }

        $activityMaterial->save();

        return $activityMaterial->withDetails();
    }

    public function delete(int $id): bool
    {
        $activityMaterial = ActivityMaterial::find($id);
        if (!$activityMaterial) {
            throw new \Exception('活动材料不存在');
        }

        return $activityMaterial->delete();
    }

    private function validateData(array $data): void
    {
        if (empty($data['activity_id'])) {
            throw new \Exception('活动ID不能为空');
        }
        if (empty($data['material_id'])) {
            throw new \Exception('材料ID不能为空');
        }
        if (isset($data['quantity_per_child']) && $data['quantity_per_child'] <= 0) {
            throw new \Exception('每人用量必须大于0');
        }
    }
}
