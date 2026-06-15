<?php

namespace StoryRoom\Services;

use StoryRoom\Models\Material;
use StoryRoom\Models\ActivityMaterial;
use StoryRoom\Models\MaterialUsage;
use StoryRoom\Models\Activity;
use StoryRoom\Core\Database;

class MaterialService
{
    public function listMaterials(int $page = 1, int $pageSize = 10): array
    {
        $result = Material::paginate($page, $pageSize);
        return [
            'items' => array_map(fn($m) => $m->toArray(), $result['items']),
            'total' => $result['total'],
            'page' => $result['page'],
            'page_size' => $result['page_size'],
        ];
    }

    public function getMaterialById(int $id): ?array
    {
        $material = Material::find($id);
        return $material ? $material->toArray() : null;
    }

    public function createMaterial(array $data): array
    {
        $this->validateMaterialData($data);

        $material = new Material();
        $material->name = $data['name'];
        $material->unit = $data['unit'];
        $material->quantity = $data['quantity'] ?? 0;
        $material->description = $data['description'] ?? null;
        $material->save();

        return $material->toArray();
    }

    public function updateMaterial(int $id, array $data): array
    {
        $material = Material::find($id);
        if (!$material) {
            throw new \Exception('材料不存在');
        }

        if (isset($data['name'])) {
            $material->name = $data['name'];
        }
        if (isset($data['unit'])) {
            $material->unit = $data['unit'];
        }
        if (isset($data['quantity'])) {
            $material->quantity = $data['quantity'];
        }
        if (array_key_exists('description', $data)) {
            $material->description = $data['description'];
        }

        $material->save();

        return $material->toArray();
    }

    public function deleteMaterial(int $id): bool
    {
        $material = Material::find($id);
        if (!$material) {
            throw new \Exception('材料不存在');
        }

        return $material->delete();
    }

    private function validateMaterialData(array $data): void
    {
        if (empty($data['name'])) {
            throw new \Exception('材料名称不能为空');
        }
        if (empty($data['unit'])) {
            throw new \Exception('材料单位不能为空');
        }
        if (isset($data['quantity']) && $data['quantity'] < 0) {
            throw new \Exception('材料数量不能为负数');
        }
    }
}
