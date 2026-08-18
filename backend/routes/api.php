<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\ChartController;

Route::post('/login', [AuthController::class, 'login']);

Route::middleware('auth:sanctum')->group(function () {
    Route::get('/user', [AuthController::class, 'user']);
    Route::post('/logout', [AuthController::class, 'logout']);

    // Charts
    Route::get('/charts', [ChartController::class, 'index']);
    Route::post('/charts/run-query', [ChartController::class, 'runQuery']);
    Route::delete('/charts/{id}', [ChartController::class, 'destroy']);
});
