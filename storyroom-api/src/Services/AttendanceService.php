<?php

namespace StoryRoom\Services;

use StoryRoom\Models\Activity;
use StoryRoom\Models\Child;
use StoryRoom\Models\Registration;
use StoryRoom\Models\Attendance;
use StoryRoom\Core\Database;

class AttendanceService
{
    public function list(int $page = 1, int $pageSize = 10, ?int $activityId = null, ?string $status = null): array
    {
        $conditions = [];
        if ($activityId) {
            $conditions['activity_id'] = $activityId;
        }
        if ($status) {
            $conditions['status'] = $status;
        }

        $result = Attendance::paginate($page, $pageSize, $conditions);
        $items = array_map(fn($att) => $att->withDetails(), $result['items']);

        return [
            'items' => $items,
            'total' => $result['total'],
            'page' => $result['page'],
            'page_size' => $result['page_size'],
        ];
    }

    public function getByActivity(int $activityId): array
    {
        $attendances = Attendance::getByActivity($activityId);
        return array_map(fn($att) => $att->withDetails(), $attendances);
    }

    public function sign(array $data): array
    {
        $this->validateSignData($data);

        $activity = Activity::find($data['activity_id']);
        if (!$activity) {
            throw new \Exception('活动不存在');
        }

        $child = Child::find($data['child_id']);
        if (!$child) {
            throw new \Exception('孩子档案不存在');
        }

        $registration = Registration::findByActivityAndChild($data['activity_id'], $data['child_id']);
        if (!$registration || $registration->status !== 'registered') {
            throw new \Exception('该孩子未报名此活动');
        }

        $attendance = Attendance::findByActivityAndChild($data['activity_id'], $data['child_id']);

        if (!$attendance) {
            $attendance = new Attendance();
            $attendance->activity_id = $data['activity_id'];
            $attendance->child_id = $data['child_id'];
            $attendance->registration_id = $registration->id;
        }

        $attendance->status = 'signed';
        $attendance->sign_time = date('Y-m-d H:i:s');
        $attendance->staff_id = $data['staff_id'] ?? null;
        $attendance->save();

        return $attendance->withDetails();
    }

    public function leave(array $data): array
    {
        $this->validateLeaveData($data);

        Database::beginTransaction();

        try {
            $activity = Activity::find($data['activity_id']);
            if (!$activity) {
                throw new \Exception('活动不存在');
            }

            $child = Child::find($data['child_id']);
            if (!$child) {
                throw new \Exception('孩子档案不存在');
            }

            $registration = Registration::findByActivityAndChild($data['activity_id'], $data['child_id']);
            if (!$registration || $registration->status !== 'registered') {
                throw new \Exception('该孩子未报名此活动');
            }

            $attendance = Attendance::findByActivityAndChild($data['activity_id'], $data['child_id']);

            if (!$attendance) {
                $attendance = new Attendance();
                $attendance->activity_id = $data['activity_id'];
                $attendance->child_id = $data['child_id'];
                $attendance->registration_id = $registration->id;
            }

            $attendance->status = 'leave';
            $attendance->leave_reason = $data['leave_reason'] ?? null;
            $attendance->staff_id = $data['staff_id'] ?? null;
            $attendance->save();

            $registration->status = 'canceled';
            $registration->canceled_at = date('Y-m-d H:i:s');
            $registration->waitlist_position = null;
            $registration->save();

            $registrationService = new RegistrationService();
            $registrationService->promoteWaitlisted($data['activity_id']);

            Database::commit();

            return $attendance->withDetails();
        } catch (\Exception $e) {
            Database::rollBack();
            throw $e;
        }
    }

    private function validateSignData(array $data): void
    {
        if (empty($data['activity_id'])) {
            throw new \Exception('活动ID不能为空');
        }
        if (empty($data['child_id'])) {
            throw new \Exception('孩子ID不能为空');
        }
    }

    private function validateLeaveData(array $data): void
    {
        if (empty($data['activity_id'])) {
            throw new \Exception('活动ID不能为空');
        }
        if (empty($data['child_id'])) {
            throw new \Exception('孩子ID不能为空');
        }
    }
}
