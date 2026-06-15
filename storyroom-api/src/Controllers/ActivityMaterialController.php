<?php

namespace StoryRoom\Controllers;

use StoryRoom\Core\Request;
use StoryRoom\Core\Response;
use StoryRoom\Services\ActivityMaterialService;

class ActivityMaterialController extends Controller
{
    private ActivityMaterialService $activityMaterialService;

    public function __construct()
    {
        $this->activityMaterialService = new ActivityMaterialService();
    }

    public function index(Request $request): Response
    {
        [$page, $pageSize] = $this->getPaginationParams($request);
        $activityId = $request->get('activity_id');
        $result = $this->activityMaterialService->list(
            $page,
            $pageSize,
            $activityId ? (int)$activityId : null
        );
        return $this->paginated($result);
    }

    public function store(Request $request): Response
    {
        try {
            $data = $request->getBodyParams();
            $activityMaterial = $this->activityMaterialService->create($data);
            return $this->success($activityMaterial, '添加成功', 201);
        } catch (\Exception $e) {
            return $this->error($e->getMessage());
        }
    }

    public function update(Request $request, int $id): Response
    {
        try {
            $data = $request->getBodyParams();
            $activityMaterial = $this->activityMaterialService->update($id, $data);
            return $this->success($activityMaterial, '更新成功');
        } catch (\Exception $e) {
            return $this->error($e->getMessage());
        }
    }

    public function destroy(Request $request, int $id): Response
    {
        try {
            $this->activityMaterialService->delete($id);
            return $this->success(null, '删除成功');
        } catch (\Exception $e) {
            return $this->error($e->getMessage());
        }
    }
}
