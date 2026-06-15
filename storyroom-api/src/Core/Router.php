<?php

namespace StoryRoom\Core;

class Router
{
    private array $routes = [];

    public function __construct()
    {
        $this->registerRoutes();
    }

    private function registerRoutes(): void
    {
        $this->get('/api/activity-types', 'ActivityTypeController@index');
        $this->get('/api/age-groups', 'AgeGroupController@index');

        $this->get('/api/parents', 'ParentController@index');
        $this->get('/api/parents/{id}', 'ParentController@show');
        $this->post('/api/parents', 'ParentController@store');
        $this->put('/api/parents/{id}', 'ParentController@update');
        $this->delete('/api/parents/{id}', 'ParentController@destroy');

        $this->get('/api/children', 'ChildController@index');
        $this->get('/api/children/{id}', 'ChildController@show');
        $this->post('/api/children', 'ChildController@store');
        $this->put('/api/children/{id}', 'ChildController@update');
        $this->delete('/api/children/{id}', 'ChildController@destroy');

        $this->get('/api/activities', 'ActivityController@index');
        $this->get('/api/activities/{id}', 'ActivityController@show');
        $this->post('/api/activities', 'ActivityController@store');
        $this->put('/api/activities/{id}', 'ActivityController@update');
        $this->delete('/api/activities/{id}', 'ActivityController@destroy');
        $this->post('/api/activities/{id}/publish', 'ActivityController@publish');

        $this->get('/api/registrations', 'RegistrationController@index');
        $this->post('/api/registrations', 'RegistrationController@store');
        $this->delete('/api/registrations/{id}', 'RegistrationController@destroy');
        $this->get('/api/activities/{activityId}/registrations', 'RegistrationController@getByActivity');

        $this->get('/api/attendances', 'AttendanceController@index');
        $this->post('/api/attendances/sign', 'AttendanceController@sign');
        $this->post('/api/attendances/leave', 'AttendanceController@leave');
        $this->get('/api/activities/{activityId}/attendances', 'AttendanceController@getByActivity');

        $this->get('/api/feedbacks', 'FeedbackController@index');
        $this->post('/api/feedbacks', 'FeedbackController@store');
        $this->get('/api/activities/{activityId}/feedbacks', 'FeedbackController@getByActivity');

        $this->get('/api/materials', 'MaterialController@index');
        $this->get('/api/materials/{id}', 'MaterialController@show');
        $this->post('/api/materials', 'MaterialController@store');
        $this->put('/api/materials/{id}', 'MaterialController@update');
        $this->delete('/api/materials/{id}', 'MaterialController@destroy');

        $this->get('/api/activity-materials', 'ActivityMaterialController@index');
        $this->post('/api/activity-materials', 'ActivityMaterialController@store');
        $this->put('/api/activity-materials/{id}', 'ActivityMaterialController@update');
        $this->delete('/api/activity-materials/{id}', 'ActivityMaterialController@destroy');

        $this->get('/api/material-usage', 'MaterialUsageController@index');
        $this->post('/api/material-usage', 'MaterialUsageController@store');
        $this->get('/api/activities/{activityId}/material-usage', 'MaterialUsageController@getByActivity');

        $this->post('/api/auth/login', 'AuthController@login');
    }

    private function get(string $path, string $handler): void
    {
        $this->addRoute('GET', $path, $handler);
    }

    private function post(string $path, string $handler): void
    {
        $this->addRoute('POST', $path, $handler);
    }

    private function put(string $path, string $handler): void
    {
        $this->addRoute('PUT', $path, $handler);
    }

    private function delete(string $path, string $handler): void
    {
        $this->addRoute('DELETE', $path, $handler);
    }

    private function addRoute(string $method, string $path, string $handler): void
    {
        $this->routes[] = [
            'method' => $method,
            'path' => $path,
            'handler' => $handler,
        ];
    }

    public function dispatch(Request $request): Response
    {
        $method = $request->getMethod();
        $uri = $request->getUri();

        foreach ($this->routes as $route) {
            if ($route['method'] !== $method) {
                continue;
            }

            $params = $this->matchRoute($route['path'], $uri);
            if ($params !== false) {
                return $this->callHandler($route['handler'], $request, $params);
            }
        }

        return Response::error('未找到该接口', 404);
    }

    private function matchRoute(string $routePath, string $uri): bool|array
    {
        $routeParts = explode('/', trim($routePath, '/'));
        $uriParts = explode('/', trim($uri, '/'));

        if (count($routeParts) !== count($uriParts)) {
            return false;
        }

        $params = [];

        for ($i = 0; $i < count($routeParts); $i++) {
            if (str_starts_with($routeParts[$i], '{') && str_ends_with($routeParts[$i], '}')) {
                $paramName = trim($routeParts[$i], '{}');
                $params[$paramName] = $uriParts[$i];
            } elseif ($routeParts[$i] !== $uriParts[$i]) {
                return false;
            }
        }

        return $params;
    }

    private function callHandler(string $handler, Request $request, array $params): Response
    {
        [$controllerName, $methodName] = explode('@', $handler);

        $controllerClass = 'StoryRoom\\Controllers\\' . $controllerName;

        if (!class_exists($controllerClass)) {
            return Response::error('控制器不存在: ' . $controllerClass, 404);
        }

        $controller = new $controllerClass();

        if (!method_exists($controller, $methodName)) {
            return Response::error('方法不存在: ' . $methodName, 404);
        }

        return call_user_func([$controller, $methodName], $request, ...array_values($params));
    }
}
