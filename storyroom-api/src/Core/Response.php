<?php

namespace StoryRoom\Core;

class Response
{
    private int $statusCode;
    private array $data;
    private array $headers;

    public function __construct(int $statusCode = 200, array $data = [], array $headers = [])
    {
        $this->statusCode = $statusCode;
        $this->data = $data;
        $this->headers = $headers;
    }

    public static function success($data = null, string $message = 'success', int $code = 200): self
    {
        return new self($code, [
            'code' => $code,
            'message' => $message,
            'data' => $data,
        ]);
    }

    public static function error(string $message, int $code = 400, $data = null): self
    {
        return new self($code, [
            'code' => $code,
            'message' => $message,
            'data' => $data,
        ]);
    }

    public static function paginated(array $items, int $total, int $page, int $pageSize): self
    {
        return self::success([
            'items' => $items,
            'pagination' => [
                'total' => $total,
                'page' => $page,
                'page_size' => $pageSize,
                'total_pages' => ceil($total / $pageSize),
            ],
        ]);
    }

    public function setStatusCode(int $statusCode): self
    {
        $this->statusCode = $statusCode;
        return $this;
    }

    public function addHeader(string $key, string $value): self
    {
        $this->headers[$key] = $value;
        return $this;
    }

    public function send(): void
    {
        http_response_code($this->statusCode);
        foreach ($this->headers as $key => $value) {
            header("$key: $value");
        }
        echo json_encode($this->data, JSON_UNESCAPED_UNICODE);
    }
}
