<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\ChartController;
use App\Http\Controllers\RoleController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\SettingsController;

Route::post('/login', [AuthController::class, 'login']);
Route::post('/forgot-password', [AuthController::class, 'forgotPassword']);
Route::post('/reset-password', [AuthController::class, 'resetPassword']);

// Public Embed Route
Route::get('/public/charts/{token}', [ChartController::class, 'getChartByToken']);

Route::middleware('auth:sanctum')->group(function () {
    Route::get('/user', [AuthController::class, 'user']);
    Route::post('/logout', [AuthController::class, 'logout']);

    // Settings
    Route::post('/settings/profile', [SettingsController::class, 'updateProfile']);

    // Dashboard
    Route::get('/dashboard/stats', [DashboardController::class, 'stats']);
    Route::get('/dashboard/viewer', [DashboardController::class, 'viewerDashboard']);

    // Roles
    Route::get('/roles', [RoleController::class, 'index']);
    Route::post('/roles', [RoleController::class, 'store']);
    Route::put('/roles/{id}', [RoleController::class, 'update']);
    Route::delete('/roles/{id}', [RoleController::class, 'destroy']);

    // Users
    Route::get('/users', [UserController::class, 'index']);
    Route::post('/users', [UserController::class, 'store']);
    Route::put('/users/{id}', [UserController::class, 'update']);
    Route::delete('/users/{id}', [UserController::class, 'destroy']);

    // Charts
    Route::get('/charts', [ChartController::class, 'index']);
    Route::post('/charts', [ChartController::class, 'store']);
    Route::get('/charts/{id}', [ChartController::class, 'show']);
    Route::put('/charts/{id}', [ChartController::class, 'update']);
    Route::post('/charts/{id}/token', [ChartController::class, 'generateToken']);
    Route::post('/charts/run-query', [ChartController::class, 'runQuery']);
    Route::delete('/charts/{id}', [ChartController::class, 'destroy']);
});
