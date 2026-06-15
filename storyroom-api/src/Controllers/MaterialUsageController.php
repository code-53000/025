<?php

namespace StoryRoom\Controllers;

use StoryRoom\Core\Request;
use StoryRoom\Core\Response;
use StoryRoom\Services\MaterialUsageService;

class MaterialUsageController extends Controller
{
    private MaterialUsageService $materialUsageService;

    public function __construct()
    {
        $this->materialUsageService = new MaterialUsageService();
    }

    public function index(Request $request): Response
    {
        [$page, $pageSize] = $this->getPaginationParams($request);
        $activityId = $request->get('activity_id');
        $result = $this->materialUsageService->list(
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
            $usage = $this->materialUsageService->create($data);
            return $this->success($usage, '记录成功', 201);
        } catch (\Exception $e) {
            return $this->error($e->getMessage());
        }
    }

    public function getByActivity(Request $request, int $activityId): Response
    {
        try {
            $usages = $this->materialUsageService->getByActivity($activityId);
            return $this->success($usages);
        } catch (\Exception $e) {
            return $this->error($e->getMessage());
        }
    }
}
