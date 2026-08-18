<?php

namespace App\Http\Controllers;

use App\Models\Chart;
use App\Models\User;
use Illuminate\Http\Request;

class DashboardController extends Controller
{
    public function stats(Request $request)
    {
        $user = $request->user();

        // Ambil grafik sesuai akses (Role atau sebagai Kreator)
        $charts = Chart::with('roles', 'creator')
            ->where(function ($query) use ($user) {
                $query->whereHas('roles', function($q) use ($user) {
                    $q->where('roles.id', $user->role_id);
                })->orWhere('creator_id', $user->id);
            })->get();

        $totalCharts = $charts->count();
        $activeEmbeds = $charts->whereNotNull('embed_token')->count();
        $totalUsers = User::count();

        // Kelompokkan tipe grafik
        $chartTypes = [
            ['name' => 'Bar', 'value' => $charts->where('chart_type', 'bar')->count()],
            ['name' => 'Pie', 'value' => $charts->where('chart_type', 'pie')->count()],
            ['name' => 'Line', 'value' => $charts->where('chart_type', 'line')->count()],
        ];

        // 5 Grafik terbaru
        $recentCharts = $charts->sortByDesc('created_at')->take(5)->values()->map(function($chart) {
            return [
                'id' => $chart->id,
                'title' => $chart->title,
                'type' => ucfirst($chart->chart_type) . ' Chart',
                'roles' => $chart->roles->pluck('name')->join(', ') ?: 'Private',
                'status' => $chart->embed_token ? 'Active' : 'Inactive',
                'created' => $chart->created_at->diffForHumans()
            ];
        });

        return response()->json([
            'success' => true,
            'data' => [
                'total_charts' => $totalCharts,
                'active_embeds' => $activeEmbeds,
                'total_users' => $totalUsers,
                'charts_by_type' => $chartTypes,
                'recent_charts' => $recentCharts
            ]
        ]);
    }

    public function viewerDashboard(Request $request, \App\Services\QueryRunnerService $queryRunner)
    {
        $user = $request->user();

        if (!$user->role_id) {
            return response()->json([
                'success' => true,
                'data' => []
            ]);
        }

        // Get charts allowed for this user's role
        $charts = Chart::with('roles')
            ->whereHas('roles', function($q) use ($user) {
                $q->where('roles.id', $user->role_id);
            })->get();

        // Execute queries for each chart
        $chartsData = $charts->map(function ($chart) use ($queryRunner) {
            try {
                $results = $queryRunner->runQuery($chart->raw_query);
                $chart->data = $results;
            } catch (\Exception $e) {
                $chart->data = [];
                $chart->query_error = $e->getMessage();
            }
            return $chart;
        });

        return response()->json([
            'success' => true,
            'data' => $chartsData
        ]);
    }
}
