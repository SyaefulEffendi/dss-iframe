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
}
