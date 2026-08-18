<?php

namespace App\Services;

use Illuminate\Support\Facades\DB;
use Exception;

class QueryRunnerService
{
    /**
     * Mengeksekusi raw query dengan batasan aman.
     * Hanya mengizinkan query SELECT dan otomatis membatasi jumlah baris (LIMIT).
     */
    public function runQuery($rawQuery, $limit = 100)
    {
        $query = trim($rawQuery);

        // 1. Basic SQL Injection / Mutation Prevention
        // Kita hanya mengizinkan query yang diawali dengan kata SELECT
        if (!preg_match('/^SELECT\b/i', $query)) {
            throw new Exception("Security Violation: Hanya query SELECT yang diizinkan untuk alasan keamanan.");
        }

        // Blokir keyword berbahaya jika menyusup di dalam kueri
        $forbiddenKeywords = ['INSERT', 'UPDATE', 'DELETE', 'DROP', 'ALTER', 'TRUNCATE', 'GRANT', 'REVOKE'];
        foreach ($forbiddenKeywords as $keyword) {
            if (preg_match("/\b{$keyword}\b/i", $query)) {
                throw new Exception("Security Violation: Keyword '{$keyword}' diblokir demi keamanan data.");
            }
        }

        // 2. Row Limit Prevention (Preview Mode)
        // Jika kueri tidak memiliki limit, kita paksakan limit agar browser/server tidak hang
        if (!preg_match('/\bLIMIT\b/i', $query)) {
            // Hilangkan titik koma di akhir jika ada, lalu tambahkan limit
            $query = rtrim($query, ';') . " LIMIT {$limit}";
        }

        // 3. Eksekusi Kueri
        try {
            // Untuk MVP, kita menggunakan koneksi default. 
            // Namun, di sistem produksi besar, kita harus mendefinisikan koneksi 'readonly' di database.php
            // DB::connection('readonly')->select(...)
            $results = DB::select($query);
            return $results;
        } catch (\Illuminate\Database\QueryException $e) {
            // Menangkap error sintaks SQL dan meneruskannya secara aman ke Frontend
            throw new Exception("SQL Error: " . $e->errorInfo[2]);
        } catch (Exception $e) {
            throw new Exception("Error Eksekusi: " . $e->getMessage());
        }
    }
}
