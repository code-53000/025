<?php

namespace StoryRoom\Services;

use StoryRoom\Core\Database;
use StoryRoom\Models\Child;
use StoryRoom\Models\ParentUser;
use StoryRoom\Models\Registration;

class ChildService
{
    public function list(int $page = 1, int $pageSize = 10, ?int $parentId = null): array
    {
        if ($parentId) {
            $result = Child::paginateByParent($parentId, $page, $pageSize);
        } else {
            $result = Child::paginate($page, $pageSize);
        }

        $items = array_map(fn($child) => $this->enrichChild($child), $result['items']);

        return [
            'items' => $items,
            'total' => $result['total'],
            'page' => $result['page'],
            'page_size' => $result['page_size'],
        ];
    }

    public function getById(int $id): ?array
    {
        $child = Child::find($id);
        return $child ? $this->enrichChild($child) : null;
    }

    public function create(array $data): array
    {
        $this->validateChildData($data);

        $parent = ParentUser::find($data['parent_id']);
        if (!$parent) {
            throw new \Exception('家长用户不存在');
        }

        $child = new Child();
        $child->parent_id = $data['parent_id'];
        $child->name = $data['name'];
        $child->gender = $data['gender'] ?? 'unknown';
        $child->birthday = $data['birthday'];
        $child->avatar = $data['avatar'] ?? null;
        $child->notes = $data['notes'] ?? null;
        $child->save();

        return $this->enrichChild($child);
    }

    public function update(int $id, array $data): array
    {
        $child = Child::find($id);
        if (!$child) {
            throw new \Exception('孩子档案不存在');
        }

        if (isset($data['name'])) {
            $child->name = $data['name'];
        }
        if (isset($data['gender'])) {
            $child->gender = $data['gender'];
        }
        if (isset($data['birthday'])) {
            $this->validateBirthday($data['birthday']);
            $child->birthday = $data['birthday'];
        }
        if (array_key_exists('avatar', $data)) {
            $child->avatar = $data['avatar'];
        }
        if (array_key_exists('notes', $data)) {
            $child->notes = $data['notes'];
        }

        $child->save();

        return $this->enrichChild($child);
    }

    public function delete(int $id): bool
    {
        $child = Child::find($id);
        if (!$child) {
            throw new \Exception('孩子档案不存在');
        }

        Database::beginTransaction();

        try {
            $registrations = Registration::where(['child_id' => $id]);
            $activityIdsToPromote = [];
            $activityIdsToReorder = [];

            foreach ($registrations as $registration) {
                if ($registration->status === 'registered') {
                    $activityIdsToPromote[$registration->activity_id] = true;
                } elseif ($registration->status === 'waitlisted') {
                    $activityIdsToReorder[$registration->activity_id] = true;
                }
            }

            $child->delete();

            $registrationService = new RegistrationService();
            foreach (array_keys($activityIdsToPromote) as $activityId) {
                $registrationService->promoteWaitlisted($activityId);
            }

            foreach (array_keys($activityIdsToReorder) as $activityId) {
                if (!isset($activityIdsToPromote[$activityId])) {
                    $registrationService->reorderWaitlist($activityId);
                }
            }

            Database::commit();

            return true;
        } catch (\Exception $e) {
            Database::rollBack();
            throw $e;
        }
    }

    public function getByParent(int $parentId): array
    {
        $children = Child::findByParent($parentId);
        return array_map(fn($child) => $this->enrichChild($child), $children);
    }

    private function validateChildData(array $data): void
    {
        if (empty($data['parent_id'])) {
            throw new \Exception('家长ID不能为空');
        }
        if (empty($data['name'])) {
            throw new \Exception('孩子姓名不能为空');
        }
        if (empty($data['birthday'])) {
            throw new \Exception('孩子生日不能为空');
        }
        $this->validateBirthday($data['birthday']);
    }

    private function validateBirthday(string $birthday): void
    {
        $date = \DateTime::createFromFormat('Y-m-d', $birthday);
        if (!$date || $date->format('Y-m-d') !== $birthday) {
            throw new \Exception('生日格式不正确，应为YYYY-MM-DD');
        }
        if ($date > new \DateTime()) {
            throw new \Exception('生日不能是未来日期');
        }
    }

    private function enrichChild(Child $child): array
    {
        $data = $child->toArray();
        $data['age'] = $child->getAge();
        return $data;
    }
}
