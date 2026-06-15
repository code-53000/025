<?php

namespace StoryRoom\Controllers;

use StoryRoom\Core\Request;
use StoryRoom\Core\Response;
use StoryRoom\Models\ActivityType;

class ActivityTypeController extends Controller
{
    public function index(Request $request): Response
    {
        $types = ActivityType::all();
        $data = array_map(fn($type) => $type->toArray(), $types);
        return $this->success($data);
    }
}
