<?php

namespace StoryRoom\Controllers;

use StoryRoom\Core\Request;
use StoryRoom\Core\Response;
use StoryRoom\Services\FeedbackService;

class FeedbackController extends Controller
{
    private FeedbackService $feedbackService;

    public function __construct()
    {
        $this->feedbackService = new FeedbackService();
    }

    public function index(Request $request): Response
    {
        [$page, $pageSize] = $this->getPaginationParams($request);
        $activityId = $request->get('activity_id');
        $childId = $request->get('child_id');
        $result = $this->feedbackService->list(
            $page,
            $pageSize,
            $activityId ? (int)$activityId : null,
            $childId ? (int)$childId : null
        );
        return $this->paginated($result);
    }

    public function store(Request $request): Response
    {
        try {
            $data = $request->getBodyParams();
            $feedback = $this->feedbackService->create($data);
            return $this->success($feedback, '反馈提交成功', 201);
        } catch (\Exception $e) {
            return $this->error($e->getMessage());
        }
    }

    public function getByActivity(Request $request, int $activityId): Response
    {
        try {
            $feedbacks = $this->feedbackService->getByActivity($activityId);
            return $this->success($feedbacks);
        } catch (\Exception $e) {
            return $this->error($e->getMessage());
        }
    }
}
