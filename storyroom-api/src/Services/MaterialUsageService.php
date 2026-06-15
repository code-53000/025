<?php

namespace StoryRoom\Services;

use StoryRoom\Models\MaterialUsage;
use StoryRoom\Models\Material;
use StoryRoom\Models\Activity;
use StoryRoom\Models\Staff;
use StoryRoom\Core\Database;

class MaterialUsageService
{
    public function list(int $page = 1, int $pageSize = 10, ?int $activityId = null): array
    {
        $conditions = [];
        if ($activityId) {
            $conditions['activity_id'] = $activityId;
        }

        $result = MaterialUsage::paginate($page, $pageSize, $conditions);
        $items = array_map(fn($mu) => $mu->withDetails(), $result['items']);

        return [
            'items' => $items,
            'total' => $result['total'],
            'page' => $result['page'],
            'page_size' => $result['page_size'],
        ];
    }

    public function getByActivity(int $activityId): array
    {
        $items = MaterialUsage::getByActivity($activityId);
        return array_map(fn($mu) => $mu->withDetails(), $items);
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

        if (!empty($data['staff_id'])) {
            $staff = Staff::find($data['staff_id']);
            if (!$staff) {
                throw new \Exception('馆员不存在');
            }
        }

        Database::beginTransaction();

        try {
            $usage = new MaterialUsage();
            $usage->activity_id = $data['activity_id'];
            $usage->material_id = $data['material_id'];
            $usage->quantity_used = $data['quantity_used'];
            $usage->staff_id = $data['staff_id'] ?? 1;
            $usage->notes = $data['notes'] ?? null;
            $usage->save();

            $newQuantity = $material->quantity - $data['quantity_used'];
            if ($newQuantity < 0) {
                throw new \Exception('材料库存不足');
            }

            $material->quantity = $newQuantity;
            $material->save();

            Database::commit();

            return $usage->withDetails();
        } catch (\Exception $e) {
            Database::rollBack();
            throw $e;
        }
    }

    private function validateData(array $data): void
    {
        if (empty($data['activity_id'])) {
            throw new \Exception('活动ID不能为空');
        }
        if (empty($data['material_id'])) {
            throw new \Exception('材料ID不能为空');
        }
        if (empty($data['quantity_used']) || $data['quantity_used'] <= 0) {
            throw new \Exception('消耗数量必须大于0');
        }
    }
}
