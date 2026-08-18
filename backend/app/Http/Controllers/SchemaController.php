<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

class SchemaController extends Controller
{
    /**
     * Get all tables in the database.
     */
    public function getTables()
    {
        try {
            $tables = Schema::getTables();
            
            // Extract table names
            $tableNames = array_map(function ($table) {
                return is_array($table) ? $table['name'] : $table->name;
            }, $tables);

            // Filter out system tables if necessary (e.g. migrations, jobs)
            $filteredTables = array_values(array_filter($tableNames, function ($name) {
                $systemTables = ['migrations', 'personal_access_tokens', 'password_reset_tokens', 'failed_jobs', 'jobs', 'job_batches', 'sessions', 'cache', 'cache_locks'];
                return !in_array($name, $systemTables);
            }));

            return response()->json([
                'success' => true,
                'data' => $filteredTables
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch tables: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get all columns for a specific table.
     */
    public function getColumns($table)
    {
        try {
            if (!Schema::hasTable($table)) {
                return response()->json([
                    'success' => false,
                    'message' => 'Table not found'
                ], 404);
            }

            $columns = Schema::getColumns($table);
            
            // Extract column names
            $columnNames = array_map(function ($column) {
                return is_array($column) ? $column['name'] : $column->name;
            }, $columns);

            return response()->json([
                'success' => true,
                'data' => $columnNames
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch columns: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Preview raw data from a specific table (Limit 100).
     */
    public function previewTable($table)
    {
        try {
            // Security check: Block system tables
            $systemTables = ['migrations', 'personal_access_tokens', 'password_reset_tokens', 'failed_jobs', 'jobs', 'job_batches', 'sessions', 'cache', 'cache_locks'];
            if (in_array($table, $systemTables)) {
                return response()->json([
                    'success' => false,
                    'message' => 'Access denied to system tables'
                ], 403);
            }

            if (!Schema::hasTable($table)) {
                return response()->json([
                    'success' => false,
                    'message' => 'Table not found'
                ], 404);
            }

            // Fetch top 100 rows
            $data = DB::table($table)->limit(100)->get();

            return response()->json([
                'success' => true,
                'data' => $data
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to preview table: ' . $e->getMessage()
            ], 500);
        }
    }
}
