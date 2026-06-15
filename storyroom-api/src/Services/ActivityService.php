<?php

namespace StoryRoom\Services;

use StoryRoom\Models\Activity;
use StoryRoom\Models\ActivityType;
use StoryRoom\Models\AgeGroup;
use StoryRoom\Models\Staff;

class ActivityService
{
    public function list(int $page = 1, int $pageSize = 10, ?string $status = null, ?int $typeId = null): array
    {
        $conditions = [];
        if ($status) {
            $conditions['status'] = $status;
        }
        if ($typeId) {
            $conditions['activity_type_id'] = $typeId;
        }

        $result = Activity::paginate($page, $pageSize, $conditions);
        $items = array_map(fn($activity) => $activity->withDetails(), $result['items']);

        return [
            'items' => $items,
            'total' => $result['total'],
            'page' => $result['page'],
            'page_size' => $result['page_size'],
        ];
    }

    public function getById(int $id): ?array
    {
        $activity = Activity::find($id);
        return $activity ? $activity->withDetails() : null;
    }

    public function create(array $data): array
    {
        $this->validateActivityData($data);

        $activity = new Activity();
        $activity->title = $data['title'];
        $activity->activity_type_id = $data['activity_type_id'];
        $activity->age_group_id = $data['age_group_id'];
        $activity->teacher = $data['teacher'];
        $activity->location = $data['location'];
        $activity->start_time = $data['start_time'];
        $activity->end_time = $data['end_time'];
        $activity->max_participants = $data['max_participants'];
        $activity->material_description = $data['material_description'] ?? null;
        $activity->description = $data['description'] ?? null;
        $activity->status = $data['status'] ?? 'draft';
        $activity->staff_id = $data['staff_id'] ?? 1;
        $activity->save();

        return $activity->withDetails();
    }

    public function update(int $id, array $data): array
    {
        $activity = Activity::find($id);
        if (!$activity) {
            throw new \Exception('活动不存在');
        }

        if ($activity->status === 'completed') {
            throw new \Exception('已完成的活动不能修改');
        }

        if (isset($data['title'])) {
            $activity->title = $data['title'];
        }
        if (isset($data['activity_type_id'])) {
            $activity->activity_type_id = $data['activity_type_id'];
        }
        if (isset($data['age_group_id'])) {
            $activity->age_group_id = $data['age_group_id'];
        }
        if (isset($data['teacher'])) {
            $activity->teacher = $data['teacher'];
        }
        if (isset($data['location'])) {
            $activity->location = $data['location'];
        }
        if (isset($data['start_time'])) {
            $activity->start_time = $data['start_time'];
        }
        if (isset($data['end_time'])) {
            $activity->end_time = $data['end_time'];
        }
        if (isset($data['max_participants'])) {
            $activity->max_participants = $data['max_participants'];
        }
        if (array_key_exists('material_description', $data)) {
            $activity->material_description = $data['material_description'];
        }
        if (array_key_exists('description', $data)) {
            $activity->description = $data['description'];
        }
        if (isset($data['status'])) {
            $activity->status = $data['status'];
        }

        if (isset($data['start_time']) || isset($data['end_time'])) {
            $start = $activity->start_time;
            $end = $activity->end_time;
            $this->validateTimeRange($start, $end);
        }

        $activity->save();

        return $activity->withDetails();
    }

    public function delete(int $id): bool
    {
        $activity = Activity::find($id);
        if (!$activity) {
            throw new \Exception('活动不存在');
        }

        if ($activity->status !== 'draft') {
            throw new \Exception('只能删除草稿状态的活动');
        }

        return $activity->delete();
    }

    public function publish(int $id): array
    {
        $activity = Activity::find($id);
        if (!$activity) {
            throw new \Exception('活动不存在');
        }

        if ($activity->status !== 'draft') {
            throw new \Exception('只能发布草稿状态的活动');
        }

        $activity->status = 'published';
        $activity->save();

        return $activity->withDetails();
    }

    private function validateActivityData(array $data): void
    {
        if (empty($data['title'])) {
            throw new \Exception('活动标题不能为空');
        }
        if (empty($data['activity_type_id'])) {
            throw new \Exception('活动类型不能为空');
        }
        if (empty($data['age_group_id'])) {
            throw new \Exception('适合年龄段不能为空');
        }
        if (empty($data['teacher'])) {
            throw new \Exception('老师不能为空');
        }
        if (empty($data['location'])) {
            throw new \Exception('活动地点不能为空');
        }
        if (empty($data['start_time']) || empty($data['end_time'])) {
            throw new \Exception('活动时间不能为空');
        }
        if (empty($data['max_participants'])) {
            throw new \Exception('人数上限不能为空');
        }
        if ($data['max_participants'] <= 0) {
            throw new \Exception('人数上限必须大于0');
        }

        $activityType = ActivityType::find($data['activity_type_id']);
        if (!$activityType) {
            throw new \Exception('活动类型不存在');
        }

        $ageGroup = AgeGroup::find($data['age_group_id']);
        if (!$ageGroup) {
            throw new \Exception('年龄段不存在');
        }

        if (!empty($data['staff_id'])) {
            $staff = Staff::find($data['staff_id']);
            if (!$staff) {
                throw new \Exception('馆员不存在');
            }
        }

        $this->validateTimeRange($data['start_time'], $data['end_time']);
    }

    private function validateTimeRange(string $startTime, string $endTime): void
    {
        $start = \DateTime::createFromFormat('Y-m-d H:i:s', $startTime);
        $end = \DateTime::createFromFormat('Y-m-d H:i:s', $endTime);

        if (!$start || !$end) {
            throw new \Exception('时间格式不正确，应为YYYY-MM-DD HH:MM:SS');
        }

        if ($start >= $end) {
            throw new \Exception('结束时间必须晚于开始时间');
        }
    }
}
