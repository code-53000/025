<?php

namespace StoryRoom\Controllers;

use StoryRoom\Core\Request;
use StoryRoom\Core\Response;
use StoryRoom\Models\AgeGroup;

class AgeGroupController extends Controller
{
    public function index(Request $request): Response
    {
        $groups = AgeGroup::all();
        $data = array_map(fn($group) => $group->toArray(), $groups);
        return $this->success($data);
    }
}
