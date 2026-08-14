<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('charts', function (Blueprint $table) {
            $table->id();
            $table->string('title');
            $table->text('description')->nullable();
            $table->text('raw_query');
            $table->string('chart_type'); // bar, pie, line
            $table->json('config');
            $table->foreignId('creator_id')->constrained('users')->onDelete('cascade');
            $table->string('embed_token')->nullable()->unique();
            $table->integer('cache_ttl_seconds')->default(300);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('charts');
    }
};
