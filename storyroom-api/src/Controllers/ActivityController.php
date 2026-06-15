<?php

namespace StoryRoom\Controllers;

use StoryRoom\Core\Request;
use StoryRoom\Core\Response;
use StoryRoom\Services\ActivityService;

class ActivityController extends Controller
{
    private ActivityService $activityService;

    public function __construct()
    {
        $this->activityService = new ActivityService();
    }

    public function index(Request $request): Response
    {
        [$page, $pageSize] = $this->getPaginationParams($request);
        $status = $request->get('status');
        $typeId = $request->get('type_id');
        $result = $this->activityService->list(
            $page,
            $pageSize,
            $status,
            $typeId ? (int)$typeId : null
        );
        return $this->paginated($result);
    }

    public function show(Request $request, int $id): Response
    {
        $activity = $this->activityService->getById($id);
        if (!$activity) {
            return $this->error('活动不存在', 404);
        }
        return $this->success($activity);
    }

    public function store(Request $request): Response
    {
        try {
            $data = $request->getBodyParams();
            $activity = $this->activityService->create($data);
            return $this->success($activity, '创建成功', 201);
        } catch (\Exception $e) {
            return $this->error($e->getMessage());
        }
    }

    public function update(Request $request, int $id): Response
    {
        try {
            $data = $request->getBodyParams();
            $activity = $this->activityService->update($id, $data);
            return $this->success($activity, '更新成功');
        } catch (\Exception $e) {
            return $this->error($e->getMessage());
        }
    }

    public function destroy(Request $request, int $id): Response
    {
        try {
            $this->activityService->delete($id);
            return $this->success(null, '删除成功');
        } catch (\Exception $e) {
            return $this->error($e->getMessage());
        }
    }

    public function publish(Request $request, int $id): Response
    {
        try {
            $activity = $this->activityService->publish($id);
            return $this->success($activity, '发布成功');
        } catch (\Exception $e) {
            return $this->error($e->getMessage());
        }
    }
}
