<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Dashboard extends Model
{
    protected $fillable = ['title', 'creator_id'];

    public function creator()
    {
        return $this->belongsTo(User::class, 'creator_id');
    }

    public function charts()
    {
        return $this->belongsToMany(Chart::class, 'dashboard_chart')
            ->withPivot('layout_config')
            ->withTimestamps();
    }
}
