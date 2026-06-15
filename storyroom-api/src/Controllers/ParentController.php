<?php

namespace StoryRoom\Controllers;

use StoryRoom\Core\Request;
use StoryRoom\Core\Response;
use StoryRoom\Services\ParentService;

class ParentController extends Controller
{
    private ParentService $parentService;

    public function __construct()
    {
        $this->parentService = new ParentService();
    }

    public function index(Request $request): Response
    {
        [$page, $pageSize] = $this->getPaginationParams($request);
        $result = $this->parentService->list($page, $pageSize);
        return $this->paginated($result);
    }

    public function show(Request $request, int $id): Response
    {
        $parent = $this->parentService->getById($id);
        if (!$parent) {
            return $this->error('家长用户不存在', 404);
        }
        return $this->success($parent);
    }

    public function store(Request $request): Response
    {
        try {
            $data = $request->getBodyParams();
            $parent = $this->parentService->create($data);
            return $this->success($parent, '创建成功', 201);
        } catch (\Exception $e) {
            return $this->error($e->getMessage());
        }
    }

    public function update(Request $request, int $id): Response
    {
        try {
            $data = $request->getBodyParams();
            $parent = $this->parentService->update($id, $data);
            return $this->success($parent, '更新成功');
        } catch (\Exception $e) {
            return $this->error($e->getMessage());
        }
    }

    public function destroy(Request $request, int $id): Response
    {
        try {
            $this->parentService->delete($id);
            return $this->success(null, '删除成功');
        } catch (\Exception $e) {
            return $this->error($e->getMessage());
        }
    }
}
