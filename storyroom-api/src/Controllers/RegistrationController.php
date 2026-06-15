<?php

namespace StoryRoom\Controllers;

use StoryRoom\Core\Request;
use StoryRoom\Core\Response;
use StoryRoom\Services\RegistrationService;

class RegistrationController extends Controller
{
    private RegistrationService $registrationService;

    public function __construct()
    {
        $this->registrationService = new RegistrationService();
    }

    public function index(Request $request): Response
    {
        [$page, $pageSize] = $this->getPaginationParams($request);
        $activityId = $request->get('activity_id');
        $childId = $request->get('child_id');
        $status = $request->get('status');
        $result = $this->registrationService->list(
            $page,
            $pageSize,
            $activityId ? (int)$activityId : null,
            $childId ? (int)$childId : null,
            $status
        );
        return $this->paginated($result);
    }

    public function store(Request $request): Response
    {
        try {
            $data = $request->getBodyParams();
            $registration = $this->registrationService->register($data);
            $message = $registration['status'] === 'waitlisted' ? '报名成功，已进入候补队列' : '报名成功';
            return $this->success($registration, $message, 201);
        } catch (\Exception $e) {
            return $this->error($e->getMessage());
        }
    }

    public function destroy(Request $request, int $id): Response
    {
        try {
            $this->registrationService->cancel($id);
            return $this->success(null, '取消报名成功');
        } catch (\Exception $e) {
            return $this->error($e->getMessage());
        }
    }

    public function getByActivity(Request $request, int $activityId): Response
    {
        try {
            $registrations = $this->registrationService->getByActivity($activityId);
            return $this->success($registrations);
        } catch (\Exception $e) {
            return $this->error($e->getMessage());
        }
    }
}
