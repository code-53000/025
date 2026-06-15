<?php

namespace StoryRoom\Controllers;

use StoryRoom\Core\Request;
use StoryRoom\Core\Response;
use StoryRoom\Services\MaterialService;

class MaterialController extends Controller
{
    private MaterialService $materialService;

    public function __construct()
    {
        $this->materialService = new MaterialService();
    }

    public function index(Request $request): Response
    {
        [$page, $pageSize] = $this->getPaginationParams($request);
        $result = $this->materialService->listMaterials($page, $pageSize);
        return $this->paginated($result);
    }

    public function show(Request $request, int $id): Response
    {
        $material = $this->materialService->getMaterialById($id);
        if (!$material) {
            return $this->error('材料不存在', 404);
        }
        return $this->success($material);
    }

    public function store(Request $request): Response
    {
        try {
            $data = $request->getBodyParams();
            $material = $this->materialService->createMaterial($data);
            return $this->success($material, '创建成功', 201);
        } catch (\Exception $e) {
            return $this->error($e->getMessage());
        }
    }

    public function update(Request $request, int $id): Response
    {
        try {
            $data = $request->getBodyParams();
            $material = $this->materialService->updateMaterial($id, $data);
            return $this->success($material, '更新成功');
        } catch (\Exception $e) {
            return $this->error($e->getMessage());
        }
    }

    public function destroy(Request $request, int $id): Response
    {
        try {
            $this->materialService->deleteMaterial($id);
            return $this->success(null, '删除成功');
        } catch (\Exception $e) {
            return $this->error($e->getMessage());
        }
    }
}
