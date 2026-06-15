<?php

namespace StoryRoom\Services;

use StoryRoom\Models\Staff;

class AuthService
{
    public function login(string $username, string $password): array
    {
        if (empty($username)) {
            throw new \Exception('用户名不能为空');
        }
        if (empty($password)) {
            throw new \Exception('密码不能为空');
        }

        $staff = Staff::findBy('username', $username);
        if (!$staff) {
            throw new \Exception('用户名或密码错误');
        }

        if (!$staff->verifyPassword($password)) {
            throw new \Exception('用户名或密码错误');
        }

        $token = base64_encode($staff->id . ':' . time() . ':' . bin2hex(random_bytes(16)));

        return [
            'token' => $token,
            'user' => [
                'id' => $staff->id,
                'username' => $staff->username,
                'name' => $staff->name,
                'role' => $staff->role,
            ],
        ];
    }
}
