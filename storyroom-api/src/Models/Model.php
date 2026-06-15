<?php

namespace StoryRoom\Models;

use StoryRoom\Core\Database;
use PDO;

abstract class Model
{
    protected static string $table = '';
    protected string $primaryKey = 'id';
    protected array $fillable = [];
    protected array $attributes = [];

    public function __construct(array $attributes = [])
    {
        $this->attributes = $attributes;
    }

    public function __get(string $name)
    {
        return $this->attributes[$name] ?? null;
    }

    public function __set(string $name, $value): void
    {
        $this->attributes[$name] = $value;
    }

    public function toArray(): array
    {
        return $this->attributes;
    }

    public function getAttributes(): array
    {
        return $this->attributes;
    }

    public static function all(array $columns = ['*']): array
    {
        $table = static::$table;
        $cols = implode(', ', $columns);
        $sql = "SELECT $cols FROM $table ORDER BY id DESC";
        $stmt = Database::getConnection()->query($sql);
        $items = $stmt->fetchAll(PDO::FETCH_ASSOC);

        return array_map(fn($item) => new static($item), $items);
    }

    public static function find(int $id): ?static
    {
        $table = static::$table;
        $sql = "SELECT * FROM $table WHERE id = ?";
        $stmt = Database::getConnection()->prepare($sql);
        $stmt->execute([$id]);
        $data = $stmt->fetch(PDO::FETCH_ASSOC);

        return $data ? new static($data) : null;
    }

    public static function findBy(string $field, $value): ?static
    {
        $table = static::$table;
        $sql = "SELECT * FROM $table WHERE $field = ? LIMIT 1";
        $stmt = Database::getConnection()->prepare($sql);
        $stmt->execute([$value]);
        $data = $stmt->fetch(PDO::FETCH_ASSOC);

        return $data ? new static($data) : null;
    }

    public static function where(array $conditions): array
    {
        $table = static::$table;
        $whereParts = [];
        $params = [];

        foreach ($conditions as $key => $value) {
            $whereParts[] = "$key = ?";
            $params[] = $value;
        }

        $whereClause = implode(' AND ', $whereParts);
        $sql = "SELECT * FROM $table WHERE $whereClause ORDER BY id DESC";
        $stmt = Database::getConnection()->prepare($sql);
        $stmt->execute($params);
        $items = $stmt->fetchAll(PDO::FETCH_ASSOC);

        return array_map(fn($item) => new static($item), $items);
    }

    public static function paginate(int $page = 1, int $pageSize = 10, array $conditions = []): array
    {
        $table = static::$table;
        $offset = ($page - 1) * $pageSize;

        $whereClause = '';
        $params = [];
        if (!empty($conditions)) {
            $whereParts = [];
            foreach ($conditions as $key => $value) {
                $whereParts[] = "$key = ?";
                $params[] = $value;
            }
            $whereClause = 'WHERE ' . implode(' AND ', $whereParts);
        }

        $countSql = "SELECT COUNT(*) as total FROM $table $whereClause";
        $countStmt = Database::getConnection()->prepare($countSql);
        $countStmt->execute($params);
        $total = $countStmt->fetch(PDO::FETCH_ASSOC)['total'];

        $sql = "SELECT * FROM $table $whereClause ORDER BY id DESC LIMIT ? OFFSET ?";
        $stmt = Database::getConnection()->prepare($sql);
        $stmt->execute(array_merge($params, [$pageSize, $offset]));
        $items = $stmt->fetchAll(PDO::FETCH_ASSOC);

        return [
            'items' => array_map(fn($item) => new static($item), $items),
            'total' => $total,
            'page' => $page,
            'page_size' => $pageSize,
        ];
    }

    public function save(): bool
    {
        if (isset($this->attributes[$this->primaryKey]) && $this->attributes[$this->primaryKey]) {
            return $this->update();
        }
        return $this->create();
    }

    private function create(): bool
    {
        $table = static::$table;
        $fillableAttributes = array_intersect_key($this->attributes, array_flip($this->fillable));

        if (empty($fillableAttributes)) {
            return false;
        }

        $columns = array_keys($fillableAttributes);
        $placeholders = array_fill(0, count($columns), '?');
        $values = array_values($fillableAttributes);

        $sql = "INSERT INTO $table (" . implode(', ', $columns) . ") VALUES (" . implode(', ', $placeholders) . ")";
        $stmt = Database::getConnection()->prepare($sql);
        $result = $stmt->execute($values);

        if ($result) {
            $this->attributes[$this->primaryKey] = Database::lastInsertId();
            $this->refresh();
        }

        return $result;
    }

    private function update(): bool
    {
        $table = static::$table;
        $fillableAttributes = array_intersect_key($this->attributes, array_flip($this->fillable));

        if (empty($fillableAttributes)) {
            return false;
        }

        $setParts = [];
        $values = [];
        foreach ($fillableAttributes as $key => $value) {
            $setParts[] = "$key = ?";
            $values[] = $value;
        }
        $values[] = $this->attributes[$this->primaryKey];

        $sql = "UPDATE $table SET " . implode(', ', $setParts) . " WHERE $this->primaryKey = ?";
        $stmt = Database::getConnection()->prepare($sql);
        $result = $stmt->execute($values);

        if ($result) {
            $this->refresh();
        }

        return $result;
    }

    public function refresh(): void
    {
        $table = static::$table;
        $sql = "SELECT * FROM $table WHERE $this->primaryKey = ?";
        $stmt = Database::getConnection()->prepare($sql);
        $stmt->execute([$this->attributes[$this->primaryKey]]);
        $data = $stmt->fetch(PDO::FETCH_ASSOC);
        if ($data) {
            $this->attributes = $data;
        }
    }

    public function delete(): bool
    {
        $table = static::$table;
        if (!isset($this->attributes[$this->primaryKey])) {
            return false;
        }

        $sql = "DELETE FROM $table WHERE $this->primaryKey = ?";
        $stmt = Database::getConnection()->prepare($sql);
        return $stmt->execute([$this->attributes[$this->primaryKey]]);
    }

    public static function deleteById(int $id): bool
    {
        $table = static::$table;
        $sql = "DELETE FROM $table WHERE id = ?";
        $stmt = Database::getConnection()->prepare($sql);
        return $stmt->execute([$id]);
    }
}
