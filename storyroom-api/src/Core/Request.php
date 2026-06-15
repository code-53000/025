<?php

namespace StoryRoom\Core;

class Request
{
    private string $method;
    private string $uri;
    private array $queryParams;
    private array $bodyParams;
    private array $headers;

    public function __construct(string $method, string $uri, array $queryParams, array $bodyParams, array $headers)
    {
        $this->method = $method;
        $this->uri = $uri;
        $this->queryParams = $queryParams;
        $this->bodyParams = $bodyParams;
        $this->headers = $headers;
    }

    public static function createFromGlobals(): self
    {
        $method = $_SERVER['REQUEST_METHOD'];
        $uri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
        $queryParams = $_GET;

        $bodyParams = [];
        if ($method !== 'GET') {
            $input = file_get_contents('php://input');
            if ($input) {
                $bodyParams = json_decode($input, true) ?: [];
            }
        }

        $headers = [];
        if (function_exists('getallheaders')) {
            $headers = getallheaders();
        } else {
            foreach ($_SERVER as $key => $value) {
                if (str_starts_with($key, 'HTTP_')) {
                    $header = str_replace(' ', '-', ucwords(strtolower(str_replace('_', ' ', substr($key, 5)))));
                    $headers[$header] = $value;
                }
            }
        }

        return new self($method, $uri, $queryParams, $bodyParams, $headers);
    }

    public function getMethod(): string
    {
        return $this->method;
    }

    public function getUri(): string
    {
        return $this->uri;
    }

    public function get(string $key, $default = null)
    {
        return $this->queryParams[$key] ?? $default;
    }

    public function getQueryParams(): array
    {
        return $this->queryParams;
    }

    public function getBodyParam(string $key, $default = null)
    {
        return $this->bodyParams[$key] ?? $default;
    }

    public function getBodyParams(): array
    {
        return $this->bodyParams;
    }

    public function getHeader(string $key, $default = null)
    {
        return $this->headers[$key] ?? $this->headers[ucwords($key, '-')] ?? $default;
    }

    public function getHeaders(): array
    {
        return $this->headers;
    }
}
