<?php

namespace StoryRoom\Models;

use StoryRoom\Core\Database;
use PDO;

class Child extends Model
{
    protected static string $table = 'children';
    protected array $fillable = ['parent_id', 'name', 'gender', 'birthday', 'avatar', 'notes'];

    public function getAge(): int
    {
        $birthday = new \DateTime($this->attributes['birthday'] ?? 'now');
        $now = new \DateTime();
        return $now->diff($birthday)->y;
    }

    public function parent(): ?ParentUser
    {
        return ParentUser::find($this->attributes['parent_id']);
    }

    public static function findByParent(int $parentId): array
    {
        return self::where(['parent_id' => $parentId]);
    }

    public static function paginateByParent(int $parentId, int $page = 1, int $pageSize = 10): array
    {
        return self::paginate($page, $pageSize, ['parent_id' => $parentId]);
    }
}
