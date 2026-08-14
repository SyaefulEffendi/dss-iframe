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
        'embed_token',
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
}
