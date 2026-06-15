<?php

namespace StoryRoom\Controllers;

use StoryRoom\Core\Request;
use StoryRoom\Core\Response;

class Controller
{
    protected function getPaginationParams(Request $request): array
    {
        $page = max(1, (int)$request->get('page', 1));
        $pageSize = min(100, max(1, (int)$request->get('page_size', 10)));
        return [$page, $pageSize];
    }

    protected function success($data = null, string $message = 'success'): Response
    {
        return Response::success($data, $message);
    }

    protected function error(string $message, int $code = 400): Response
    {
        return Response::error($message, $code);
    }

    protected function paginated(array $result): Response
    {
        return Response::paginated(
            $result['items'],
            $result['total'],
            $result['page'],
            $result['page_size']
        );
    }
}
