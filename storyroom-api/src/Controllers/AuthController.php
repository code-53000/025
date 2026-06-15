<?php

namespace StoryRoom\Controllers;

use StoryRoom\Core\Request;
use StoryRoom\Core\Response;
use StoryRoom\Services\AuthService;

class AuthController extends Controller
{
    private AuthService $authService;

    public function __construct()
    {
        $this->authService = new AuthService();
    }

    public function login(Request $request): Response
    {
        try {
            $username = $request->getBodyParam('username');
            $password = $request->getBodyParam('password');
            $result = $this->authService->login($username, $password);
            return $this->success($result, '登录成功');
        } catch (\Exception $e) {
            return $this->error($e->getMessage());
        }
    }
}
