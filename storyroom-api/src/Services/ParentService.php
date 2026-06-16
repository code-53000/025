<?php

namespace StoryRoom\Services;

use StoryRoom\Core\Database;
use StoryRoom\Models\ParentUser;
use StoryRoom\Models\Registration;

class ParentService
{
    public function list(int $page = 1, int $pageSize = 10): array
    {
        $result = ParentUser::paginate($page, $pageSize);
        $items = array_map(fn($parent) => $this->enrichParent($parent), $result['items']);

        return [
            'items' => $items,
            'total' => $result['total'],
            'page' => $result['page'],
            'page_size' => $result['page_size'],
        ];
    }

    public function getById(int $id): ?array
    {
        $parent = ParentUser::find($id);
        return $parent ? $this->enrichParent($parent) : null;
    }

    public function create(array $data): array
    {
        $this->validateParentData($data);

        $parent = new ParentUser();
        $parent->name = $data['name'];
        $parent->phone = $data['phone'];
        $parent->openid = $data['openid'] ?? null;
        $parent->avatar = $data['avatar'] ?? null;
        $parent->save();

        return $this->enrichParent($parent);
    }

    public function update(int $id, array $data): array
    {
        $parent = ParentUser::find($id);
        if (!$parent) {
            throw new \Exception('家长用户不存在');
        }

        if (isset($data['name'])) {
            $parent->name = $data['name'];
        }
        if (isset($data['phone'])) {
            $parent->phone = $data['phone'];
        }
        if (array_key_exists('avatar', $data)) {
            $parent->avatar = $data['avatar'];
        }

        $parent->save();

        return $this->enrichParent($parent);
    }

    public function delete(int $id): bool
    {
        $parent = ParentUser::find($id);
        if (!$parent) {
            throw new \Exception('家长用户不存在');
        }

        Database::beginTransaction();

        try {
            $children = $parent->children();
            $activityIdsToPromote = [];
            $activityIdsToReorder = [];

            foreach ($children as $child) {
                $registrations = Registration::where(['child_id' => $child->id]);
                foreach ($registrations as $registration) {
                    if ($registration->status === 'registered') {
                        $activityIdsToPromote[$registration->activity_id] = true;
                    } elseif ($registration->status === 'waitlisted') {
                        $activityIdsToReorder[$registration->activity_id] = true;
                    }
                }
            }

            $parent->delete();

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

    private function validateParentData(array $data): void
    {
        if (empty($data['name'])) {
            throw new \Exception('家长姓名不能为空');
        }
        if (empty($data['phone'])) {
            throw new \Exception('联系电话不能为空');
        }
    }

    private function enrichParent(ParentUser $parent): array
    {
        $data = $parent->toArray();
        unset($data['openid']);
        return $data;
    }
}
