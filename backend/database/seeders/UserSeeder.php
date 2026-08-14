<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use App\Models\Role;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        $analystRole = Role::where('name', 'Data Analyst')->first();

        User::create([
            'name' => 'Moh. Syaeful Effendi',
            'email' => 'mohsyaefuleffendi@student.uns.ac.id',
            'password' => Hash::make('SyaefulEffendi280106'),
            'role_id' => $analystRole->id,
        ]);
    }
}
