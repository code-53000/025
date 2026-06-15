<?php

namespace StoryRoom\Controllers;

use StoryRoom\Core\Request;
use StoryRoom\Core\Response;
use StoryRoom\Services\AttendanceService;

class AttendanceController extends Controller
{
    private AttendanceService $attendanceService;

    public function __construct()
    {
        $this->attendanceService = new AttendanceService();
    }

    public function index(Request $request): Response
    {
        [$page, $pageSize] = $this->getPaginationParams($request);
        $activityId = $request->get('activity_id');
        $status = $request->get('status');
        $result = $this->attendanceService->list(
            $page,
            $pageSize,
            $activityId ? (int)$activityId : null,
            $status
        );
        return $this->paginated($result);
    }

    public function sign(Request $request): Response
    {
        try {
            $data = $request->getBodyParams();
            $attendance = $this->attendanceService->sign($data);
            return $this->success($attendance, '签到成功');
        } catch (\Exception $e) {
            return $this->error($e->getMessage());
        }
    }

    public function leave(Request $request): Response
    {
        try {
            $data = $request->getBodyParams();
            $attendance = $this->attendanceService->leave($data);
            return $this->success($attendance, '请假成功');
        } catch (\Exception $e) {
            return $this->error($e->getMessage());
        }
    }

    public function getByActivity(Request $request, int $activityId): Response
    {
        try {
            $attendances = $this->attendanceService->getByActivity($activityId);
            return $this->success($attendances);
        } catch (\Exception $e) {
            return $this->error($e->getMessage());
        }
    }
}
