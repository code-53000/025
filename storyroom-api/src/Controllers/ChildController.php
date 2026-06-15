<?php

namespace StoryRoom\Controllers;

use StoryRoom\Core\Request;
use StoryRoom\Core\Response;
use StoryRoom\Services\ChildService;

class ChildController extends Controller
{
    private ChildService $childService;

    public function __construct()
    {
        $this->childService = new ChildService();
    }

    public function index(Request $request): Response
    {
        [$page, $pageSize] = $this->getPaginationParams($request);
        $parentId = $request->get('parent_id');
        $result = $this->childService->list($page, $pageSize, $parentId ? (int)$parentId : null);
        return $this->paginated($result);
    }

    public function show(Request $request, int $id): Response
    {
        $child = $this->childService->getById($id);
        if (!$child) {
            return $this->error('孩子档案不存在', 404);
        }
        return $this->success($child);
    }

    public function store(Request $request): Response
    {
        try {
            $data = $request->getBodyParams();
            $child = $this->childService->create($data);
            return $this->success($child, '创建成功', 201);
        } catch (\Exception $e) {
            return $this->error($e->getMessage());
        }
    }

    public function update(Request $request, int $id): Response
    {
        try {
            $data = $request->getBodyParams();
            $child = $this->childService->update($id, $data);
            return $this->success($child, '更新成功');
        } catch (\Exception $e) {
            return $this->error($e->getMessage());
        }
    }

    public function destroy(Request $request, int $id): Response
    {
        try {
            $this->childService->delete($id);
            return $this->success(null, '删除成功');
        } catch (\Exception $e) {
            return $this->error($e->getMessage());
        }
    }
}
