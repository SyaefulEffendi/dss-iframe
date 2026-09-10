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
    public function index()
    {
        $dashboards = \App\Models\Dashboard::with('creator')->get();
        return response()->json([
            'success' => true,
            'data' => $dashboards
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'title' => 'required|string|max:255'
        ]);

        $dashboard = \App\Models\Dashboard::create([
            'title' => $request->title,
            'creator_id' => $request->user()->id
        ]);

        return response()->json([
            'success' => true,
            'data' => $dashboard
        ]);
    }

    public function show(Request $request, $id, \App\Services\QueryRunnerService $queryRunner)
    {
        $dashboard = \App\Models\Dashboard::with('creator')->findOrFail($id);
        $user = $request->user();

        // Get charts associated with this dashboard
        $chartsQuery = $dashboard->charts()->with('roles');

        // Filter charts based on user role (unless they are the creator or have full access)
        // Adjusting based on how viewerDashboard behaves: if user has a role, only show those charts.
        if ($user->role_id) {
            // But wait, what if the user is Data Analyst (admin) and wants to edit?
            // Actually, PRD says Data Analyst is a role. If they have role_id, they'll only see charts assigned to them?
            // Let's ensure creators or Data Analysts can see everything if we want to allow editing,
            // or we just follow the rule: charts seen are those the user has role for.
            $chartsQuery->where(function ($query) use ($user) {
                $query->whereHas('roles', function($q) use ($user) {
                    $q->where('roles.id', $user->role_id);
                })->orWhere('creator_id', $user->id);
            });
        }

        $charts = $chartsQuery->get();

        // Execute queries for each chart
        $chartsData = $charts->map(function ($chart) use ($queryRunner) {
            try {
                $results = $queryRunner->runQuery($chart->raw_query);
                $chart->setAttribute('data', $results);
            } catch (\Exception $e) {
                $chart->setAttribute('data', []);
                $chart->setAttribute('query_error', $e->getMessage());
            }
            return $chart;
        });

        // Set relation correctly so it serializes properly
        $dashboard->setRelation('charts', $chartsData);

        return response()->json([
            'success' => true,
            'data' => $dashboard
        ]);
    }

    public function update(Request $request, $id)
    {
        $dashboard = \App\Models\Dashboard::findOrFail($id);
        $request->validate([
            'title' => 'required|string|max:255'
        ]);

        $dashboard->update([
            'title' => $request->title
        ]);

        return response()->json([
            'success' => true,
            'data' => $dashboard
        ]);
    }

    public function destroy($id)
    {
        $dashboard = \App\Models\Dashboard::findOrFail($id);
        $dashboard->delete();

        return response()->json([
            'success' => true,
            'message' => 'Dashboard deleted successfully'
        ]);
    }

    public function syncCharts(Request $request, $id)
    {
        $dashboard = \App\Models\Dashboard::findOrFail($id);
        
        $request->validate([
            'layouts' => 'required|array',
            'layouts.*.i' => 'required', // This should correspond to chart_id
        ]);

        $syncData = [];
        foreach ($request->layouts as $layout) {
            // Remove any potential prefix from 'i' if frontend adds one (like 'chart_1')
            $chartId = str_replace('chart_', '', $layout['i']);
            $syncData[$chartId] = ['layout_config' => json_encode($layout)];
        }

        $dashboard->charts()->sync($syncData);

        return response()->json([
            'success' => true,
            'message' => 'Dashboard layout updated successfully'
        ]);
    }
}
