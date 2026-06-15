<?php

namespace StoryRoom\Services;

use StoryRoom\Models\Activity;
use StoryRoom\Models\Child;
use StoryRoom\Models\Registration;
use StoryRoom\Models\Feedback;

class FeedbackService
{
    public function list(int $page = 1, int $pageSize = 10, ?int $activityId = null, ?int $childId = null): array
    {
        $conditions = [];
        if ($activityId) {
            $conditions['activity_id'] = $activityId;
        }
        if ($childId) {
            $conditions['child_id'] = $childId;
        }

        $result = Feedback::paginate($page, $pageSize, $conditions);
        $items = array_map(fn($fb) => $fb->withDetails(), $result['items']);

        return [
            'items' => $items,
            'total' => $result['total'],
            'page' => $result['page'],
            'page_size' => $result['page_size'],
        ];
    }

    public function getByActivity(int $activityId): array
    {
        $feedbacks = Feedback::getByActivity($activityId);
        return array_map(fn($fb) => $fb->withDetails(), $feedbacks);
    }

    public function create(array $data): array
    {
        $this->validateFeedbackData($data);

        $activity = Activity::find($data['activity_id']);
        if (!$activity) {
            throw new \Exception('活动不存在');
        }

        $child = Child::find($data['child_id']);
        if (!$child) {
            throw new \Exception('孩子档案不存在');
        }

        $registration = Registration::findByActivityAndChild($data['activity_id'], $data['child_id']);
        if (!$registration || $registration->status === 'canceled') {
            throw new \Exception('该孩子未参加此活动');
        }

        $feedback = new Feedback();
        $feedback->activity_id = $data['activity_id'];
        $feedback->child_id = $data['child_id'];
        $feedback->parent_id = $child->parent_id;
        $feedback->content = $data['content'];
        $feedback->rating = $data['rating'] ?? null;
        $feedback->save();

        return $feedback->withDetails();
    }

    private function validateFeedbackData(array $data): void
    {
        if (empty($data['activity_id'])) {
            throw new \Exception('活动ID不能为空');
        }
        if (empty($data['child_id'])) {
            throw new \Exception('孩子ID不能为空');
        }
        if (empty($data['content'])) {
            throw new \Exception('反馈内容不能为空');
        }
        if (isset($data['rating']) && ($data['rating'] < 1 || $data['rating'] > 5)) {
            throw new \Exception('评分必须在1-5之间');
        }
    }
}
