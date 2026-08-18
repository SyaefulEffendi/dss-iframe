<?php

namespace App\Http\Controllers;

use App\Models\Chart;
use Illuminate\Http\Request;
use App\Services\QueryRunnerService;

class ChartController extends Controller
{
    /**
     * Display a listing of the charts.
     */
    public function index(Request $request)
    {
        // For MVP, we simply return all charts with their creator's name.
        // We order by latest created first.
        $charts = Chart::with('creator:id,name')
                    ->orderBy('created_at', 'desc')
                    ->get();
        
        return response()->json([
            'success' => true,
            'data' => $charts
        ]);
    }

    /**
     * Remove the specified chart from storage.
     */
    public function destroy($id)
    {
        $chart = Chart::find($id);

        if (!$chart) {
            return response()->json([
                'success' => false,
                'message' => 'Grafik tidak ditemukan.'
            ], 404);
        }

        $chart->delete();

        return response()->json([
            'success' => true,
            'message' => 'Grafik berhasil dihapus.'
        ]);
    }

    /**
     * Eksekusi raw query untuk fitur Chart Builder (Preview mode)
     */
    public function runQuery(Request $request, QueryRunnerService $queryRunner)
    {
        $request->validate([
            'query' => 'required|string'
        ]);

        try {
            $results = $queryRunner->runQuery($request->input('query'));
            
            return response()->json([
                'success' => true,
                'data' => $results,
                'count' => count($results)
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ], 400); // Bad Request
        }
    }

    /**
     * Store a newly created chart in storage.
     */
    public function store(Request $request)
    {
        $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'raw_query' => 'required|string',
            'chart_type' => 'required|in:bar,pie,line',
            'config' => 'required|array', // JSON containing x_axis, y_axis, etc.
            'role_ids' => 'required|array', // Array of Role IDs
            'role_ids.*' => 'exists:roles,id'
        ]);

        $chart = new Chart();
        $chart->title = $request->title;
        $chart->description = $request->description;
        $chart->raw_query = $request->raw_query;
        $chart->chart_type = $request->chart_type;
        $chart->config = $request->config;
        $chart->creator_id = $request->user()->id; // Sanctum user
        $chart->save();

        // Sync roles via the pivot table
        $chart->roles()->sync($request->role_ids);

        return response()->json([
            'success' => true,
            'message' => 'Grafik berhasil disimpan!',
            'data' => $chart
        ], 201);
    }
}
