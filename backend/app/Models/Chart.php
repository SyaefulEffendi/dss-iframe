<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Chart extends Model
{
    use HasFactory;

    protected $fillable = [
        'title',
        'description',
        'raw_query',
        'chart_type',
        'config',
        'creator_id',
        'cache_ttl_seconds'
    ];

    protected $casts = [
        'config' => 'array',
    ];

    public function roles()
    {
        return $this->belongsToMany(Role::class, 'chart_role');
    }

    public function creator()
    {
        return $this->belongsTo(User::class, 'creator_id');
    }

    public function dashboards()
    {
        return $this->belongsToMany(Dashboard::class, 'dashboard_chart')
            ->withPivot('layout_config')
            ->withTimestamps();
    }
}
