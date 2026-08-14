<?php

namespace App\Http\Controllers;

use App\Models\Chart;
use Illuminate\Http\Request;

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

        // Optional: Check if user has permission to delete (for MVP, Data Analyst can delete any)
        
        $chart->delete();

        return response()->json([
            'success' => true,
            'message' => 'Grafik berhasil dihapus.'
        ]);
    }
}
