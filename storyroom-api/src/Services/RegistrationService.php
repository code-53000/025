<?php

namespace StoryRoom\Services;

use StoryRoom\Core\Database;
use StoryRoom\Models\Activity;
use StoryRoom\Models\Child;
use StoryRoom\Models\AgeGroup;
use StoryRoom\Models\Registration;
use StoryRoom\Models\Attendance;

class RegistrationService
{
    public function list(int $page = 1, int $pageSize = 10, ?int $activityId = null, ?int $childId = null, ?string $status = null): array
    {
        $conditions = [];
        if ($activityId) {
            $conditions['activity_id'] = $activityId;
        }
        if ($childId) {
            $conditions['child_id'] = $childId;
        }
        if ($status) {
            $conditions['status'] = $status;
        }

        $result = Registration::paginate($page, $pageSize, $conditions);
        $items = array_map(fn($reg) => $reg->withDetails(), $result['items']);

        return [
            'items' => $items,
            'total' => $result['total'],
            'page' => $result['page'],
            'page_size' => $result['page_size'],
        ];
    }

    public function getByActivity(int $activityId): array
    {
        $registrations = Registration::where(['activity_id' => $activityId]);
        return array_map(fn($reg) => $reg->withDetails(), $registrations);
    }

    public function register(array $data): array
    {
        $this->validateRegistrationData($data);

        $activity = Activity::find($data['activity_id']);
        if (!$activity) {
            throw new \Exception('活动不存在');
        }

        if ($activity->status !== 'published') {
            throw new \Exception('活动未发布，不能报名');
        }

        $child = Child::find($data['child_id']);
        if (!$child) {
            throw new \Exception('孩子档案不存在');
        }

        $existing = Registration::findByActivityAndChild($data['activity_id'], $data['child_id']);
        if ($existing && $existing->status !== 'canceled') {
            throw new \Exception('该孩子已报名此活动');
        }

        $this->validateAge($child, $activity);

        Database::beginTransaction();

        try {
            $registeredCount = $activity->getRegisteredCount();

            $registration = $existing && $existing->status === 'canceled' ? $existing : new Registration();
            $registration->activity_id = $data['activity_id'];
            $registration->child_id = $data['child_id'];
            $registration->parent_id = $child->parent_id;

            if ($registeredCount < $activity->max_participants) {
                $registration->status = 'registered';
                $registration->waitlist_position = null;
            } else {
                $registration->status = 'waitlisted';
                $registration->waitlist_position = Registration::getNextWaitlistPosition($data['activity_id']);
            }

            $registration->canceled_at = null;
            $registration->save();

            if ($registration->status === 'registered') {
                $this->createAttendanceRecord($registration);
            }

            Database::commit();

            return $registration->withDetails();
        } catch (\Exception $e) {
            Database::rollBack();
            throw $e;
        }
    }

    public function cancel(int $id): bool
    {
        $registration = Registration::find($id);
        if (!$registration) {
            throw new \Exception('报名记录不存在');
        }

        if ($registration->status === 'canceled') {
            throw new \Exception('报名已取消');
        }

        Database::beginTransaction();

        try {
            $wasRegistered = $registration->status === 'registered';
            $activityId = $registration->activity_id;

            $registration->status = 'canceled';
            $registration->canceled_at = date('Y-m-d H:i:s');
            $registration->waitlist_position = null;
            $registration->save();

            if ($wasRegistered) {
                $this->promoteWaitlisted($activityId);
                $this->removeAttendance($activityId, $registration->child_id);
            } else {
                $this->reorderWaitlist($activityId);
            }

            Database::commit();

            return true;
        } catch (\Exception $e) {
            Database::rollBack();
            throw $e;
        }
    }

    private function validateRegistrationData(array $data): void
    {
        if (empty($data['activity_id'])) {
            throw new \Exception('活动ID不能为空');
        }
        if (empty($data['child_id'])) {
            throw new \Exception('孩子ID不能为空');
        }
    }

    private function validateAge(Child $child, Activity $activity): void
    {
        $ageGroup = AgeGroup::find($activity->age_group_id);
        if (!$ageGroup) {
            return;
        }

        $childAge = $child->getAge();

        if ($childAge < $ageGroup->min_age || $childAge > $ageGroup->max_age) {
            throw new \Exception("孩子年龄不符合要求，适合年龄为{$ageGroup->min_age}-{$ageGroup->max_age}岁");
        }
    }

    private function createAttendanceRecord(Registration $registration): void
    {
        $attendance = new Attendance();
        $attendance->activity_id = $registration->activity_id;
        $attendance->child_id = $registration->child_id;
        $attendance->registration_id = $registration->id;
        $attendance->status = 'absent';
        $attendance->save();
    }

    private function removeAttendance(int $activityId, int $childId): void
    {
        $attendance = Attendance::findByActivityAndChild($activityId, $childId);
        if ($attendance) {
            $attendance->delete();
        }
    }

    public function promoteWaitlisted(int $activityId): void
    {
        $firstWaitlisted = Registration::getFirstWaitlisted($activityId);
        if ($firstWaitlisted) {
            $firstWaitlisted->status = 'registered';
            $firstWaitlisted->waitlist_position = null;
            $firstWaitlisted->save();

            $this->createAttendanceRecord($firstWaitlisted);

            $this->reorderWaitlist($activityId);
        }
    }

    public function reorderWaitlist(int $activityId): void
    {
        $table = Registration::getTableName();
        $sql = "SELECT id FROM $table WHERE activity_id = ? AND status = 'waitlisted' ORDER BY waitlist_position ASC";
        $stmt = Database::getConnection()->prepare($sql);
        $stmt->execute([$activityId]);
        $ids = $stmt->fetchAll(\PDO::FETCH_COLUMN);

        $position = 1;
        foreach ($ids as $id) {
            $updateSql = "UPDATE $table SET waitlist_position = ? WHERE id = ?";
            $updateStmt = Database::getConnection()->prepare($updateSql);
            $updateStmt->execute([$position, $id]);
            $position++;
        }
    }
}
